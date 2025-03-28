<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject, ref} from "vue";

defineProps({
  characterName: ""
});

const emit = defineEmits(['save']);

const raids = ["Камен 2.0 (гер)", "Камен 2.0 (об)", "Аврель (гер)", "Аврель (об)", "Эгир (гер)", "Эгир (об)", "Ехидна", "Бехемос", "Камен (гер)", "Хаос", "Хранитель", "Эфонка"];
let settings = inject('settings');
const characterSettings = computed(() => settings.value?.characterSettings);

let currentOptions = ref([]);

function applyRaidSelection(characterName) {
  let selectedRaids = Array.from(currentOptions.value);
  saveSettings({characterSettings: {
    ...characterSettings.value,
      [characterName]: {
      ...characterSettings.value[characterName] || {},
        raids: selectedRaids
      }
    }});
  emit("save");
}
</script>

<template>
<div class="raid-selector">
  <button class="cross button button_icon" @click="emit('close')">✖</button>
  <label class="raid-selector__label">
    Выбери активность для персонажа: <i>{{characterName}}</i>.<br>Для мульти-выбора: нажми <i>Cntrl</i> и выбирай необходимые пункты
    <select class="raid-selector__select" multiple v-model="currentOptions" >
      <option v-for="raid in raids" :value="raid" :selected="characterSettings[characterName].raidStatus[raid]">{{raid}}</option>
    </select>
  </label>
  <button id="apply-raids" class="apply-button button" @click="applyRaidSelection(characterName)">Применить</button>
</div>
</template>

<style scoped lang="scss">

</style>