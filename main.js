import {app, BrowserWindow, dialog, ipcMain, Menu, Tray, shell, net} from 'electron';
import path, {dirname, join} from 'path';
import {parseLostArkProfile} from "./parser.js";
import {fileURLToPath} from 'url';
import {changeSettingsPath, loadSettings, saveSettings} from "./storage.js";
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
}

await app.on('ready', async () => {
    await createWindow();
    const settings = loadSettings();
    applySettings(settings);

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

ipcMain.handle('remove-nickname', (event, nickname) => {
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
}

ipcMain.handle("load-settings", () => {
    return loadSettings();
});

ipcMain.on("save-settings", (event, newSettings) => {
    const currentSettings = loadSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    saveSettings(updatedSettings);
});

// Выбор папки для сохранения
ipcMain.handle("choose-folder", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

// Закрытие или сворачивание при нажатии на крестик
ipcMain.on("window:close", () => {
    const settings = loadSettings();

    if (settings.rememberWindowPosition) {
        const bounds = mainWindow.getBounds();
        settings.windowPosition = { x: bounds.x, y: bounds.y };
    }

    // Если включено запоминание размера окна
    if (settings.rememberWindowSize) {
        const bounds = mainWindow.getBounds();
        settings.windowSize = { width: bounds.width, height: bounds.height };
    }

    saveSettings(settings);

    if (settings.minimizeOnClose) {
        mainWindow.hide();
    } else {
        app.quit();
    }

    mainWindow = null;
});

ipcMain.on("save-window-state", () => {
    if (!mainWindow) return;

    const settings = loadSettings();
    const bounds = mainWindow.getBounds();

    settings.windowSize = { width: bounds.width, height: bounds.height };
    settings.windowPosition = { x: bounds.x, y: bounds.y };

    saveSettings(settings);
});

ipcMain.on("restore-window-state", () => {
    const settings = loadSettings();

    if (settings.windowSize) {
        mainWindow.setSize(settings.windowSize.width, settings.windowSize.height);
    }

    if (settings.windowPosition) {
        mainWindow.setBounds({
            x: settings.windowPosition.x,
            y: settings.windowPosition.y,
            width: settings.windowSize.width,
            height: settings.windowSize.height,
        });
    }
});

ipcMain.on("update-app", async () => {
    const repoUrl = "https://github.com/AmoneMisa/accountStatusLA/releases/latest";
    await shell.openExternal(repoUrl);
});

ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
});

ipcMain.handle('change-settings-path', async (event, newPath) => {
    return changeSettingsPath(newPath);
});

function applySettings(settings) {
    // 📌 Запоминать размер окна
    if (settings.rememberWindowSize && settings.windowSize) {
        mainWindow.setSize(settings.windowSize.width, settings.windowSize.height);
    }

    // 📌 Запоминать расположение окна
    if (settings.rememberWindowPosition && settings.windowPosition) {
        mainWindow.setBounds({
            x: settings.windowPosition.x,
            y: settings.windowPosition.y,
            width: settings.windowSize ? settings.windowSize.width : 1200,  // fallback
            height: settings.windowSize ? settings.windowSize.height : 800  // fallback
        });
    }

    // 📌 Обрабатывать поведение кнопки закрытия
    mainWindow.on('close', (event) => {
        if (settings.minimizeOnClose) {
            event.preventDefault();
            mainWindow.hide();
        } else {
            app.quit();
        }
    });
}

ipcMain.handle('check-for-updates', async (event) => {
    try {
        const request = net.request('https://api.github.com/repos/AmoneMisa/accountStatusLA/releases/latest');

        request.on('response', (response) => {
            let rawData = '';
            console.log("response", response)
            response.on('data', (chunk) => { rawData += chunk; });
            response.on('end', async () => {
                try {
                    const releaseData = JSON.parse(rawData);
                    const latestVersion = releaseData.tag_name;
                    const assets = releaseData.assets;
                    console.log("response", releaseData)

                    // Ищем .exe в релизе
                    const exeAsset = assets.find(asset => asset.name.endsWith('.exe'));

                    if (exeAsset) {
                        const downloadUrl = exeAsset.browser_download_url;
                        event.sender.send('update-available', { latestVersion, downloadUrl });
                    } else {
                        event.sender.send('update-not-found');
                    }
                } catch (error) {
                    event.sender.send('update-error', error);
                }
            });
        });

        request.end();
    } catch (error) {
        event.sender.send('update-error', error.message);
    }
});

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
