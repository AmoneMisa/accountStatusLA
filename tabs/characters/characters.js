import {saveSettings} from "../../utils/utils.js";

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
}