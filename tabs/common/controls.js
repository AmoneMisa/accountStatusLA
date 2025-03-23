import {saveSettings} from "../../utils/utils.js";
import {renderCharacters} from "../characters/characters.js";
import {renderCharacterTable} from "../cubes/cubes.js";
import checkList from "../checkList/checkList.js";

export default function () {
    document.getElementById('minimize').addEventListener('click', () => {
        window.electron.ipcRenderer.send('window:minimize');
    });

    document.getElementById('maximize').addEventListener('click', () => {
        window.electron.ipcRenderer.send('window:toggleMaximize');
    });

    document.getElementById('close').addEventListener('click', () => {
        window.electron.ipcRenderer.send('window:close');
    });

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

    window.electron.ipcRenderer.on('clear-nickname', async () => {
        saveSettings({nickname: undefined});

        document.getElementById('nickname').innerText = "Ник не установлен";
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

            if (tabId === 'check-list') {
                checkList();
            }
        });
    });
}