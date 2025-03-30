import {app, BrowserWindow} from "electron";
import path, {join} from "path";

let globalWindow = null;

export async function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        icon: path.join(process.env.VITE_PUBLIC, 'assets/icon.png'),
        webPreferences: {
            preload: join(import.meta.dirname, 'preload.mjs'),
            contextIsolation: true, // Должно быть `true`
            enableRemoteModule: false,
            nodeIntegration: false // Должно быть `false`!
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        await mainWindow.loadFile(path.join(process.env.DIST, 'index.html'))
    }

    return mainWindow;
}

export function setMainWindow(mainWindow) {
    globalWindow = mainWindow;
}

export function getMainWindow() {
    return globalWindow;
}