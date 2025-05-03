<script setup>
import { ref, computed } from 'vue';
import Tooltip from "@/components/utils/Tooltip.vue";

const stackCount = ref(1);

const COST = {
  blue: 33,
  green: 45,
  white: 86
};

const total = computed(() => {
  return {
    blue: stackCount.value * COST.blue,
    green: stackCount.value * COST.green,
    white: stackCount.value * COST.white
  };
});
</script>

<template>
  <div class="tools-container__item" id="craft-needs">
    <tooltip>
      <div class="tools-container__item-name">
        Ресурсы для изготовления Авидорских кристаллов судьбы
      </div>
      <template #tooltip>Расчёт количества ресурсов, необходимых для крафта n количества стаков кристаллов</template>
    </tooltip>
    <div class="tools-container__item-content">
      <div class="tools-container__item-label">
        Количество стаков кристаллов (по 10 штук в стаке)
        <input v-model.number="stackCount" type="number" min="1" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-message" v-if="stackCount > 0">
        Для создания {{ stackCount * 10 }} кристаллов потребуется:
        <ul>
          <li>Синие ресурсы: {{ total.blue }}</li>
          <li>Зелёные ресурсы: {{ total.green }}</li>
          <li>Белые ресурсы: {{ total.white }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>