import { BrowserWindow } from "electron";
const events = require('events')
const defaultCfg = {
  show: false,
  frame: false,
  focusable: false,
  resizable: false,
  webPrefrences: {
    nodeIntegration: true,
    contextIsolation: false
  }
}

export class Launch extends events {
  constructor(config) {
    super()
    this.state = Object.assign({}, defaultCfg, config)
    this.windowInstance = new BrowserWindow(this.state)
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      this.windowInstance.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/#/launchPage`)
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      win.loadURL('app://./index.html/#/launchPage')
    }
    this.init()
  }

  init() {
    this.windowInstance.once('ready-to-show', () => {
      this.windowInstance.show()
    })

    this.windowInstance.on('show', () => {
      this.emit('show')
    })

  }
  close(){
    this.windowInstance.close()
  }
}