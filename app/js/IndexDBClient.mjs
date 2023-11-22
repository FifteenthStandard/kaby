const requestToPromise = function (request) {
  return new Promise(function (resolve, reject) {
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
  });
};

export class IndexedDBClient {
  constructor(name) {
    this._name = name;
  }

  async list() {
    const store = await this.#open('readonly');
    const paths = requestToPromise(store.getAllKeys());
    return paths;
  }

  async create(path) {
    const store = await this.#open('readwrite');
    await requestToPromise(store.put('', path));
  }

  async read(path) {
    const store = await this.#open('readonly');
    const file = await requestToPromise(store.get(path));
    return file;
  }

  async update(path, contents) {
    const store = await this.#open('readwrite');
    await requestToPromise(store.put(contents, path));
  }

  async delete(path) {
    const store = await this.#open('readwrite');
    await requestToPromise(store.delete(path));
  }

  async #open(mode) {
    const name = this._name;
    const db = await new Promise(function (resolve, reject) {
      const request = window.indexedDB.open(name);
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = function (event) {
        const db = event.target.result;
        db.createObjectStore('files');
      };
    });
    const transaction = db.transaction('files', mode);
    const store = transaction.objectStore('files');
    return store;
  }

  static async new() {
    const name = 'kaby';
    const client = new IndexedDBClient(name);
    return client;
  }
}
