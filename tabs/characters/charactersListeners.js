import {loadCharacters, renderCharacters, setEditable, sortCharacters} from "./characters.js";
import {saveSettings} from "../../utils.js";

export default function (nicknameElement, editNicknameButton, saveNicknameButton) {
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

    editNicknameButton.addEventListener('click', () => {
        const currentNickname = window.settings.nickname;

        nicknameElement.innerHTML = `<input type="text" id="nickname-input" value="${currentNickname}" />`;

        editNicknameButton.style.display = 'none';
        saveNicknameButton.style.display = 'inline-block';
    });

    saveNicknameButton.addEventListener('click', async () => {
        const newNickname = document.getElementById('nickname-input').value.trim();

        if (!newNickname) {
            alert('Введите корректный ник!');
            return;
        }

        saveSettings({nickname: newNickname});

        nicknameElement.innerText = `Ваш ник: ${newNickname}`;
        saveNicknameButton.style.display = 'none';
        editNicknameButton.style.display = 'inline-block';

        if (window.settings.characterList[newNickname]) {
            renderCharacters(true);
        } else {
            await loadCharacters(newNickname);
        }
    });

    document.getElementById('save-button').addEventListener('click', () => {
        sortCharacters();
        setEditable(false);

        console.log("Загружаем персонажей после сохранения...");
        renderCharacters(false);
    });

    if (document.getElementById('apply-raids')) {
        document.getElementById('apply-raids').addEventListener('click', () => {
            const selectedOptions = Array.from(document.getElementById('raid-select').selectedOptions).map(option => option.value);
            saveSettings({selectedRaids: selectedOptions});
            renderCharacters(false); // Перерисовываем список с новыми рейдами
        });
    }
}