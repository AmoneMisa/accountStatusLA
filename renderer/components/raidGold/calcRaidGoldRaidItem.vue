<script setup>
import raidGold from "@/raidGold.js";
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject} from "vue";
import coin from "../../../src/svg/coin.svg";
import money from "../../../src/svg/money.svg";
import chest from "../../../src/svg/chest.svg";

defineProps({
  raid: String,
  character: Object
});

let settings = inject('settings');
const characterSettings = computed(() => settings.value.characterSettings);

function getChestStatus(charName, raid, phaseIndex) {
  return characterSettings.value?.[charName]?.phases?.[raid]?.[phaseIndex]?.chestBought || false;
}

function toggleChest(charName, raid, phaseIndex) {
  if (!characterSettings.value[charName].hasOwnProperty("phases")) {
    characterSettings.value[charName].phases = {};
  }

  if (!characterSettings.value[charName].phases.hasOwnProperty(raid)) {
    characterSettings.value[charName].phases[raid] = {};
  }

  characterSettings.value[charName].phases[raid][phaseIndex] = {chestBought: getChestStatus(charName, raid, phaseIndex)};

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

function toggleRaid(charName, raid) {
  if (!characterSettings.value[charName]) {
    characterSettings.value[charName] = {};
  }

  if (!characterSettings.value[charName].phases) {
    characterSettings.value[charName].phases = {};
  }

  if (!characterSettings.value[charName].phases[raid]) {
    characterSettings.value[charName].phases[raid] = {};
  }

  characterSettings.value[charName].phases[raid].disabled = !getRaidGoldStatus(charName, raid);
  saveSettings({characterSettings: characterSettings.value});
}
</script>

<template>
  <div class="calc-raid-gold__raid-name"><label class="custom-label calc-raid-gold__label">
    <span>{{ raid }}</span>
    <input type="checkbox"
           class="calc-raid-gold__checkbox"
           :checked="!getRaidGoldStatus(character.name, raid)"
           @change="toggleRaid(character.name, raid)"/>
  </label>
  </div>
  <div v-for="(phase, index) in raidGold[raid]" :key="index" class="calc-raid-gold__phase">
    <div> Фаза {{ index + 1 }}: {{ phase.золото }} золота</div>
    <label class="custom-label calc-raid-gold__label">
      <span>Сундук ({{ phase["сундук"] }} золота)</span>
      <input type="checkbox"
             class="calc-raid-gold__checkbox"
             :checked="getChestStatus(character.name, raid, index)"
             @change="(elem) => toggleChest(character.name, raid, index, elem)"/>
    </label>
  </div>

  <div class="calc-raid-gold__raid-total">
    <div class="calc-raid-gold__raid-total-item">
      <coin class="icon icon_very-small coin-icon"/>
      Получено: {{ getGoldFromRaid(character.name, raid).earned }}
    </div>
    <div class="calc-raid-gold__raid-total-item">
      <chest class="icon icon_very-small chest-icon"/>
      Потрачено на сундуки: {{ getGoldFromRaid(character.name, raid).spent }}
    </div>
    <div class="calc-raid-gold__raid-total-item">
      <money class="icon icon_very-small money-icon"/>
      Всего: {{ getGoldFromRaid(character.name, raid).total }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.calc-raid-gold__raid-name {
  font-size: var(--font-body);
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  gap: 3px;
  align-items: center;
}

.calc-raid-gold__raid-total {
  text-align: right;
  margin-top: 10px;
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--grey);
}

.calc-raid-gold__raid-total-item {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-bottom: 5px;
}

.calc-raid-gold__phase {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>