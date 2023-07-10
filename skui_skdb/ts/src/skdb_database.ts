
import { Environment, ptr, loadWasm} from "#skui_base/skui_types";
import { Orchestrable, SKDB, Server, Storage, SKDBCallable, ExternalFuns, Utility} from "#skui_skdb/skdb_types";
import { connect } from "#skui_skdb/skdb_orchestration";
import { init } from "#skui_skdb/skdb_skdb";

interface WasmExports {
  SKIP_init_jsroots: () => void;
  getVersion: () => ptr;
}

class OrchestrableImpl implements Orchestrable {
  writeCsv: (table: string, payload: string) => void;
  watermark: (replicationUid: string, table: string) => bigint;
  watchFile: (fileName: string, fn: (change: ArrayBuffer) => void) => void;
  getReplicationUid: (deviceUuid: string) => string;
  subscribe: (replicationUid: string, table: string, updateFile: string) => string;
  diff: (watermark: bigint, session: string) => ArrayBuffer | null;
  assertCanBeMirrored: (tableName: string) => void;
  tableExists: (tableName: string) => Promise<boolean>;
  sql: (query: string) => Promise<Array<any>>;

  constructor(client: SKDBImpl, utf8Encode: (v: string) => Uint8Array) {
    this.tableExists = client.tableExists;
    this.sql = client.sql;
    this.assertCanBeMirrored = client.assertCanBeMirrored;
    this.watermark = (replicationId: string, table: string) => {
      return BigInt(client.runLocal(["watermark", "--source", replicationId, table], ""));
    };
    this.writeCsv = (table: string, payload: string) => {
      return client.runLocal(["write-csv", table], payload + '\n');
    };
    this.watchFile = (fileName: string, fn: (change: ArrayBuffer) => void) => {
      client.watchFile(fileName, change => {
        if (change == "") {
          return;
        }
        fn(utf8Encode(change));
      });
    };
    this.getReplicationUid = (deviceUuid: string) => {
      return client.runLocal(["replication-id", deviceUuid], "").trim()
    };
    this.subscribe = (replicationUid: string, table: string, updateFile: string) => {
      return client.runLocal(
        [
          "subscribe", table, "--connect", "--format=csv",
          "--updates", updateFile, "--ignore-source", replicationUid
        ],
        ""
      ).trim()
    };
    this.diff = (watermark: bigint, session: string) => {
      let d = client.runLocal(
        [
          "diff", "--format=csv",
          "--since",
          watermark.toString(),
          session,
        ], 
        ""
      );
      if (d == "") {
        return null;
      }
      return utf8Encode(d);
    };
  }

  

}


class SKDBImpl implements SKDB {
  private environment: Environment;
  private subscriptionCount: number = 0;
  private onRootChangeFuns: Array<(rootName: string) => void> = new Array();
  private fileDescrs: Map<string, number> = new Map();
  private fileDescrNbr: number = 2;
  private files: Array<Array<String>> = new Array();
  private execOnChange: Array<(change: string) => void> = new Array();
  private nbrInitPages: number = -1;
  private roots: Map<string, number> = new Map();
  private clientUuid: string = "";

  registerFun: <T1, T2>(f: (obj: T1) => T2) => SKDBCallable<T1, T2>;
  addRoot: <T1, T2>(rootName: string, callable: (obj: T1) => T2 | SKDBCallable<T1, T2>, arg: T1) => void;
  removeRoot: (rootName: string) => void;
  getRoot: (rootName: string) => any;
  trackedCall: <T1, T2>(callable: SKDBCallable<T1, T2>, arg: T1) => T2;
  trackedQuery: (request: string, start?: number, end?: number) => any;
  save : () => Promise<boolean>;
  private runner: (fn: () => string) => Promise<Array<any>>;

  server?: Server;

  private constructor() {}

  static async clear(dbName: string, storeName: string): Promise<void> {
    await clearSKDBStore(dbName, storeName);
  }

  static async create(
    environment: Environment,
    utility: Utility,
    storageGetter: (storeName: string) => Storage,
    dbName: string | null = null,
    getWasmSource: () => Promise<Uint8Array>,
  ): Promise<SKDB> {
    let storeName: string | null = null;
    if (dbName != null) {
      storeName = "SKDBStore";
    }
    let client = new SKDBImpl();
    let storage = storeName ? storageGetter(storeName) : null;
    client.addRoot = utility.addRoot;
    client.removeRoot = utility.removeRoot;
    client.getRoot = utility.getRoot;
    client.trackedCall = utility.trackedCall;
    client.trackedQuery = utility.trackedQuery;
    client.runner = utility.runner;
    client.registerFun = utility.registerFun;
    client.save = storage ? storage.save : () => Promise.resolve(true);
    //let pageBitSize = 20;
    //client.pageSize = 1 << pageBitSize;
    const wasmBytes = await getWasmSource();
    let skdbManager = await init(environment);
    await loadWasm(wasmBytes, [skdbManager], environment);
    /*
    // TODO
    let size = utils.getPersistentSize();
    client.nbrInitPages = size / client.pageSize + 1;
    let version = utils.getVersion();
    if (dbName != null && storeName != null) {
      client.db = await makeSKDBStore(
        dbName,
        storeName,
        version,
        utils.getMemoryBuffer(),
        size,
        client.pageSize
      );
    }
    let exports = wasm.instance.exports as any as WasmExports;

    exports.SKIP_init_jsroots();
    client.runSubscribeRoots();

    client.clientUuid = crypto.randomUUID();
    */
    return client;
  }

  openFile(filename: string): number {
    if (this.fileDescrs[filename] !== undefined) {
      return this.fileDescrs[filename];
    }
    let fd = this.fileDescrNbr;
    this.files[fd] = new Array();
    this.fileDescrs[filename] = fd;
    this.fileDescrNbr++;
    return fd;
  }

  watchFile(filename: string, f: (change: string) => void): void {
    const fd = this.openFile(filename);
    this.execOnChange[fd] = f;
  }

  async connect(
    db: string,
    accessKey: string,
    privateKey: CryptoKey,
    endpoint?: string,
  ): Promise<Server> {
    if (!endpoint) {
      if (typeof window === 'undefined') {
        throw new Error("No endpoint passed to connect and no window object to infer from.");
      }
      const loc = window.location;
      const scheme = loc.protocol === "https:" ? "wss://" : "ws://"
      endpoint = `${scheme}${loc.host}`
    }

    const creds = {
      accessKey: accessKey,
      privateKey: privateKey,
      deviceUuid: this.clientUuid,
    };
    
    this.server = await connect(
      this.environment, 
      new OrchestrableImpl(this, this.environment.encodeUTF8),
      endpoint,
      db,
      creds
    );
    return this.server;
  }

  runLocal(new_args: Array<string>, new_stdin: string): string {
    console.assert(this.nbrInitPages >= 0);
    return this.environment.main(new_args, new_stdin);
  }

  runSubscribeRoots(): void {
    this.roots = new Map();
    let fileName = "/subscriptions/jsroots";
    this.watchFile(fileName, (text) => {
      let changed = new Map();
      let updates = text.split("\n").filter((x) => x.indexOf("\t") != -1);
      for (const update of updates) {
        if (update.substring(0, 1) !== "0") continue;
        let json = JSON.parse(update.substring(update.indexOf("\t") + 1));
        this.roots.delete(json.name);
        changed.set(json.name, true);
      }
      for (const update of updates) {
        if (update.substring(0, 1) === "0") continue;
        let json = JSON.parse(update.substring(update.indexOf("\t") + 1));
        this.roots.set(json.name, json.value);
        changed.set(json.name, true);
      }
      for (const f of this.onRootChangeFuns) {
        for (const name of changed.keys()) {
          f(name);
        }
      }
    });
    this.subscriptionCount++;
    this.runLocal(
      ["subscribe", "jsroots", "--format=json", "--updates", fileName],
      ""
    );
  }

  watermark(replicationId: string, table: string): bigint {
    return BigInt(this.runLocal(["watermark", "--source", replicationId, table], ""));
  }

  cmd(new_args: Array<string>, new_stdin: string): Promise<string> {
    return Promise.resolve(this.runLocal(new_args, new_stdin));
  }

  onRootChange(f: (rootName: string) => void): void {
    this.onRootChangeFuns.push(f);
  }

  subscribe(viewName: string, f: (change: string) => void): void {
    const fileName = "/subscriptions/sub" + this.subscriptionCount;
    this.watchFile(fileName, f);
    this.subscriptionCount++;
    this.runLocal(
      ["subscribe", viewName, "--format=csv", "--updates", fileName],
      ""
    );
  }

  sqlRaw = (stdin: string) => {
    return Promise.resolve(this.runLocal([], stdin));
  }

  sql = (stdin: string) => {
    return this.runner(() => this.runLocal(["--format=js"], stdin));
  }

  tableExists = (tableName: string) => {
    return Promise.resolve(this.runLocal(["dump-table", tableName], "").trim() != "");
  }

  tableSchema = (tableName: string) => {
    return Promise.resolve(this.runLocal(["dump-table", tableName], ""));
  }

  viewExists = (viewName: string) => {
    return Promise.resolve(this.runLocal(["dump-view", viewName], "") != "");
  }

  viewSchema = (viewName: string) => {
    return Promise.resolve(this.runLocal(["dump-view", viewName], ""));
  }

  schema = () => {
    const tables = this.runLocal(["dump-tables"], "");
    const views = this.runLocal(["dump-views"], "");
    return Promise.resolve(tables + views);
  }

  insert = (tableName: string, values: Array<any>) => {
    values = values.map((x) => {
      if (typeof x == "string") {
        if (x == undefined) {
          return "NULL";
        }
        return "'" + x + "'";
      }
      return x;
    });
    let stdin =
      "insert into " + tableName + " values (" + values.join(", ") + ");";
    return Promise.resolve(this.runLocal([], stdin) == "");
  }

  assertCanBeMirrored(tableName: string): void {
    const error = this.runLocal(["can-mirror", tableName], "");
    if (error === "") {
      return
    }
    throw new Error(error);
  }
}

/* ***************************************************************************/
/* Primitives to connect to indexedDB. */
/* ***************************************************************************/

function clearSKDBStore(
  dbName: string,
  storeName: string,
): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    throw new Error("No indexedDB in this environment.");
  }
  return new Promise((resolve, reject) => {
    let open = indexedDB.open(dbName, 1);

    open.onupgradeneeded = function () {
      let db = open.result;
      let store = db.createObjectStore(storeName, { keyPath: "pageid" });
    };

    open.onsuccess = function () {
      let db = open.result;
      let tx = db.transaction(storeName, "readwrite");
      let store = tx.objectStore(storeName);

      store.clear();

      tx.oncomplete = function () {
        resolve();
      };

      tx.onerror = function (err) {
        reject(err);
      };
    };

    open.onerror = function (err) {
      reject(err);
    };
  });
}

function makeSKDBStore(
  dbName: string,
  storeName: string,
  version: number,
  memory: ArrayBuffer,
  memorySize: number,
  pageSize: number
): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    throw new Error("No indexedDB in this environment.");
  }
  let memory32 = new Uint32Array(memory);
  // Let's round up the memorySize to be pageSize aligned
  memorySize = (memorySize + (pageSize - 1)) & ~(pageSize - 1);

  return new Promise((resolve, reject) => {
    let open = indexedDB.open(dbName, 1);

    open.onupgradeneeded = function () {
      let db = open.result;
      let store = db.createObjectStore(storeName, { keyPath: "pageid" });
    };

    open.onsuccess = function () {
      let db = open.result;
      let tx = db.transaction(storeName, "readwrite");
      let store = tx.objectStore(storeName);

      store.getAll().onsuccess = (event) => {
        let target = event.target;
        if (target == null) {
          reject(new Error("Unexpected null target"));
          return;
        }
        let pages =
          (
            target as unknown as
            { result: Array<{ pageid: number, content: ArrayBuffer }> }
          ).result;
        if (pages.length == 0) {
          let i;
          let cursor = 0;
          for (i = 0; i < memorySize / pageSize; i++) {
            const content = memory.slice(cursor, cursor + pageSize);
            store.put({ pageid: i, content: content });
            cursor = cursor + pageSize;
          }
        }
        else {
          for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
            let page = pages[pageIdx]!;
            const pageid = page.pageid;
            if (pageid < 0) continue;
            let pageBuffer = new Uint32Array(page.content);
            const start = pageid * (pageSize / 4);
            for (let i = 0; i < pageBuffer.length; i++) {
              memory32[start + i] = pageBuffer[i]!;
            }
          }
        }
      }

      tx.oncomplete = function () {
        resolve(db);
      };

      tx.onerror = function (err) {
        reject(err);
      };
    };

    open.onerror = function (err) {
      reject(err);
    };
  });
}
