const baseUrl = 'http://localhost:5298/';
let editorSelectionRange;

// Functions

function focus(elem, range = null) {
  const selection = window.getSelection();
  if (!range) {
    range = document.createRange();
    range.setStart(elem, 0);
    range.setEnd(elem, 0);
  }
  selection.removeAllRanges();
  selection.addRange(range);
};

async function getFileContents(file) {
  const resp = await fetch(`${baseUrl}${file}`);
  const text = await resp.text();
  return text.replaceAll('\r\n', '\n');
};

async function loadFileFromHash() {
  const file = window.location.hash.substring(1) || 'index.md';
  const text = await getFileContents(file);

  const editor = document.getElementById('editor');
  editor.textContent = text;
  focus(editor);
};

async function selectFile(file) {
  window.location.hash = file;
};

function filterFiles(files, input) {
  let filtered = files;

  const tokens = input.split(' ');

  for (const token of tokens) {
    filtered = filtered.filter(file => file.includes(token));
  }

  return filtered.slice(0, 10);
};

async function setCommandPaletteFiles(input) {
  const resp = await fetch(`${baseUrl}index.txt`);
  const text = await resp.text();
  const files = text.split('\n');

  const filtered = filterFiles(files, input);

  const fileElem = document.getElementById('file');
  fileElem.innerHTML = '';

  for (const file of filtered) {
    const option = document.createElement('option');
    option.value = file;
    option.textContent = file;
    fileElem.appendChild(option);
  }

  if (filtered.length === 0) {
    const option = document.createElement('option');
    option.value = input;
    option.textContent = `Create ${input}`;
    fileElem.appendChild(option);
    fileElem.value = input;
  } else {
    fileElem.value = filtered[0];
  }

  fileElem.size = filtered.length;
};

async function saveSelectedFile() {
  const file = window.location.hash.substring(1) || 'index.md';
  const content = document.getElementById('editor').textContent;
  await fetch(`${baseUrl}${file}`, { method: 'PUT', body: content });
};


// Event handlers

function handleSaveFile(event) {
  event.preventDefault();
  saveSelectedFile();
};

function handleOpenCommandPalette(event) {
  event.preventDefault();
  editorSelectionRange = window.getSelection().getRangeAt(0);
  setCommandPaletteFiles('');
  document.getElementById('command-palette').showModal();
};

function handleSelectClick(event) {
  selectFile(event.target.value);
  document.getElementById('command-palette').close();
};

function handleCommandPaletteClose() {
  document.getElementById('files-form').reset();
};

function handleCommandPaletteCancel() {
  focus(document.getElementById('editor'), editorSelectionRange);
};

function handleCommandPaletteSubmit(event) {
  event.preventDefault();
  selectFile(event.target.file.value);
  document.getElementById('command-palette').close();
};


// Event handler registration

window.addEventListener('load', loadFileFromHash);
window.addEventListener('hashchange', loadFileFromHash);
window.addEventListener('keydown', function (event) {
  if (event.ctrlKey && event.key === 'p') {
    handleOpenCommandPalette(event);
  }
  if (event.ctrlKey && event.key === 's') {
    handleSaveFile(event);
  }
});