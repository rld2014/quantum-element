const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('window_control', {
    toClose: () => ipcRenderer.send('close-app'),
    toMinimize: () => ipcRenderer.send('min-app'),
    toMaximize: () => ipcRenderer.send('maximize-app')
})