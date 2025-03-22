import {saveSettings} from "../../utils.js";
import {loadCharacters, renderCharacters} from "../characters/characters.js";

export default async function (nicknameElement, editNicknameButton, saveNicknameButton) {
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
}