<script setup>
import raidGold from "@/raidGold.js";
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject} from "vue";

const props = defineProps({
  raid: String,
  character: Object
});

const emit = defineEmits(["updateChest"]);

let settings = inject('settings');
const characterSettings = computed(() => settings.value.characterSettings);

function getChestStatus(charName, raid, phaseIndex) {
  return characterSettings.value?.[charName]?.phases?.[raid]?.[phaseIndex]?.chestBought || false;
}

function toggleChest(charName, raid, phaseIndex, elem) {
  if (!characterSettings.value[charName].hasOwnProperty("phases")) {
    characterSettings.value[charName].phases = {};
    characterSettings.value[charName].phases[raid] = {};
    characterSettings.value[charName].phases[raid][phaseIndex] = {chestBought: elem.target.checked};
  } else if (!characterSettings.value[charName].phases.hasOwnProperty(raid)) {
    characterSettings.value[charName].phases[raid] = {};
    characterSettings.value[charName].phases[raid][phaseIndex] = {chestBought: elem.target.checked};
  } else {
    characterSettings.value[charName].phases[raid][phaseIndex] = {chestBought: elem.target.checked};
  }

  emit("updateChest",  getGoldFromRaid(charName, raid));

  saveSettings({characterSettings: characterSettings.value});
}

function getGoldFromRaid(charName, raid) {
  let earned = 0, spent = 0;
  const phases = raidGold[raid] || [];
  const savedPhases = characterSettings.value?.[charName]?.phases?.[raid] || {};

  phases.forEach((phase, index) => {
    const bought = savedPhases[index]?.chestBought;
    if (bought) {
      earned += phase["золото"] - phase["сундук"];
      spent += phase["сундук"];
    } else {
      earned += phase["золото"];
    }
  });

  return {earned, spent, total: earned + spent};
}

</script>

<template>
  <div class="calc-raid-gold__raid-name">{{ raid }}</div>
  <div v-for="(phase, index) in raidGold[raid]" :key="index">
    <div> Фаза {{ index + 1 }}: {{ phase.золото }} золота</div>
    <label class="custom-label calc-raid-gold__label">
      Сундук ({{ phase["сундук"] }} золота)
      <input type="checkbox"
             class="calc-raid-gold__checkbox"
             :checked="getChestStatus(character.name, raid, index)"
             @change="(elem) => toggleChest(character.name, raid, index, elem)"/>
    </label>
  </div>

  <div class="calc-raid-gold__raid-total">
    <div>🪙 Получено: {{ getGoldFromRaid(character.name, raid).earned }}</div>
    <div>💰 Потрачено на сундуки: {{ getGoldFromRaid(character.name, raid).spent }}</div>
    <div>💎 Всего: {{ getGoldFromRaid(character.name, raid).total }}</div>
  </div>
</template>

<style scoped lang="scss">
.calc-raid-gold__raid-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.calc-raid-gold__raid-total {
  text-align: right;
}
</style>