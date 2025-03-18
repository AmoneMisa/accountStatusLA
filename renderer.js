import characters from "./characters.js";

document.addEventListener('DOMContentLoaded', async () => {
    const nicknameElement = document.getElementById('nickname');

    if (nicknameElement) {
        nicknameElement.innerText = "Загружаю ник...";
        try {
            const nickname = await window.electron.ipcRenderer.getNickname();
            nicknameElement.innerText = `Ваш ник: ${nickname}`;
            await characters(nickname);

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
});