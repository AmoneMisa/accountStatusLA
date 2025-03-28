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

function save() {
  saveSettings({
    savePath: savePath.value,
    theme: theme.value,
    minimizeOnClose: minimizeOnClose.value,
    rememberWindowSize: rememberWindowSize.value,
    rememberWindowPosition: rememberWindowPosition.value,
  });
  document.getElementById("message").innerText = "Настройки сохранены";
}

async function chooseFolder() {
  const filePath = await window.electron.ipcRenderer.chooseFolder();

  if (filePath) {
    savePath.value = await window.electron.ipcRenderer.invoke('change-settings-path', filePath);
  }
}

async function updateApp() {
  document.getElementById('message').innerText = "Проверка обновлений...";
  document.getElementById('error').innerText = "";

  await window.electron.ipcRenderer.invoke('check-for-updates');
}

window.electron.ipcRenderer.on('update-available', async ({latestVersion, downloadUrl}) => {
  const currentVersion = document.getElementById('update-app').dataset.currentVersion;
  const isNewer = await window.electron.ipcRenderer.invoke('is-newer-version', currentVersion, latestVersion);

  if (isNewer) {
    document.getElementById('message').innerText = `Доступно обновление ${latestVersion}. Открываем страницу загрузки...`;
    await window.electron.ipcRenderer.openExternal(downloadUrl);
  } else {
    document.getElementById('message').innerText = "У вас актуальная версия.";
  }
});

window.electron.ipcRenderer.on('update-not-found', () => {
  document.getElementById('message').innerText = "Обновлений нет.";
});

window.electron.ipcRenderer.on('update-error', (_, errorMessage) => {
  console.error(_, errorMessage)
  document.getElementById('error').innerText = `Ошибка обновления: ${errorMessage?.message || "Неизвестная ошибка"}`;
});

function changeTheme(newTheme) {
  document.documentElement.setAttribute("data-theme", newTheme);
  document.getElementById("message").innerText = "Тема изменена";
  theme.value = newTheme;
  saveSettings({theme: newTheme});
}
</script>

<template>
  <div id="settings-table" class="settings-table">
    <div class="settings-table__cell">Название настройки</div>
    <div class="settings-table__cell">Значение</div>

    <div class="settings-table__cell">Скрыть напоминание о полевом боссе сегодня</div>
    <div class="settings-table__cell">
      <label class="custom-label">
        <input type="checkbox" id="disableBossReminderToday" v-model="disableBossReminderToday"/>
      </label>
    </div>

    <div class="settings-table__cell">Скрыть напоминание о разломе сегодня</div>
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
      <input type="checkbox" id="minimizeOnClose" v-model="minimizeOnClose"></label></div>

    <div class="settings-table__cell">Запоминать размер окна при закрытии</div>
    <div class="settings-table__cell"><label class="custom-label">
      <input type="checkbox" id="rememberWindowSize" v-model="rememberWindowSize"></label></div>

    <div class="settings-table__cell">Запоминать расположение окна при закрытии</div>
    <div class="settings-table__cell"><label class="custom-label">
      <input type="checkbox" id="rememberWindowPosition" v-model="rememberWindowPosition"></label></div>

    <div class="settings-table__cell">Проверить обновления приложения</div>
    <div class="settings-table__cell">
      <button type="button" id="update-app" class="button" data-current-version="v0.9-alpha" @click="updateApp">Обновить
        приложение
      </button>
    </div>
  </div>
  <button type="button" id="save-settings" class="settings-table__button button" @click="save">Сохранить</button>
</template>

<style scoped lang="scss">

</style>