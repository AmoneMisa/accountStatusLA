import {
    loadCharacters,
    loadCharactersForCurrentNickname,
    renderCharacters,
    setEditable,
    sortCharacters,
    updatePreviousNicknames
} from "./characters.js";

document.addEventListener('DOMContentLoaded', async () => {
    const nicknameElement = document.getElementById('nickname');
    let nickname = localStorage.getItem('nickname');

    if (!nickname) {
        document.getElementById('edit-nickname').click();
        return;
    }

    nicknameElement.innerText = "Загружаю ник...";
    try {
        nickname = await window.electron.ipcRenderer.getNickname();
        nicknameElement.innerText = `Ваш ник: ${nickname}`;
        localStorage.setItem('nickname', nickname);

        const allNickCharacters = JSON.parse(localStorage.getItem('allNickCharacters') || '{}');

        if (!allNickCharacters[nickname]) {
            const characters = await window.electron.ipcRenderer.fetchCharacters(nickname);
            if (!characters.error) {
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
    }

    document.getElementById('minimize').addEventListener('click', () => {
        window.electron.ipcRenderer.send('window:minimize');
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
        renderCharacters(true);  // Загружаем сначала всех
        renderCharacters(false); // Потом скрываем тех, кто с ❌
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
        const previousNicknames = JSON.parse(localStorage.getItem('previousNicknames') || '[]');

        const nicknameOptions = previousNicknames.map(nick => `
            <option ${nick === currentNickname ? 'selected' : ''}>${nick}</option>
        `).join('');

        nicknameElement.innerHTML = `
        <input type="text" id="nickname-input" value="${currentNickname}" />
            или выбрать из списка:
            <select id="nickname-select">
                <option value="">- Выбрать -</option>
                ${nicknameOptions}
            </select>
        `;

        document.getElementById('edit-nickname').style.display = 'none';
        document.getElementById('save-nickname').style.display = 'inline-block';
    });

    document.getElementById('save-nickname').addEventListener('click', async () => {
        const nicknameInputValue = document.getElementById('nickname-input').value.trim();
        const nicknameSelectValue = document.getElementById('nickname-select').value;
        const newNickname = nicknameSelectValue || nicknameInputValue;

        if (!newNickname) {
            alert('Введите корректный ник!');
            return;
        }

        await window.electron.ipcRenderer.setNickname(newNickname);
        localStorage.setItem('nickname', newNickname);
        updatePreviousNicknames(newNickname);

        document.getElementById('nickname').innerText = `Ваш ник: ${newNickname}`;
        document.getElementById('save-nickname').style.display = 'none';
        document.getElementById('edit-nickname').style.display = 'inline-block';

        // Загружаем персонажей, которые привязаны к этому нику
        await loadCharactersForCurrentNickname();
    });

    if (document.getElementById('apply-raids')) {
        document.getElementById('apply-raids').addEventListener('click', () => {
            const selectedOptions = Array.from(document.getElementById('raid-select').selectedOptions).map(option => option.value);
            localStorage.setItem('selectedRaids', JSON.stringify(selectedOptions));
            renderCharacters(false); // Перерисовываем список с новыми рейдами
        });
    }
});
