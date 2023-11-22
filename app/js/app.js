import { ApiClient } from './ApiClient.mjs';
import { FileSystemClient } from './FileSystemClient.mjs';
import { IndexedDBClient } from './IndexDBClient.mjs';
import { OneDriveClient } from './OneDriveClient.mjs';
import { Editor } from './Editor.mjs';
import { CommandPalette } from './CommandPalette.mjs';
import { FilePicker } from './FilePicker.mjs';


const clientTypes = {
  'ApiClient': ApiClient,
  'IndexedDB': IndexedDBClient,
  'FileSystem': FileSystemClient,
  'OneDrive': OneDriveClient,
};

let editor;
let commandPalette;
let filePicker;

const setStorage = async function (type) {
  try {
    const client = await clientTypes[type].new();
    editor.setClient(client);
    await editor.load();
    commandPalette = new CommandPalette(document.getElementById('command-palette'));
    commandPalette.setClient(client);
    filePicker = new FilePicker(document.getElementById('file-picker'));
    filePicker.setClient(client);
    document.getElementById('choose-storage').close();
  }
  catch (error) {
    console.error(error);
  }
}

window.addEventListener('load', async function () {
  editor = new Editor(document.getElementById('editor'));
  const type = window.localStorage.getItem('kaby:storage');
  if (type in clientTypes) {
    await setStorage(type);
  }
  else {
    window.document.getElementById('choose-storage').showModal();
  }
});

window.handleChooseStorageSubmit = async function (event) {
  event.preventDefault();
  const type = event.submitter.name;
  await setStorage(type);
  window.localStorage.setItem('kaby:storage', type);
};

window.handleModalCancel = function (event) {
  event.preventDefault();
};
