<script setup>
import CustomHeader from "@/components/header/CustomHeader.vue";
import CustomFooter from "@/components/footer/CustomFooter.vue";
import CharactersListTab from "@/components/charactersList/CharactersListTab.vue";
import CubesTab from "@/components/cubes/CubesTab.vue";
import CheckListTab from "@/components/checkList/CheckListTab.vue";
import NotificationsTab from "@/components/notifications/NotificationsTab.vue";
import SettingsTable from "@/components/settings/SettingsTable.vue";
import ToolsTab from "@/components/toolsList/ToolsTab.vue";
import {onMounted, provide, ref} from "vue";
import CalcRaidGoldTab from "@/components/raidGold/calcRaidGoldTab.vue";

const tabButtonsList = [
    {
  data: "main", name: "Активности"
}, {
  data: "table", name: "Кубы"
}, {
  data: "check-list", name: "Чек-лист"
}, {
  data: "notification", name: "Уведомления"
}, {
  data: "tools", name: "Инструменты"
}, {
  data: "calc-raid-gold", name: "Золото с рейдов"
}, {
  data: "settings", name: "Настройки"
}];

let settings = ref();
provide('settings', settings);

window.electron.ipcRenderer.on('init-settings', async (settings_) => {
  settings.value = settings_;

  if (settings?.value?.theme) {
    document.documentElement.setAttribute("data-theme", settings.value.theme);
  }
});

window.electron.ipcRenderer.on('update-settings', (settings_) => {
  settings.value = settings_;
});

onMounted(async () => {
  settings.value = await window.electron.ipcRenderer.invoke('load-settings');
});

let currentTab = ref("main");

onMounted(() => {
  currentTab.value = tabButtonsList[0].data;
});

function changeTab(tab) {
  currentTab.value = tab.data;
  document.getElementById("message").innerText = "";
  document.getElementById("error").innerText = "";
}
</script>

<template>
  <custom-header/>
  <div class="wrapper">
    <div class="tabs">
      <button type="button" class="tab-button" :class="{'active': currentTab === tab.data}"
              v-for="tab in tabButtonsList" :key="tab.data" @click="changeTab(tab)">{{ tab.name }}
      </button>
    </div>
    <div class="main">
      <characters-list-tab v-if="currentTab === 'main'"/>
      <cubes-tab v-if="currentTab === 'table'"/>
      <check-list-tab v-if="currentTab === 'check-list'"/>
      <notifications-tab v-if="currentTab === 'notification'"/>
      <tools-tab v-if="currentTab === 'tools'"/>
      <calc-raid-gold-tab v-if="currentTab === 'calc-raid-gold'"/>
      <settings-table v-if="currentTab === 'settings'"/>
    </div>
    <div id="message" class="message"></div>
    <div id="error" class="error"></div>
    <div id="loader" class="loader"></div>
  </div>
  <custom-footer/>
</template>

<style lang="scss">
:root {
  --dark-grey: #333333;
  --middle-grey: #2d2d2d;
  --grey: #444444;
  --light-grey: #666666;
  --black: #222222;
  --white: #ffffff;
  --error: #cc1b1b;
  --gold: #FFD700FF;
  --loader-border: #f3f3f3;
  --loader-top: #FFD700;
  --support: #5cffff;
  --dd: #ea91ff;
  --gs: #eab00f;
  --shadow: 0px 4px 10px rgba(129, 106, 0, 0.3);
  --inner-shadow: inset 0 0 10px rgba(103, 103, 103, 0.35);
}

[data-theme="light"] {
  --dark-grey: #e0e0e0;
  --middle-grey: #f0f0f0;
  --grey: #d6d6d6;
  --light-grey: #c0c0c0;
  --black: #ffffff;
  --white: #222222;
  --error: #d32f2f;
  --gold: #67a1ff;
  --loader-border: #777777;
  --loader-top: #FFD700;
  --support: #00a4a4;
  --dd: #ad00ad;
  --gs: #c69c6d;
  --shadow: 0px 4px 10px rgba(107, 107, 107, 0.3);
  --inner-shadow: inset 0 0 10px #a8a8a8;
}

[data-theme="red"] {
  --dark-grey: #4d0000;
  --middle-grey: #660000;
  --grey: #800000;
  --light-grey: #990000;
  --black: #210000;
  --white: #ffcccc;
  --error: #ff4444;
  --gold: #cb5400;
  --loader-border: #ff6666;
  --loader-top: #ffcc00;
  --support: #ffa9a9;
  --dd: #ff0037;
  --gs: #ff8c00;
  --shadow: 0px 4px 10px rgba(255, 89, 0, 0.3);
  --inner-shadow: inset 0 0 10px rgba(110, 11, 11, 0.59);
}

[data-theme="blue"] {
  --dark-grey: #001a33;
  --middle-grey: #00264d;
  --grey: #003366;
  --light-grey: #004080;
  --black: #001122;
  --white: #cceeff;
  --error: #ff3333;
  --gold: #00bbc9;
  --loader-border: #6699ff;
  --loader-top: #ffcc00;
  --support: #66ccff;
  --dd: #3399ff;
  --gs: #ffa500;
  --shadow: 0px 4px 10px rgba(77, 202, 255, 0.3);
  --inner-shadow: inset 0 0 10px rgba(67, 104, 194, 0.63);
}

[data-theme="green"] {
  --dark-grey: #003300;
  --middle-grey: #004d00;
  --grey: #006600;
  --light-grey: #008000;
  --black: #002200;
  --white: #ccffcc;
  --error: #ff4444;
  --gold: #21c900;
  --loader-border: #66ff66;
  --loader-top: #ffcc00;
  --support: #3fff80;
  --dd: #00ad3a;
  --gs: #eab00f;
  --shadow: 0px 4px 10px rgba(0, 255, 21, 0.3);
  --inner-shadow: inset 0 0 10px rgba(0, 161, 78, 0.63);
}

[data-theme="yellow"] {
  --dark-grey: #665500;
  --middle-grey: #806600;
  --grey: #997700;
  --light-grey: #b38900;
  --black: #332200;
  --white: #fff5cc;
  --error: #cc0000;
  --gold: #e0c100;
  --loader-border: #ffcc00;
  --loader-top: #ffdd00;
  --support: #ffea80;
  --dd: #ffbb33;
  --gs: #ffd700;
  --shadow: 0px 4px 10px rgba(255, 215, 0, 0.3);
  --inner-shadow: inset 0 0 10px rgba(182, 176, 121, 0.48);
}

[data-theme="gradient-dark"] {
  --dark-grey: #1a1a2e;
  --middle-grey: #16213e;
  --grey: #0f3460;
  --light-grey: #533483;
  --black: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  --white: #eaeaea;
  --error: #ff3860;
  --gold: #c0a304;
  --loader-border: #a29bfe;
  --loader-top: #f4d03f;
  --support: #8b78e6;
  --dd: #6a89cc;
  --gs: #f4c542;
  --shadow: 0px 4px 10px rgba(255, 215, 0, 0.3);
  --inner-shadow: inset 0 0 10px rgba(182, 176, 121, 0.48);
}

[data-theme="rose"] {
  --dark-grey: #f8e8e9;
  --middle-grey: #f3d9df;
  --grey: #eec1cb;
  --light-grey: #e8b4bc;
  --black: linear-gradient(135deg, #fff5f7, #ffe0e8);
  --white: #5c374c;
  --error: #ff6b81;
  --gold: #ffb6b9;
  --loader-border: #fddde6;
  --loader-top: #ffc2d1;
  --support: #b185a7;
  --dd: #f78fb3;
  --gs: #ffcad4;
  --shadow: 0px 4px 10px rgba(255, 182, 193, 0.3);
  --inner-shadow: inset 0 0 10px rgba(255, 192, 203, 0.4);
}

[data-theme="light-blue"] {
  --dark-grey: #e6f7ff;
  --middle-grey: #d0ecff;
  --grey: #b6e0fe;
  --light-grey: #a0d2f0;
  --black: #f5fcff;
  --white: #324a5f;
  --error: #ff6f6f;
  --gold: #9fd3f8;
  --loader-border: #e0f4ff;
  --loader-top: #bde0fe;
  --support: #6fa8dc;
  --dd: #92c9f9;
  --gs: #bee3f8;
  --shadow: 0px 4px 10px rgba(159, 211, 248, 0.3);
  --inner-shadow: inset 0 0 10px rgba(189, 224, 254, 0.4);
}

[data-theme="mint"] {
  --dark-grey: #e2fdf7;
  --middle-grey: #c7f6ec;
  --grey: #a6e9d9;
  --light-grey: #8cded1;
  --black: #f2fefb;
  --white: #325c52;
  --error: #ff7b7b;
  --gold: #8de0c5;
  --loader-border: #dafdf5;
  --loader-top: #a3f4d2;
  --support: #67bfa9;
  --dd: #7fe3c2;
  --gs: #78c9ad;
  --shadow: 0px 4px 10px rgba(141, 224, 197, 0.3);
  --inner-shadow: inset 0 0 10px rgba(141, 224, 197, 0.4);
}

[data-theme="forest"] {
  --dark-grey: #1E2C1E;
  --middle-grey: #2E4F2E;
  --grey: #3A5F3A;
  --light-grey: #90B890;
  --black: #141C14;
  --white: #F4ECD6;
  --error: #cc1b1b;
  --gold: #A3C48C;
  --loader-border: #d7ecd4;
  --loader-top: #A3C48C;
  --support: #6FB98F;
  --dd: #C3F0CA;
  --gs: #E6FFDF;
  --shadow: 0px 4px 10px rgba(47, 86, 47, 0.3);
  --inner-shadow: inset 0 0 10px rgba(102, 154, 102, 0.35);
}

[data-theme="oceanic"] {
  --dark-grey: #005F73;
  --middle-grey: #008C9E;
  --grey: #00B8D4;
  --light-grey: #81D4FA;
  --black: #003844;
  --white: #FFFFFF;
  --error: #cc1b1b;
  --gold: #FFE57F;
  --loader-border: #DFF9FF;
  --loader-top: #00B8D4;
  --support: #FFECB3;
  --dd: #B2EBF2;
  --gs: #FFF3E0;
  --shadow: 0px 4px 10px rgba(0, 184, 212, 0.3);
  --inner-shadow: inset 0 0 10px rgba(129, 211, 255, 0.35);
}

[data-theme="purple"] {
  --dark-grey: #2A003F;
  --middle-grey: #3E0066;
  --grey: #5D178A;
  --light-grey: #A259FF;
  --black: #1C0029;
  --white: #F3E8FF;
  --error: #FF4D6D;
  --gold: #FFBE0B;
  --loader-border: #E0BBE4;
  --loader-top: #D896FF;
  --support: #C77DFF;
  --dd: #B388EB;
  --gs: #E0AAFF;
  --shadow: 0px 4px 10px rgba(91, 0, 121, 0.4);
  --inner-shadow: inset 0 0 10px rgba(162, 89, 255, 0.35);
}

[data-theme="dark-blue-gradient"] {
  --dark-grey: #0D1B2A;
  --middle-grey: #1B263B;
  --grey: #415A77;
  --light-grey: #778DA9;
  --black: #000814;
  --white: #E0E1DD;
  --error: #EF476F;
  --gold: #347be5;
  --loader-border: #CBD5E1;
  --loader-top: #00B4D8;
  --support: #48CAE4;
  --dd: #ADE8F4;
  --gs: #CAF0F8;
  --shadow: 0px 4px 10px rgba(13, 27, 42, 0.4);
  --inner-shadow: inset 0 0 10px rgba(119, 141, 169, 0.35);
}


@font-face {
  font-family: 'Caveat';
  src: url('../../assets/fonts/Caveat-VariableFont_wght.ttf') format('truetype');
}

body {
  font-family: Arial, sans-serif;
  background: var(--black);
  color: var(--white);
  -webkit-app-region: drag; /* Позволяет перемещать окно */
  box-sizing: border-box;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 22px;
}

.header {
  flex: none;
  position: sticky;
  top: 0;
  z-index: 99;
  -webkit-app-region: drag;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding-top: 20px;
}

.wrapper {
  padding: 15px;
  position: relative;
  -webkit-app-region: no-drag;
  flex: auto;
  min-height: 100vh;
}

.footer {
  flex: none;
  height: 25px;
  font-size: 12px;
  color: var(--gold);
  display: flex;
  justify-content: center;
  align-items: center;
}

.error {
  color: var(--error);
  margin: 10px 0;
}

.message {
  margin: 10px 0;
}

input, button, select, textarea, a, .popup, .button, label {
  -webkit-app-region: no-drag;
}

a {
  color: var(--white);
  transition: color .2s ease;
  text-decoration: none;
}

a:hover {
  color: var(--gold);
}

a:visited,
a:active {
  color: var(--white);
}

select {
  background-color: transparent;
  border-radius: 5px;
  border: 1px solid var(--grey);
  color: var(--white);
  padding: 10px;
  width: 100%;
  height: 120px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

option {
  padding: 5px;
  color: var(--white);
  background-color: var(--dark-grey);
  font-size: 13px;
}

option:checked {
  background-color: var(--light-grey);
}

input {
  background-color: transparent;
  border-radius: 5px;
  border: 1px solid var(--grey);
  color: var(--white);
  padding: 5px;
}

input[type=number] {
  cursor: text;
}

.custom-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.custom-label input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid var(--gold);
  border-radius: 4px;
  margin-right: 6px;
  background-color: transparent;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.custom-label input[type="checkbox"]:checked {
  background-color: var(--gold);
}

.custom-label input[type="checkbox"]::after {
  content: "✔";
  position: absolute;
  top: -3px;
  left: 2px;
  color: var(--black);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.custom-label input[type="checkbox"]:checked::after {
  opacity: 1;
}

input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.button {
  border: none;
  background: var(--gold);
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
  width: 160px;
  height: 40px;
  color: var(--white);
}

.button:hover {
  background: var(--light-grey);
}

.button_icon {
  background-color: transparent;
  transition: .3s ease-in-out;
  cursor: pointer;
  border: none;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  width: 28px;
}

.button_icon:hover {
  background-color: transparent;
  transform: scale(120%);
}

.button_control {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--grey);
  color: var(--white);
  font-size: 14px;
  cursor: pointer;
  height: 28px;
  width: 28px;
  padding-bottom: 12px;
  border-radius: 5px;
}

.loader {
  border: 8px solid var(--loader-border);
  border-top: 8px solid var(--loader-top);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
  display: none;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.inactive {
  filter: grayscale(1);
}

.tabs {
  display: flex;
  margin-bottom: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.tab-button {
  padding: 8px;
  cursor: pointer;
  border: 1px solid var(--black);
  background: var(--grey);
  flex: 1;
  text-align: center;
  color: var(--white);
  border-radius: 5px;
  transition: .2s ease;
  font-size: 16px;
  box-shadow: var(--inner-shadow);
}

.tab-button.active {
  background: var(--gold);
}

.tab-button:hover {
  background: var(--light-grey);
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.tooltip {
  position: relative;
  cursor: pointer;
}

.tooltip::after {
  content: attr(data-tooltip); /* Берем текст из data-tooltip */
  font-family: Arial, sans-serif;
  position: absolute;
  bottom: 120%; /* Поднимаем выше элемента */
  left: 50%;
  transform: translateX(-50%);
  background: var(--black);
  color: var(--white);
  padding: 5px 8px;
  border-radius: 5px;
  font-size: 12px;
  white-space: wrap;
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none; /* Чтоб не мешал клику */
  z-index: 1;
}

.tooltip:hover::after {
  opacity: 1;
}

.hidden {
  display: none;
}

::-webkit-scrollbar {
  width: 8px; /* Ширина вертикального скролла */
  height: 8px; /* Высота горизонтального скролла */
  cursor: move;
}

/* Полоса прокрутки (фон) */
::-webkit-scrollbar-track {
  background: var(--black); /* Тёмный фон */
  border-radius: 10px;
}

/* Ползунок скролла */
::-webkit-scrollbar-thumb {
  background: var(--grey);
  border-radius: 10px;
}

/* При наведении на ползунок */
::-webkit-scrollbar-thumb:hover {
  background: var(--light-grey);
}


.popup {
  border-radius: 5px;
  width: 300px;
  height: 150px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: var(--black);
  color: var(--white);
  padding: 20px;
  margin: auto;
  border: 1px solid var(--grey);
  z-index: 1;
  box-shadow: var(--shadow);
}

.popup::after {
  background: var(--black);
  opacity: 0.6;
  position: fixed;
  content: "";
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.popup__content {
  position: relative;
  flex-direction: column;
  align-items: stretch;
  display: flex;
  gap: 15px;
  z-index: 2;
}

.popup__input {
  width: 100%;
  margin-top: 15px;
}

.cross {
  position: absolute;
  top: -15px;
  right: -15px;
  cursor: pointer;
}

</style>