export default class Entry {
  #data;
  #timestemp;
  constructor(data, timestemp) {
    this.#data = data;
    this.#timestemp = timestemp;
  }

  get value() {
    return this.#data;
  }

  get timestemp() {
    return this.#timestemp;
  }
}

export class ReadOnlyEntry extends Entry {
  constructor(...args) {
    super(...args);
  }
}
