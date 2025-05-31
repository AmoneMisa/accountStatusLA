<script setup>
import CalcRaidGoldRaidItem from "@/components/raidGold/calcRaidGoldRaidItem.vue";
import Tooltip from "@/components/utils/Tooltip.vue";
import cross from "../../../src/svg/cross.svg";
import {computed, inject, ref} from "vue";

const props = defineProps({
  characterSettings: Object,
  character: Object,
  goldCharacters: Array
});

const isHidden = ref({});

const emit = defineEmits({'toggle-gold-receiver': [String, Boolean]});

function getCompletedRaids() {
  const raids = props.characterSettings?.raids || [];
  const raidStatus = props.characterSettings?.raidStatus || {};
  return raids.filter(raid => raidStatus[raid] !== 'unfinished' && raid !== "Хранитель" && raid !== "Эфонка" && raid !== "Хаос");
}

function toggleGoldCharacter(target, characterName) {
  target.closest('.button').classList.toggle("inactive");
  emit('toggle-gold-receiver', [characterName, !target.closest('.button').classList.contains('inactive')]);
}

let settings = inject('settings');
const calcGoldMode = computed(() => settings.value?.calcGoldMode || 'default');
</script>

<template>
  <div class="calc-raid-gold__item"
       v-if="characterSettings && !characterSettings.delete && getCompletedRaids().length"
       :class="{'calc-raid-gold__item_min': calcGoldMode === 'minimized'}"
  >
    <div class="calc-raid-gold__header">
      <tooltip>
        <div class="calc-raid-gold__title"
             @click="isHidden[character.name] ?
            isHidden[character.name] = !isHidden[character.name] :
             isHidden[character.name] = true">
          {{ character.name }}
        </div>
        <template #tooltip>Свернуть или развернуть информацию о персонаже</template>
      </tooltip>
      <tooltip>
        <button
            :class="{'inactive': !characterSettings?.goldReceiver && !characterSettings?.legate}"
            class="button button_icon"
            @click.stop="({target}) => toggleGoldCharacter(target, character.name)">
          <cross class="icon cross-icon"/>
        </button>
        <template #tooltip>Убрать персонажа из общего расчёта золота</template>
      </tooltip>
    </div>
    <div v-if="!isHidden[character.name]" class="calc-raid-gold__body">
      <calc-raid-gold-raid-item v-for="raid in getCompletedRaids()" :key="raid" :raid="raid" :character="character"/>
    </div>
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
  height: fit-content;

  &_min {
    flex: calc((100% - (30px * 5)) / 6);

    @media screen and (max-width: 1024px){
      flex: calc((100% - (30px * 4)) / 5);
    }

    @media screen and (max-width: 881px){
      flex: calc((100% - (30px * 3)) / 4);
    }
  }
}

.calc-raid-gold__item:hover {
  background-color: var(--grey);
}

.calc-raid-gold__header {
  display: flex;
  justify-content: space-between;
}

.calc-raid-gold__title {
  font-size: var(--font-h2);;
  font-family: var(--font-family-decorative), serif;
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