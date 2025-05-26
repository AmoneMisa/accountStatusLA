<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {ref} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";
import minus from "../../../src/svg/minus.svg";
import square from "../../../src/svg/square.svg";
import cross from "../../../src/svg/cross.svg";

function minimize() {
  window.electron.ipcRenderer.send('window:minimize');
}

function maximize() {
  window.electron.ipcRenderer.send('window:toggleMaximize');
}

function close() {
  window.electron.ipcRenderer.send('window:close');
}

const upTop = ref(false);

function alwaysUpTop(elem) {
  elem.target.classList.toggle('active', !upTop.value);
  window.electron.ipcRenderer.send('window:toggle-always-on-top', !upTop.value);
  upTop.value = !upTop.value;
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

import pinIcon from "../../../src/svg/pin.svg";
</script>

<template>
  <div class="header">
    <div id="title-bar" class="title-bar">
      <div id="title" class="title-bar__title">Lost Ark Character Manager v. prerelease-2.1.0</div>
      <div id="window-controls" class="window-controls">
        <tooltip>
          <button id="alwaysUpTop" class="window-controls__button button button_control"
                  @click="(elem) => alwaysUpTop(elem)">
            <pinIcon class="icon pin-icon"/>
          </button>
          <template #tooltip>Поверх окон</template>
        </tooltip>
        <tooltip>
          <button id="minimize" class="window-controls__button button button_control" @click="minimize"><minus class="icon icon_very-small minus-icon" /></button>
          <template #tooltip>Свернуть</template>
        </tooltip>
        <tooltip>
          <button id="maximize" class="window-controls__button button button_control" @click="maximize"><square class="icon icon_very-small square-icon" /></button>
          <template #tooltip>Развернуть</template>
        </tooltip>
        <tooltip>
          <button id="close" class="window-controls__button button button_control" @click="close"><cross class="icon icon_very-small cross-icon cross-icon_control" /></button>
          <template #tooltip>Закрыть</template>
        </tooltip>
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
  font-family: var(--font-family-decorative), serif;
  font-size: var(--font-h2);
  -webkit-app-region: drag;
}

.window-controls {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: max-content;
  gap: 2px;
  padding: 0 5px;
  -webkit-app-region: no-drag;
}

.window-controls__button {
  &.active {
    background-color: var(--light-grey);
  }
}

.pin-icon {
  color: var(--error);

  path:last-child {
    fill: var(--white);
  }
}
</style>