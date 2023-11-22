export class CommandPalette {
  constructor(node) {
    this._node = node;
    this._form = node.querySelector('form');
    this._input = this._form.input;
    this._command = this._form.command;
    this._client = undefined;

    window.addEventListener('keydown', async (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        await this.show();
      }
    });

    this._input.addEventListener('input', () => {
      this.#setCommands();
    });

    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const [ _1, _2, action ] = this.commands.find(([ value, _1, _2 ]) => value === this._command.value);
      this._node.close();
      await action();
    });

    this._node.addEventListener('close', () => {
      this._form.reset();
    });
  }

  setClient(client) {
    this._client = client;
  }

  async show() {
    this.#setCommands();
    this._node.showModal();
  }

  #setCommands() {
    const target = new RegExp(this._input.value.split('').join('.*'), 'i');
    const filtered = this.commands.filter(([ _1, name, _2 ]) => name.match(target));
    this._command.innerHTML = '';
    for (const [ value, name, _ ] of filtered) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = name;
      this._command.appendChild(option);
    }
    this._command.size = Math.min(10, filtered.length);
    this._command.value = filtered[0][0];
  }

  get commands() {
    return [
      [ 'new', 'New file', async () => {
        const name = prompt('Filename');
        await this._client.create(name);
        window.location.hash = name;
      } ],
      [ 'reset', 'Reset storage', async () => {
        window.localStorage.removeItem('kaby:storage');
        window.location.hash = '';
        window.location.reload();
      } ]
    ];
  }
}