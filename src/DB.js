import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { v4 } from "uuid";

import Entry, { ReadOnlyEntry } from "./Entry";

export default class DB {
  #dir;
  constructor(dir) {
    this.#dir = dir;
    if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir);
  }

  removeAll() {
    fsSync.rmdirSync(this.#dir, { recursive: true });
  }

  get size() {
    return fsSync.readdirSync(this.#dir).length;
  }

  async store(data, readOnly = false) {
    const id = v4();
    await fs.writeFile(
      path.join(this.#dir, id),
      JSON.stringify({
        data,
        readOnly,
        timestemp: new Date(Date.now()),
      })
    );
    return id;
  }

  async get(id) {
    const filePath = path.join(this.#dir, id);
    const { data, readOnly, timestemp } = JSON.parse(
      await fs.readFile(filePath)
    );
    if (readOnly) return new ReadOnlyEntry(data, timestemp);
    return new Entry(data, timestemp, (action, ...args) => {
      this.#actionCB(id, action, ...args);
    });
  }

  async #actionCB(id, action, ...args) {
    switch (action) {
      case "SET":
        await fs.writeFile(
          path.join(this.#dir, id),
          JSON.stringify({
            data: args[0],
            readOnly: false,
            timestemp: new Date(Date.now()),
          })
        );
        break;
      case "REMOVE":
        //Wierd problem with promive version
        fsSync.rmSync(path.join(this.#dir, id));
        break;
    }
  }

  [Symbol.iterator]() {
    const ids = fsSync.readdirSync(this.#dir);
    let id = -1;
    return {
      next: () => {
        if (id === this.size - 1) return { done: true };
        id++;
        return { value: this.get(ids[id]) };
      },
    };
  }
}
