<script setup>
import CalcRaidGoldRaidItem from "@/components/raidGold/calcRaidGoldRaidItem.vue";
import Tooltip from "@/components/utils/Tooltip.vue";

const props = defineProps({
  characterSettings: Object,
  character: Object,
  goldCharacters: Array
});

function getCompletedRaids() {
  const raids = props.characterSettings?.raids || [];
  return raids.filter(raid => props.characterSettings?.raidStatus[raid] && raid !== "Хранитель" && raid !== "Эфонка" && raid !== "Хаос");
}

function toggleGoldCharacter(button, characterName) {
  button.target.classList.toggle("inactive");

  if (props.goldCharacters.includes(characterName)) {
    props.goldCharacters.splice(props.goldCharacters.indexOf(characterName), 1);
  } else {
    props.goldCharacters.push(characterName);
  }
}
</script>

<template>
  <div class="calc-raid-gold__item" v-if="characterSettings && !characterSettings.delete">
    <div class="calc-raid-gold__title">{{ character.name }}
      <tooltip>
        <button class="button button_icon" @click="(button) => toggleGoldCharacter(button, character.name)">❌</button>
        <template #tooltip>Убрать персонажа из общего расчёта золота</template>
      </tooltip>
    </div>
    <calc-raid-gold-raid-item v-for="raid in getCompletedRaids()" :key="raid" :raid="raid" :character="character"/>
  </div>
</template>

<style scoped lang="scss">
.calc-raid-gold__item {
  flex: 25%;
  border-radius: 5px;
  background-color: var(--dark-grey);
  border: 1px solid var(--grey);
  color: var(--white);
  transition: .2s ease;
  cursor: pointer;
  padding: 10px;
}

.calc-raid-gold__item:hover {
  background-color: var(--grey);
}

.calc-raid-gold__title {
  font-size: var(--font-h2);;
  font-family: Caveat, serif;
  color: var(--gold);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media screen and (max-width: 680px) {
  .calc-raid-gold__item {
    flex: 33%;
  }
}
</style>