<script setup>
import {ref, inject, computed, watch} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";
import CustomCheckbox from "@/components/utils/CustomCheckbox.vue";

// Камни, которые хотим посмотреть в пересчёте
const settings = inject('settings');
const totalCubes = computed(() => settings?.value?.totalCubes || {});
const useMyCubes = ref(false);

// Сколько 2 ур. камней падает из каждого куба
const cubeDrop = {
  'T4-1': 3,
  'T4-2': 6,
  'T4-3': 8,
};

const cubes = ref({
  'T4-1': 0,
  'T4-2': 0,
  'T4-3': 0,
});

const totalLevel2 = computed(() => {
  return getCurrentCubes()['T4-1'] * cubeDrop['T4-1'] +
      getCurrentCubes()['T4-2'] * cubeDrop['T4-2'] +
      getCurrentCubes()['T4-3'] * cubeDrop['T4-3'];
});

const mergeUpTo = ref(10); // Максимальный уровень объединения

const finalTotals = computed(() => {
  let gems = {2: totalLevel2.value}; // стартуем с 2 ур.

  for (let level = 2; level < mergeUpTo.value; level++) {
    const current = gems[level] || 0;
    const mergeCount = Math.floor(current / 3);
    const remainder = current % 3;

    if (!gems[level + 1]) gems[level + 1] = 0;

    gems[level + 1] += mergeCount;
    gems[level] = remainder;
  }

  return gems;
});

function clear() {
  cubes.value['T4-1'] = 0;
  cubes.value['T4-2'] = 0;
  cubes.value['T4-3'] = 0;
  mergeUpTo.value = 10;
  useMyCubes.value = false;
}

const sortedTotals = computed(() => {
  return Object.entries(finalTotals.value)
      .map(([level, count]) => ({level: parseInt(level), count}))
      .filter(item => item.count > 0)
      .sort((a, b) => b.level - a.level);
});

function getCurrentCubes() {
  if (useMyCubes.value) {
    return convertToT4Totals(settings.value.tableData);
  } else {
    return cubes.value;
  }
}

function convertToT4Totals(data) {
  const result = {
    'T4-1': 0,
    'T4-2': 0,
    'T4-3': 0
  };

  for (const character in data) {
    const _cubes = data[character];

    for (const [key, value] of Object.entries(_cubes)) {
      const numericValue = parseInt(value) || 0;

      if (key === '4.1') {
        result['T4-1'] += numericValue;
      }
      if (key === '4.2') {
        result['T4-2'] += numericValue;
      }
      if (key === '4.3') {
        result['T4-3'] += numericValue;
      }
    }
  }

  return result;
}

watch(useMyCubes, (newVal) => {
  if (newVal) {
    cubes.value['T4-1'] = totalCubes.value['T4-1'] || 0;
    cubes.value['T4-2'] = totalCubes.value['T4-2'] || 0;
    cubes.value['T4-3'] = totalCubes.value['T4-3'] || 0;
  }
});
</script>

<template>
  <div class="tools-container__item calc-gems" id="calc-gems">
    <tooltip has-icon="true">
      <div class="tools-container__item-name">
        Рассчитать количество камней из заданного числа кубов
      </div>
      <template #tooltip>Учитывается только основной дроп с кубов, без бонусов</template>
    </tooltip>

    <div class="tools-container__item-content">
      <custom-checkbox
          text="Использовать все мои кубы"
          v-model="useMyCubes"
      />

      <div v-if="useMyCubes">
        <ul>
          <li v-for="[type, count] in Object.entries(getCurrentCubes())" :key="type">{{ type }} - {{ count }}</li>
        </ul>
      </div>

      <div class="calc-gems__inputs">
        <label class="tools-container__item-label">
          T4-1 кубов
          <input type="number" min="0" v-model.number="cubes['T4-1']" class="tools-container__item-input"/>
        </label>
        <label class="tools-container__item-label">
          T4-2 кубов
          <input type="number" min="0" v-model.number="cubes['T4-2']" class="tools-container__item-input"/>
        </label>
        <label class="tools-container__item-label">
          T4-3 кубов
          <input type="number" min="0" v-model.number="cubes['T4-3']" class="tools-container__item-input"/>
        </label>
        <label class="tools-container__item-label">
          Объединять до уровня:
          <input type="number" v-model.number="mergeUpTo" min="2" max="10" class="tools-container__item-input">
        </label>
      </div>

      <div class="tools-container__item-message">
        <div>🔹 Получено камней 2 уровня: <b>{{ totalLevel2 }}</b></div>
        <div><b>📦 Итого:</b></div>
        <div v-for="(level, index) in sortedTotals" :key="index">
          ▫️ <b class="calc-gems__converted-item">ур. {{ level.level }}:</b> х{{ level.count }}
        </div>
      </div>

      <button class="button" @click="clear">Очистить всё</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.calc-gems__inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.tools-container__item-label {
  flex: 33%;
}

.calc-gems__converted {
  margin-top: 10px;
}

.tools-container__item-message {
  text-align: center;
}

.calc-gems__converted-item {
  color: var(--gold);
  margin-right: 5px;
}
</style>
