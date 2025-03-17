import {app, BrowserWindow, Tray, Menu, ipcMain, dialog} from 'electron';
import path from 'path';
// import fs from 'fs';
// import {parseLostArkProfile} from "./parser.js";
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {loadSettings, saveSettings} from "./storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let tray;

async function showNicknameWindow() {
    return new Promise((resolve) => {
        let nicknameWindow = new BrowserWindow({
            width: 500,
            height: 350,
            frame: false,
            modal: true,
            parent: mainWindow,
            webPreferences: {
                preload: join(__dirname, 'preload.cjs'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        nicknameWindow.loadFile(path.join(app.getAppPath(), 'assets', 'nickname.html'));

        ipcMain.once('save-nickname', (event, nickname) => {
            saveSettings({nickname});
            nicknameWindow.close();
            resolve(nickname);
        });
    });
}

async function createWindow() {
    const settings = loadSettings();


    if (!settings.nickname) {
        settings.nickname = await showNicknameWindow();
    }

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        icon: path.join(app.getAppPath(), 'assets', 'icon.png'),
        webPreferences: {
            preload: join(__dirname, 'preload.cjs'), // Указываем путь к `preload.cjs`
            contextIsolation: true, // Должно быть `true`
            enableRemoteModule: false,
            nodeIntegration: false // Должно быть `false`!
        }
    });

    await mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

await app.on('ready', async () => {
    await createWindow();

    tray = new Tray(path.join(app.getAppPath(), 'assets', 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Открыть', click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Выход', click: () => {
                app.quit();
            }
        }
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

ipcMain.handle('get-nickname', () => {
    const settings = loadSettings();
    return settings.nickname || 'Неизвестный';
});

ipcMain.on('save-nickname', (event, nickname) => {
    console.log("Получен ник:", nickname); // Проверка в консоли
    saveSettings({ nickname });
    event.sender.getOwnerBrowserWindow().close();
});
// ipcMain.on('fetch-characters', async (event, nickname) => {
//     const characters = await parseLostArkProfile(nickname);
//     if (!characters) {
//         event.reply('characters-fetch-error', 'Ошибка получения персонажей');
//         return;
//     }
//
//     const filePath = path.join(app.getPath('userData'), 'characters.json');
//     fs.writeFileSync(filePath, JSON.stringify(characters, null, 2), 'utf-8');
//     event.reply('characters-fetched', characters);
// });
