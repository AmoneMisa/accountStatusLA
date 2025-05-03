<script setup>
import { ref, computed, watch } from 'vue';

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

const inputTotalWhite = computed(() => {
  return inputs.value.white + Math.floor(inputs.value.extraBlue / 5) * 50;
});

const inputTotalDust = computed(() => {
  const surplusWhite = Math.max(0, inputTotalWhite.value - need.value.white);
  return Math.floor(surplusWhite / 100) * 80 + Math.floor(inputs.value.dust / 10) * 10;
});

const inputTotalBlue = computed(() => {
  const surplusDust = inputTotalDust.value;
  return inputs.value.blue + Math.floor(surplusDust / 80) * 10;
});

function calculate() {
  const maxBlue = inputTotalBlue.value / COST.blue;
  const maxGreen = inputs.value.green / COST.green;
  const maxWhite = inputTotalWhite.value / COST.white;

  inputs.value.targetCrystals = Math.floor(Math.min(maxBlue, maxGreen, maxWhite));

  const conv = [];

  const usedWhite = Math.max(0, inputTotalWhite.value - need.value.white);
  const usedDust = Math.floor((Math.floor(usedWhite / 100) * 80 + Math.floor(inputs.value.dust / 10) * 10) / 80) * 80;
  const blueFromDust = usedDust / 80 * 10;

  if (inputs.value.extraBlue >= 5) {
    const usedExtraBlue = Math.floor(inputs.value.extraBlue / 5) * 5;
    const whites = usedExtraBlue * 10;
    if (whites > need.value.white - inputs.value.white) {
      conv.push(`${usedExtraBlue} ненужных синих → ${whites} белых`);
    }
  }

  if (usedWhite >= 100) {
    const usedWhiteRounded = Math.floor(usedWhite / 100) * 100;
    const dust = usedWhiteRounded / 100 * 80;
    conv.push(`${usedWhiteRounded} белых → ${dust} пыли`);
  }

  if (usedDust >= 80) {
    conv.push(`${usedDust} пыли → ${blueFromDust} синих ресурсов`);
  }

  conversion.value = conv;
}

watch(inputs, calculate, { deep: true });
</script>

<template>
  <div class="tools-container__item" id="craft-resources">
    <div class="tools-container__item-name">
      Калькулятор Авидорских кристаллов судьбы
    </div>
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
        Ненужные синие ресурсы
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