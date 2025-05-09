<script setup>
import { ref, watch } from 'vue';
import Tooltip from "@/components/utils/Tooltip.vue";

const inputs = ref({
  blue: 0,
  green: 0,
  white: 0,
  dust: 0,
  extraBlue: 0
});

const conversion = ref([]);
const totalCrafts = ref(0);

function calculate() {
  conversion.value = [];
  totalCrafts.value = 0;

  const COST = {
    blue: 33,
    green: 45,
    white: 86
  };

  const PER_BLUE = {
    blue: 1,
    green: 6.25,
    white: 12.5
  };

  const inputsClone = { ...inputs.value };
  const extraBlue = Math.floor(inputsClone.extraBlue / 5) * 5;
  const whiteFromExtra = (extraBlue / 5) * 50;

  const initial = {
    blue: inputsClone.blue,
    green: inputsClone.green,
    white: inputsClone.white + whiteFromExtra
  };

  conversion.value.push(`Обменяно ${extraBlue} ненужных синих на ${whiteFromExtra} белых.`);

  let maxCrafts = 0;
  let bestReport = [];

  for (let target = 0; target <= 500; target++) {
    const need = {
      blue: target * COST.blue,
      green: target * COST.green,
      white: target * COST.white
    };

    const missing = {
      blue: Math.max(0, need.blue - initial.blue),
      green: Math.max(0, need.green - initial.green),
      white: Math.max(0, need.white - initial.white)
    };

    const dustNeeded = (
        (missing.green / PER_BLUE.green) * 80 +
        (missing.white / PER_BLUE.white) * 80 +
        missing.blue * 10
    );

    const excess = {
      green: Math.max(0, initial.green - need.green),
      white: Math.max(0, initial.white - need.white)
    };

    const dustAvailable = (
        Math.floor(excess.green / 50) * 80 +
        Math.floor(excess.white / 100) * 80
    );

    if (dustAvailable >= dustNeeded) {
      maxCrafts = target;
      bestReport = [
        `На ${target} крафтов нужно:`,
        `- Синих: ${need.blue} (не хватает ${missing.blue})`,
        `- Зелёных: ${need.green} (не хватает ${missing.green})`,
        `- Белых: ${need.white} (не хватает ${missing.white})`,
        `Можно получить ${dustAvailable} пыли, нужно ${Math.ceil(dustNeeded)}.`,
        `Избыточных зелёных: ${excess.green}, белых: ${excess.white}`
      ];
    } else {
      break;
    }
  }

  totalCrafts.value = maxCrafts;
  conversion.value.push(...bestReport);
  conversion.value.push(`\uD83C\uDFC6 Максимально возможное количество крафтов: ${maxCrafts}`);
}

watch(inputs, calculate, { deep: true });
</script>

<template>
  <div class="tools-container__item" id="craft-resources">
    <tooltip has-icon="true">
      <div class="tools-container__item-name">
        Калькулятор Авидорских кристаллов судьбы
      </div>
      <template #tooltip>Расчёт количества кристаллов по текущим ресурсам</template>
    </tooltip>

    <div class="tools-container__item-content">
      <div class="tools-container__item-label">
        Нужные синие ресурсы
        <input v-model.number="inputs.blue" type="number" min="0" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-label">
        Зелёные ресурсы
        <input v-model.number="inputs.green" type="number" min="0" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-label">
        Белые ресурсы
        <input v-model.number="inputs.white" type="number" min="0" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-label">
        Пыль
        <input v-model.number="inputs.dust" type="number" min="0" class="tools-container__item-input" />
      </div>
      <div class="tools-container__item-label">
        <tooltip has-icon="true">
          Ненужные синие ресурсы
          <template #tooltip>Только для камня и дерева: 5 → 50 белых</template>
        </tooltip>
        <input v-model.number="inputs.extraBlue" type="number" min="0" class="tools-container__item-input" />
      </div>

      <div class="tools-container__item-message" v-if="conversion.length">
        <p>Результаты расчёта:</p>
        <ul>
          <li v-for="line in conversion" :key="line">{{ line }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>