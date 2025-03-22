import fs from 'fs';
import path from 'path';
import { app } from 'electron';

let dataPath = path.join(app.getPath('userData'), 'config.json');

// Функция чтения данных
export function loadSettings() {
    let settings = {};

    if (fs.existsSync(dataPath)) {
        settings = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    const settingsPath = settings.savePath
        ? path.join(settings.savePath, 'config.json')
        : dataPath;

    if (fs.existsSync(settingsPath)) {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }

    return settings;
}

// Функция записи данных
export function saveSettings(settings) {
    const settingsPath = settings.savePath
        ? path.join(settings.savePath, 'config.json')
        : dataPath;

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

export function changeSettingsPath(newPath) {
    const oldSettings = loadSettings();

    // Если старые настройки существуют — копируем их в новую папку
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true });
    }

    oldSettings.savePath = newPath;
    saveSettings(oldSettings);
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