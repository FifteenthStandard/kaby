export class ApiClient {
  constructor(base) {
    this._base = base;
  }

  async list() {
    const response = await fetch(this._base);
    const contents = await response.text();
    const files = contents.split('\n');
    return files;
  }

  async create(path) {
    await fetch(`${this._base}${path}`, { method: 'PUT', body: '' });
  }

  async read(path) {
    const response = await fetch(`${this._base}${path}`);
    const contents = await response.text();
    return contents;
  }

  async update(path, contents) {
    await fetch(`${this._base}${path}`, { method: 'PUT', body: contents });
  }

  async delete(path) {
    await fetch(`${this._base}${path}`, { method: 'DELETE' });
  }

  static async new() {
    const base = 'http://localhost:5000/';
    const client = new ApiClient(base);
    return client;
  }
}
