const electron = require('electron');
const fs = require('fs');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const Menu = electron.Menu;


// reusable functions
const openFile = function () {
  var files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
    ]
  });

  if (!files) { return; }

  var file = files[0];

  currentFile = file;

  var content = fs.readFileSync(file).toString();

  app.addRecentDocument(file);

  mainWindow.webContents.send('file-opened', file, content);
};

const saveFile = function(content){
  if(currentFile){
    // if the file is already saved, just save
    fs.writeFileSync(currentFile, content);
  }else{
    // otherwise show save dialog then save
    var fileName = dialog.showSaveDialog(mainWindow, {
      title: 'Save Markdown Output',
      defaultPath: app.getPath('documents'),
      filters: [{
        name: 'Markdown Files',
        extensions: ['md']
      }]
    });

    if (!fileName){ return; }

    currentFile = fileName;

    fs.writeFileSync(fileName, content);

    // reopens saved file in case file was new to activate the show in FS button
    mainWindow.webContents.send('file-opened', fileName, content);
  }
};

const saveOnClose = function(content){
  saveFile(content);
  mainWindow.webContents.send('close-after-save');
}

const saveAsHtmlFile = function(content){
  var fileName = dialog.showSaveDialog(mainWindow, {
    title: 'Save Html Output',
    defaultPath: app.getPath('documents'),
    filters: [{
      name: 'Html Files',
      extensions: ['html']
    }]
  });

  if (!fileName){ return; }

  fs.writeFileSync(fileName, content);
};

const closeFile = function(){
  mainWindow.webContents.send('file-closed');
  currentFile = null;
}

const showInFileSystem = function(){
  mainWindow.webContents.send('show-in-file-system');
};

// Menu Template
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New File',
        accelerator: 'CmdOrCtrl+N',
        click() { }
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click() { openFile(); }
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click() { saveFile(); }
      },
      {
        label: 'Close File',
        click() { closeFile(); }
      },
      { type: 'separator' },
      {
        label: 'Export HTML',
        click() { saveAsHtmlFile(); }
      },
      {
        label: 'Show File Location',
        click() { showInFileSystem(); }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      { type: 'separator' },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  }
];


if (process.platform == 'darwin') {
  var name = 'LiveMrkd';
  template[0].submenu[5].label = "Show in Finder";
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      { type: 'separator' },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      { type: 'separator' },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      { type: 'separator'},
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  });
}


// Global Variables
var mainWindow = null;
var menu = Menu.buildFromTemplate(template);
var currentFile = null;

app.on('ready', function(){
  console.log('The App is ready');

  // set up File Menu
  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // starts a new Browser Window
  mainWindow = new BrowserWindow({ width: 1200, height: 750, show: true });

  // loads the main html file
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // opens dev tools
  // mainWindow.webContents.openDevTools();

  //TODO: new file, or open dialog box

  // when window is closed, clean up
  mainWindow.on('closed', function(){
    console.log('Window Closed');

    mainWindow = null;
  });
});

app.on('open-file', function(event, file){
  var content = fs.readFileSync(file).toString();
  mainWindow.webContents.send('file-opened', file, content);
})

function fileNotSaved(){

  console.log("File not saved, are you sure you want to close?");
}


// functions to export for renderer
exports.openFile = openFile;
exports.closeFile = closeFile;
exports.saveFile = saveFile;
exports.saveAsHtmlFile = saveAsHtmlFile;
exports.showInFileSystem = showInFileSystem;
exports.saveOnClose = saveOnClose;
