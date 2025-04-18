<script setup>
import ThemeSelect from "@/components/settings/ThemeSelect.vue";
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject} from "vue";

let settings = inject('settings');
const savePath = computed(() => settings.value.savePath);
const theme = computed({
  get: () => settings.value.theme,
  set: (newValue) => settings.value.theme = newValue
});
const minimizeOnClose = computed({
  get: () => settings.value.minimizeOnClose,
  set: (newValue) => settings.value.minimizeOnClose = newValue
});
const rememberWindowSize = computed({
  get: () => settings.value.rememberWindowSize,
  set: (newValue) => settings.value.rememberWindowSize = newValue
});
const rememberWindowPosition = computed({
  get: () => settings.value.rememberWindowPosition,
  set: (newValue) => settings.value.rememberWindowPosition = newValue
});
const disableBossReminderToday = computed({
  get: () => settings.value.disableBossReminderToday,
  set: (newValue) => settings.value.disableBossReminderToday = newValue
});
const disableChaosReminderToday = computed({
  get: () => settings.value.disableChaosReminderToday,
  set: (newValue) => settings.value.disableChaosReminderToday = newValue
});
const fontScale = computed({
  get: () => settings.value.fontScale || 1,
  set: (newValue) => settings.value.fontScale = newValue
});
const autoStart = computed({
  get: () => settings.value.autoStart || false,
  set: () => settings.value.autoStart = !settings.value.autoStart
});

function updateFontScale() {
  document.documentElement.style.setProperty('--font-scale', fontScale.value);
  saveSettings({fontScale: fontScale.value});
}

function resetFontScale() {
  document.documentElement.style.setProperty('--font-scale', "1");
  saveSettings({fontScale: 1});
  document.querySelector('.settings-table__font-scale-input').value = 1;
}

function save() {
  saveSettings({
    savePath: savePath.value,
    theme: theme.value,
    minimizeOnClose: minimizeOnClose.value,
    rememberWindowSize: rememberWindowSize.value,
    rememberWindowPosition: rememberWindowPosition.value,
    autoStart: autoStart.value,
    disableBossReminderToday: disableBossReminderToday.value,
    disableChaosReminderToday: disableChaosReminderToday.value
  });
  document.getElementById("message").innerText = "Настройки сохранены";
  document.getElementById("message").classList.add("active");
  setTimeout(() => document.getElementById("message").classList.remove("active"), 3500);
}

async function chooseFolder() {
  const filePath = await window.electron.ipcRenderer.chooseFolder();

  if (filePath) {
    savePath.value = await window.electron.ipcRenderer.invoke('change-settings-path', filePath);
  }
}

async function updateApp() {
  document.getElementById('message').innerText = "Проверка обновлений...";
  document.querySelector("#message").classList.add("active");
  setTimeout(() => document.getElementById("message").classList.remove("active"), 3500);
  document.getElementById('error').innerText = "";

  await window.electron.ipcRenderer.invoke('check-for-updates');
}

window.electron.ipcRenderer.on('update-available', async ({latestVersion, downloadUrl}) => {
  const currentVersion = document.getElementById('update-app').dataset.currentVersion;
  const isNewer = await window.electron.ipcRenderer.invoke('is-newer-version', currentVersion, latestVersion);

  if (isNewer) {
    document.getElementById('message').innerText = `Доступно обновление ${latestVersion}. Открываем страницу загрузки...`;
    document.querySelector("#message").classList.add("active");
    setTimeout(() => document.getElementById("message").classList.remove("active"), 3500);
    await window.electron.ipcRenderer.openExternal(downloadUrl);
  } else {
    document.getElementById('message').innerText = "У вас актуальная версия.";
    document.querySelector("#message").classList.add("active");
    setTimeout(() => document.getElementById("message").classList.remove("active"), 3500);
  }
});

window.electron.ipcRenderer.on('update-not-found', () => {
  document.getElementById('message').innerText = "Обновлений нет.";
  document.querySelector("#message").classList.add("active");
  setTimeout(() => document.getElementById("message").classList.remove("active"), 3500);
});

window.electron.ipcRenderer.on('update-error', (_, errorMessage) => {
  console.error(_, errorMessage)
  document.getElementById('error').innerText = `Ошибка обновления: ${errorMessage?.message || "Неизвестная ошибка"}`;
});

window.electron.ipcRenderer.invoke('set-autostart', autoStart.value);

function changeTheme(newTheme) {
  document.documentElement.setAttribute("data-theme", newTheme);
  document.getElementById("message").innerText = "Тема изменена";
  document.getElementById("message").classList.add("active");
  setTimeout(() => document.getElementById("message").classList.remove("active"), 3500);
  theme.value = newTheme;
  saveSettings({theme: newTheme});
}
</script>

<template>
  <div id="settings-table" class="settings-table">
    <div class="settings-table__cell">Название настройки</div>
    <div class="settings-table__cell">Значение</div>

    <div class="settings-table__cell">Прекратить напоминание о полевом боссе на сегодня</div>
    <div class="settings-table__cell">
      <label class="custom-label">
        <input type="checkbox" id="disableBossReminderToday" v-model="disableBossReminderToday"/>
      </label>
    </div>

    <div class="settings-table__cell">Прекратить напоминание о разломе на сегодня</div>
    <div class="settings-table__cell">
      <label class="custom-label">
        <input type="checkbox" id="disableChaosReminderToday" v-model="disableChaosReminderToday"/>
      </label>
    </div>

    <div class="settings-table__cell">Изменить путь сохранения настроек</div>
    <div class="settings-table__cell">
      <input type="text" id="savePath" class="choose-folder-input" readonly v-model="savePath"/>
      <button id="choose-folder" class="button" @click="chooseFolder">Выбрать</button>
    </div>

    <div class="settings-table__cell">Выбрать тему</div>
    <div class="settings-table__cell">
      <theme-select @change-theme="changeTheme" :current-theme="theme"/>
    </div>

    <div class="settings-table__cell">Сворачивать приложение при нажатии на крестик</div>
    <div class="settings-table__cell"><label class="custom-label">
      <input type="checkbox" id="minimizeOnClose" v-model="minimizeOnClose"></label>
    </div>

    <div class="settings-table__cell">Запоминать размер окна при закрытии</div>
    <div class="settings-table__cell"><label class="custom-label">
      <input type="checkbox" id="rememberWindowSize" v-model="rememberWindowSize"></label>
    </div>

    <div class="settings-table__cell">Запоминать расположение окна при закрытии</div>
    <div class="settings-table__cell"><label class="custom-label">
      <input type="checkbox" id="rememberWindowPosition" v-model="rememberWindowPosition"></label>
    </div>

    <div class="settings-table__cell">Автозапуск при старте Windows</div>
    <div class="settings-table__cell">
      <label class="custom-label">
        <input type="checkbox" id="rememberWindowPosition" v-model="autoStart">
      </label>
    </div>

    <div class="settings-table__cell">Размер шрифта</div>
    <div class="settings-table__cell"><label class="custom-label settings-table__font-scale-label">
      <input class="settings-table__font-scale-input" type="range" min="0.7" max="1.3" step="0.05" v-model="fontScale"
             @input="updateFontScale"/>
    </label>
      <button class="button" @click="resetFontScale">Сбросить</button>
    </div>

    <div class="settings-table__cell">Проверить обновления приложения</div>
    <div class="settings-table__cell">
      <button type="button" id="update-app" class="button" data-current-version="0.12" @click="updateApp">
        Обновить приложение
      </button>
    </div>
  </div>
  <button type="button" id="save-settings" class="settings-table__button button" @click="save">Сохранить</button>
</template>

<style scoped lang="scss">
.settings-table {
  display: grid;
  border: 1px solid var(--grey);
  border-bottom: none;
  padding: 10px;
  border-radius: 5px 5px 0 0;
  margin-bottom: 10px;
  grid-template-areas: "a b";
  box-shadow: var(--shadow);
}

.settings-table__cell {
  padding: 0 10px;
  height: 80px;
  border-bottom: 1px solid var(--grey);
  display: flex;
  align-items: center;
  font-size: var(--font-very-small);
}

.settings-table__cell:nth-child(odd) {
  border-right: 1px solid var(--grey);
}

.settings-table__cell select {
  height: 60px;
}

.choose-folder-input {
  margin-right: 10px;
  width: 240px;
  height: 30px;
}

.settings-table__font-scale-label {
  margin-right: 10px;
}
</style>