<script setup>
import CharacterList from "@/components/charactersList/CharacterList.vue";
import NickName from "@/components/charactersList/NickName.vue";
import RaidSelector from "@/components/charactersList/RaidSelector.vue";
import {computed, inject, ref} from "vue";
import {saveSettings} from "../../../utils/utils.js";

const settings = inject("settings");
const isShowLoader = inject("isShowLoader");

const isEditMode = ref(false);
const isShowRaidSelector = ref(false);
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
  await refreshCharacters();
}

async function refreshCharacters() {
  if (!nickname.value.length) {
    return;
  }

  await loadCharacters(nickname.value);
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
</script>

<template>
  <nick-name
      v-model="nickname"
      @save-nickname="saveNickname"
      @refresh-characters="refreshCharacters"
      @edit-characters="toggleEditCharacters"
      @edit-nickname="isEditMode = true"
      :isEditMode="isEditMode"
  />

  <character-list
      :characterList="characterList"
      :characterSettings="characterSettings"
      :groupOrder="groupOrder"
      :isEditMode="isEditMode"
      @show-raid-selector="showRaidSelector"
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