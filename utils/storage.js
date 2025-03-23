import fs from 'fs';
import path from 'path';
import {app} from 'electron';
import {getMainWindow} from "../mainProcess/mainWindow.js";

let dataPath = path.join(app.getPath('userData'), 'config.json');

// Функция чтения данных
export function loadSettings() {
    let settings = loadAppDataSettings();

    if (settings.savePath) {
        const settingsPath = path.join(settings.savePath, 'config.json');
        if (fs.existsSync(settingsPath)) {
            settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        }
    }

    return settings;
}

export function getToolsInfo() {
    const settingsPath = path.join(app.getAppPath(), "assets", 'toolsInfo.json');
    if (fs.existsSync(settingsPath)) {
        return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
}

function loadAppDataSettings() {
    let settings = {};

    if (fs.existsSync(dataPath)) {
        settings = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    return settings;
}

function saveAppDataSettings(settings) {
    fs.writeFileSync(dataPath, JSON.stringify(settings, null, 2), 'utf-8');
}

export function getCharactersSettings() {
    let settings = loadSettings();
    return settings.characterSettings || {};
}

export function setCharactersSettings(characterSettings) {
    let settings = loadSettings();
    settings.characterSettings = characterSettings;
    saveSettings(settings);
}

// Функция записи данных
export function saveSettings(settings) {
    let {savePath} = loadAppDataSettings();

    if (savePath) {
        fs.writeFileSync(path.join(savePath, 'config.json'), JSON.stringify(settings, null, 2), 'utf-8');
    } else {
        saveAppDataSettings(settings);
    }

    let mainWindow = getMainWindow();
    mainWindow.webContents.send('update-settings', settings);
}

export function changeSettingsPath(newPath) {
    const oldSettings = loadAppDataSettings();
    const settings = loadSettings();

    // Если старые настройки существуют — копируем их в новую папку
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, {recursive: true});
    }

    oldSettings.savePath = newPath;
    saveAppDataSettings(oldSettings);
    saveSettings(settings);

    return newPath;
}

export function getLastResetWeekly() {
    const settings = loadSettings();
    return settings.lastResetWeekly || null;
}

export function getLastResetDaily() {
    const settings = loadSettings();
    return settings.lastResetDaily || null;
}

export function setLastResetWeekly(date) {
    const settings = loadSettings();
    settings.lastResetWeekly = date;
    saveSettings(settings);
}

export function setLastResetDaily(date) {
    const settings = loadSettings();
    settings.lastResetDaily = date;
    saveSettings(settings);
}

