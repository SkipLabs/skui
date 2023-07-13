

import {PromiseWorker, Function} from "#skui_base/skui_worker";
import {SKDB, SKDBCallable} from "#skfs_skdb/skdb_types";

export class SKDBWorker implements SKDB {
  private worker: PromiseWorker;
  
  constructor(worker: Worker) {
    this.worker = new PromiseWorker(worker);
  }

  create = async (dbName ?: string): Promise<void> => {
    await this.worker.post(new Function("create", [dbName]));
  }

  onRootChange = async (f: (rootName: string) => void) => {
    await this.worker.subscribe(new Function("onRootChange", []), f);
  };
  
  subscribe = async (viewName: string, f: (change: string) => void) => {
    await this.worker.subscribe(new Function("subscribe", [viewName]), f);
  };

  sqlRaw = async (query: string) => {
    return await this.worker.post(new Function("sqlRaw", [query])) as string;
  };
  sql = async (query: string) => {
    return await this.worker.post(new Function("sql", [query])) as Array<any>;
  }

  cmd = async (new_args: Array<string>, new_stdin: string) => {
    return await this.worker.post(new Function("cmd", [new_args, new_stdin])) as string;
  };

  tableExists = async (tableName: string) => {
    return await this.worker.post(new Function("tableExists", [tableName])) as boolean;
  };

  tableSchema = async(tableName: string) => {
    return await this.worker.post(new Function("tableSchema", [tableName])) as string;
  };

  viewExists = async (tableName: string) => {
    return await this.worker.post(new Function("viewSchema", [tableName])) as boolean;
  };

  viewSchema = async(tableName: string) => {
    return await this.worker.post(new Function("viewSchema", [tableName])) as string;
  };

  schema = async() => {
    return await this.worker.post(new Function("schema", [])) as string;
  };

  insert = async (tableName: string, values: Array<any>) => {
    return await this.worker.post(new Function("viewSchema", [tableName, values])) as boolean;
  };

  addRoot = async <T1, T2>(rootName: string, callable: (obj: T1) => T2 | SKDBCallable<T1, T2>, arg: T1) => {
    await this.worker.post(new Function("addRoot", [rootName, callable, arg]));
  }

  removeRoot = async (rootName: string) => {
    await this.worker.post(new Function("removeRoot", [rootName]));
  }

  getRoot = async (rootName: string) => {
    return await this.worker.post(new Function("getRoot", [rootName]));
  }

  trackedCall = async <T1, T2>(callable: SKDBCallable<T1, T2>, arg: T1) => {
    return await this.worker.post(new Function("trackedCall", [callable, arg])) as T2;
  }

  trackedQuery = async (request: string, start?: number, end?: number) => {
    return await this.worker.post(new Function("trackedQuery", [request, start, end]));
  }

  save = async () => {
    return await this.worker.post(new Function("save", [])) as boolean;
  }

  registerFun = async <T1, T2>(f: (obj: T1) => T2) => {
    return await this.worker.subscribe(new Function("registerFun", []), f) as SKDBCallable<T1, T2>;
  };
}