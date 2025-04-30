const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
        fetchCharacters: (nickname) => ipcRenderer.invoke('fetch-characters', nickname),
        fetchCharacter: (nickname) => ipcRenderer.invoke('fetch-character', nickname),
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
        openExternal: (url) => ipcRenderer.invoke('open-external', url),
        chooseFolder: () => ipcRenderer.invoke('choose-folder'),
    }
});