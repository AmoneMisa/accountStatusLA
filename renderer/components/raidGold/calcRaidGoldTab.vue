<script setup>
import {computed, inject, ref} from "vue";
import CalcRaidGoldItem from "@/components/raidGold/calcRaidGoldItem.vue";
import raidGold from "@/raidGold.js";
import coin from "../../../src/svg/coin.svg";
import money from "../../../src/svg/money.svg";
import chest from "../../../src/svg/chest.svg";
import Tooltip from "@/components/utils/Tooltip.vue";

let settings = inject('settings');
const characterSettings = computed(() => settings.value.characterSettings);
const characterList = computed(() => settings.value.characterList);

const goldCharacters = ref([]);
const currentReceivers = ref({});

const totalGold = computed(() => {
  let earned = 0;
  let spent = 0;
  let bound = 0;
  let selled = 0;

  for (const char of characterList.value) {
    if (goldCharacters.value.includes(char.name)) {
      continue;
    }

    if (characterSettings.value?.[char.name]?.delete) {
      continue;
    }

    for (const raid of characterSettings.value?.[char.name]?.raids || []) {
      const g = getGoldFromRaid(char.name, raid);
      earned += g.earned;
      earned += g.selled;
      bound += g.bound;
      spent += g.spent;
      selled += g.selled;
    }
  }
  return {earned, spent, total: earned - spent, bound, selled};
});

function getGoldFromRaid(charName, raid) {
  if (!characterSettings.value?.[charName]?.raidStatus?.[raid]) {
    return {earned: 0, spent: 0, total: 0, bound: 0, selled: 0};
  }

  const isGoldReceiver = characterSettings.value?.[charName]?.goldReceiver;
  const isLegate = characterSettings.value?.[charName]?.legate;
  const hasReceiverInfo = currentReceivers.value.hasOwnProperty(charName);
  const isReceiver = currentReceivers.value[charName];

  if (!isGoldReceiver && !isLegate) {
    if (!hasReceiverInfo) {
      return {earned: 0, spent: 0, total: 0, bound: 0, selled: 0};
    }
    if (!isReceiver) {
      return {earned: 0, spent: 0, total: 0, bound: 0, selled: 0};
    }
  }

  if (isGoldReceiver || isLegate) {
    if (hasReceiverInfo && !isReceiver) {
      return {earned: 0, spent: 0, total: 0, bound: 0, selled: 0};
    }
  }

  let earned = 0;
  let bound = 0;
  let spent = 0;
  const phases = raidGold[raid] || [];
  const savedPhases = characterSettings.value?.[charName]?.phases?.[raid] || {};

  let selled = 0;
  if (characterSettings.value?.[charName]?.customRaidPrices
      && characterSettings.value?.[charName]?.customRaidPrices?.[raid]
      && characterSettings.value?.[charName]?.customRaidPrices?.[raid] > 0) {
    selled += parseInt(characterSettings.value?.[charName]?.customRaidPrices?.[raid]);
  }

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
        earned += (phase["привязанное"] || 0);
        bound += (phase["привязанное"] || 0);
        spent += phase["сундук"];
      } else {
        bound += (phase["привязанное"] || 0);
        earned += (phase["привязанное"] || 0);
        earned += phase["золото"];
      }
    }
  });

  return {earned, spent, total: earned - spent, bound, selled};
}

function toggleGoldCharacter([characterName, isReceiver]) {
  currentReceivers.value[characterName] = isReceiver;
}
</script>

<template>
  <div class="calc-raid-gold">
    <calc-raid-gold-item v-for="character in characterList"
                         :key="character.name"
                         :character="character"
                         :character-settings="characterSettings[character.name]"
                         :gold-characters="goldCharacters"
                         @toggleGoldReceiver="toggleGoldCharacter"
    />
  </div>
  <div class="calc-raid-gold__total">
    <div class="calc-raid-gold__total-item">
      <coin class="icon icon_very-small coin-icon"/>
      Общая сумма золота: {{ totalGold.earned }}
    </div>
    <div class="calc-raid-gold__total-item">
      <coin class="icon icon_very-small coin-icon"/>
      Из них привязанное: {{ totalGold.bound }}
    </div>
    <div class="calc-raid-gold__total-item" v-if="totalGold.selled">
      <coin class="icon icon_very-small coin-icon"/>
      <tooltip>
        За продажи: {{ totalGold.selled * 0.95 }}
        <template #tooltip>С учётом 5% комиссии</template>
      </tooltip>
    </div>
    <div class="calc-raid-gold__total-item">
      <chest class="icon icon_very-small chest-icon"/>
      Потрачено на сундуки: {{ totalGold.spent }}
    </div>
    <div class="calc-raid-gold__total-item">
      <money class="icon icon_very-small money-icon"/>
      После выкупа: {{ totalGold.total }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.calc-raid-gold {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  font-size: var(--font-small);
  border-radius: 5px;
  border: 1px solid var(--grey);
  box-shadow: var(--shadow);
  padding: 15px;
}

.calc-raid-gold__total-item {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}
</style>