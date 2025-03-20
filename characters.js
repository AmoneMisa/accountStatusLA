function handleIconClick(characterObj, type, element) {
    if (type === 'legate') {
        handleLegateClick(characterObj, element);
    } else if (type === 'goldReceiver') {
        handleGoldReceiverClick(characterObj, element);
    } else if (type === 'delete') {
        handleDeleteClick(characterObj, element);
    } else {
        element.classList.toggle('inactive');
        saveCharacterSetting(
            characterObj.name,
            type,
            !element.classList.contains('inactive')
        );
    }
}

function handleLegateClick(characterObj, element) {
    const activeLegate = document.querySelector('.character span[data-type="legate"]:not(.inactive)');

    if (activeLegate && activeLegate !== element) {
        activeLegate.classList.add('inactive');
        saveCharacterSetting(activeLegate.closest('.character').dataset.name, 'legate', false);
    }

    element.classList.toggle('inactive');
    saveCharacterSetting(
        characterObj.name,
        'legate',
        !element.classList.contains('inactive')
    );
}

function handleGoldReceiverClick(characterObj, element) {
    element.classList.toggle('inactive');
    saveCharacterSetting(
        characterObj.name,
        'goldReceiver',
        !element.classList.contains('inactive')
    );
}

function handleDeleteClick(characterObj, element) {
    const characterDiv = element.closest('.character');
    if (element.classList.contains('inactive')) {
        characterDiv.querySelectorAll('span').forEach(icon => {
            icon.classList.add('inactive');
            saveCharacterSetting(characterObj.name, icon.dataset.type, false);
        });
        element.classList.remove('inactive');
        saveCharacterSetting(
            characterObj.name,
            'delete',
            true
        );
    } else {
        element.classList.add('inactive');
        saveCharacterSetting(
            characterObj.name,
            'delete',
            false
        );
    }
}

// Сохранение настроек персонажей
export function saveCharacterSetting(character, type, state) {
    let settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');

    if (!settings[character]) {
        settings[character] = {};
    }

    settings[character][type] = state;
    localStorage.setItem('characterSettings', JSON.stringify(settings));
}

// Загрузка и применение настроек персонажей
export function loadCharacterSettings() {
    const settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');
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
    const settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');

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

export function setEditable(state) {
    document.querySelectorAll('.character span[data-type]').forEach(icon => {
        icon.style.pointerEvents = state ? 'auto' : 'none';
    });

    if (state) {
        document.getElementById('save-button').style.display = 'block';
    } else {
        document.getElementById('save-button').style.display = 'none';
    }
}

export async function loadCharacters(nickname) {
    const container = document.getElementById('character-list');
    container.innerHTML = 'Загрузка...';
    const charactersList = JSON.parse(localStorage.getItem('charactersList') || '[]');
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

    localStorage.setItem('charactersList', JSON.stringify(Array.from(filteredCharacters.values())));
    renderCharacters(true);
    loadCharacterSettings();
    sortCharacters();
}

export function renderCharacters(editMode = false) {
    const container = document.getElementById('character-list');
    container.innerHTML = '';
    const settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');
    const charactersList = JSON.parse(localStorage.getItem('charactersList') || '[]');

    charactersList.forEach(char => {
        const charSettings = settings[char.name] || {};

        if (!editMode && charSettings.delete) {
            return;
        }

        const dragBurger = "<div class='drag-burger'>≡</div>"

        const icons = `
            <div data-type="legate" data-tooltip="Легат" class="tooltip character__icon ${charSettings.legate ? '' : 'inactive'}">👑</div>
            <div data-type="goldReceiver" data-tooltip="Получатель голды" class="tooltip character__icon ${charSettings.goldReceiver ? '' : 'inactive'}">💰</div>
            <div data-type="favorite" data-tooltip="Избранное"  class="tooltip character__icon ${charSettings.favorite ? '' : 'inactive'}">⭐</div>
            ${editMode ? `<div data-type="delete" data-tooltip="Скрыть из списка"  class="tooltip character__icon ${charSettings.delete ? '' : 'inactive'}">❌</div>` : ''}   
        `;

        const charDiv = document.createElement('div');
        const isSupport = ['Художница', 'Менестрель', 'Паладин'].includes(char.className);

        charDiv.className = `character ${editMode ? '' : 'view-mode'} ${isSupport ? 'character_support' : 'character_dd'}`;
        charDiv.dataset.name = char.name;
        charDiv.dataset.gs = char.gearScore;
        charDiv.dataset.className = char.className;
        charDiv.dataset.isSupport = char.isSupport;

        let raidCells = (charSettings.raids || []).map(raid => `
            <div data-raid="${raid}" class="raid">
                <div class="raid__header">
                    <div class="raid__name">${raid}</div>
                    <button data-tooltip="Удалить рейд из списка" class="tooltip remove-raid button button_icon" data-name="${char.name}" data-raid="${raid}">🗑️</button>
                </div>
                <button data-tooltip="Отметка пройдена ли активность" class="tooltip raid-status button button_icon" data-raid="${raid}">${charSettings.raidStatus?.[raid] ? '✅' : '❌'}</button>
                
            </div>
        `).join('');

        if (!editMode) {
            charDiv.innerHTML = `
        <div data-tooltip="Изменить порядок персонажей" class="tooltip character__cell character__drag">${dragBurger}</div>
        <div class="character__cell character__icons">${icons}</div>
        <div class="character__cell character__info">
                <div class="character__name">${char.name}</div>
                <div class="character__gearscore">${char.gearScore}</div>
                <div class="character__class">${char.className}</div>
        </div>
        <div class="character__cell character__raids">${raidCells}</div>
        <div class="character__cell character__actions"><button type="button" data-tooltip="Добавить или убрать активность" class="tooltip button button_icon add-raid" data-name="${char.name}">➕</button></div>
            `;
        } else {
            charDiv.innerHTML = `
                ${char.name} (${char.className}, GS: ${char.gearScore}) ${icons}
            `;
        }

        if (editMode) {
            charDiv.addEventListener('click', (e) => {
                if (e.target.classList.contains("character__icon")) {
                    handleIconClick(char, e.target.dataset.type, e.target);
                }
            });
            document.getElementById('save-button').style.display = 'block';
        }

        charDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('raid-status')) {
                toggleRaidStatus(char.name, e.target.dataset.raid, e.target);
            }
        });

        charDiv.querySelectorAll('.remove-raid').forEach(button => {
            button.addEventListener('click', e => removeRaidFromCharacter(e.target.dataset.name, e.target.dataset.raid));
        });

        charDiv.querySelector('.add-raid')?.addEventListener('click', () => showRaidSelector(char.name));

        container.appendChild(charDiv);
    });

    if (!editMode) {
        document.getElementById('save-button').style.display = 'none';
        sortCharacters();
    }

    enableDragAndDrop();
}

function toggleRaidStatus(characterName, raid, element) {
    let settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');
    if (!settings[characterName]) {
        settings[characterName] = {};
    }

    settings[characterName].raidStatus = settings[characterName].raidStatus || {};
    settings[characterName].raidStatus[raid] = !settings[characterName].raidStatus[raid];

    element.innerHTML = settings[characterName].raidStatus[raid] ? '✅' : '❌';
    localStorage.setItem('characterSettings', JSON.stringify(settings));
}

function showRaidSelector(characterName) {
    const raids = ["Камен 2.0 (гер)", "Камен 2.0 (нормал)", "Аврель (гер)", "Аврель (нормал)", "Эгир (гер)", "Эгир (нормал)", "Ехидна", "Бехемос", "Камен (гер)", "Хаос", "Хранитель", "Эфонка"];
    let settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');
    let selectContainer = document.createElement("div");
    let selectLabel = document.createElement("label");
    let select = document.createElement('select');
    select.multiple = true;

    selectLabel.innerHTML = `Выбери активность для персонажа: <i>${characterName}</i>.<br>Для мульти-выбора: нажми <i>Cntrl</i> и выбирай необходимые пункты`;
    selectLabel.classList.add("raid-selector__label");
    select.classList.add("raid-selector__select");
    selectLabel.appendChild(select);
    selectContainer.appendChild(selectLabel);
    selectContainer.classList.add('raid-selector');

    raids.forEach(raid => {
        let option = document.createElement('option');
        option.value = raid;
        option.innerText = raid;
        select.appendChild(option);
    });

    if (settings[characterName] && settings[characterName].raids && settings[characterName].raids.length > 0) {
        console.log(settings[characterName].raids.length);
        Array.from(select.options).forEach(option => {

            if (settings[characterName].raids.includes(option.value)) {
                option.selected = true;
                console.log(option);

            }
        });
    }

    let applyButton = document.createElement('button');
    applyButton.id = 'apply-raids';
    applyButton.className = "apply-button button";
    applyButton.innerText = "Применить";
    applyButton.addEventListener('click', () => applyRaidSelection(characterName, select));

    selectContainer.appendChild(applyButton);
    document.body.appendChild(selectContainer);
}

function applyRaidSelection(characterName, select) {
    let selectedRaids = Array.from(select.selectedOptions).map(opt => opt.value);
    let settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');

    if (!settings[characterName]) {
        settings[characterName] = {};
    }

    settings[characterName].raids = selectedRaids;

    localStorage.setItem('characterSettings', JSON.stringify(settings));
    document.querySelector('.raid-selector').remove();
    renderCharacters(false);
}

function removeRaidFromCharacter(characterName, raidName) {
    let settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');

    if (settings[characterName]?.raids) {
        settings[characterName].raids = settings[characterName].raids.filter(r => r !== raidName);
        delete settings[characterName].raidStatus?.[raidName]; // Удаляем статус рейда тоже
    }

    localStorage.setItem('characterSettings', JSON.stringify(settings));
    renderCharacters(false);
}

import Sortable from "./node_modules/sortablejs/modular/sortable.core.esm.js";

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

    let characters = JSON.parse(localStorage.getItem('charactersList') || '[]');

    characters.sort((a, b) => newOrder.indexOf(a.name) - newOrder.indexOf(b.name));
    localStorage.setItem('charactersList', JSON.stringify(characters));
}