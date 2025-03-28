<script setup>
import {ref} from "vue";

let bid = ref(0);
let players = ref(3);

function calc() {
  const resultContainer = document.querySelector('.profit-calc__result');

  if (isNaN(bid.value) || bid.value <= 0) {
    resultContainer.innerText = "Введите корректную ставку.";
    return;
  }

  let totalBid = parseInt(bid.value);
  let tax = 0;

  if (bid.value > 100000) {
    tax = bid.value * 0.05;
    totalBid = bid.value - tax;
  }

  const profitPerPerson = (totalBid / players.value).toFixed(2);

  resultContainer.innerHTML = `
        <div>Чистая сумма после комиссии: ${Math.floor(totalBid)} 💰</div>
        <div>Выгода на одного человека: ${profitPerPerson} 💵</div>
        ${tax ? `<div>Комиссия: ${Math.floor(tax)} 🧾</div>` : ""}
    `;
}
</script>

<template>
  <div class="tools-container__item calc-auction-sum" id="calc-auction-sum">
    <div class="tools-container__item-name tooltip"
         data-tooltip="Подсчёт суммы, которую получит каждый член группы при чьей-то покупке на аукционе">
      Выгода на человека при покупке на аукционе
    </div>
    <label class="tools-container__item-label">
      Количество участников (без учёта себя)
      <input type="number" min="3" max="30"
             class="profit-calc__players tools-container__item-input" v-model="players">
    </label>
    <label class="tools-container__item-label">
      Сумма ставки
      <input type="number" class="profit-calc__bid tools-container__item-input" min="0"
             placeholder="Введите ставку" v-model="bid"/>
    </label>
    <button class="button profit-calc__submit" @click="calc">Рассчитать</button>
    <div class="tools-container__item-message profit-calc__result"></div>
  </div>
</template>

<style scoped lang="scss">

</style>