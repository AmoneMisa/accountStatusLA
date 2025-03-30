<script setup>
import {saveSettings} from "../../../utils/utils.js";

function minimize() {
  window.electron.ipcRenderer.send('window:minimize');
}

function maximize() {
  window.electron.ipcRenderer.send('window:toggleMaximize');
}

function close() {
  window.electron.ipcRenderer.send('window:close');
}

window.electron.ipcRenderer.on('clear-character-settings', () => {
  saveSettings({characterSettings: undefined});
  console.log('Настройки персонажей сброшены.');
});

window.electron.ipcRenderer.on('clear-characters-list', () => {
  saveSettings({characterList: undefined});
  console.log('Список персонажей сброшен.');
});

window.electron.ipcRenderer.on('clear-characters-qubes', () => {
  saveSettings({tableData: undefined});
  console.log('Настройки кубов сброшены.');
});

window.electron.ipcRenderer.on('clear-nickname', async () => {
  saveSettings({nickname: undefined});
  document.getElementById('nickname').innerText = "Ник не установлен";
});
</script>

<template>
  <div class="header">
    <div id="title-bar" class="title-bar">
      <div id="title" class="title-bar__title">Lost Ark Character Manager by WhitesLove v. 0.9-alpha</div>
      <div id="window-controls" class="window-controls">
        <button id="minimize" class="window-controls__button button button_control" @click="minimize">—</button>
        <button id="maximize" class="window-controls__button button button_control" @click="maximize">⬜</button>
        <button id="close" class="window-controls__button button button_control" @click="close">✖</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title-bar {
  width: 100%;
  height: 35px;
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  background: var(--black);
  box-shadow: var(--shadow);
}

.title-bar__title {
  margin-left: 5px;
  font-family: Caveat, serif;
  font-size: 18px;
  -webkit-app-region: drag;
}

.window-controls {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 90px;
  padding: 0 5px;
  -webkit-app-region: no-drag;
}
</style>