export function saveSettings(settings) {
    window.electron.ipcRenderer.send("save-settings", settings);
}