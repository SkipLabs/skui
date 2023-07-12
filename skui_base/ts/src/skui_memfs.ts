
import {int, FileSystem} from "#skui_base/skui_types";

export class MemFS implements FileSystem { 
  private fileDescrs: Map<string, number>;
  private fileDescrNbr: int;
  private files: Array<Array<String>>;
  private changed_files: Array<number>;
  private execOnChange: Array<(change: string) => void>;
  
  constructor() {
    this.fileDescrs = new Map();
    this.fileDescrNbr = 2;
    this.files = new Array();
    this.changed_files = new Array();
    this.execOnChange = new Array();
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

  writeToFile(fd: int, content: string) {
    this.files[fd]!.push(content);
    this.changed_files[fd] = fd;
    if (this.execOnChange[fd] !== undefined) {
      this.execOnChange[fd]!(this.files[fd]!.join(""));
      this.files[fd] = [];
    }
  }

  appendToFile(filename: string, content: string) {
    let fd = this.fileDescrs.get(filename);
    if (!fd) {
      fd = this.openFile(filename);
    }
    this.writeToFile(fd, content);
  }

  closeFile(fd: int) {
    // Nothing to do
  }
}