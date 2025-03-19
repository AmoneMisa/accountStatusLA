function createCharacterBlock(char, container, isEditable = true) {
    const settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');
    const charSettings = settings[char.name] || {};

    let charDiv = document.createElement('div');
    charDiv.className = 'character';
    charDiv.dataset.name = char.name;
    charDiv.dataset.gs = char.gearScore;

    charDiv.innerHTML = `
        ${char.name} (${char.className}, GS: ${char.gearScore})
        <span data-type="legate" class="${charSettings.legate ? '' : 'inactive'}">👑</span>
        <span data-type="goldReceiver" class="${charSettings.goldReceiver ? '' : 'inactive'}">💰</span>
        <span data-type="favorite" class="${charSettings.favorite ? '' : 'inactive'}">⭐</span>
        ${isEditable ? `<span data-type="delete" class="${charSettings.delete ? '' : 'inactive'}">❌</span>` : ''}
    `;

    if (isEditable) {
        charDiv.addEventListener('click', (e) => {
            if(e.target.tagName === 'SPAN') {
                handleIconClick(char.name, e.target.dataset.type, e.target);
                e.stopPropagation();
            }
        });
    }

    container.appendChild(charDiv);
}


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
function saveCharacterSetting(character, type, state) {
    let settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');

    if (!settings[character]) {
        settings[character] = {};
    }
    console.log(settings, character, type, state);
    settings[character][type] = state;
    console.log(settings[character][type]);

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
    chars.forEach(char => {
        const charSet = settings[char.dataset.name];
        if (!charSet?.delete) {
            container.appendChild(char);
        }
    });
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
    const loader = document.getElementById('loader');

    loader.style.display = 'block';
    container.innerHTML = '';

    const result = await window.electron.ipcRenderer.fetchCharacters(nickname);

    loader.style.display = 'none';

    if (result.error) {
        container.innerText = 'Ошибка: ' + result.error;
        return;
    }

    localStorage.setItem('charactersList', JSON.stringify(result));

    result.sort((a, b) => parseFloat(b.gearScore) - parseFloat(a.gearScore));

    result.forEach(char => createCharacterBlock(char, container));
    loadCharacterSettings();
    sortCharacters();
    setEditable(false);
}

export function renderCharacters(isEditable = false) {
    const container = document.getElementById('character-list');
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
    container.innerHTML = '';

    let charactersList = JSON.parse(localStorage.getItem('charactersList') || '[]');
    const settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');

    if (!isEditable) {
        charactersList = charactersList.filter(char => !settings[char.name]?.delete);
    }

    // Сортировка
    charactersList.sort((a, b) => {
        const aSet = settings[a.name] || {};
        const bSet = settings[b.name] || {};

        return (Number(bSet.legate || 0) - Number(aSet.legate || 0)) ||
            (Number(bSet.goldReceiver || 0) - Number(aSet.goldReceiver || 0)) ||
            (Number(bSet.favorite || 0) - Number(aSet.favorite || 0)) ||
            (parseFloat(b.gearScore.replace(',', '')) - parseFloat(a.gearScore.replace(',', '')));
    });

    charactersList.forEach(char => createCharacterBlock(char, container, isEditable));
    loader.style.display = 'none';
    document.getElementById('save-button').style.display = 'none';
}
