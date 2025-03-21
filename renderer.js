import {loadCharacters, renderCharacters, setEditable, sortCharacters,} from "./characters.js";
import {renderCharacterTable} from "./qubes.js";

document.addEventListener('DOMContentLoaded', async () => {
    const nicknameElement = document.getElementById('nickname');
    const editNicknameButton = document.getElementById('edit-nickname');
    const saveNicknameButton = document.getElementById('save-nickname');

    let nickname = localStorage.getItem('nickname') || '';

    if (!nickname) {
        nicknameElement.innerHTML = `<input type="text" id="nickname-input" placeholder="Введите ник" autofocus />`;
        editNicknameButton.style.display = 'none';
        saveNicknameButton.style.display = 'inline-block';
    } else {
        nicknameElement.innerText = `Ваш ник: ${nickname}`;
    }

    try {
        if (!nickname) {
            nickname = await window.electron.ipcRenderer.getNickname();
            nicknameElement.innerText = `Ваш ник: ${nickname}`;
            localStorage.setItem('nickname', nickname);
        }

        const allNickCharacters = JSON.parse(localStorage.getItem('allNickCharacters') || '{}');

        if (!allNickCharacters[nickname]) {
            const characters = await window.electron.ipcRenderer.fetchCharacters(nickname);
            if (characters && !characters?.error) {
                allNickCharacters[nickname] = characters;
                localStorage.setItem('allNickCharacters', JSON.stringify(allNickCharacters));
            }
        }

        if (localStorage.getItem('charactersList')) {
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
        const nickname = await window.electron.ipcRenderer.getNickname();
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
        const currentNickname = localStorage.getItem('nickname');

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

        await window.electron.ipcRenderer.setNickname(newNickname);
        localStorage.setItem('nickname', newNickname);

        document.getElementById('nickname').innerText = `Ваш ник: ${newNickname}`;
        document.getElementById('save-nickname').style.display = 'none';
        document.getElementById('edit-nickname').style.display = 'inline-block';

        if (JSON.parse(localStorage.getItem('charactersList'))[newNickname]) {
            renderCharacters(true);
        } else {
            await loadCharacters(newNickname);
        }
    });

    if (document.getElementById('apply-raids')) {
        document.getElementById('apply-raids').addEventListener('click', () => {
            const selectedOptions = Array.from(document.getElementById('raid-select').selectedOptions).map(option => option.value);
            localStorage.setItem('selectedRaids', JSON.stringify(selectedOptions));
            renderCharacters(false); // Перерисовываем список с новыми рейдами
        });
    }

    window.electron.ipcRenderer.on('clear-character-settings', () => {
        localStorage.removeItem('characterSettings');
        console.log('Настройки персонажей сброшены.');
        renderCharacters(false);
    });

    window.electron.ipcRenderer.on('clear-characters-list', () => {
        localStorage.removeItem('charactersList');
        console.log('Список персонажей сброшен.');
        renderCharacters(false);
    });

    window.electron.ipcRenderer.on('clear-characters-qubes', () => {
        localStorage.removeItem('tableData');
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

            if (tabId === 'table') {
                renderCharacterTable();
            }
        });
    });

    window.electron.ipcRenderer.on('clear-nickname', async () => {
        localStorage.removeItem('nickname');
        await window.electron.ipcRenderer.removeNickname(nickname);
        document.getElementById('nickname').innerText = "Ник не установлен";
    });

    const savePathInput = document.getElementById("savePath");
    const chooseFolderButton = document.getElementById("choose-folder");
    const themeSelect = document.getElementById("theme");
    const minimizeOnCloseCheckbox = document.getElementById("minimizeOnClose");
    const rememberWindowSizeCheckbox = document.getElementById("rememberWindowSize");
    const rememberWindowPositionCheckbox = document.getElementById("rememberWindowPosition");
    const updateAppButton = document.getElementById("update-app");
    const saveSettingsButton = document.getElementById("save-settings");

    // Загрузка текущих настроек из `main.js`
    const settings = await window.electron.ipcRenderer.invoke("load-settings");
    if (settings.savePath) {
        savePathInput.value = settings.savePath;
    }

    if (settings.theme) {
        themeSelect.value = settings.theme;
    }

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
        const folderPath = await window.electron.ipcRenderer.invoke("choose-folder");
        if (folderPath) {
            savePathInput.value = folderPath;
        }
    });

    // Сохранение настроек
    saveSettingsButton.addEventListener("click", () => {
        const newSettings = {
            savePath: savePathInput.value,
            theme: themeSelect.value,
            minimizeOnClose: minimizeOnCloseCheckbox.checked,
            rememberWindowSize: rememberWindowSizeCheckbox.checked,
            rememberWindowPosition: rememberWindowPositionCheckbox.checked,
        };

        console.log(newSettings)
        window.electron.ipcRenderer.send("save-settings", newSettings);
    });

    // Обновление приложения
    updateAppButton.addEventListener("click", () => {
        window.electron.ipcRenderer.send("update-app");
    });
});
