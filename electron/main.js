import {app, dialog, ipcMain, Menu, net, Notification, shell, Tray} from 'electron';
import path from 'path';
import {parseLostArkProfile} from "../tabs/characters/parser.js";
import {changeSettingsPath, getToolsInfo, loadSettings, saveSettings} from "../utils/storage.js";
import fs from "fs";
// import cron from "node-cron";
import {DateTime, Settings} from "luxon";
import {createWindow, setMainWindow} from "../mainProcess/mainWindow.js";
import {capitalize} from "../utils/utils.js";
import applySettings from "../mainProcess/applySettings.js";
import {resetDailyActivities, resetWeeklyActivities} from "../mainProcess/resetActivities.js";
import { parse } from 'semver';
import schedule from "node-schedule";

process.env.DIST = path.join(import.meta.dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
    ? process.env.DIST
    : path.join(process.env.DIST, '../public')

let tray;
let mainWindow = null;

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

    Settings.defaultZone = "UTC+3";
    resetDailyActivities(DateTime);
    resetWeeklyActivities(DateTime);

    schedule.scheduleJob('0 3 * * *', () => {
        resetWeeklyActivities(DateTime);
        resetDailyActivities(DateTime);
    });

    // cron.schedule('0 3 * * *', () => {
    //     resetWeeklyActivities(DateTime);
    //     resetDailyActivities(DateTime);
    // });
    schedule.scheduleJob('* * * * *', () => {
        resetDailyActivities(DateTime);
    });
    //
    // cron.schedule('* * * * *', () => {
    //     resetDailyActivities(DateTime);
    // });

    const settings = loadSettings();
    applySettings(settings);
    resetReminderSettingsIfNeeded();
    scheduleReminders(DateTime);
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
                    const latestVersion = releaseData.tag_name;
                    const assets = releaseData.assets;

                    // Ищем .exe в релизе
                    const exeAsset = assets.find(asset => asset.name.endsWith('.exe'));

                    if (exeAsset) {
                        const downloadUrl = exeAsset.browser_download_url;
                        event.sender.send('update-available', {latestVersion, downloadUrl});
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

ipcMain.handle('is-newer-version', async (_, current, latest) => {
    return parse(latest) > parse(current);
});

function shouldNotifyToday(type, settings) {
    Settings.defaultZone = "UTC+3";

    const today = DateTime.now().toFormat('yyyy-MM-dd');
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
            const notifyTime = DateTime.local().set({ hour: +h, minute: +m }).minus({ minutes: 5 });

            schedule.scheduleJob(`${notifyTime.minute} ${notifyTime.hour} * * *`, () => {
                const now = DateTime.local();
                if (now.weekday === weekday) {
                    new Notification({
                        title: 'Напоминание',
                        body: `${type === 'boss' ? 'Полевой босс' : 'Разлом хаоса'} начнётся через 5 минут!`,
                    }).show();
                }
            })

            // cron.schedule(`${notifyTime.minute} ${notifyTime.hour} * * *`, () => {
            //     const now = DateTime.local();
            //     if (now.weekday === weekday) {
            //         new Notification({
            //             title: 'Напоминание',
            //             body: `${type === 'boss' ? 'Полевой босс' : 'Разлом хаоса'} начнётся через 5 минут!`,
            //         }).show();
            //     }
            // });
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

        // cron.schedule(`*/${interval} * * * *`, () => {
        //     const now = DateTime.local();
        //
        //     if (days.includes(now.weekday)) {
        //         new Notification({
        //             title: 'Напоминание',
        //             body: `${notification.name}`,
        //         }).show();
        //     }
        // });
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