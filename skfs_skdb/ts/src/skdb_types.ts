export interface Utility {
  addRoot: <T1, T2>(rootName: string, callable: (obj: T1) => T2 | SKDBCallable<T1, T2>, arg: T1) => void;
  removeRoot: (rootName: string) => void;
  getRoot: (rootName: string) => any;
  trackedCall: <T1, T2>(callable: SKDBCallable<T1, T2>, arg: T1) => T2;
  trackedQuery: (request: string, start?: number, end?: number) => any;
  runner: (fn: () => string) => Promise<Array<any>>;
  registerFun: <T1, T2>(f: (obj: T1) => T2) => SKDBCallable<T1, T2>;
  addSubscribedRoot: (name: string, value: any) => void;
  removeSubscribedRoot: (name: string) => void;
  getRootChangeListeners: () => Array<(rootName: string) => void>;
  addRootChangeListener: (f: (rootName: string) => void) => void;
  main: (new_args: Array<string>, new_stdin: string) => string;
}

export interface SKDB {
  onRootChange: (f: (rootName: string) => void) => void;
  subscribe: (viewName: string, f: (change: string) => void) => void;

  sqlRaw: (query: string) => Promise<string>;
  sql(query: string): Promise<Array<any>>;
  cmd(new_args: Array<string>, new_stdin: string): Promise<string>;
  tableExists(tableName: string): Promise<boolean>;
  tableSchema(tableName: string): Promise<string>;
  viewExists(viewName: string): Promise<boolean>;
  viewSchema(viewName: string): Promise<string>;
  schema(): Promise<string>;
  insert(tableName: string, values: Array<any>): Promise<boolean>;
  addRoot: <T1, T2>(rootName: string, callable: (obj: T1) => T2 | SKDBCallable<T1, T2>, arg: T1) => void;
  removeRoot: (rootName: string) => void;
  getRoot: (rootName: string) => any;
  trackedCall: <T1, T2>(callable: SKDBCallable<T1, T2>, arg: T1) => T2;
  trackedQuery: (request: string, start?: number, end?: number) => any;
  save(): Promise<boolean>;
}

export interface Orchestrable {
  writeCsv: (table: string, payload: string) => void;
  watermark: (replicationUid: string, table: string) => bigint;
  watchFile: (fileName: string, fn: (change: ArrayBuffer) => void) => void;
  getReplicationUid: (deviceUuid: string) => string;
  subscribe: (replicationUid: string, table: string, updateFile: string) => string;
  diff: (watermark: bigint, session: string) => ArrayBuffer | null;
  tableExists: (tableName: string) => Promise<boolean>;
  sql: (query: string) => Promise<Array<any>>;
  assertCanBeMirrored: (tableName: string) => void;
}

export var metadataTable = (tableName: string) => {
  return `skdb__${tableName}_sync_metadata`;
}

export interface Storage {
  save(): Promise<boolean>;
}

export interface Server {}


export type Page = { pageid: number, content: any };

export interface PagedMemory {
  init(fn: (page: Page) => void): void;
  restore(pages: Array<Page>): void;
  clear() : void;
  update() : void;
  getPages(): Promise<Array<Page>>;
}


/* ***************************************************************************/
/* The type used to represent callables. */
/* ***************************************************************************/

export class SKDBCallable<T1, T2> {
  private id: number;

  constructor(id: number) {
    this.id = id;
  }

  getId(): number {
    return this.id;
  }
}
