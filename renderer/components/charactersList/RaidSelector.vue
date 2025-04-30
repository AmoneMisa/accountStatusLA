<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject, ref, watchEffect} from "vue";
import cross from "../../../src/svg/cross.svg";

const props = defineProps({
  characterName: ""
});

const emit = defineEmits(['save', 'close']);

const raids = ["Камен 2.0 (гер)", "Камен 2.0 (об)", "Аврель (гер)", "Аврель (об)", "Эгир (гер)", "Эгир (об)", "Ехидна", "Бехемос", "Камен (гер)", "Хаос", "Хранитель", "Эфонка"];
let settings = inject('settings');
const characterSettings = computed(() => settings.value?.characterSettings);

let currentOptions = ref([]);

function setChosenOption(value, isChecked) {
  if (!currentOptions.value.includes(value) && isChecked) {
    currentOptions.value.push(value);
  } else {
    currentOptions.value = currentOptions.value.filter(_val => _val !== value);
  }
}

function applyRaidSelection(characterName) {
  let selectedRaids = Array.from(currentOptions.value);
  saveSettings({
    characterSettings: {
      ...characterSettings.value,
      [characterName]: {
        ...characterSettings.value[characterName] || {},
        raids: selectedRaids
      }
    }
  });
  emit("save");
}

watchEffect(() => {
  currentOptions.value = characterSettings.value?.[props.characterName]?.raids || [];
});
</script>

<template>
  <div class="raid-selector popup">
    <div class="popup__content">
      <button class="cross button button_icon" @click="emit('close')">
        <cross class="icon icon_very-small cross-icon"/>
      </button>
      <div>Выбери активность для персонажа: <i>{{ characterName }}</i>.</div>
      <div class="raid-selector__list">
        <label v-for="raid in raids" class="raid-selector__label custom-label">
          <input :value="raid" type="checkbox" class="raid-selector__checkbox" :checked="currentOptions.includes(raid)" @change="({target}) => setChosenOption(raid, target.checked)">
          <span>{{ raid }}</span>
        </label>
      </div>
      <button id="apply-raids" class="apply-button button" @click="applyRaidSelection(characterName)">Применить</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.raid-selector__label {
  font-size: var(--font-small);
  width: 100%;
  max-width: calc(50% - 10px);

  &:nth-child(even) {
    justify-content: flex-end;

    span {
      order: 1;
    }

    input {
      order: 2;
    }
  }
}

.raid-selector__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
</style>