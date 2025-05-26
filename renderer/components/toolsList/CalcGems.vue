<script setup>
import {ref, computed} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";

// Камни, которые хотим посмотреть в пересчёте
const gemLevels = [2, 3, 4, 5, 6, 7, 8, 9, 10];

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
  return cubes.value['T4-1'] * cubeDrop['T4-1'] +
      cubes.value['T4-2'] * cubeDrop['T4-2'] +
      cubes.value['T4-3'] * cubeDrop['T4-3'];
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
}

const sortedTotals = computed(() => {
  return Object.entries(finalTotals.value)
      .map(([level, count]) => ({level: parseInt(level), count}))
      .filter(item => item.count > 0)
      .sort((a, b) => b.level - a.level);
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
