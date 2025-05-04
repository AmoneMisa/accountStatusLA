<script setup>
import romb from "../../../src/svg/romb.svg";
import plus from "../../../src/svg/plus.svg";
import minus from "../../../src/svg/minus.svg";
import trash from "../../../src/svg/trash.svg";

import {ref, computed} from 'vue';
import Tooltip from "@/components/utils/Tooltip.vue";

const state = ref({
  A: Array(10).fill(null),
  B: Array(10).fill(null),
  C: Array(10).fill(null),
});

const computedChance = computed(() => {
  let chance = 0.75;
  const sequence = [...state.value.A, ...state.value.B, ...state.value.C];
  for (const cell of sequence) {
    if (cell === true) chance = Math.max(0.25, chance - 0.1);
    else if (cell === false) chance = Math.min(0.75, chance + 0.1);
  }
  return chance;
});

const current = computed(() => ({
  currentA: state.value.A.filter(v => v === true).length,
  totalA: state.value.A.filter(v => v !== null).length,
  currentB: state.value.B.filter(v => v === true).length,
  totalB: state.value.B.filter(v => v !== null).length,
  currentC: state.value.C.filter(v => v === true).length,
  totalC: state.value.C.filter(v => v !== null).length,
}));

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

  /**
   * @param {State} state
   * @returns {boolean}
   */
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

  /**
   * @param {State} state
   * @returns {number}
   */
  this.chanceReachWithoutCache = function (state) {
    if (!state.isValid()) return 0;
    if (this.isReach(state)) return 1;
    if (!this.isReachable(state)) return 0;
    return Math.max(...Object.values(this.variantsChances(state)));
  };

  this.variantsChances = function (state) {
    const variants = state.variants();
    return ['A', 'B', 'C'].reduce((acc, variantType) => {
      acc[variantType] = this.variantChance(
          state.chance,
          variants[`${variantType}+`],
          variants[`${variantType}-`]
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

const result = computed(() => {
  const s = new State(
      current.value.currentA, current.value.totalA,
      current.value.currentB, current.value.totalB,
      current.value.currentC, current.value.totalC,
      computedChance.value
  );
  return {
    reachChance: calculator.chanceReach(s),
    variants: calculator.variantsChances(s)
  };
});

function markCell(row, status) {
  const index = state.value[row].findIndex(v => v === null);
  if (index !== -1) state.value[row][index] = status;
}

function resetRow(row) {
  state.value[row] = Array(10).fill(null);
}

const bestOption = computed(() => {
  let best = 0;
  let bestKey = [result.value.variants["A"]];

  for (const [key, bestChance] of Object.entries(result.value.variants)) {
    if (best < bestChance || best === bestChance) {
      bestKey.pop();
      bestKey.push(key);
    }

    console.log(best, bestChance, key);
    best = Math.max(best, bestChance);
  }

  return bestKey;
});

</script>

<template>
  <div class="tools-container__item" id="stone-chance-calculator">
    <div class="tools-container__item-name">
      Калькулятор фетранита
    </div>

    <div class="fetranite-state">
      <div v-for="(row, rowKey) in state" :key="rowKey" class="fetranite-state__row">
        <div
            v-for="(cell, idx) in row" :key="idx"
            class="fentranite-state__button"
            :class="{
            'fentranite-state__button_best': bestOption.includes(rowKey),
            'fentranite-state__button_success': cell === true,
            'fentranite-state__button_fail': cell === false
          }"
        >
          <romb/>
        </div>
        <div class="fetranite-state__controls">
          <tooltip>
            <button class="button button_icon plus-icon" @click="markCell(rowKey, true)">
              <plus/>
            </button>
            <template #tooltip>Успех</template>
          </tooltip>
          <tooltip>
            <button class="button button_icon minus-icon" @click="markCell(rowKey, false)">
              <minus/>
            </button>
            <template #tooltip>Неудача</template>
          </tooltip>
          <tooltip>
            <button class="button button_icon trash-icon" @click="resetRow(rowKey)">
              <trash/>
            </button>
            <template #tooltip>Сбросить</template>
          </tooltip>
        </div>
        <div>
          {{ (result.variants[rowKey] * 100).toFixed(2) }}%
        </div>
      </div>
    </div>

    <div class="tools-container__item-content">
      <div class="tools-container__item-message">
        Текущий шанс: <strong>{{ (computedChance * 100).toFixed(0) }}%</strong>
      </div>
      <div class="tools-container__item-message">
        Максимальный шанс достижения цели: <strong>{{ (result.reachChance * 100).toFixed(2) }}%</strong>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fetranite-state__row {
  display: flex;
  gap: 3px;
  margin-bottom: 10px;
  align-items: center;
}

.fentranite-state__button {
  filter: brightness(1);
  width: 15px;

  &_success {
    filter: none;
    color: var(--gold);
  }

  &_fail {
    filter: none;
    color: var(--dark-grey);
  }
}

.fentranite-state__button_best:not(.fentranite-state__button_success):not(.fentranite-state__button_fail) {
  filter: drop-shadow(0 0 7px gold);
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

.fetranite-state__controls {
  display: flex;
  gap: 10px;
  align-items: center;
  border-left: 1px solid var(--grey);
  padding-left: 10px;
  margin-left: 10px;

  .plus-icon {
    color: var(--check);
  }

  .minus-icon {
    color: var(--error);
  }

}
</style>
