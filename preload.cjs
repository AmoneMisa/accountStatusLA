const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        fetchCharacters: (nickname) => ipcRenderer.invoke('fetch-characters', nickname),
        getNickname: () => ipcRenderer.invoke('get-nickname'),
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
});

ipcRenderer.on('clear-character-settings', () => {
    localStorage.removeItem('characterSettings');
    location.reload();
});

ipcRenderer.on('clear-characters-list', () => {
    localStorage.removeItem('charactersList');
    location.reload();
});