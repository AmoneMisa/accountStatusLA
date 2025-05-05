<script setup>
import {computed, inject, reactive, ref} from 'vue';
import {saveSettings} from '../../../utils/utils.js';
import ShareSnippet from "@/components/utils/ShareSnippet.vue";
import CustomCheckbox from "@/components/utils/CustomCheckbox.vue";

const columnNames = ['3.1', '3.2', '3.3', '3.4', '3.5', '4.1', '4.2'];

let settings = inject('settings');
const characterList = computed(() => settings.value.characterList);
const characterSettings = computed(() => settings.value.characterSettings);
const tableData = computed(() => settings.value.tableData || {});
const cubesSettings = computed(() => settings.value.cubesSettings || {});

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
  return parseInt(tableData.value[charName]?.[col]) || 0;
};

const updateValue = (charName, col, value) => {
  if (!tableData.value[charName]) {
    tableData.value[charName] = {};
  }

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
  saveSettings({cubesSettings: cubesSettings.value});
};
</script>

<template>
  <div id="cubes-table">
    <div class="cubes-table__settings">
      <customCheckbox
          v-for="col in columnNames"
          :key="col"
          :text="`Вкл. ${col}`"
          labelClass="cubes-table__settings-item"
          v-model="cubesSettings[col]"
          :data-name="col"
          class="cubes-table__settings-input"
          @change="saveCubesSettings"
      />
    </div>

    <share-snippet>
      <div class="cubes-table">
        <div class="cubes-table__row">
          <div class="cubes-table__cell cubes-table__cell_name">Персонаж</div>
          <div
              v-for="col in columnNames"
              :key="col"
              class="cubes-table__cell"
              :data-cube="col"
              v-show="cubesSettings[col]"
          >
            {{ col }}
          </div>
        </div>

        <div
            v-for="char in filteredCharacters"
            :key="char.name"
            class="cubes-table__row"
        >
          <div
              class="cubes-table__cell cubes-table__cell_name"
              :class="{'cubes-table_support': isSupport(char.className),
            'cubes-table_dd': !isSupport(char.className)}"
          >
            {{ char.name }}
          </div>

          <div
              v-for="col in columnNames"
              :key="col"
              class="cubes-table__cell"
              :data-cube="col"
              v-show="cubesSettings[col]"
          >
            <input
                class="cubes-table__input"
                type="number"
                min="0"
                :value="getCellValue(char.name, col)"
                @input="e => updateValue(char.name, col, e.target.value)"
            />
            <div class="cubes-table__controls">
              <button class="button button_control btn-minus" @click="decrement(char.name, col)">-</button>
              <button class="button button_control btn-plus" @click="increment(char.name, col)">+</button>
            </div>
          </div>
        </div>
      </div>
    </share-snippet>
  </div>
</template>

<style scoped lang="scss">
.cubes-table__settings {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
  font-size: var(--font-very-small);
}

.cubes-table {
  border: 1px solid var(--grey);
  box-shadow: var(--shadow);
  border-radius: 8px;
  padding: 10px;
  overflow: hidden;
}

.cubes-table__row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid var(--grey);
  justify-content: space-between;
  overflow: auto;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background-color: var(--dark-grey);
  }
}

.cubes-table__cell {
  width: 60px;
  border-right: 1px solid var(--grey);
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: var(--font-small);
  flex: auto;

  &:first-child {
    min-width: 140px;
    max-width: 30%;
  }

  &:last-child {
    border-right: none;
  }
}

.cubes-table__input {
  width: 50px;
}

.cubes-table__controls {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  gap: 5px;
}

.cubes-table_dd {
  color: var(--dd);
}

.cubes-table_support {
  color: var(--support);
}
</style>