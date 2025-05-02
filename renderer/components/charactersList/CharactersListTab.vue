<script setup>
import CharacterList from "@/components/charactersList/CharacterList.vue";
import NickName from "@/components/charactersList/NickName.vue";
import RaidSelector from "@/components/charactersList/RaidSelector.vue";
import {computed, inject, ref} from "vue";
import {saveSettings} from "../../../utils/utils.js";
import ConfirmPopup from "@/components/utils/ConfirmPopup.vue";

const settings = inject("settings");
const isShowLoader = inject("isShowLoader");

const isEditMode = ref(false);
const isShowRaidSelector = ref(false);
const isShowConfirmPopup = ref(false);
const currentChosenCharacter = ref({});

const nickname = computed({
  get: () => settings.value?.nickname,
  set: (newValue) => settings.value.nickname = newValue
});

const characterList = computed(() => settings.value?.characterList || []);
const characterSettings = computed(() => settings.value?.characterSettings || {});
const groupOrder = computed(() => settings.value?.groupOrder || []);

function toggleEditCharacters() {
  isEditMode.value = !isEditMode.value;
}

async function saveNickname(newNickname) {
  isEditMode.value = false;
  saveSettings({nickname: newNickname});
  await updateCharacters();
}

async function updateCharacters() {
  if (!nickname.value.length) {
    return;
  }

  await loadCharacters(nickname.value);
}

async function backupConfig() {
  const result = await window.electron.ipcRenderer.backupConfig();
  document.getElementById("message").innerText = result.message || "Бэкап создан";
  document.getElementById("message").classList.add("active");
  setTimeout(() => document.getElementById("message").classList.remove("active"), 3500);
}

async function resetCharacters() {
  const updatedSettings = {...settings.value};
  await backupConfig();
  for (let [characterName, character] of Object.entries(characterSettings.value)) {
    if (!character.raidStatus || !character.raids) {
      continue;
    }

    let raidStatus = {};

    for (let raidName of Object.keys(character.raidStatus)) {
      if (!character.raids.includes(raidName)) {
        continue;
      }

      raidStatus[raidName] = false;
    }

    updatedSettings.characterSettings[characterName] = {
      ...updatedSettings.characterSettings[characterName],
      raidStatus
    };
  }

  saveSettings(updatedSettings);
}

async function loadCharacters(nickname) {
  const container = document.getElementById("character-list");
  isShowLoader.value = true;

  const result = await window.electron.ipcRenderer.fetchCharacters(nickname);

  if (result.error) {
    container.innerText = "Ошибка: " + result.error;
    return;
  }

  const isValidCharacter = (char) => char && char.name && char.gearScore;

  const filtered = new Map();
  [...characterList.value, ...result].forEach((char) => {
    if (!isValidCharacter(char)) {
      return;
    }

    const existing = filtered.get(char.name);
    const newGS = parseFloat(char.gearScore.replace(",", ""));
    const oldGS = existing ? parseFloat(existing.gearScore.replace(",", "")) : 0;

    if (!existing || newGS > oldGS) {
      filtered.set(char.name, char);
    }
  });

  if (!groupOrder.value.length) {
    saveSettings({groupOrder: ["Без группы"]});
  }

  saveCharacterList(Array.from(filtered.values()));
  isShowLoader.value = false;
}

function saveCharacterList(newList) {
  saveSettings({characterList: newList});
}

function saveCharacters() {
  saveSettings({
    characterList: characterList.value,
    characterSettings: characterSettings.value,
  });
  isEditMode.value = false;
}

function showRaidSelector(characterName) {
  currentChosenCharacter.value = characterName;
  isShowRaidSelector.value = true;
}

async function updateSingleCharacter(name) {
  isShowLoader.value = true;

  const result = await window.electron.ipcRenderer.fetchCharacter(name);

  if (result.error) {
    console.error('Ошибка:', result.error);
    isShowLoader.value = false;
    return;
  }

  const updated = characterList.value.filter(c => c.name !== name);
  updated.push(result);

  saveCharacterList(updated);
  isShowLoader.value = false;
}

async function updateCharactersGroup(characters = []) {
  if (!Array.isArray(characters) || characters.length === 0) {
    return;
  }

  isShowLoader.value = true;

  const updated = [];
  for (const character of characters) {
    const result = await window.electron.ipcRenderer.fetchCharacter(character.name);
    if (result && !result.error) {
      updated.push(result);
    } else {
      console.error(`Ошибка при загрузке ${character.name}:`, result.error);
    }
    await new Promise(res => setTimeout(res, 1000));
  }

  saveCharacterList(mergeCharactersPreferMaxGS([...characterList.value, ...updated]));
  isShowLoader.value = false;
}

function mergeCharactersPreferMaxGS(list) {
  const map = new Map();

  for (const char of list) {
    const existing = map.get(char.name);
    const currentGS = parseFloat(char.gearScore.replace(',', ''));
    const existingGS = existing ? parseFloat(existing.gearScore.replace(',', '')) : 0;

    if (!existing || currentGS > existingGS) {
      map.set(char.name, char);
    }
  }

  return Array.from(map.values());
}
</script>

<template>
  <nick-name
      v-model="nickname"
      @saveNickname="saveNickname"
      @updateCharacters="updateCharacters"
      @resetCharacters="isShowConfirmPopup = true"
      @editCharacters="toggleEditCharacters"
      @editNickname="isEditMode = true"
      :isEditMode="isEditMode"
  />

  <character-list
      :characterList="characterList"
      :characterSettings="characterSettings"
      :groupOrder="groupOrder"
      :isEditMode="isEditMode"
      @showRaidSelector="showRaidSelector"
      @updateCharacter="updateSingleCharacter"
      @updateCharacterGroup="updateCharactersGroup"
  />

  <button
      id="save-button"
      class="button save-button"
      v-show="isEditMode"
      @click="saveCharacters"
  >
    Сохранить
  </button>

  <raid-selector
      v-show="isShowRaidSelector"
      @save="isShowRaidSelector = false"
      :character-name="currentChosenCharacter"
      @close="isShowRaidSelector = false"
  />

  <confirm-popup
      title="Сброс состояния активностей"
      text="Ты уверен, что хочешь сбросить прогресс активностей у всех персонажей?"
      note="При подтверждении, будет создан бэкап состояния до сброса"
      @closePopup="isShowConfirmPopup = false"
      @accept="resetCharacters"
      @reject="isShowConfirmPopup = false"
      v-if="isShowConfirmPopup"
  />
</template>

<style scoped lang="scss">

</style>