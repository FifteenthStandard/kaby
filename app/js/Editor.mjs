export class Editor {
  constructor(node) {
    this._node = node;
    this._client = undefined;
    this._debounce = undefined;
    this.#setPath();

    window.addEventListener('hashchange', async () => {
      this.#setPath();
      await this.load();
    });

    window.addEventListener('keydown', async (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        await this.save();
      }
    });

    node.addEventListener('input', () => {
      this._node.classList.add('dirty');
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => this.save(), 1000);
    });
  }

  setClient(client) {
    this._client = client;
  }

  async load() {
    if (!this._client) return;

    const path = this._path;
    const contents = await this._client.read(path);
    this._node.textContent = contents;
  }

  async save() {
    if (!this._client) return;

    const path = this._path;
    const contents = this._node.textContent;
    await this._client.update(path, contents);
    this._node.classList.remove('dirty');
  }

  #setPath() {
    this._path = window.location.hash.substring(1) || 'index.md';
    window.document.title = `${this._path} | Kaby`;
  }
}