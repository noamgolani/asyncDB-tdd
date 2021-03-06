export default class Entry {
  #data;
  #timestemp;
  #actionCB;
  constructor(data, timestemp, actionCB) {
    this.#data = data;
    this.#timestemp = timestemp;
    this.#actionCB = actionCB;
  }

  get value() {
    return this.#data;
  }

  toString() {
    return JSON.stringify(this.#data);
  }

  async setValue(val) {
    await this.#actionCB("SET", val);
    this.#data = val;
  }

  async remove() {
    await this.#actionCB("REMOVE");
  }

  get timestemp() {
    return this.#timestemp;
  }
}

export class ReadOnlyEntry extends Entry {
  constructor(...args) {
    super(...args);
  }

  setValue() {
    return Promise.reject(new Error("Cant change read only entry"));
  }
}
