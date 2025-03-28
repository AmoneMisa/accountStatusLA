import {app} from "electron";
import {getMainWindow} from "./mainWindow.js";

export default function (settings) {
    let mainWindow = getMainWindow();

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

    mainWindow.webContents.send('init-settings', settings);
}