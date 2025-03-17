const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        getNickname: () => ipcRenderer.invoke('get-nickname'),
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
});