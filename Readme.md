# LiveMrkd

This is a simple markdown editor built as a stand-alone application. 
It allows you to create/edit markdown files and displays results in real time 
so you can view as you write.

Built with [Node](http://nodejs.org/) and wrapped in an [Electron](http://electron.atom.io/) container.

## Prerequisites

You will need the following properly installed on your computer.

* [Node.js](http://nodejs.org/) (with NPM)


## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`


## Running / Development

* `npm start`
  

### Building

* `npm build` from within the project root builds Mac OS X 64bit version
* If you need to build for another platform:
  
  `electron-packager <sourcedir> LiveMrkd --platform=<platform> --arch=<arch> --out <output-dir> [optional flags...]`

Get more information about building with [electron-packager](https://github.com/electron-userland/electron-packager#from-the-command-line)


