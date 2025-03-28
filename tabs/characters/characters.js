import {saveSettings} from "../../utils/utils.js";

// Загрузка и применение настроек персонажей
export function loadCharacterSettings() {
    const settings = window.settings.characterSettings || {};
    document.querySelectorAll('.character').forEach(charDiv => {
        const charName = charDiv.dataset.name;
        const charSettings = settings[charName];

        if (charSettings) {
            charDiv.querySelectorAll('span').forEach(icon => {
                const type = icon.dataset.type;
                if (charSettings[type]) {
                    icon.classList.remove('inactive');
                } else {
                    icon.classList.add('inactive');
                }
            });
        }
    });
}

export function sortCharacters() {
    const container = document.getElementById('character-list');
    const chars = Array.from(container.children);
    const settings = window.settings.characterSettings || {};

    chars.sort((a, b) => {
        const aSet = settings[a.dataset.name] || {};
        const bSet = settings[b.dataset.name] || {};

        return (bSet.legate - aSet.legate) ||
            (bSet.goldReceiver - aSet.goldReceiver) ||
            (bSet.favorite - aSet.favorite) ||
            (parseFloat(b.dataset.gs) - parseFloat(a.dataset.gs));
    });

    container.innerHTML = '';
    chars.forEach(char => container.appendChild(char));
}

export async function loadCharacters(nickname) {
    const container = document.getElementById('character-list');
    container.innerHTML = 'Загрузка...';
    document.querySelector("#loader").style.display = 'block';
    const charactersList = window.settings.characterList || [];
    const result = await window.electron.ipcRenderer.fetchCharacters(nickname);

    if (result.error) {
        container.innerText = 'Ошибка: ' + result.error;
        return;
    }

    const isValidCharacter = char => char && char.name && char.gearScore;

    let filteredCharacters = new Map();
    [...charactersList, ...result].forEach(char => {
        if (!isValidCharacter(char)) {
            return;
        }

        const existingChar = filteredCharacters.get(char.name);

        if (!existingChar || parseFloat(char.gearScore.replace(',', '')) > parseFloat(existingChar.gearScore.replace(',', ''))) {
            filteredCharacters.set(char.name, char);
        }
    });

    saveSettings({characterList: Array.from(filteredCharacters.values())});
    document.querySelector("#loader").style.display = 'none';
    loadCharacterSettings();
    sortCharacters();
}

import Sortable from "../../node_modules/sortablejs/modular/sortable.core.esm.js";

function enableDragAndDrop() {
    const characterList = document.getElementById('character-list');

    if (!characterList) {
        return;
    }

    new Sortable(characterList, {
        animation: 150,
        ghostClass: 'dragging',
        handle: '.character__drag',
        onEnd: function (evt) {
            updateCharacterOrder();
        }
    });
}

function updateCharacterOrder() {
    const characterList = document.getElementById('character-list');
    const newOrder = [];

    characterList.querySelectorAll('.character').forEach((charDiv) => {
        newOrder.push(charDiv.dataset.name);
    });

    let characters = window.settings.characterList || [];

    characters.sort((a, b) => newOrder.indexOf(a.name) - newOrder.indexOf(b.name));
    saveSettings({characterList: characters});
}