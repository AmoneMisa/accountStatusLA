<script setup>
import raidGold from "@/raidGold.js";
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject} from "vue";

defineProps({
  raid: String,
  character: Object
});

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

  saveSettings({characterSettings: characterSettings.value});
}

function getGoldFromRaid(charName, raid) {
  let earned = 0, spent = 0;
  const phases = raidGold[raid] || [];
  const savedPhases = characterSettings.value?.[charName]?.phases?.[raid] || {};

  phases.forEach((phase, index) => {
    const bought = savedPhases[index]?.chestBought;
    const disabled = savedPhases?.disabled || false;
    if (disabled) {
      if (bought) {
        spent += phase["сундук"];
      }
    } else {
      if (bought) {
        earned += phase["золото"];
        spent += phase["сундук"];
      } else {
        earned += phase["золото"];
      }
    }
  });

  return {earned, spent, total: earned - spent};
}

function getRaidGoldStatus(charName, raid) {
  return characterSettings.value?.[charName]?.phases?.[raid]?.disabled || false;
}

function toggleRaid(charName, raid, elem) {
  if (!characterSettings.value[charName]) {
    characterSettings.value[charName] = {};
  }

  if (!characterSettings.value[charName].phases) {
    characterSettings.value[charName].phases = {};
  }

  if (!characterSettings.value[charName].phases[raid]) {
    characterSettings.value[charName].phases[raid] = {};
  }

  characterSettings.value[charName].phases[raid].disabled = elem.target.checked;
  saveSettings({characterSettings: characterSettings.value});
}
</script>

<template>
  <div class="calc-raid-gold__raid-name">{{ raid }} <label class="custom-label calc-raid-gold__label">
    Без золота
    <input type="checkbox"
           class="calc-raid-gold__checkbox"
           :checked="getRaidGoldStatus(character.name, raid)"
           @change="(elem) => toggleRaid(character.name, raid, elem)"/>
  </label>
  </div>
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
  font-size: var(--font-body);
  font-weight: bold;
  margin-bottom: 10px;
}

.calc-raid-gold__raid-total {
  text-align: right;
}
</style>