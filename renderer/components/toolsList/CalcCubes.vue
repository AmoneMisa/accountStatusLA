<script setup>
import {ref} from "vue";

const cubes = [{
  text: "Ур. 1 т.4",
  name: "1"
}, {
  text: "Ур. 2 т.4",
  name: "2"
}, {
  text: "Ур. 3 т.4",
  name: "3"
}, {
  text: "Ур. 4 т.4",
  name: "4"
}, {
  text: "Ур. 5 т.4",
  name: "5"
}, {
  text: "Ур. 6 т.4",
  name: "6"
}, {
  text: "Ур. 7 т.4",
  name: "7"
}, {
  text: "Ур. 8 т.4",
  name: "8"
}, {
  text: "Ур. 9 т.4",
  name: "9"
}];

const cubeDrop = {
  'T4-1': 3,
  'T4-2': 6
};

function convertToLevel2Amount(level, count) {
  return count * Math.pow(3, level - 2);
}

let needLevel = ref(0);

function calculate() {
  const resultEl = document.querySelector('.calc-cubes__all');
  const inputs = document.querySelectorAll('.calc-cubes__input');

  const targetLevel = parseInt(needLevel.value);
  if (isNaN(targetLevel) || targetLevel < 2 || targetLevel > 10) {
    resultEl.innerHTML = "Введите уровень от 2 до 10";
    return;
  }

  const requiredGems = Math.pow(3, targetLevel - 2); // нужное количество 2 ур. камней
  let onHand = 0;

  inputs.forEach(input => {
    const level = parseInt(input.name);
    const count = parseInt(input.value) || 0;
    onHand += convertToLevel2Amount(level, count);
  });

  const gemsNeeded = Math.max(requiredGems - onHand, 0);

  const fullT41 = Math.ceil(requiredGems / cubeDrop['T4-1']);
  const fullT42 = Math.ceil(requiredGems / cubeDrop['T4-2']);

  const needT41 = Math.ceil(gemsNeeded / cubeDrop['T4-1']);
  const needT42 = Math.ceil(gemsNeeded / cubeDrop['T4-2']);

  resultEl.innerHTML = `
            🔹 <b>Без учёта</b> ваших камней:<br>
            ▫️ T4-1: <b>${fullT41}</b> кубов<br>
            ▫️ T4-2: <b>${fullT42}</b> кубов<br><br>
            🔸 <b>С учётом</b> ваших камней:<br>
            ▫️ T4-1: <b>${needT41}</b> кубов<br>
            ▫️ T4-2: <b>${needT42}</b> кубов
        `;
}

function clear() {
  const resultEl = document.querySelector('.calc-cubes__all');
  const inputs = document.querySelectorAll('.calc-cubes__input');

  needLevel.value = 0;
  inputs.forEach(input => input.value = '');
  resultEl.innerHTML = '';
}
</script>

<template>
  <div class="tools-container__item calc-cubes" id="calc-cubes">
    <div class="tools-container__item-name tooltip"
         data-tooltip="Количество кубов рассчитывается без учёта возможных бонусных комнат">
      Рассчитать количество кубов
    </div>
    <div class="tools-container__item-content">
      <div>
        <label class="tools-container__item-label">
          Нужный уровень камня
          <input min="2" max="10" type="number" required
                 class="tools-container__item-input calc-cubes__need-level-input"
                 placeholder="10" v-model="needLevel" @input="calculate">
        </label>
        <div class="tools-container__item-text">Количество камней в наличии</div>
        <div class="calc-cubes__inputs">
          <label class="tools-container__item-label" v-for="cube of cubes">
            {{ cube.text }}
            <input min="0" type="number" :placeholder="cube.text"
                   class="tools-container__item-input calc-cubes__input" :name="cube.name" @input="calculate">
          </label>
        </div>
      </div>
      <div class="tools-container__item-message">
        <div class="calc-cubes__all"></div>
        <div class="calc-cubes__clear"></div>
      </div>
      <button class="button calc-cubes__clean" @click="clear">Очистить всё</button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>