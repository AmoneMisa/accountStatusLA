<script setup>
import Tooltip from "@/components/utils/Tooltip.vue";

let desiredAmountValue;

function calc() {
  const desiredAmount = parseFloat(desiredAmountValue);
  const resultDiv = document.getElementById('transfer-result');

  if (isNaN(desiredAmount) || desiredAmount <= 0) {
    resultDiv.innerText = 'Введите корректную сумму';
    return;
  }

  const commissionRate = 0.05;
  const totalToSend = Math.ceil(desiredAmount / (1 - commissionRate));

  resultDiv.innerText = `Чтобы получатель получил ${desiredAmount.toLocaleString()} золота, нужно отправить: ${totalToSend.toLocaleString()} золота.`;
}
</script>

<template>
  <div class="tools-container__item" id="calc-commission">
    <tooltip has-icon="true">
    <div class="tools-container__item-name">Калькулятор комиссии перевода
    </div>
      <template #tooltip>Расчёт суммы для перевода с учётом комиссии 5%</template>
    </tooltip>
    <div class="tools-container__item-content">
      <label class="tools-container__item-label">
        Сумма, которую должен получить получатель:
        <input type="number" min="1" class="tools-container__item-input" id="desired-amount"
               placeholder="Введите сумму (например, 210000)" v-model="desiredAmountValue">
      </label>
      <div class="tools-container__item-message" id="transfer-result"></div>
      <button class="button" id="calc-transfer" @click="calc">Рассчитать</button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>