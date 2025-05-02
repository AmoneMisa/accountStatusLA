<script setup>
import {computed, inject, ref} from "vue";
import CalcRaidGoldItem from "@/components/raidGold/calcRaidGoldItem.vue";
import raidGold from "@/raidGold.js";
import coin from "../../../src/svg/coin.svg";
import money from "../../../src/svg/money.svg";
import chest from "../../../src/svg/chest.svg";

let settings = inject('settings');
const characterSettings = computed(() => settings.value.characterSettings);
const characterList = computed(() => settings.value.characterList);

const goldCharacters = ref([]);
const currentReceivers = ref([]);

const totalGold = computed(() => {
  let earned = 0;
  let spent = 0;

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
      spent += g.spent;
    }
  }
  return {earned, spent, total: earned - spent};
});

function getGoldFromRaid(charName, raid) {
  if (!characterSettings.value?.[charName]?.raidStatus?.[raid]) {
    return {earned: 0, spent: 0, total: 0};
  }

  if (!characterSettings.value?.[charName]?.goldReceiver
      && !characterSettings.value?.[charName]?.legate
      && !currentReceivers.value.includes(charName)) {
    return {earned: 0, spent: 0, total: 0};
  }

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

function toggleGoldCharacter([characterName, isReceiver]) {
  if (isReceiver && !currentReceivers.value.includes(characterName)) {

    if (goldCharacters.value.includes(characterName)) {
      return;
    }

    currentReceivers.value.push(characterName);
  } else if (currentReceivers.value.includes(characterName) && !isReceiver) {
    currentReceivers.value.splice(currentReceivers.value.indexOf(characterName), 1);
  }
}
</script>

<template>
  <div class="calc-raid-gold">
    <calc-raid-gold-item v-for="character in characterList"
                         :key="character.name"
                         :character="character" :character-settings="characterSettings[character.name]"
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