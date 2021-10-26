  get size() {
    return this.#keys.length;
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

  toString() {
    return JSON.stringify(this.value);
  }
}
