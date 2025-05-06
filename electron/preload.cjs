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
        openConfigFolder: () => ipcRenderer.invoke('open-config-folder'),
        backupConfig: () => ipcRenderer.invoke('backup-config'),
        restoreConfigFromBackup: () => ipcRenderer.invoke('restore-config-from-backup'),
        generateLog: () => ipcRenderer.invoke('generate-log'),
        saveCacheJson: (data) => ipcRenderer.invoke('save-cache-json', data),
        loadCacheJson: () => ipcRenderer.invoke('load-cache-json'),
        getSystemFonts: () => ipcRenderer.invoke('get-system-fonts'),
    }
});