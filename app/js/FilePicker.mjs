export class FilePicker {
  constructor(node) {
    this._node = node;
    this._form = node.querySelector('form');
    this._search = this._form.search;
    this._path = this._form.path;
    this._client = undefined;
    this._paths = [];

    window.addEventListener('keydown', async (event) => {
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        await this.show();
      }
    });

    this._search.addEventListener('input', () => {
      this.#setPaths();
    });

    this._search.addEventListener('keydown', event => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this._path.selectedIndex = Math.max(0, this._path.selectedIndex - 1);
      }
      else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this._path.selectedIndex = Math.min(this._path.length -1, this._path.selectedIndex + 1);
      }
    });

    this._form.addEventListener('submit', event => {
      event.preventDefault();
      const file = this._path.value;
      window.location.hash = file;
      this._node.close();
    });

    this._node.addEventListener('close', () => {
      this._form.reset();
    });
  }

  setClient(client) {
    this._client = client;
  }

  async show() {
    this._node.showModal();
    this._paths = await this._client.list();
    this.#setPaths();
  }

  #setPaths() {
    const target = new RegExp(this._search.value.split('').join('.*'), 'i');
    const filtered = this._paths.filter(path => path.match(target));
    this._path.innerHTML = '';
    for (const path of filtered) {
      const option = document.createElement('option');
      option.value = path;
      option.textContent = path;
      this._path.appendChild(option);
    }
    this._path.size = Math.min(10, filtered.length);
    this._path.value = filtered[0];
  }
}
