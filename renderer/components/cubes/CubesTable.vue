<script setup>
import {computed, inject, reactive, ref} from 'vue';
import {saveSettings} from '../../../utils/utils.js';

const columnNames = ['3.1', '3.2', '3.3', '3.4', '3.5', '4.1', '4.2'];

let settings = inject('settings');
const characterList = computed(() => settings.value.characterList);
const characterSettings = computed(() => settings.value.characterSettings);
const tableData = computed(() => settings.value.tableData);
const cubesSettings = computed(() => settings.value.cubesSettings);

columnNames.forEach(col => {
  if (!cubesSettings.value) {
    cubesSettings.value = {};
  }

  if (!cubesSettings.value.hasOwnProperty(col)) {
    cubesSettings.value[col] = true;
  }
});

const filteredCharacters = computed(() =>
    characterList.value.filter(c => !(characterSettings.value[c.name]?.delete))
);

const isSupport = (className) => ['Художница', 'Менестрель', 'Паладин'].includes(className);

const getCellValue = (charName, col) => {
  return tableData.value[charName]?.[col] || 0;
};

const updateValue = (charName, col, value) => {
  if (!tableData.value[charName]) tableData.value[charName] = {};
  tableData.value[charName][col] = parseInt(value) || 0;

  if (!tableData.value[charName]) {
    tableData.value[charName] = {};
  }

  tableData.value[charName][col] = value;
  saveSettings({tableData: tableData.value});
};

const increment = (charName, col) => {
  updateValue(charName, col, getCellValue(charName, col) + 1);
};

const decrement = (charName, col) => {
  updateValue(charName, col, Math.max(0, getCellValue(charName, col) - 1));
};

const saveCubesSettings = () => {
  saveSettings({ cubesSettings: cubesSettings.value });
};
</script>

<template>
  <div id="character-table">
    <div class="character-table__settings">
      <label
          v-for="col in columnNames"
          :key="col"
          class="character-table__settings-item custom-label"
      >
        Вкл. {{ col }}
        <input
            type="checkbox"
            v-model="cubesSettings[col]"
            :data-name="col"
            class="character-table__settings-input"
            @change="saveCubesSettings"
        />
      </label>
    </div>

    <div class="character-table">
      <div class="character-table__row">
        <div class="character-table__cell character-table__cell_name">Персонаж</div>
        <div
            v-for="col in columnNames"
            :key="col"
            class="character-table__cell"
            :data-cube="col"
            v-show="cubesSettings[col]"
        >
          {{ col }}
        </div>
      </div>

      <div
          v-for="char in filteredCharacters"
          :key="char.name"
          class="character-table__row"
      >
        <div
            class="character-table__cell character-table__cell_name"
            :class="{'character-table_support': isSupport(char.className),
            'character-table_dd': !isSupport(char.className)}"
        >
          {{ char.name }}
        </div>

        <div
            v-for="col in columnNames"
            :key="col"
            class="character-table__cell"
            :data-cube="col"
            v-show="cubesSettings[col]"
        >
          <input
              class="character-table__input"
              type="number"
              min="0"
              :value="getCellValue(char.name, col)"
              @input="e => updateValue(char.name, col, e.target.value)"
          />
          <div class="character-table__controls">
            <button class="button button_control btn-minus" @click="decrement(char.name, col)">-</button>
            <button class="button button_control btn-plus" @click="increment(char.name, col)">+</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>