import {saveSettings} from "../../utils/utils.js";

export default function () {
    if (!window.settings.characterSettings) {
        window.settings.characterSettings = JSON.parse(localStorage.getItem('characterSettings'));
    }

    if (!window.settings.characterList) {
        window.settings.characterList = JSON.parse(localStorage.getItem('charactersList'));
    }

    if (!window.settings.nickname) {
        window.settings.nickname = localStorage.getItem('nickname');
    }

    if (!window.settings.allNickCharacters) {
        window.settings.allNickCharacters = JSON.parse(localStorage.getItem('allNickCharacters'));
    }

    if (!window.settings.selectedRaids) {
        window.settings.selectedRaids = JSON.parse(localStorage.getItem('selectedRaids'));
    }

    if (!window.settings.tableData) {
        window.settings.tableData = JSON.parse(localStorage.getItem('tableData'));
    }

    if (!window.settings.todos) {
        window.settings.todos = [];
    }

    saveSettings(window.settings);
}