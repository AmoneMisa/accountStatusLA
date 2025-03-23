import charactersListeners from "../tabs/characters/charactersListeners.js";
import init from "../tabs/common/init.js";
import controls from "../tabs/common/controls.js";
import settingsDOM from "../tabs/settings/settingsDOM.js";
import migration from "../tabs/common/migration.js";
import calcBet from "../tabs/services/calcBet.js";

document.addEventListener('DOMContentLoaded', async () => {
    const nicknameElement = document.getElementById('nickname');
    const editNicknameButton = document.getElementById('edit-nickname');
    const saveNicknameButton = document.getElementById('save-nickname');

    window.electron.ipcRenderer.on('init-settings', async (settings) => {
        window.settings = settings;
        migration();

        await init(nicknameElement, editNicknameButton, saveNicknameButton);
    });

    charactersListeners(nicknameElement, editNicknameButton, saveNicknameButton);

    window.electron.ipcRenderer.on('update-settings', (settings) => {
        window.settings = settings;
    });

   controls();
    await settingsDOM();

    calcBet();
});