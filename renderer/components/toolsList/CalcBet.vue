<script setup>
import {ref} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";

let auctionBet = ref(0);

function calc() {
  if (auctionBet.value <= 0) {
    return ;
  }

  const tax = 0.05;
  const minProfit = 0.15;

  const netIncome = auctionBet.value * (1 - tax);

  document.querySelector(".calc-bet__optimal").innerHTML = `Оптимальная ставка: ${Math.floor(netIncome * (1 - minProfit))}`;
  document.querySelector(".calc-bet__max").innerHTML = `Максимальная ставка: ${Math.floor(netIncome * (1 - minProfit / 2))}`;
}
</script>

<template>
  <div class="tools-container__item calc-bet" id="calc-bet">
    <tooltip has-icon="true">
    <div class="tools-container__item-name">
      Рассчитать оптимальную ставку для аукциона
    </div>
      <template #tooltip>Стоимость рассчитывается, беря за основу 15% прибыли от продажи предмета на ауке, с вычетом
        комиссии
      </template>
    </tooltip>
    <div class="tools-container__item-content">
      <label class="tools-container__item-label">
        Стоимость на аукционе
        <input min="1" type="number" required
               class="tools-container__item-input calc-bet__auction-price" v-model="auctionBet" @input="calc">
      </label>
      <div class="tools-container__item-message">
        <div class="calc-bet__optimal"></div>
        <div class="calc-bet__max"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>