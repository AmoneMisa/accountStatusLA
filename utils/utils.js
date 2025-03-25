export function saveSettings(settings) {
    window.electron.ipcRenderer.send("save-settings", settings);
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}