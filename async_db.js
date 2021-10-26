  toString() {
    return JSON.stringify(fsSync.readdirSync(this.#dir));
  }
}

class Entry {

  toString() {
    return JSON.stringify(this.value);
  }
}
