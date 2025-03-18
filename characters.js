export default async function(nickname) {
    const loader = document.getElementById('loader');
    const container = document.getElementById('character-list');

    loader.style.display = 'block';   // Показываем лоадер
    container.innerHTML = '';         // Очищаем контейнер с персонажами

    const result = await window.electron.ipcRenderer.fetchCharacters(nickname);

    loader.style.display = 'none';    // Скрываем лоадер после загрузки

    if (result.error) {
        container.innerText = 'Ошибка: ' + result.error;
    } else {
        // Отображаем персонажей после загрузки
        result.forEach(char => {
            let charDiv = document.createElement('div');
            charDiv.className = 'character';
            charDiv.dataset.name = char.name;

            charDiv.innerHTML = `
                ${char.name} (${char.className}, GS: ${char.gearScore})
                <span data-type="legate" class="inactive">👑</span>
                <span data-type="goldReceiver" class="inactive">💰</span>
                <span data-type="favorite" class="inactive">⭐</span>
                <span data-type="delete" class="inactive">❌</span>
            `;

            // Обработчики иконок
            charDiv.addEventListener('click', (e) => {
                if(e.target.tagName === 'SPAN') {
                    handleIconClick(char.name, e.target.dataset.type, e.target);
                    e.stopPropagation();
                }
            });

            container.appendChild(charDiv);
        });

        loadCharacterSettings();
    }
}
function handleIconClick(character, type, element) {
    if (type === 'legate') {
        handleLegateClick(character, element);
    } else if (type === 'goldReceiver') {
        handleGoldReceiverClick(character, element);
    } else {
        element.classList.toggle('inactive');
        saveCharacterSetting(character, type, !element.classList.contains('inactive'));
    }
}

function handleLegateClick(character, element) {
    const activeLegate = document.querySelector('.character span[data-type="legate"]:not(.inactive)');

    if (activeLegate && activeLegate !== element) {
        activeLegate.classList.add('inactive');
        saveCharacterSetting(activeLegate.closest('.character').dataset.name, 'legate', false);
    }

    element.classList.toggle('inactive');
    saveCharacterSetting(character, 'legate', !element.classList.contains('inactive'));
}

function handleGoldReceiverClick(character, element) {
    const activeGoldReceivers = document.querySelectorAll('.character span[data-type="goldReceiver"]:not(.inactive)').length;

    if (element.classList.contains('inactive') && activeGoldReceivers >= 6) {
        showError("Максимум 6 получателей золота!");
        return;
    }

    element.classList.toggle('inactive');
    saveCharacterSetting(character, 'goldReceiver', !element.classList.contains('inactive'));
}


// Сохранение настроек персонажей
function saveCharacterSetting(character, type, state) {
    let settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');

    if (!settings[character]) settings[character] = {};
    settings[character][type] = state;

    localStorage.setItem('characterSettings', JSON.stringify(settings));
}

// Загрузка и применение настроек персонажей
function loadCharacterSettings() {
    const settings = JSON.parse(localStorage.getItem('characterSettings') || '{}');

    document.querySelectorAll('.character').forEach(charDiv => {
        const charName = charDiv.dataset.name;
        const charSettings = settings[charName];

        if (charSettings) {
            charDiv.querySelectorAll('span').forEach(icon => {
                const type = icon.dataset.type;
                if (charSettings[type]) {
                    icon.classList.remove('inactive');
                }
            });
        }
    });
}

function showError(message) {
    const errorMessage = document.getElementById('error');
    errorMessage.innerText = message;
    setTimeout(() => { errorMessage.innerText = ''; }, 3000);
}
