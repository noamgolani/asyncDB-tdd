import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { v4 } from "uuid";

import Entry, { ReadOnlyEntry } from "./Entry";

export default class DB {
  #dir;
  constructor(dir) {
    this.#dir = dir;
    if (!fsSync.existsSync(dir)) fs.mkdir(dir);
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
    return new Entry(data, timestemp);
  }
}
