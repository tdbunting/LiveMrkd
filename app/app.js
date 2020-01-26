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
  isSaved = true;
};

const LM_SIG = `Created with [LiveMrkd](http://www.github.com/tdbunting/LiveMrdk)`
function addSignature(content) {
  const lines = content.split('\n')
  if(lines[lines.length - 1] !== LM_SIG) {
    lines.push('\n', LM_SIG)
  }
  return lines.join('\n')
}

const saveFile = function(content){
  content = addSignature(content)
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
    isSaved = true;
  }
};

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
  if(isSaved){
    mainWindow.webContents.send('file-closed');
    currentFile = null;
  }else{
    var message = dialog.showMessageBox({
      buttons: ["Save", "Don't Save", "Cancel"],
      message: "Current file is not saved, are you sure you want to close?",
      cancelID: 3
    });
    if(message === 0){
      mainWindow.webContents.send('save-on-close');
      mainWindow.webContents.send('file-closed');
    }else if(message === 1){
      mainWindow.webContents.send('file-closed');
      currentFile = null;
    }else{
      console.log("Cancelled")
    }
  }
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
        click() { 
          // TODO: HAVE A WAY TO GRAB CONTENT FROM RENDER TO SAVE
        }
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
  template[0].submenu[6].label = "Show in Finder";
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
var isSaved = true;

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

  mainWindow.on('close', function(){
    if(!isSaved){
      closeFile();
    }
  });

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



// TODO: FIGURE OUT BETTER WAY OF SHARING IS SAVED VALUES
function savedSwitch(){
  if(isSaved){
    isSaved = false;
  }else{
    isSaved = true;
  }
}

function clearFilePath(){
  currentFile = null;
}

// functions to export for renderer
exports.openFile = openFile;
exports.closeFile = closeFile;
exports.saveFile = saveFile;
exports.saveAsHtmlFile = saveAsHtmlFile;
exports.showInFileSystem = showInFileSystem;
// try to get rid of these
exports.savedSwitch = savedSwitch;
exports.clearFilePath = clearFilePath;
