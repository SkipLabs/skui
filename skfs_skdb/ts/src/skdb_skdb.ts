
import { int, ptr, Environment, Links, ToWasmManager, Utils, Shared, run} from "#skui_base/skui_types";
import {PagedMemory, Page, Utility, SKDBCallable, Storage, SKDB} from "#skui_skdb/skdb_types";
import {IDBStorage} from "#skui_skdb/skdb_storage";
import {SKDBImpl} from "#skui_skdb/skdb_database";


interface Exported {
  sk_pop_dirty_page: () => number;
  SKIP_get_version: () => number;
  skip_main: () => void;
  //
  SKIP_init_jsroots: () => void;
  SKIP_add_root: (
    rootNameWasmStr: number,
    funId: number,
    funArg: number | null
  ) => void;
  SKIP_remove_root: (rootNameWasmStr: number) => void;
  SKIP_tracked_call: (funId: number, funArg: number) => number;
  SKIP_tracked_query: (request: number, start: number, end: number) => number;
  getVersion: () => number;
}

class UtilityImpl implements Utility {
  private roots: Map<string, number> = new Map();
  private onRootChangeFuns: Array<(rootName: string) => void>;
  private exported : Exported;
  private utils : Utils;
  runner: (fn: () => string) => Promise<Array<any>>;
  registerFun: <T1, T2>(f: (obj: T1) => T2) => SKDBCallable<T1, T2>;
  main: (new_args: Array<string>, new_stdin: string) => string;

  constructor(
    exported : Exported,
    utils : Utils,
    runner: (fn: () => string) => Promise<Array<any>>,
    registerFun: <T1, T2>(f: (obj: T1) => T2) => SKDBCallable<T1, T2>,
  ) {
    exported.SKIP_init_jsroots();
    this.roots = new Map();
    this.exported = exported;
    this.utils = utils;
    this.runner = runner;
    this.registerFun = registerFun;
    this.main = utils.main;
  }

  private runAddRoot(rootName: string, funId: number, arg: any): void {
    this.utils.clearMainEnvironment();
    this.exported.SKIP_add_root(
      this.utils.exportString(rootName),
      funId,
      this.utils.exportString(JSON.stringify(arg ? arg : null)) 
    )
  }
  
  addRoot<T1, T2>(rootName: string, callable: (obj: T1) => T2 | SKDBCallable<T1, T2>, arg: T1) {
    let fCallable = callable instanceof SKDBCallable ? callable : this.registerFun(callable);
    this.runAddRoot(rootName, fCallable.getId(), arg);
  }

  removeRoot(rootName: string) {
    this.exported.SKIP_remove_root(this.utils.exportString(rootName));
  }

  getRoot(rootName: string) {
    return this.roots.get(rootName);
  }

  trackedCall<T1, T2>(callable: SKDBCallable<T1, T2>, arg: T1) {
    let result = this.exported.SKIP_tracked_call(
      callable.getId(),
      this.utils.exportString(JSON.stringify(arg ? arg : null))
    );
    return JSON.parse(this.utils.importString(result));
  }

  trackedQuery(request: string, start?: number, end?: number) {
    if (start === undefined) start = 0;
    if (end === undefined) end = -1;
    let result = this.exported.SKIP_tracked_query(
      this.utils.exportString(request),
      start,
      end
    );
    return this.utils.importString(result)
      .split("\n")
      .filter((x) => x != "")
      .map((x) => JSON.parse(x));
  }


  addSubscribedRoot(name: string, value: any) {
    this.roots.set(name, value);
  }

  removeSubscribedRoot(name: string) {
    this.roots.delete(name);
  }

  getRootChangeListeners() {
    return this.onRootChangeFuns
  }

  addRootChangeListener(f: (rootName: string) => void) {
    this.onRootChangeFuns.push(f)
  }
}

interface ToWasm {
  SKIP_call_external_fun: (funId: int, skParam: ptr) => ptr;
  SKIP_clear_field_names: () => void;
  SKIP_push_field_name: (skName: ptr) => void;
  SKIP_clear_object: () => void;
  SKIP_push_object_field_null: () => void;
  SKIP_push_object_field_int32: (field: int) => void;
  SKIP_push_object_field_int64: (field: ptr) => void;
  SKIP_push_object_field_float: (field: ptr) => void;
  SKIP_push_object_field_string: (field: ptr) => void;
  SKIP_push_object: () => void;
}

class SKDBMemory implements PagedMemory {
  memory: ArrayBuffer;
  persistentSize: number;
  nbrInitPages: number;
  pageSize: number;
  popDirtyPage: () => number;
  private dirtyPagesMap: Array<number>;
  private dirtyPages: Array<number>;

  constructor(
    memory: ArrayBuffer,
    persistentSize: number,
    popDirtyPage: () => number,
    pageBitSize: number = 20,
  ) {
    this.memory = memory;
    this.persistentSize = persistentSize;
    this.pageSize = 1 << pageBitSize;
    this.nbrInitPages = persistentSize / this.pageSize + 1;
    this.popDirtyPage = popDirtyPage;
  }

  clear = () => {
    this.dirtyPagesMap = [];
    this.dirtyPages = [];
  }

  update = () => {
    while (true) {
      let dirtyPage = this.popDirtyPage();
      if (dirtyPage == -1) break;
      if (dirtyPage >= this.nbrInitPages) {
        if (this.dirtyPagesMap[dirtyPage] != dirtyPage) {
          this.dirtyPagesMap[dirtyPage] = dirtyPage;
          this.dirtyPages.push(dirtyPage);
        }
      }
    }

    for (let dirtyPage = 0; dirtyPage < this.nbrInitPages; dirtyPage++) {
      if (this.dirtyPagesMap[dirtyPage] != dirtyPage) {
        this.dirtyPagesMap[dirtyPage] = dirtyPage;
        this.dirtyPages.push(dirtyPage);
      }
    }
  }

  private async copyPage(start: number, end: number): Promise<ArrayBuffer> {
    return this.memory.slice(start, end);
  }

  init(fn: (page: Page) => void) {
    // Let's round up the memorySize to be pageSize aligned
    let memorySize = (this.persistentSize + (this.pageSize - 1)) & ~(this.pageSize - 1);
    let i : number;
    let cursor = 0;
    for (i = 0; i < memorySize / this.pageSize; i++) {
      const content = this.memory.slice(cursor, cursor + this.pageSize);
      fn({ pageid: i, content: content });
      cursor = cursor + this.pageSize;
    }
  }

  restore(pages: Array<Page>) {
    let memory32 = new Uint32Array(this.memory);
    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      let page = pages[pageIdx]!;
      const pageid = page.pageid;
      if (pageid < 0) continue;
      let pageBuffer = new Uint32Array(page.content);
      const start = pageid * (this.pageSize / 4);
      for (let i = 0; i < pageBuffer.length; i++) {
        memory32[start + i] = pageBuffer[i]!;
      }
    }
  }

  async getPages() {
    let pages = this.dirtyPages;
    let copiedPages = new Array();
    for (let j = 0; j < pages.length; j++) {
      let page = pages[j]!;
      let start = page * this.pageSize;
      let end = page * this.pageSize + this.pageSize;
      let content = await this.copyPage(start, end);
      copiedPages.push({ pageid: page, content });
    }
    return copiedPages;
  }
}

export class SKDBShared implements Shared {
  getName = () => "SKDB";
  create: (dbName ?: string, asWorker ?: boolean) => Promise<SKDB>;
  constructor(create: (dbName ?: string) => Promise<SKDB>) {
    this.create = async (dbName ?: string, asWorker ?: boolean) => {
      asWorker = asWorker === false ? false : true;
      // todo Manage worker
      return await create(dbName);
    };
  }
}



export class ExternalFuns {
  private externalFuns: Array<(any) => any>;

  constructor() {
    this.externalFuns = [];
  }

  register<T1, T2>(f: (obj: T1) => T2): SKDBCallable<T1, T2> {
    let funId = this.externalFuns.length;
    this.externalFuns.push(f);
    return new SKDBCallable(funId);
  }

  call(funId: number, jso: object) {
    return this.externalFuns[funId]!(jso);
  }
}

class LinksImpl implements Links, ToWasm {
  private environment: Environment;
  private state: ExternalFuns;
  private field_names: Array<string>;
  private objectIdx: number;
  private object: {[k: string]: any};
  private stdout_objects: Array<any>;
  private storage ?: Storage;

  SKIP_call_external_fun: (funId: int, skParam: ptr) => ptr;
  SKIP_clear_field_names: () => void;
  SKIP_push_field_name: (skName: ptr) => void;
  SKIP_clear_object: () => void;
  SKIP_push_object_field_null: () => void;
  SKIP_push_object_field_int32: (field: int) => void;
  SKIP_push_object_field_int64: (field: ptr) => void;
  SKIP_push_object_field_float: (field: ptr) => void;
  SKIP_push_object_field_string: (field: ptr) => void;
  SKIP_push_object: () => void;

  constructor(environment: Environment) {
    this.environment = environment;
    this.state = new ExternalFuns();
    this.field_names = new Array();
    this.objectIdx = 0;
    this.object = {};
    this.stdout_objects = new Array();
  }

  complete = (utils: Utils, exports: object) => {
    let exported = exports as Exported;
    this.SKIP_call_external_fun = (funId: int, skParam: ptr) => {
      let res = this.state.call(
        funId,
        JSON.parse(utils.importString(skParam))
      )
      return utils.exportString(JSON.stringify( res ? res : null));
    };
    this.SKIP_clear_field_names = () => {
      this.field_names = new Array();
    };
    this.SKIP_push_field_name = (skName: ptr) => {
      this.field_names.push(utils.importString(skName))
    };
    this.SKIP_clear_object = () => {
      this.objectIdx = 0;
      this.object = {};
    };
    this.SKIP_push_object_field_null = () => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = null;
      this.objectIdx++;
    };
    this.SKIP_push_object_field_int32 = (n: int) => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = n;
      this.objectIdx++;
    };
    this.SKIP_push_object_field_int64 = (skV: ptr) => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = parseInt(utils.importString(skV), 10);
      this.objectIdx++;
    };
    this.SKIP_push_object_field_float = (skV: ptr) => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = parseFloat(utils.importString(skV));
      this.objectIdx++;
    },
    this.SKIP_push_object_field_string = (skV: ptr) => {
      let field_name: string = this.field_names[this.objectIdx]!;
      this.object[field_name] = utils.importString(skV);
      this.objectIdx++;
    },
    this.SKIP_push_object = () => {
      this.stdout_objects.push(this.object);
    };
    let runner = async (fn: () => string) => {
      this.stdout_objects = new Array();
      let stdout = fn();
      if(stdout == "") {
        let result = this.stdout_objects;
        return result;
      }
      throw new Error(stdout)
    };
    let utility = new UtilityImpl(exported, utils, runner, this.state.register);
    let create = async (dbName ?: string) => {
      let save: () => Promise<boolean> = async () => true;
      let storeName = dbName ? "SKDBStore" : null;
      if (storeName != null) {
        let memory = new SKDBMemory(
          utils.getMemoryBuffer(),
          utils.getPersistentSize(),
          exported.sk_pop_dirty_page
        );
        this.storage = await IDBStorage.create(
          dbName!,
          storeName,
          exported.getVersion(),
          memory,
        );
        save = this.storage!.save;
      };
      return await SKDBImpl.create(utility, this.environment.fs(), save);
    };
    return new SKDBShared(create);
  };
}

class Manager implements ToWasmManager {
  private environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
  }

  prepare = (wasm: object) => {
    let toWasm = wasm as ToWasm;
    let links = new LinksImpl(this.environment);
    toWasm.SKIP_call_external_fun =  (funId: int, skParam: ptr) => links.SKIP_call_external_fun(funId, skParam);
    toWasm.SKIP_clear_field_names =  () => links.SKIP_clear_field_names();
    toWasm.SKIP_push_field_name =  (skName: ptr) =>  links.SKIP_push_field_name(skName);
    toWasm.SKIP_clear_object =  () =>  links.SKIP_clear_object();
    toWasm.SKIP_push_object_field_null =  () => links.SKIP_push_object_field_null();
    toWasm.SKIP_push_object_field_int32 =  (field: int) =>  links.SKIP_push_object_field_int32(field);
    toWasm.SKIP_push_object_field_int64 =  (field: ptr) =>  links.SKIP_push_object_field_int64(field);
    toWasm.SKIP_push_object_field_float =  (field: ptr) =>  links.SKIP_push_object_field_float(field);
    toWasm.SKIP_push_object_field_string =  (field: ptr) =>  links.SKIP_push_object_field_string(field);
    toWasm.SKIP_push_object =  () =>  links.SKIP_push_object();
    return links;
  }
}


/** @sk factory SKDB | SKDB_factory | create as createDatabase | dbName | asWorker */
/** @sk init */
export function init(env?: Environment) {
  return Promise.resolve(new Manager(env!));
}