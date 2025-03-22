import {loadCharacters, renderCharacters, setEditable, sortCharacters,} from "./characters.js";
import {renderCharacterTable} from "./qubes.js";
import {saveSettings} from "./utils.js";

document.addEventListener('DOMContentLoaded', async () => {
    const nicknameElement = document.getElementById('nickname');
    const editNicknameButton = document.getElementById('edit-nickname');
    const saveNicknameButton = document.getElementById('save-nickname');

    window.electron.ipcRenderer.on('init-settings', async (settings) => {
        window.settings = settings;
        migration();

        let nickname = window.settings.nickname;

        if (!nickname) {
            nicknameElement.innerHTML = `<input type="text" id="nickname-input" placeholder="Введите ник" autofocus />`;
            editNicknameButton.style.display = 'none';
            saveNicknameButton.style.display = 'inline-block';
        } else {
            nicknameElement.innerText = `Ваш ник: ${nickname}`;
        }

        try {
            const allNickCharacters = window.settings.allNickCharacters || {};

            if (!allNickCharacters[nickname]) {
                const characters = await window.electron.ipcRenderer.fetchCharacters(nickname);
                if (characters && !characters?.error) {
                    allNickCharacters[nickname] = characters;
                    saveSettings({allNickCharacters: allNickCharacters});
                }
            }

            if (window.settings.characterList) {
                renderCharacters(false);
            } else {
                await loadCharacters(nickname);
            }
        } catch (error) {
            console.error("Ошибка загрузки ника:", error);
            nicknameElement.innerText = "Ошибка загрузки ника";
            editNicknameButton.style.display = 'block';
            saveNicknameButton.style.display = 'none';
        }
    });

    window.electron.ipcRenderer.on('update-settings', (settings) => {
        window.settings = settings;
        renderCharacters(false);
    });

    document.getElementById('minimize').addEventListener('click', () => {
        window.electron.ipcRenderer.send('window:close');
    });

    document.getElementById('maximize').addEventListener('click', () => {
        window.electron.ipcRenderer.send('window:toggleMaximize');
    });

    document.getElementById('close').addEventListener('click', () => {
        window.electron.ipcRenderer.send('window:close');
    });

    document.getElementById('save-button').addEventListener('click', () => {
        sortCharacters();
        setEditable(false);

        console.log("Загружаем персонажей после сохранения...");
        renderCharacters(false);
    });

    document.getElementById('refresh-characters').addEventListener('click', async () => {
        const nickname = window.settings.nickname;
        if (nickname) {
            await loadCharacters(nickname);
            document.getElementById('save-button').style.display = 'block';
            setEditable(true);
        }
    });

    document.getElementById('edit-characters').addEventListener('click', () => {
        renderCharacters(true);
        setEditable(true);
    });

    document.getElementById('edit-nickname').addEventListener('click', () => {
        const currentNickname = window.settings.nickname;

        nicknameElement.innerHTML = `<input type="text" id="nickname-input" value="${currentNickname}" />`;

        document.getElementById('edit-nickname').style.display = 'none';
        document.getElementById('save-nickname').style.display = 'inline-block';
    });

    document.getElementById('save-nickname').addEventListener('click', async () => {
        const newNickname = document.getElementById('nickname-input').value.trim();

        if (!newNickname) {
            alert('Введите корректный ник!');
            return;
        }

        saveSettings({nickname: newNickname});

        document.getElementById('nickname').innerText = `Ваш ник: ${newNickname}`;
        document.getElementById('save-nickname').style.display = 'none';
        document.getElementById('edit-nickname').style.display = 'inline-block';

        if (window.settings.characterList[newNickname]) {
            renderCharacters(true);
        } else {
            await loadCharacters(newNickname);
        }
    });

    if (document.getElementById('apply-raids')) {
        document.getElementById('apply-raids').addEventListener('click', () => {
            const selectedOptions = Array.from(document.getElementById('raid-select').selectedOptions).map(option => option.value);
            saveSettings({selectedRaids: selectedOptions});
            renderCharacters(false); // Перерисовываем список с новыми рейдами
        });
    }

    window.electron.ipcRenderer.on('clear-character-settings', () => {
        saveSettings({characterSettings: undefined});
        console.log('Настройки персонажей сброшены.');
        renderCharacters(false);
    });

    window.electron.ipcRenderer.on('clear-characters-list', () => {
        saveSettings({characterList: undefined});
        console.log('Список персонажей сброшен.');
        renderCharacters(false);
    });

    window.electron.ipcRenderer.on('clear-characters-qubes', () => {
        saveSettings({tableData: undefined});
        console.log('Настройки кубов сброшены.');
        renderCharacters(false);
    });

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

            const tabId = button.dataset.tab;
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            document.getElementById("message").innerText = "";
            document.getElementById("error").innerText = "";

            if (tabId === 'table') {
                renderCharacterTable();
            }
        });
    });

    window.electron.ipcRenderer.on('clear-nickname', async () => {
        saveSettings({nickname: undefined});

        document.getElementById('nickname').innerText = "Ник не установлен";
    });

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
});


function migration() {
    if (!window.settings.characterSettings) {
        window.settings.characterSettings = JSON.parse(localStorage.getItem('characterSettings'));
    }

    if (!window.settings.characterList) {
        window.settings.characterList = JSON.parse(localStorage.getItem('charactersList'));
    }

    if (!window.settings.nickname) {
        window.settings.nickname = localStorage.getItem('nickname');
    }

    if (!window.settings.allNickCharacters) {
        window.settings.allNickCharacters = JSON.parse(localStorage.getItem('allNickCharacters'));
    }

    if (!window.settings.selectedRaids) {
        window.settings.selectedRaids = JSON.parse(localStorage.getItem('selectedRaids'));
    }

    if (!window.settings.tableData) {
        window.settings.tableData = JSON.parse(localStorage.getItem('tableData'));
    }

    saveSettings(window.settings);
}