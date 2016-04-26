const electron = require('electron');
const $ = require('jquery');
const marked = require('marked');
const ipc = electron.ipcRenderer;
const shell = electron.shell;

// accessing the main application js since renderer doesnt access native OS APIs
const remote = electron.remote;
const mainProcess = remote.require(__dirname + '\/..' + '/app');
const clipboard = remote.clipboard;

// html elements
const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');
const $openFileButton = $('#open-file');
const $closeFileButton = $('#close-file');
const $saveFileButton = $('#save-file');
const $saveAsHtmlFileButton = $('#save-as-html-file');
const $copyHtmlButton = $('#copy-html');
const $showInFileSystemButton = $('#show-in-file-system');


// Global Variables
var currentFile = null;
var isSaved = false;

// reusable functions
function renderMarkdownToHtml(markdown){
  var html = marked(markdown);
  $htmlView.html(html);
}

function closingFile(){
  if(isSaved === true){
    closeFile();
  }else{
    var save = confirm("File not saved, are you sure you want to close?");
    if(save){
      var mkdn = $markdownView.val();
      mainProcess.saveOnClose(mkdn);
    }else{

    }
  }
}

function closeFile(){
  $markdownView.val('');
  $htmlView.empty();
  $closeFileButton.attr('disabled', true);
  $showInFileSystemButton.attr('disabled', true);
  currentFile = null;
  isSaved = false;
};

function showInFileSystem(){
  shell.showItemInFolder(currentFile);
}

ipc.on('file-opened', function (event, file, content) {
  currentFile = file;
  isSaved = true;
  $showInFileSystemButton.attr('disabled', false);
  $closeFileButton.attr('disabled', false);

  $markdownView.val(content);
  renderMarkdownToHtml(content);
});

ipc.on('file-closed', function(event){
  closingFile();
});

ipc.on('close-after-save', function(event){
  $markdownView.val('');
  $htmlView.empty();
  $closeFileButton.attr('disabled', true);
  $showInFileSystemButton.attr('disabled', true);
  currentFile = null;
});

ipc.on('show-in-file-system', function(event){
  showInFileSystem();
});

$(document).on('click', 'a[href^="http"]', function(event){
  event.preventDefault();
  shell.openExternal(this.href);
  isSaved = false;
});

// button functions
$markdownView.on('keyup', function(){
  var content = $(this).val();
  isSaved = false;
  renderMarkdownToHtml(content);
  $closeFileButton.attr('disabled', false);
});

$openFileButton.on('click', function(){
  mainProcess.openFile();
});

$closeFileButton.on('click', function(){
  closingFile();
});

$copyHtmlButton.on('click', function(){
  var html = $htmlView.html();
  clipboard.writeText(html);
});

$saveFileButton.on('click', function(){
  var mkdn = $markdownView.val();
  mainProcess.saveFile(mkdn);
  isSaved = true;
});

$saveAsHtmlFileButton.on('click', function(){
  var html = $htmlView.html();
  mainProcess.saveAsHtmlFile(html);
});

$showInFileSystemButton.on('click', function(){
  showInFileSystem();
});
