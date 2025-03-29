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

const tabButtonsList = [{
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
@use "./styles/styles";
</style>