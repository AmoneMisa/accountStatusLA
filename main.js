import pkg from 'electron';
const { app, BrowserWindow, Tray, Menu, ipcMain } = pkg;

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Заменяем __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import path from 'path';
import fs from 'fs';
import {parseLostArkProfile} from "./parser.js";

let mainWindow;
let tray;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

await app.on('ready', () => {
    createWindow();

    tray = new Tray(path.join(__dirname, 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Открыть', click: () => { mainWindow.show(); } },
        { label: 'Выход', click: () => { app.quit(); } }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Lost Ark Character Manager');

    tray.on('click', () => {
        mainWindow.show();
    });
});

ipcMain.on('window:minimize', () => {
    mainWindow.minimize();
});

ipcMain.on('window:toggleMaximize', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('window:close', () => {
    mainWindow.hide();
});

ipcMain.on('window:quit', () => {
    app.quit();
});

ipcMain.on('fetch-characters', async (event, nickname) => {
    const characters = await parseLostArkProfile(nickname);
    if (!characters) {
        event.reply('characters-fetch-error', 'Ошибка получения персонажей');
        return;
    }

    const filePath = path.join(app.getPath('userData'), 'characters.json');
    fs.writeFileSync(filePath, JSON.stringify(characters, null, 2), 'utf-8');
    event.reply('characters-fetched', characters);
});
