<script src="../../../../../Desktop/index.js"></script>
<script setup>
import romb from "../../../src/svg/romb.svg";

function State(
    currentA, totalA,
    currentB, totalB,
    currentC, totalC,
    chance
) {
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
    return this.totalA <= 10
        && this.totalB <= 10
        && this.totalC <= 10;
  }

  this.toBest = function () {
    return new State(
        this.currentA + (10 - this.totalA),
        10,
        this.currentB + (10 - this.totalB),
        10,
        this.currentC,
        10,
        0.75
    );
  };

  let variantsChanges = {
    'A+': {currentA: 1, totalA: 1, chance: -0.1},
    'A-': {totalA: 1, chance: 0.1},
    'B+': {currentB: 1, totalB: 1, chance: -0.1},
    'B-': {totalB: 1, chance: 0.1},
    'C+': {currentC: 1, totalC: 1, chance: -0.1},
    'C-': {totalC: 1, chance: 0.1},
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
  }

  this.variant = function (variantType) {
    return this.withChange(variantsChanges[variantType]);
  };

  this.variants = function () {
    return Object.keys(variantsChanges).reduce((acc, variantType) => {
      acc[variantType] = this.variant(variantType);

      return acc;
    }, {})
  }
}

function Calculator(targets, cache) {
  this.targets = targets;

  if (!cache) {
    cache = new Map();
  }

  this.cache = cache;

  /**
   * @param {State} state
   * @returns {boolean}
   */
  this.isReach = function isReach(state) {
    for (const target of this.targets) {
      if (target.minA <= state.currentA
          && target.minB <= state.currentB
          && state.currentC <= target.maxC) {
        return true;
      }
    }

    return false;
  };

  /**
   * @param {State} state
   * @returns {boolean}
   */
  this.isReachable = function (state) {
    return this.isReach(state.toBest());
  };

  this.chanceReach = function (state) {
    let key = state.getKey();

    if (!this.cache.has(key)) {
      this.cache.set(key, this.chanceReachWithoutCache(state));
    }

    return this.cache.get(key);
  }

  /**
   * @param {State} state
   * @returns {number}
   */
  this.chanceReachWithoutCache = function (state) {
    if (!state.isValid()) {
      return 0;
    } else if (this.isReach(state)) {
      return 1;
    } else if (!this.isReachable(state)) {
      return 0;
    }

    return Math.max(...Object.values(this.variantsChances(state)));
  };

  this.variantsChances = function (state) {
    let variants = state.variants();

    return ['A', 'B', 'C'].reduce((acc, variantType) => {
      acc[variantType] = this.variantChance(
          state.chance,
          variants[`${variantType}+`],
          variants[`${variantType}-`]
      );

      return acc;
    }, {});
  }

  this.variantChance = function (chance, plusState, minusState) {
    return this.chanceReach(plusState) * chance + this.chanceReach(minusState) * (1 - chance);
  };
}

let calculator = new Calculator([
  {minA: 9, minB: 7, maxC: 4},
  {minA: 7, minB: 9, maxC: 4},
  {minA: 10, minB: 6, maxC: 4},
  {minA: 6, minB: 10, maxC: 4}
]);
let stateState = new State(0, 0, 0, 0, 0, 0, 0.75);
let start = performance.now();
console.log(calculator.chanceReach(stateState));
console.log(calculator.variantsChances(stateState));
console.log(performance.now() - start);
console.log(calculator.cache.size);
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
