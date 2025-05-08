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

const need = computed({
  get: () => {
    return {
      blue: inputs.value.targetCrystals * COST.blue,
      green: inputs.value.targetCrystals * COST.green,
      white: inputs.value.targetCrystals * COST.white
    }
  },
  set: (newValue) => {
    return {
      blue: newValue * COST.blue,
      green: newValue * COST.green,
      white: newValue * COST.white
    }
  }
});

const conversion = ref([]);
const additionalBlue = ref(0);
const additionalWhite = ref(0);

function calculate() {
  // Копии ресурсов
  let blue = inputs.value.blue;
  let green = inputs.value.green;
  let white = inputs.value.white;
  let dust = inputs.value.dust;
  let extraBlue = inputs.value.extraBlue;

  const conversionMap = new Map();
  const addConversion = (text, times = 1) => {
    if (conversionMap.has(text)) {
      conversionMap.set(text, conversionMap.get(text) + times);
    } else {
      conversionMap.set(text, times);
    }
  };

  let crafted = 0;

  // Ненужные синие → белые (до начала симуляции)
  const usedExtraBlue = Math.floor(extraBlue / 5) * 5;
  const whiteFromExtra = (usedExtraBlue / 5) * 50;
  white += whiteFromExtra;
  extraBlue -= usedExtraBlue;
  if (usedExtraBlue > 0) {
    addConversion(`5 ненужных синих → 50 белых`, usedExtraBlue / 5);
  }

  while (true) {
    if (blue >= COST.blue && green >= COST.green && white >= COST.white) {
      blue -= COST.blue;
      green -= COST.green;
      white -= COST.white;
      crafted++;
      continue;
    }

    let didSomething = false;

    // Пыль → синие
    if (blue < COST.blue && dust >= 100) {
      const need = Math.ceil((COST.blue - blue) / 10);
      const times = Math.min(Math.floor(dust / 100), need);
      dust -= times * 100;
      blue += times * 10;
      addConversion(`100 пыли → 10 синих ресурсов`, times);
      didSomething = true;
      continue;
    }

    // Пыль → зелёные
    if (green < COST.green && dust >= 100) {
      const need = Math.ceil((COST.green - green) / 50);
      const times = Math.min(Math.floor(dust / 100), need);
      dust -= times * 100;
      green += times * 50;
      addConversion(`100 пыли → 50 зелёных ресурсов`, times);
      didSomething = true;
      continue;
    }

    // Белые → пыль
    if ((blue < COST.blue || green < COST.green) && white >= 100) {
      const times = Math.floor(white / 100);
      white -= times * 100;
      dust += times * 80;
      addConversion(`100 белых → 80 пыли`, times);
      didSomething = true;
      continue;
    }

    // Зелёные → белые
    if (white < COST.white && green >= 25) {
      const times = Math.floor(green / 25);
      green -= times * 25;
      white += times * 50;
      addConversion(`25 зелёных → 50 белых`, times);
      didSomething = true;
      continue;
    }

    // Ненужные синие → белые (внутри цикла)
    if (white < COST.white && extraBlue >= 5) {
      const times = Math.floor(extraBlue / 5);
      extraBlue -= times * 5;
      white += times * 50;
      addConversion(`5 ненужных синих → 50 белых`, times);
      didSomething = true;
      continue;
    }

    if (!didSomething) break;
  }

  // Вывод результата
  inputs.value.targetCrystals = crafted;
  additionalBlue.value = 0;
  additionalWhite.value = 0;

  // Сгруппированные конверсии для отображения
  conversion.value = Array.from(conversionMap.entries()).map(([text, times]) => {
    const match = text.match(/(\d+)\s+(.+?)\s+→\s+(\d+)\s+(.+)/);
    if (!match) return text;
    const [, fromCount, fromUnit, toCount, toUnit] = match;
    return `${fromCount * times} ${fromUnit} → ${toCount * times} ${toUnit}`;
  });

  // Для отображения потребностей
  need.value = {
    blue: crafted * COST.blue,
    green: crafted * COST.green,
    white: crafted * COST.white
  };
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