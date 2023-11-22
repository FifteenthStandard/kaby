export class FileSystemClient {
  constructor(root) {
    this._root = root;
  }

  async list() {
    const paths = [];
    for await (const key of this._root.keys()) {
      paths.push(key);
    }
    return paths;
  }

  async create(path) {
    await this._root.getFileHandle(path, { create: true });
  }

  async read(path) {
    const handle = await this._root.getFileHandle(path);
    const file = await handle.getFile();
    const text = await file.text();
    return text;
  }

  async update(path, contents) {
    const handle = await this._root.getFileHandle(path);
    const file = await handle.createWritable();
    await file.write(contents);
    await file.close();
  }

  async delete(path) {
    await this._root.removeEntry(path);
  }

  static async new() {
    const root = await window.showDirectoryPicker({ id: 'kaby', mode: 'readwrite' });
    const client = new FileSystemClient(root);
    return client;
  }
}
