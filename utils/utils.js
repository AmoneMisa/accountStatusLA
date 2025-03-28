export function saveSettings(settings) {
    try {
        window.electron.ipcRenderer.send("save-settings", settings);
    } catch (error) {
        try {
            window.electron.ipcRenderer.send("save-settings", JSON.parse(JSON.stringify(settings)));
        } catch (e) {
            console.error('Failed to save settings for settings', e);
        }
    }
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}