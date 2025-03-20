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

async function createWindow() {
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
        { label: 'Открыть', click: () => mainWindow.show() },
        { type: 'separator' },
        { label: 'Сбросить настройки персонажей', click: () => {
                mainWindow.webContents.send('clear-character-settings');
            }},
        { label: 'Сбросить список персонажей', click: () => {
                mainWindow.webContents.send('clear-characters-list');
            }},
        { label: 'Сбросить настройки кубов', click: () => {
                mainWindow.webContents.send('clear-characters-qubes');
            }},
        {
            label: 'Очистить ник',
            click: () => mainWindow.webContents.send('clear-nickname')
        },
        { type: 'separator' },
        { label: 'Выход', click: () => app.quit() }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Lost Ark Character Manager');

    tray.on('click', () => {
        mainWindow.show();
    });
});

ipcMain.handle('clear-character-settings', () => {
    console.log("Очищаем настройки персонажей...");
    mainWindow.webContents.send('clear-character-settings');
});

ipcMain.handle('clear-characters-list', () => {
    console.log("Очищаем список персонажей...");
    mainWindow.webContents.send('clear-characters-list');
});

ipcMain.handle('clear-characters-qubes', () => {
    console.log("Очищаем список персонажей...");
    mainWindow.webContents.send('clear-characters-qubes');
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
        if (nickname === "Неизвестный" || !nickname) {
            return;
        }

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
                if (["Хаос", "Хранитель", "Эфонка"].includes(raid)) {
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
