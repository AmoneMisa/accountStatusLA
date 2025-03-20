const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        fetchCharacters: (nickname) => ipcRenderer.invoke('fetch-characters', nickname),
        getNickname: () => ipcRenderer.invoke('get-nickname'),
        setNickname: (event, nickname) => ipcRenderer.invoke('set-nickname', event, nickname),
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
});