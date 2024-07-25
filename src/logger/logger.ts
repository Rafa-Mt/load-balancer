import fs from 'fs';
import type { ArrayResult } from '../load_balancer/status';

interface LogEntry {
  [key: string]: LogEntryValues;
}
interface LogEntryValues {
  status: ArrayResult[];
  winner: string;
}

// open log.json
const logFile = fs.openSync('log.txt', 'w');

export class Logger {
  static entries: LogEntry = {};
  static log(message: string) {
    fs.writeSync(logFile, message);
  }
  static addToEntry<T extends keyof LogEntryValues>(entry: string, key: T, value: LogEntryValues[T]) {
    this.entries[entry][key] = value;
  }
  static createEntry(entry: string) {
    this.entries[entry] = {
      status: [],
      winner: ''
    };
  }
  static saveEntry(entry: string) {
    fs.writeSync(logFile, `[${entry}] ${JSON.stringify(this.entries[entry], null, 2)}\n`);
  }
  static save() {
    fs.writeSync(logFile, `\n[${new Date().toISOString}]: ${JSON.stringify(this.entries, null, 2)}`);
  }
}