import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { v4 } from "uuid";

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
}
