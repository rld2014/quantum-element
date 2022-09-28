'use strict'

import { app, protocol, BrowserWindow, screen, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const path = require('path')
import * as cv from 'opencv4nodejs'
const isDevelopment = process.env.NODE_ENV !== 'production'
const renderProcessApi = path.join(__dirname, '../src/scripts/preload.ts')
const DESIGN_MAINWINDOW_WIDTH: number = 1280
const DESIGN_MAINWINDOW_HEIGHT: number = 800
const REFRENCE_SCREEN_WIDTH: number = 1920
const REFRENCE_SCREEN_HEIGHT: number = 1080
const DESIGN_LAUNCHPAGE_WIDTH: number = 600
const DESIGN_LAUNCHPAGE_HEIGHT: number = 300

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {

  const screenBound = screen.getPrimaryDisplay().bounds

  const realWindowWidth = Math.floor(DESIGN_MAINWINDOW_WIDTH / REFRENCE_SCREEN_WIDTH * screenBound.width)
  const realWindowHeight = Math.floor(DESIGN_MAINWINDOW_HEIGHT / REFRENCE_SCREEN_HEIGHT * screenBound.height)
  // Create the browser window.
  const win = new BrowserWindow({
    width: realWindowWidth,
    height: realWindowHeight,
    frame: false,
    useContentSize: false,
    show: false,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info

      preload: renderProcessApi,
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION === undefined,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  win.on('ready-to-show', () => {
    win.show()
  })
  ipcMain.on('close-app', () => {
    win.close()
    app.quit()
  })
  ipcMain.on('min-app', () => {
    win.minimize()
  })
  ipcMain.on('maximize-app', () => {
    console.log('toggling window maximize')
    if (!win.isMaximized()) {
      win.maximize()
    } else {
      win.unmaximize()
    }
  })
}
app.on('ready', async () => {
  createWindow()
  console.log(cv.version)
})