<script setup>
import { ref, watch } from 'vue';

const cardCount = ref(0);
const cardInputs = ref([]);

watch(cardCount, (newCount) => {
  const count = parseInt(newCount);
  cardInputs.value = Array.from({ length: count }, (_, i) => ({
    level: 0,
    plus: 0,
  }));
});

function calculate() {
  const upgradeCost = [0, 1, 2, 3, 4, 5];
  const maxCards = 16;
  let totalNeeded = 0;
  let resultText = '';

  cardInputs.value.forEach((card, index) => {
    const level = parseInt(card.level);
    const plus = parseInt(card.plus) || 0;

    let used = 1; // За саму карту
    for (let j = 1; j <= level; j++) {
      used += upgradeCost[j];
    }

    const haveTotal = used + plus;
    const missing = Math.max(0, maxCards - haveTotal);
    const progressPercent = Math.min((missing / maxCards) * 100, 100);

    totalNeeded += missing;

    resultText += `Карта ${index + 1}: не хватает ${missing} карт
    <div class="calc-cards__card-progress-container">
      <div class="calc-cards__card-progress-bar" style="width: ${100 - progressPercent}%"></div>
    </div>`;
  });

  resultText += `<br><strong>Всего не хватает: ${totalNeeded} карт</strong>`;
  resultHTML.value = resultText;
}

const resultHTML = ref('');
</script>

<template>
  <div class="tools-container__item calc-cards">
    <div class="tools-container__item-name tooltip"
         data-tooltip="Подсчёт количества карт, которые необходимо дособирать для получения 30-й колоды">
      Расчёт недостающих карт в колоде
    </div>

    <label class="tools-container__item-label">
      Количество карт в колоде (от 2 до 6)
      <input type="number" v-model="cardCount" min="2" max="6" class="tools-container__item-input" />
    </label>

    <div class="calc-cards__example">
      *Подсказка для заполнения карт. Для карты 1+1: выбери в селекте уровень 1, в поле ввода введи цифру 1.
    </div>

    <div class="calc-cards__list">
      <div
          v-for="(card, index) in cardInputs"
          :key="index"
          class="tools-container__item-label calc-cards__item"
      >
        Карта {{ index + 1 }}
        <select v-model="card.level" class="calc-cards__select" name="level">
          <option value="0">Уровень 0</option>
          <option value="1">Уровень 1</option>
          <option value="2">Уровень 2</option>
          <option value="3">Уровень 3</option>
          <option value="4">Уровень 4</option>
          <option value="5">Уровень 5 (макс)</option>
        </select>
        <input
            type="number"
            class="calc-cards__plus tools-container__item-input"
            v-model="card.plus"
            name="plus"
            placeholder="Дополнительные карты"
            min="0"
            max="15"
        />
      </div>
    </div>

    <button class="button" @click="calculate">Рассчитать</button>

    <div class="tools-container__item-message">
      <div id="calc-cards__result" v-html="resultHTML"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>