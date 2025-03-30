<script setup>
import {computed, inject, ref} from "vue";
import CalcRaidGoldItem from "@/components/raidGold/calcRaidGoldItem.vue";
import raidGold from "@/raidGold.js";

let settings = inject('settings');
const characterSettings = computed(() => settings.value.characterSettings);
const characterList = computed(() => settings.value.characterList);

const excludedGoldCharacters = ref([]);

const totalGold = computed(() => {
  let earned = 0;
  let spent = 0;

  for (const char of characterList.value) {
    if (excludedGoldCharacters.value.includes(char.name)) {
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
  return {earned, spent, total: earned + spent};
});

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
  <div class="calc-raid-gold">
    <calc-raid-gold-item v-for="character in characterList"
                         :key="character.name"
                         :character="character" :character-settings="characterSettings[character.name]"
                         :gold-characters="excludedGoldCharacters"/>
  </div>
  <div class="calc-raid-gold__total">
    <div>🪙 Общая сумма золота: {{ totalGold.earned }}</div>
    <div>💰 Потрачено на сундуки: {{ totalGold.spent }}</div>
    <div>💎 После выкупа: {{ totalGold.total }}</div>
  </div>
</template>

<style scoped lang="scss">
.calc-raid-gold {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid var(--grey);
  box-shadow: var(--shadow);
  padding: 15px;
}
</style>