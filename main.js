import {app, BrowserWindow, ipcMain, Menu, Tray} from 'electron';
import path, {dirname, join} from 'path';
import {parseLostArkProfile} from "./parser.js";
import {fileURLToPath} from 'url';
import {loadSettings, saveSettings} from "./storage.js";
import fs from "fs";
import cron from "node-cron";

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

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Сбросить настройки персонажей', click: () => mainWindow.webContents.send('clear-character-settings') },
        { label: 'Сбросить список персонажей', click: () => mainWindow.webContents.send('clear-characters-list') }
    ]);

    mainWindow.webContents.on('context-menu', () => {
        contextMenu.popup();
    });

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

ipcMain.handle('set-nickname', (event, nickname) => {
    saveSettings({ nickname });
});

ipcMain.handle('fetch-characters', async (_, nickname) => {
    try {
        const characters = await parseLostArkProfile(nickname);
        if (!characters) {
            throw new Error('Ошибка получения персонажей');
        }

        const filePath = path.join(app.getPath('userData'), 'characters.json');
        fs.writeFileSync(filePath, JSON.stringify(characters, null, 2), 'utf-8');

        return characters;
    } catch (error) {
        return { error: error.message };
    }
});

function resetRaids() {
    let settings = loadSettings();
    const now = new Date();
    const day = now.getUTCDay(); // 0 = воскресенье, 3 = среда

    Object.keys(settings).forEach(charName => {
        if (settings[charName].raids) {
            settings[charName].raids.forEach(raid => {
                if (["Chaos", "Guard"].includes(raid)) {
                    settings[charName].raidStatus[raid] = false;
                } else if (day === 3) {
                    settings[charName].raidStatus[raid] = false;
                }
            });
        }
    });

    saveSettings(settings);
    console.log("Рейды сброшены!");
}

// Сбрасываем Chaos и Guard в 06:00 каждый день
cron.schedule('0 6 * * *', () => {
    console.log("Сбрасываем Хаос и Хранителей...");
    resetRaids();
});

// Сбрасываем все остальные рейды в 06:00 по средам
cron.schedule('0 6 * * 3', () => {
    console.log("Сбрасываем недельные рейды...");
    resetRaids();
});
