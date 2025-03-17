import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const dataPath = path.join(app.getPath('userData'), 'config.json');

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
