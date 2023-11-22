export class OneDriveClient {
  constructor(accessToken) {
    this._accessToken = accessToken;
  }

  async list() {
    const response = await this.#fetch('/drive/special/approot/children');
    const data = await response.json();
    const paths = data.value.map(item => item.name);
    return paths;
  }

  async create(path) {
    await this.#fetch(
      `/drive/special/approot:/${path}:/content`,
      {
        method: 'PUT',
        body: '',
      });
  }

  async read(path) {
    const response = await this.#fetch(`/drive/special/approot:/${path}:/content`);
    const contents = await response.text();
    return contents;
  }

  async update(path, contents) {
    await this.#fetch(
      `/drive/special/approot:/${path}:/content`,
      {
        method: 'PUT',
        body: contents,
      });
  }

  async delete(path) {

  }

  async #fetch(path, options) {
    while (true) {
      const baseUrl = 'https://graph.microsoft.com/v1.0';
      options = {
        ...options,
        headers: {
          'Authorization': `Bearer ${this._accessToken}`,
        },
      };
      const response = await fetch(`${baseUrl}${path}`, options);
      if (response.status === 401) {
        console.log('Access token expired');
        await this.#refresh();
        continue;
      }
      return response;
    }
  }

  async #refresh() {
    return new Promise(resolve => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.append(iframe);
  
      iframe.addEventListener('load', () => {
        this._accessToken = window.localStorage.getItem('kaby:onedrive-access-token');
        document.body.removeChild(iframe);
        console.log('Access token refreshed');
        resolve();
      });
  
      const clientId = 'da702467-afe6-42e4-9a7f-251e74e58f69';
      const redirectUri = encodeURIComponent('https://kaby.app/onedrive-auth');
      iframe.contentWindow.location = [
        `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize`,
        `?client_id=${clientId}`,
        '&response_type=token',
        `&redirect_uri=${redirectUri}`,
        '&scope=Files.ReadWrite.AppFolder',
        '&prompt=none'
      ].join('');
    });
  }

  static async new() {
    const accessToken = window.localStorage.getItem('kaby:onedrive-access-token');
    if (accessToken) {
      return new OneDriveClient(accessToken);
    }
    else {
      const clientId = 'da702467-afe6-42e4-9a7f-251e74e58f69';
      const redirectUri = encodeURIComponent('https://kaby.app/onedrive-auth');
      window.location = [
        `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize`,
        `?client_id=${clientId}`,
        '&response_type=token',
        `&redirect_uri=${redirectUri}`,
        '&scope=Files.ReadWrite.AppFolder'
      ].join('');
    }
  }
}
