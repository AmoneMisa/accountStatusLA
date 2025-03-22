import {app, BrowserWindow} from "electron";
import path, {join} from "path";

let globalWindow = null;

export async function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        icon: path.join(app.getAppPath(), 'assets', 'icon.png'),
        webPreferences: {
            preload: join(import.meta.dirname, 'preload.cjs'), // Указываем путь к `preload.cjs`
            contextIsolation: true, // Должно быть `true`
            enableRemoteModule: false,
            nodeIntegration: false // Должно быть `false`!
        }
    });

    await mainWindow.loadFile('index.html');

    return mainWindow;
}

export function setMainWindow(mainWindow) {
    globalWindow = mainWindow;
}

export function getMainWindow() {
    return globalWindow;
}