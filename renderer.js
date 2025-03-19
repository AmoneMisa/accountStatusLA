import {loadCharacters, renderCharacters, setEditable, sortCharacters} from "./characters.js";

document.addEventListener('DOMContentLoaded', async () => {
    const nicknameElement = document.getElementById('nickname');

    if (nicknameElement) {
        nicknameElement.innerText = "Загружаю ник...";
        try {
            const nickname = await window.electron.ipcRenderer.getNickname();
            nicknameElement.innerText = `Ваш ник: ${nickname}`;
            const savedCharacters = localStorage.getItem('charactersList');

            if (savedCharacters) {
                renderCharacters(false); // Просмотр без крестиков
            } else {
                await loadCharacters(nickname);
                renderCharacters(false);
            }
        } catch (error) {
            console.error("Ошибка загрузки ника:", error);
            nicknameElement.innerText = "Ошибка загрузки ника";
        }
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
        renderCharacters(false); // Переотрисовка без крестиков
    });

    document.getElementById('refresh-characters').addEventListener('click', async () => {
        const nickname = await window.electron.ipcRenderer.getNickname();
        if (nickname) {
            await loadCharacters(nickname);
            document.getElementById('save-button').style.display = 'block'; // Показываем кнопку сохранить при обновлении
            setEditable(true);
        }
    });

    document.getElementById('edit-characters').addEventListener('click', () => {
        renderCharacters(true); // Перерисовываем со всеми персонажами
        setEditable(true);
    });
});
