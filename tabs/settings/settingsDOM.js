import {saveSettings} from "../../utils/utils.js";

export default async function () {
    const savePathInput = document.getElementById("savePath");
    const chooseFolderButton = document.getElementById("choose-folder");
    const themeSelect = document.getElementById("theme");
    const minimizeOnCloseCheckbox = document.getElementById("minimizeOnClose");
    const rememberWindowSizeCheckbox = document.getElementById("rememberWindowSize");
    const rememberWindowPositionCheckbox = document.getElementById("rememberWindowPosition");
    const saveSettingsButton = document.getElementById("save-settings");

    // Загрузка текущих настроек из `main.js`
    const settings = await window.electron.ipcRenderer.invoke("load-settings");
    if (settings.savePath) {
        savePathInput.value = settings.savePath;
    }

    if (settings.theme) {
        document.documentElement.setAttribute("data-theme", settings.theme);
        themeSelect.value = settings.theme;
    }

    themeSelect.addEventListener("change", () => {
        const selectedTheme = themeSelect.value;

        document.documentElement.setAttribute("data-theme", selectedTheme);
        saveSettings({theme: selectedTheme});
        document.getElementById("message").innerText = "Тема изменена";
    });

    window.electron.ipcRenderer.on('apply-theme', (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        document.getElementById("theme").value = theme;
    });

    if (settings.minimizeOnClose) {
        minimizeOnCloseCheckbox.checked = settings.minimizeOnClose;
    }

    if (settings.rememberWindowSize) {
        rememberWindowSizeCheckbox.checked = settings.rememberWindowSize;
    }

    if (settings.rememberWindowPosition) {
        rememberWindowPositionCheckbox.checked = settings.rememberWindowPosition;
    }

    // Выбор пути сохранения
    chooseFolderButton.addEventListener("click", async () => {
        const filePath = await window.electron.ipcRenderer.chooseFolder();

        if (filePath) {
            document.getElementById('savePath').value = await window.electron.ipcRenderer.invoke('change-settings-path', filePath);
        }
    });

    // Сохранение настроек
    saveSettingsButton.addEventListener("click", () => {
        saveSettings({
            savePath: savePathInput.value,
            theme: themeSelect.value,
            minimizeOnClose: minimizeOnCloseCheckbox.checked,
            rememberWindowSize: rememberWindowSizeCheckbox.checked,
            rememberWindowPosition: rememberWindowPositionCheckbox.checked,
        });
        document.getElementById("message").innerText = "Настройки сохранены";
    });

    document.getElementById('update-app').addEventListener('click', async () => {
        document.getElementById('message').innerText = "Проверка обновлений...";
        document.getElementById('error').innerText = "";

        await window.electron.ipcRenderer.invoke('check-for-updates');
    });

    window.electron.ipcRenderer.on('update-available', async ({latestVersion, downloadUrl}) => {
        document.getElementById('message').innerText = `Доступно обновление ${latestVersion}. Открываем страницу загрузки...`;

        await window.electron.ipcRenderer.openExternal(downloadUrl);
    });

    window.electron.ipcRenderer.on('update-not-found', () => {
        document.getElementById('message').innerText = "Обновлений нет.";
    });

    window.electron.ipcRenderer.on('update-error', (_, errorMessage) => {
        console.error(_, errorMessage)
        document.getElementById('error').innerText = `Ошибка обновления: ${errorMessage?.message || "Неизвестная ошибка"}`;
    });
}