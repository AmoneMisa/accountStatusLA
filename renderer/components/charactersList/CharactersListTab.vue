<script setup>
import CharacterList from "@/components/charactersList/CharacterList.vue";
import NickName from "@/components/charactersList/NickName.vue";
import {computed, inject, ref} from "vue";
import {saveSettings} from "../../../utils/utils.js";
import RaidSelector from "@/components/charactersList/RaidSelector.vue";

let settings = inject('settings');
let nickname = computed({
  get: () => settings.value?.nickname,
  set: (newValue) => settings.value.nickname = newValue
});
let characterList = computed( {
  get: () => {
    console.log("characterList", settings.value?.characterList);
    return settings.value?.characterList || [];
  },
  set: (newList) => settings.value.characterList = newList
});
let characterSettings = computed(() => settings.value?.characterSettings);
let isShowRaidSelector = ref(false);
const isEditMode = ref(false);
const currentChosenCharacter = ref({});

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
  document.querySelector("#loader").style.display = 'block';
  const result = await window.electron.ipcRenderer.fetchCharacters(nickname);

  if (result.error) {
    container.innerText = 'Ошибка: ' + result.error;
    return;
  }

  const isValidCharacter = char => char && char.name && char.gearScore;

  let filteredCharacters = new Map();
  [...characterList.value, ...result].forEach(char => {
    if (!isValidCharacter(char)) {
      return;
    }

    const existingChar = filteredCharacters.get(char.name);

    if (!existingChar || parseFloat(char.gearScore.replace(',', '')) > parseFloat(existingChar.gearScore.replace(',', ''))) {
      filteredCharacters.set(char.name, char);
    }
  });

  saveCharacterList(Array.from(filteredCharacters.values()));
  document.querySelector("#loader").style.display = 'none';
}

function toggleEditCharacters() {
  isEditMode.value = !isEditMode.value;
}

function saveCharacters(characterNickname, key, value) {
  saveSettings({
    characterSettings: {
      ...characterSettings.value,
      [characterNickname]: {
        ...characterSettings.value[characterNickname] || {},
        [key]: value
      }
    }
  });

  isEditMode.value = false;
}

function showRaidSelector(characterName) {
  currentChosenCharacter.value = characterName;
  isShowRaidSelector.value = true;
}

function saveCharacterList(newCharacterList) {
  saveSettings({characterList: newCharacterList});
}
</script>

<template>
  <nick-name v-model="nickname" @save-nickname="saveNickname"
             @refresh-characters="refreshCharacters"
             @edit-characters="toggleEditCharacters"
             @edit-nickname="isEditMode = true"
             :is-edit-mode="isEditMode"/>
  <character-list :characterList="characterList" :is-edit-mode="isEditMode"
                  @show-raid-selector="showRaidSelector"
                  @dragEnd="saveCharacterList"/>
  <button id="save-button" class="button save-button" v-show="isEditMode" @click="saveCharacters">Сохранить</button>
  <raid-selector v-show="isShowRaidSelector" @save="isShowRaidSelector = false" :character-name="currentChosenCharacter" @close="isShowRaidSelector = false"/>
</template>

<style scoped lang="scss">

</style>