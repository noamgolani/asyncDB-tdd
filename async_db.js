const fs = require("fs/promises");
const fsSync = require("fs");

class DB {
  #dir = "./";

  constructor(dir) {
    this.#dir = dir;
  }

  get size() {
    return this.#keys.length;
  }

  async get(key) {
    const content = await fs.readFile(`${this.#dir}/${key}`, "utf8");
    const { data, readOnly, timestamp } = JSON.parse(content);
    if (readOnly) {
      return new ReadOnlyEntry(data, timestamp);
    }
    return new Entry(data, timestamp, (newData) =>
      this.#updateEntry(key, newData)
    );
  }

  // implemented
  async store(key, data, readOnly) {
    const timestamp = new Date().toLocaleString();
    await fs.writeFile(
      `${this.#dir}/${key}`,
      JSON.stringify({ data, readOnly, timestamp }, null, 2)
    );
  }

  async #updateEntry(key, data, readOnly = false) {
    const { timestamp } = (await this.get(key)).value;
    await fs.writeFile(
      `${this.#dir}/${key}`,
      JSON.stringify({ data, readOnly, timestamp }, null, 2)
    );
  }

  toString() {
    return JSON.stringify(fsSync.readdirSync(this.#dir));
  }

  get #keys() {
    return fsSync.readdirSync(this.#dir);
  }

  [Symbol.iterator]() {
    const keys = this.#keys;
    let current = -1;
    const _db = this;
    return {
      next() {
        current++;
        if (current === keys.length) {
          return { done: true };
        }
        return {
          done: false,
          value: _db.get(keys[current]),
        };
      },
    };
  }
}

class Entry {
  #data;
  #timestamp;
  #updaterCb;
  constructor(data, timestamp, updaterCb) {
    this.#data = data;
    this.#timestamp = new Date(timestamp);
    this.#updaterCb = updaterCb;
  }

  get value() {
    return this.#data;
  }

  set value(data) {
    return this.#updaterCb(data).then(() => {
      this.#data = data;
    });
  }

  get timestamp() {
    return this.#timestamp;
  }

  remove() {
    throw "unimplemented";
  }

  toString() {
    return JSON.stringify(this.value);
  }
}

class ReadOnlyEntry extends Entry {
  constructor(data, timestamp) {
    super(data, timestamp, () => {
      throw "Can't update ReadOnly Entries";
    });
  }
}

/* Tests */

(async () => {
  // for unsupported top level await enviroments
  const db = new DB("./local");
  console.log(db.toString());
  await db.store("key1", { test: "test2" }, true);
  console.log(db.toString());
  const entry = await db.get("key1");
  console.log(entry.value);
  try {
    // await (entry.value = "test2");
  } catch (e) {
    console.log(`Error: ${e}`);
  }

  await db.store("key2", [1, 2, 3, 4]);
  console.log(db.toString());
  const entry2 = await db.get("key2");
  console.log(entry2.value);
  // await (entry2.value = 1234);
  console.log(db.toString());
  const entry2_ = await db.get("key2");
  console.log(entry2_.value);
  console.log("" + entry);

  console.log(db.toString());
  for await (const item of db) {
    console.log(`${item}`);
  }

  for (let i = 0; i < 10; i++) {
    await db.store(`_key${i}`, [{ this: ["is", undefined] }]);
  }
  console.log(db.toString());
})();
