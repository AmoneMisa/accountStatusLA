import {app, dialog, ipcMain, Menu, net, Notification, shell, Tray} from 'electron';
import path from 'path';
import {getCharacterPage, getClassName, getGearScore, parseLostArkProfile} from "../utils/parser.js";
import {changeSettingsPath, getToolsInfo, loadAppDataSettings, loadSettings, saveSettings} from "../utils/storage.js";
import fs from "fs";
import {DateTime, Settings} from "luxon";
import {createWindow, setMainWindow} from "../mainProcess/mainWindow.js";
import {capitalize} from "../utils/utils.js";
import applySettings from "../mainProcess/applySettings.js";
import {resetDailyActivities, resetWeeklyActivities} from "../mainProcess/resetActivities.js";
import semver from 'semver';
import schedule from "node-schedule";
import {getErrorLog} from "../utils/errors.js";

process.env.DIST = path.join(import.meta.dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
    ? process.env.DIST
    : path.join(process.env.DIST, '../public')

let tray;
let mainWindow = null;

async function checkForUpdates(mainWindow = mainWindow) {
    try {
        const request = net.request('https://api.github.com/repos/AmoneMisa/accountStatusLA/releases/latest');

        request.on('response', (response) => {
            let rawData = '';

            response.on('data', (chunk) => {
                rawData += chunk;
            });

            response.on('end', async () => {
                try {
                    const releaseData = JSON.parse(rawData);
                    const latestVersion = releaseData.name;
                    const assets = releaseData.assets;
                    const currentVersion = app.getVersion();

                    if (!semver.valid(semver.coerce(latestVersion)) || !semver.valid(currentVersion)) {
                        return;
                    }

                    const isNewer = semver.gt(semver.coerce(latestVersion), semver.coerce(semver.coerce(currentVersion)));
                    if (!isNewer) {
                        mainWindow.webContents.send('update-not-found');
                        return;
                    }

                    const exeAsset = assets.find(asset => asset.name.endsWith('.exe'));

                    if (exeAsset) {
                        const downloadUrl = exeAsset.browser_download_url;
                        mainWindow.webContents.send('update-available', { latestVersion, downloadUrl });

                        const updateNotification = new Notification({
                            title: 'Доступно обновление!',
                            body: `Версия ${latestVersion} доступна. Нажми кнопку, чтобы скачать.`,
                        });

                        updateNotification.on('click', () => {
                            shell.openExternal(downloadUrl);
                        });

                        updateNotification.show();
                    } else {
                        mainWindow.webContents.send('update-not-found');
                    }
                } catch (error) {
                    mainWindow.webContents.send('update-error', error);
                }
            });
        });

        request.end();
    } catch (error) {
        mainWindow.webContents.send('update-error', error.message);
    }
}

app.on('ready', async () => {
    mainWindow = await createWindow();
    setMainWindow(mainWindow);

    tray = new Tray(path.join(process.env.VITE_PUBLIC, 'assets/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Открыть', click: () => mainWindow.show()},
        {type: 'separator'},
        {
            label: 'Сбросить настройки персонажей', click: () => {
                mainWindow.webContents.send('clear-character-settings');
            }
        },
        {
            label: 'Сбросить список персонажей', click: () => {
                mainWindow.webContents.send('clear-characters-list');
            }
        },
        {
            label: 'Сбросить настройки кубов', click: () => {
                mainWindow.webContents.send('clear-characters-qubes');
            }
        },
        {
            label: 'Очистить ник',
            click: () => mainWindow.webContents.send('clear-nickname')
        },
        {type: 'separator'},
        {label: 'Выход', click: () => app.quit()}
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Lost Ark Character Manager');

    tray.on('click', () => {
        mainWindow.show();
    });

    resetDailyActivities(DateTime);
    resetWeeklyActivities(DateTime);

    schedule.scheduleJob('*/30 * * * *', () => {
        const nowMoscow = DateTime.now().setZone('Europe/Moscow');

        if (nowMoscow.hour === 6 && nowMoscow.minute === 0) {
            resetWeeklyActivities(DateTime);
            resetDailyActivities(DateTime);
        }
    });

    schedule.scheduleJob('* * * * *', () => {
        const nowMoscow = DateTime.now().setZone('Europe/Moscow');

        if (nowMoscow.hour === 6 && nowMoscow.minute === 0) {
            resetDailyActivities(DateTime);
        }
    });

    const settings = loadSettings();
    applySettings(settings);
    resetReminderSettingsIfNeeded();
    scheduleReminders(DateTime);

    setTimeout(() => {
        checkForUpdates(mainWindow);
    }, 3000);
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

ipcMain.on('window:toggle-always-on-top', (event, shouldBeOnTop) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(shouldBeOnTop);
    }
});

ipcMain.handle('set-nickname', (event, nickname) => {
    saveSettings({nickname});
});

ipcMain.handle('remove-nickname', (event, nickname) => {
    saveSettings({nickname});
});

ipcMain.handle('fetch-characters', async (_, nickname) => {
    try {
        if (nickname === "Неизвестный" || !nickname) {
            return;
        }

        const settings = loadSettings(); // Загружаем настройки
        const savePath = settings.savePath || app.getPath('userData');

        const characters = await parseLostArkProfile(nickname);
        if (!characters) {
            throw new Error('Ошибка получения персонажей');
        }

        const filePath = path.join(savePath, 'characters.json');
        fs.writeFileSync(filePath, JSON.stringify(characters, null, 2), 'utf-8');

        return characters;
    } catch (error) {
        return {error: error.message};
    }
});

ipcMain.handle('fetch-character', async (_, name) => {
    try {
        const page = await getCharacterPage(name);
        const gearScore = getGearScore(page);
        const className = getClassName(page);

        if (!gearScore || !className) {
            throw new Error('Не удалось получить ГС или класс');
        }

        return {
            name,
            gearScore,
            className
        };
    } catch (error) {
        return { error: error.message };
    }
});

ipcMain.handle("load-settings", () => {
    return loadSettings();
});

ipcMain.on("save-settings", (event, newSettings) => {
    const currentSettings = loadSettings();
    const updatedSettings = {...currentSettings, ...newSettings};
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

ipcMain.on("window:close", () => {
    const settings = loadSettings();

    if (settings.rememberWindowPosition) {
        const bounds = mainWindow.getBounds();
        settings.windowPosition = {x: bounds.x, y: bounds.y};
    }

    if (settings.rememberWindowSize) {
        const bounds = mainWindow.getBounds();
        settings.windowSize = {width: bounds.width, height: bounds.height};
    }

    saveSettings(settings);

    if (settings.minimizeOnClose) {
        mainWindow.hide();
    } else {
        app.quit();
        mainWindow = null;
    }
});

ipcMain.on("save-window-state", () => {
    if (!mainWindow) {
        return;
    }

    const settings = loadSettings();
    const bounds = mainWindow.getBounds();

    settings.windowSize = {width: bounds.width, height: bounds.height};
    settings.windowPosition = {x: bounds.x, y: bounds.y};

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

ipcMain.handle('check-for-updates', async (event) => {
    await checkForUpdates(mainWindow);
});

ipcMain.handle('is-newer-version', async (_, current, latest) => {
    return semver.gt(semver.coerce(latest), semver.coerce(current));
});

ipcMain.handle('set-autostart', (event, enable) => {
    app.setLoginItemSettings({
        openAtLogin: enable
    });
});

function shouldNotifyToday(type, settings) {
    const today = DateTime.now().setZone('Europe/Moscow').toFormat('yyyy-MM-dd');
    return !settings[`disable${capitalize(type)}ReminderToday`] || settings.lastDisabledReminderDate !== today;
}

function scheduleReminders(DateTime) {
    const settings = loadSettings();
    const now = DateTime.now();
    const weekday = now.weekday;
    const toolsInfo = getToolsInfo();

    ['boss', 'chaos'].forEach(type => {
        const info = toolsInfo[type];

        if (!info || !info.weekdays.includes(weekday)) {
            return;
        }

        if (!shouldNotifyToday(type, settings)) {
            return;
        }

        info.hours.forEach(hour => {
            const [h, m] = hour.split(':');
            const notifyTime = DateTime.local().set({hour: +h, minute: +m}).minus({minutes: 5});

            schedule.scheduleJob(`${notifyTime.minute} ${notifyTime.hour} * * *`, () => {
                const now = DateTime.local();
                if (now.weekday === weekday) {
                    new Notification({
                        title: 'Напоминание',
                        body: `${type === 'boss' ? 'Полевой босс' : 'Разлом хаоса'} начнётся через 5 минут!`,
                    }).show();
                }
            });
        });
    });

    const customNotifications = settings.customNotifications;
    if (!customNotifications || !customNotifications.length) {
        return;
    }
    customNotifications.forEach(notification => {
        if (!notification.enable) {
            return;
        }

        const interval = parseInt(notification.frequency);
        const days = notification.days.map(day => parseInt(day));

        schedule.scheduleJob(`*/${interval} * * * *`, () => {
            const now = DateTime.local();

            if (days.includes(now.weekday)) {
                new Notification({
                    title: 'Напоминание',
                    body: `${notification.name}`,
                }).show();
            }
        });
    });
}

function resetReminderSettingsIfNeeded() {
    const settings = loadSettings();
    const today = DateTime.local().toFormat('yyyy-MM-dd');

    let changed = false;

    ['boss', 'chaos'].forEach(type => {
        const key = `disable${capitalize(type)}ReminderToday`;
        const lastDate = settings.lastDisabledReminderDate;

        if (settings[key] && lastDate !== today) {
            // ❌ Сбросить флаг, если он был установлен ранее, но не на сегодня
            settings[key] = false;
            changed = true;
        }
    });

    if (changed) {
        saveSettings(settings);
    }
}

const getCurrentConfigPath = () => {
    const settings = loadAppDataSettings();
    return settings.savePath
        ? path.join(settings.savePath, 'config.json')
        : path.join(app.getPath('userData'), 'config.json');
};

const getBackupPath = () => {
    const settings = loadAppDataSettings();
    return settings.savePath
        ? path.join(settings.savePath, 'config-backup.json')
        : path.join(app.getPath('userData'), 'config-backup.json');
};

// 📂 Открыть папку с конфигом
ipcMain.handle('open-config-folder', async () => {
    const configPath = getCurrentConfigPath();
    return shell.openPath(path.dirname(configPath));
});

// 💾 Сделать бэкап
ipcMain.handle('backup-config', async () => {
    try {
        const configPath = getCurrentConfigPath();
        const backupPath = getBackupPath();
        fs.copyFileSync(configPath, backupPath);
        return {message: 'Бэкап успешно создан.'};
    } catch (e) {
        return {message: `Ошибка при создании бэкапа: ${e.message}`};
    }
});

// ♻️ Восстановить из бэкапа
ipcMain.handle('restore-config-from-backup', async () => {
    try {
        const configPath = getCurrentConfigPath();
        const backupPath = getBackupPath();
        fs.copyFileSync(backupPath, configPath);
        const restored = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        saveSettings(restored); // актуализируем внутри приложения
        return {message: 'Конфиг восстановлен из бэкапа.'};
    } catch (e) {
        return {message: `Ошибка восстановления: ${e.message}`};
    }
});

// 🧾 Сформировать лог
ipcMain.handle('generate-log', async () => {
    try {
        const logDir = path.join(app.getPath('userData'), 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, {recursive: true});
        const logFile = path.join(logDir, `log-${Date.now()}.txt`);

        const settingsDump = JSON.stringify(loadSettings(), null, 2);
        const errorDump = JSON.stringify(getErrorLog(), null, 2);

        const content = `Лог создан: ${new Date().toISOString()}

--- Настройки ---
${settingsDump}

--- Последние ошибки ---
${errorDump || 'Ошибок не зафиксировано.'}
`;

        fs.writeFileSync(logFile, content, 'utf-8');
        shell.showItemInFolder(logFile);
        return {message: 'Лог создан и открыт.'};
    } catch (e) {
        return {message: `Ошибка при создании лога: ${e.message}`};
    }
});