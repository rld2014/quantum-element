'use strict'

import { app, protocol, BrowserWindow, screen, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const path = require('path')
import * as cv from 'opencv4nodejs'
import { Mat } from 'opencv4nodejs'
const isDevelopment = process.env.NODE_ENV !== 'production'
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
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) 
    win.webContents.openDevTools()
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
    if (!win.isMaximized()) {
      win.maximize()
    } else {
      win.unmaximize()
    }
  })
  ipcMain.handle('find-spectrum', async (event, ImageBuffer: ImageData, width, height, __calibLines, __rows) => {
    const buffer = Buffer.from(ImageBuffer.data.buffer)
    let caliblines = JSON.parse(__calibLines)
    let rows = JSON.parse(__rows)
    let mat = new cv.Mat(buffer, height, width, cv.CV_8UC4);
    mat = mat.cvtColor(cv.COLOR_BGR2GRAY)
   
    const res = []
    for (let i = 0; i < caliblines.length - 1; i++) {
      const curLine = caliblines[i]
      const nextLine = caliblines[i + 1]
      const sectionResult = []
      const sectionWidth = ((nextLine.position - curLine.position) * mat.cols)
      const rect = new cv.Rect(curLine.position * mat.cols, rows.begin * mat.rows, sectionWidth, (rows.end - rows.begin) * mat.rows)
      const region = mat.getRegion(rect)
     
      const spectrumData = await cv.reduceAsync(region, 0, 1/*REDUCE_AVG*/)
      spectrumData.getDataAsArray()[0].forEach((intensity, index) => {
        sectionResult.push([index / sectionWidth * (nextLine.wavelength - curLine.wavelength) + curLine.wavelength,intensity])
      })
      res.push(...sectionResult)
      if (process.env.WEBPACK_DEV_SERVER_URL){
        mat.drawRectangle(rect)
      }
    }
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      cv.imshow('a window', mat)
    }
    return res;
  })
}
app.on('ready', async () => {
  createWindow()
  console.log(cv.version)
})
