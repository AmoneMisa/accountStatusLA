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
    const activeGoldReceivers = document.querySelectorAll('.character span[data-type="goldReceiver"]:not(.inactive)').length;

    if (element.classList.contains('inactive') && activeGoldReceivers >= 6) {
        showError("Максимум 6 получателей золота!");
        return;
    }

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
    console.log(character, type, settings);
    localStorage.setItem('characterSettings', JSON.stringify(settings));
    console.log(localStorage.getItem('characterSettings'));

    console.log("Сохранённые настройки персонажей:", settings);
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

export function showError(message) {
    const errorMessage = document.getElementById('error');
    errorMessage.innerText = message;
    setTimeout(() => { errorMessage.innerText = ''; }, 3000);
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
    const result = await window.electron.ipcRenderer.fetchCharacters(nickname);

    if (result.error) {
        container.innerText = 'Ошибка: ' + result.error;
        return;
    }

    localStorage.setItem('charactersList', JSON.stringify(result));
    renderCharacters(true);  // Показываем всех при редактировании
    loadCharacterSettings();
    sortCharacters();
}

export function renderCharacters(editMode = false) {
    const container = document.getElementById('character-list');
    container.innerHTML = '';
    const settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');
    const charactersList = JSON.parse(localStorage.getItem('charactersList') || '[]');

    if (!editMode) {
        const headers = document.createElement('div');
        headers.className = 'character view-mode';
        headers.innerHTML = `
            <span>Персонаж</span>
            <span>Класс</span>
            <span>GS</span>
            <span>Статусы</span>
            <span></span>
        `;
        container.appendChild(headers);
    }

    charactersList.forEach(char => {
        const charSettings = settings[char.name] || {};
        // В режиме просмотра не показываем персонажей с ❌
        if (!editMode && charSettings.delete) {
            return;
        }

        const icons = `
            <span data-type="legate" class="${charSettings.legate ? '' : 'inactive'}">👑</span>
            <span data-type="goldReceiver" class="${charSettings.goldReceiver ? '' : 'inactive'}">💰</span>
            <span data-type="favorite" class="${charSettings.favorite ? '' : 'inactive'}">⭐</span>
            ${editMode ? `<span data-type="delete" class="${charSettings.delete ? '' : 'inactive'}">❌</span>` : ''}
        `;

        const charDiv = document.createElement('div');
        charDiv.className = `character ${editMode ? '' : 'view-mode'}`;
        charDiv.dataset.name = char.name;
        charDiv.dataset.gs = char.gearScore;

        if (!editMode) {
            charDiv.innerHTML = `
                <span>${char.name}</span>
                <span>${char.className}</span>
                <span>${char.gearScore}</span>
                <span>${icons}</span>
                <div class="actions"></div>
            `;
        } else {
            charDiv.innerHTML = `
                ${char.name} (${char.className}, GS: ${char.gearScore}) ${icons}
            `;
        }

        if (editMode) {
            charDiv.addEventListener('click', (e) => {
                if (e.target.tagName === 'SPAN') {
                    handleIconClick(char, e.target.dataset.type, e.target);
                }
            });
            document.getElementById('save-button').style.display = 'block';
        }

        container.appendChild(charDiv);
    });

    if (!editMode) {
        document.getElementById('save-button').style.display = 'none';
        sortCharacters();
    }
}

export function updatePreviousNicknames(nickname) {
    let previousNicknames = JSON.parse(localStorage.getItem('previousNicknames') || '[]');
    if (!previousNicknames.includes(nickname)) {
        previousNicknames.push(nickname);
        localStorage.setItem('previousNicknames', JSON.stringify(previousNicknames));
    }
}

export async function loadCharactersForCurrentNickname() {
    const nickname = localStorage.getItem('nickname');
    const allNickCharacters = JSON.parse(localStorage.getItem('allNickCharacters') || '{}');

    if (allNickCharacters[nickname]) {
        localStorage.setItem('charactersList', JSON.stringify(allNickCharacters[nickname]));
        renderCharacters(true);
    } else {
        await loadCharacters(nickname);
    }
}


