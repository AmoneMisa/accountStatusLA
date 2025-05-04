<script setup>
import romb from "../../../src/svg/romb.svg";
import {ref, computed, watch} from "vue";

const state = ref({
  A: Array(10).fill(null),
  B: Array(10).fill(null),
  C: Array(10).fill(null),
  chance: 0.75
});

const target = ref({
  A: 0,
  B: 0,
  C: 0
});

const computedChance = computed(() => {
  const all = [...state.value.A, ...state.value.B, ...state.value.C];
  let chance = 0.75;

  for (const cell of all) {
    if (cell === true) {
      chance = Math.max(0.25, chance - 0.1);
    } else if (cell === false) {
      chance = Math.min(0.75, chance + 0.1);
    }
  }

  return chance;
});

const rowKeys = ['A', 'B', 'C'];

function countSuccess(row) {
  return state.value[row].filter(v => v === true).length;
}
function countTotal(row) {
  return state.value[row].filter(v => v !== null).length;
}

function markCell(row, index, type) {
  if (type === 'left') {
    state.value[row][index] = true;
  } else if (type === 'right') {
    state.value[row][index] = false;
  } else if (type === 'reset') {
    state.value[row][index] = null;
  }
}

function handleClick(e, row, index) {
  if (e.detail === 2) {
    markCell(row, index, 'reset');
  } else if (e.button === 2) {
    markCell(row, index, 'right');
  } else {
    markCell(row, index, 'left');
  }
}

function State(currentA, totalA, currentB, totalB, currentC, totalC, chance) {
  this.currentA = currentA;
  this.totalA = totalA;
  this.currentB = currentB;
  this.totalB = totalB;
  this.currentC = currentC;
  this.totalC = totalC;
  this.chance = chance;

  this.getKey = function () {
    return [
      this.currentA, this.totalA,
      this.currentB, this.totalB,
      this.currentC, this.totalC,
      this.chance
    ].join(';');
  };

  this.isValid = function () {
    return this.totalA <= 10 && this.totalB <= 10 && this.totalC <= 10;
  };

  this.toBest = function () {
    return new State(
        this.currentA + (10 - this.totalA), 10,
        this.currentB + (10 - this.totalB), 10,
        this.currentC, 10,
        0.75
    );
  };

  const variantsChanges = {
    'A+': {currentA: 1, totalA: 1, chance: -0.1},
    'A-': {totalA: 1, chance: 0.1},
    'B+': {currentB: 1, totalB: 1, chance: -0.1},
    'B-': {totalB: 1, chance: 0.1},
    'C+': {currentC: 1, totalC: 1, chance: -0.1},
    'C-': {totalC: 1, chance: 0.1}
  };

  this.withChange = function (change) {
    return new State(
        this.currentA + (change.currentA || 0),
        this.totalA + (change.totalA || 0),
        this.currentB + (change.currentB || 0),
        this.totalB + (change.totalB || 0),
        this.currentC + (change.currentC || 0),
        this.totalC + (change.totalC || 0),
        Math.max(0.25, Math.min(0.75, this.chance + (change.chance || 0)))
    );
  };

  this.variant = function (variantType) {
    return this.withChange(variantsChanges[variantType]);
  };

  this.variants = function () {
    return Object.keys(variantsChanges).reduce((acc, variantType) => {
      acc[variantType] = this.variant(variantType);
      return acc;
    }, {});
  };
}

function Calculator(targets, cache) {
  this.targets = targets;
  this.cache = cache || new Map();

  this.isReach = function (state) {
    return this.targets.some(target =>
        target.minA <= state.currentA &&
        target.minB <= state.currentB &&
        state.currentC <= target.maxC
    );
  };

  this.isReachable = function (state) {
    return this.isReach(state.toBest());
  };

  this.chanceReach = function (state) {
    const key = state.getKey();
    if (!this.cache.has(key)) {
      this.cache.set(key, this.chanceReachWithoutCache(state));
    }
    return this.cache.get(key);
  };

  this.chanceReachWithoutCache = function (state) {
    if (!state.isValid()) return 0;
    if (this.isReach(state)) return 1;
    if (!this.isReachable(state)) return 0;
    return Math.max(...Object.values(this.variantsChances(state)));
  };

  this.variantsChances = function (state) {
    const variants = state.variants();
    return ['A', 'B', 'C'].reduce((acc, type) => {
      acc[type] = this.variantChance(
          state.chance,
          variants[`${type}+`],
          variants[`${type}-`]
      );
      return acc;
    }, {});
  };

  this.variantChance = function (chance, plusState, minusState) {
    return this.chanceReach(plusState) * chance + this.chanceReach(minusState) * (1 - chance);
  };
}

const calculator = new Calculator([
  {minA: 9, minB: 7, maxC: 4},
  {minA: 7, minB: 9, maxC: 4},
  {minA: 10, minB: 6, maxC: 4},
  {minA: 6, minB: 10, maxC: 4}
]);

const chanceResult = ref(null);
const variantChances = ref({});
const bestRow = ref(null);

function recalculate() {
  const s = new State(
      countSuccess('A'), countTotal('A'),
      countSuccess('B'), countTotal('B'),
      countSuccess('C'), countTotal('C'),
      computedChance.value
  );
  chanceResult.value = calculator.chanceReach(s);
  const allChances = calculator.variantsChances(s);

  const filtered = Object.fromEntries(
      Object.entries(allChances).filter(([row]) => countSuccess(row) < target.value[row])
  );

  variantChances.value = filtered;
  bestRow.value = Object.keys(filtered).reduce((a, b) =>
      filtered[a] > filtered[b] ? a : b, Object.keys(filtered)[0]
  );
}

function reset() {
  state.value = {
    A: Array(10).fill(null),
    B: Array(10).fill(null),
    C: Array(10).fill(null),
    chance: 0.75
  };
  chanceResult.value = null;
  variantChances.value = {};
  bestRow.value = null;
}

watch(state, recalculate, {deep: true});
watch(target, recalculate, {deep: true});
</script>

<template>
  <div class="tools-container__item" id="ability-stone-calculator">
    <div class="tools-container__item-name">
      Калькулятор заточки фетранита
    </div>
    <div class="tools-container__item-message">
      Текущий шанс: <strong>{{ (computedChance * 100).toFixed(0) }}%</strong>
    </div>
    <div class="fetranite-state">
      <div class="fetranite-state__row" v-for="row in rowKeys" :key="row">
        <div
            v-for="(cell, i) in state[row]"
            :key="i"
            class="fentranite-state__button"
            :class="{
            'fentranite-state__button_success': cell === true,
            'fentranite-state__button_fail': cell === false,
            'fentranite-state__button_best': bestRow === row && countTotal(row) === i
          }"
            @click="e => handleClick(e, row, i)"
            @contextmenu.prevent="e => handleClick(e, row, i)"
            @dblclick.prevent="e => handleClick(e, row, i)"
        >
          <romb />
        </div>
      </div>
    </div>

    <div class="tools-container__item-content">
      <div class="tools-container__item-label" v-for="row in rowKeys" :key="row + '-target'">
        Цель по {{ row }}
        <input type="number" v-model.number="target[row]" min="0" max="10" class="tools-container__item-input" />
      </div>

      <div class="tools-container__item-message">
        <button class="button" @click="reset">Сбросить</button>
      </div>

      <div class="tools-container__item-message" v-if="chanceResult !== null">
        Общий шанс достижения цели: <strong>{{ (chanceResult * 100).toFixed(2) }}%</strong>
      </div>

      <div class="tools-container__item-message" v-if="Object.keys(variantChances).length">
        <p>Шанс при попытке в каждую строку:</p>
        <ul>
          <li v-for="(chance, key) in variantChances" :key="key">
            {{ key }}: {{ (chance * 100).toFixed(2) }}%
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fetranite-state__row {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.fentranite-state__button {
  filter: grayscale(1);
  width: 15px;
  cursor: pointer;

  &_success {
    filter: none;
    color: var(--gold);
  }

  &_fail {
    filter: none;
    color: var(--dark-grey);
  }

  &_best {
    filter: drop-shadow(0 0 7px gold);
  }
}

.fetranite-state__row:last-of-type {
  .fentranite-state__button {
    &_success {
      color: var(--error);
    }

    &_fail {
      color: var(--dark-grey);
    }
  }
}
</style>
