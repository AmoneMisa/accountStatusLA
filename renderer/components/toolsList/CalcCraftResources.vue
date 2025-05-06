<script setup>
import {ref, computed, watch} from 'vue';
import Tooltip from "@/components/utils/Tooltip.vue";

const inputs = ref({
  blue: 0,
  green: 0,
  white: 0,
  dust: 0,
  extraBlue: 0,
  targetCrystals: 0
});

const COST = {
  blue: 33,
  green: 45,
  white: 86
};

const need = computed(() => ({
  blue: inputs.value.targetCrystals * COST.blue,
  green: inputs.value.targetCrystals * COST.green,
  white: inputs.value.targetCrystals * COST.white
}));

const conversion = ref([]);
const additionalBlue = ref(0);
const additionalWhite = ref(0);

function calculate() {
  const dustToBlueRate = 80;
  const extraToWhiteRate = 5;
  const whiteFromExtra = Math.floor(inputs.value.extraBlue / extraToWhiteRate) * 50;

  additionalWhite.value = whiteFromExtra;
  const totalWhite = inputs.value.white + additionalWhite.value;

  const usedDust = Math.floor(inputs.value.dust / dustToBlueRate) * dustToBlueRate;
  const blue = (usedDust / dustToBlueRate) * 10;
  additionalBlue.value = blue;

  const totalBlue = inputs.value.blue + additionalBlue.value;

  const maxBlue = Math.floor(totalBlue / COST.blue);
  const maxGreen = Math.floor(inputs.value.green / COST.green);
  const maxWhite = Math.floor(totalWhite / COST.white);

  inputs.value.targetCrystals = Math.min(maxBlue, maxGreen, maxWhite);

  const conv = [];
  if (whiteFromExtra > 0) {
    conv.push(`${Math.floor(inputs.value.extraBlue / extraToWhiteRate) * extraToWhiteRate} ненужных синих → ${whiteFromExtra} белых`);
  }
  if (usedDust > 0) {
    conv.push(`${usedDust} пыли → ${blue} синих ресурсов`);
  }

  conversion.value = conv;
}

watch(inputs, calculate, {deep: true});
</script>

<template>
  <div class="tools-container__item" id="craft-resources">
    <tooltip has-icon="true">
      <div class="tools-container__item-name">
        Калькулятор Авидорских кристаллов судьбы
      </div>
      <template #tooltip>Расчёт количества кристаллов, в зависимости от количества ресурсов в наличии</template>
    </tooltip>
    <div class="tools-container__item-content">
      <div class="tools-container__item-label">
        Нужные синие ресурсы
        <input v-model.number="inputs.blue" type="number" min="0" class="tools-container__item-input"/>
      </div>
      <div class="tools-container__item-label">
        Зелёные ресурсы
        <input v-model.number="inputs.green" type="number" min="0" class="tools-container__item-input"/>
      </div>
      <div class="tools-container__item-label">
        Белые ресурсы
        <input v-model.number="inputs.white" type="number" min="0" class="tools-container__item-input"/>
      </div>
      <div class="tools-container__item-label">
        Пыль
        <input v-model.number="inputs.dust" type="number" min="0" class="tools-container__item-input"/>
      </div>

      <div class="tools-container__item-label">
        <tooltip has-icon="true">
          Ненужные синие ресурсы
          <template #tooltip>Только для камня и дерева</template>
        </tooltip>
        <input v-model.number="inputs.extraBlue" type="number" min="0" class="tools-container__item-input"/>
      </div>

      <div class="tools-container__item-message" v-if="inputs.targetCrystals > 0">
        Ресурсов достаточно, чтобы создать {{ inputs.targetCrystals }} стаков кристаллов.
        <ul>
          <li>Синие ресурсы: {{ need.blue }}</li>
          <li>Зелёные ресурсы: {{ need.green }}</li>
          <li>Белые ресурсы: {{ need.white }}</li>
        </ul>
      </div>
      <div class="tools-container__item-message" v-if="conversion.length">
        <p>Обмены:</p>
        <ul>
          <li v-for="line in conversion" :key="line">{{ line }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>