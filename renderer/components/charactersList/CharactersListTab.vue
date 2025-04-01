<script setup>
import CharacterList from "@/components/charactersList/CharacterList.vue";
import NickName from "@/components/charactersList/NickName.vue";
import RaidSelector from "@/components/charactersList/RaidSelector.vue";
import {computed, inject, ref} from "vue";
import {saveSettings} from "../../../utils/utils.js";

let settings = inject('settings');
let isShowLoader = inject('isShowLoader');

const isEditMode = ref(false);
const isShowRaidSelector = ref(false);
const currentChosenCharacter = ref({});

const nickname = computed({
  get: () => settings.value?.nickname,
  set: (newValue) => settings.value.nickname = newValue
});

const characterList = computed(() => settings.value?.characterList || []);
const characterSettings = computed(() => settings.value?.characterSettings || {});

function toggleEditCharacters() {
  isEditMode.value = !isEditMode.value;
}

async function saveNickname(newNickname) {
  isEditMode.value = false;
  saveSettings({nickname: newNickname});
  await refreshCharacters();
}

async function refreshCharacters() {
  await loadCharacters(nickname.value);
}

async function loadCharacters(nickname) {
  const container = document.getElementById('character-list');
  isShowLoader.value = true;

  const result = await window.electron.ipcRenderer.fetchCharacters(nickname);

  if (result.error) {
    container.innerText = 'Ошибка: ' + result.error;
    return;
  }

  const isValidCharacter = char => char && char.name && char.gearScore;

  let filteredCharacters = new Map();
  [...characterList.value, ...result].forEach(char => {
    if (!isValidCharacter(char)) return;

    const existingChar = filteredCharacters.get(char.name);
    const newGS = parseFloat(char.gearScore.replace(',', ''));
    const oldGS = existingChar ? parseFloat(existingChar.gearScore.replace(',', '')) : 0;

    if (!existingChar || newGS > oldGS) {
      filteredCharacters.set(char.name, char);
    }
  });

  saveCharacterList(Array.from(filteredCharacters.values()));
  isShowLoader.value = false;
}

function showRaidSelector(characterName) {
  currentChosenCharacter.value = characterName;
  isShowRaidSelector.value = true;
}

function saveCharacterList(newCharacterList) {
  saveSettings({characterList: newCharacterList});
}

function saveCharacters() {
  saveSettings({
    characterSettings: characterSettings.value,
    characterList: characterList.value
  });
  isEditMode.value = false;
}

function onDragEnd(flatList) {
  const updatedSettings = {...characterSettings.value};

  flatList.forEach(char => {
    if (!updatedSettings[char.name]) updatedSettings[char.name] = {};
  });

  saveSettings({
    characterList: flatList,
    characterSettings: updatedSettings
  });
}
</script>

<template>
  <nick-name
      v-model="nickname"
      @save-nickname="saveNickname"
      @refresh-characters="refreshCharacters"
      @edit-characters="toggleEditCharacters"
      @edit-nickname="isEditMode = true"
      :is-edit-mode="isEditMode"
  />

  <character-list
      :characterList="characterList"
      :characterSettings="characterSettings"
      :is-edit-mode="isEditMode"
      @show-raid-selector="showRaidSelector"
      @dragEnd="onDragEnd"
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
</template>

<style scoped lang="scss">

</style>