import fs from 'fs';
import path from 'path';
import { app } from 'electron';

let dataPath = path.join(app.getPath('userData'), 'config.json');

// Функция чтения данных
export function loadSettings() {
    if (fs.existsSync(dataPath)) {
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    return {};
}

// Функция записи данных
export function saveSettings(settings) {
    fs.writeFileSync(dataPath, JSON.stringify(settings, null, 2), 'utf-8');
}

export function changeSettingsPath(newPath) {
    const newDataPath = path.join(newPath, 'config.json');

    // Если старые настройки существуют — копируем их в новую папку
    if (fs.existsSync(dataPath)) {
        fs.copyFileSync(dataPath, newDataPath);
    }

    // Обновляем глобальный путь
    dataPath = newDataPath;
    return newDataPath;
}

export function getLastReset() {
    const settings = loadSettings();
    return settings.lastReset || null;
}

export function setLastReset(date) {
    const settings = loadSettings();
    settings.lastReset = date;
    saveSettings(settings);
}