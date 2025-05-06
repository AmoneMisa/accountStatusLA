<script setup>
import { ref, computed } from 'vue';
import Tooltip from "@/components/utils/Tooltip.vue";

const blackCrystalPrice = ref(0);
const chestCount = ref(1);
const itemsPerChest = ref(1);
const goldPricePerItem = ref(0);
const crystalBuyGold = ref(0);

const result = computed(() => {
  if (
      !blackCrystalPrice.value ||
      !chestCount.value ||
      !itemsPerChest.value ||
      !goldPricePerItem.value ||
      !crystalBuyGold.value
  ) return '';

  const totalItems = chestCount.value * itemsPerChest.value;
  const actualCrystalsReceived = 100 * 0.95;
  const goldPerCrystal = crystalBuyGold.value / actualCrystalsReceived;

  const crystalTotalGold = blackCrystalPrice.value * goldPerCrystal;
  const pricePerItemCrystal = crystalTotalGold / totalItems;
  const pricePerItemGold = goldPricePerItem.value;

  if (pricePerItemCrystal < pricePerItemGold) {
    return `Чёрные кристаллы выгоднее: ${pricePerItemCrystal.toFixed(2)} < ${pricePerItemGold} золота за 1 предмет.`;
  } else if (pricePerItemCrystal > pricePerItemGold) {
    return `Золото выгоднее: ${pricePerItemGold} < ${pricePerItemCrystal.toFixed(2)} золота (через кристаллы).`;
  } else {
    return 'Одинаково выгодно';
  }
});
</script>

<template>
  <div class="tools-container__item" id="crystal-price-comparison">
    <tooltip has-icon="true">
      <div class="tools-container__item-name">
        Что дешевле: чёрные кристаллы или золото?
      </div>
      <template #tooltip>Рассчитывает, за что выгоднее покупать предмет, за чёрные кристаллы (при покупке их с биржи) или за золото</template>
    </tooltip>
    <div class="tools-container__item-content">
      <div class="tools-container__item-label">
        Стоимость в чёрных кристаллах (за все предметы)
        <input v-model.number="blackCrystalPrice" type="number" min="0" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-label">
        Количество сундуков
        <input v-model.number="chestCount" type="number" min="1" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-label">
        Количество предметов в одном сундуке
        <input v-model.number="itemsPerChest" type="number" min="1" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-label">
        Стоимость одного предмета в золоте
        <input v-model.number="goldPricePerItem" type="number" min="0" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-label">
        Курс покупки кристаллов (за 100 штук)
        <input v-model.number="crystalBuyGold" type="number" min="0" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-message" v-if="result">
        <strong>{{ result }}</strong>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>