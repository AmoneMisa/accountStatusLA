<script setup>
import raidGold from "@/raidGold.js";
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject, ref} from "vue";
import coin from "../../../src/svg/coin.svg";
import money from "../../../src/svg/money.svg";
import chest from "../../../src/svg/chest.svg";
import CustomCheckbox from "@/components/utils/CustomCheckbox.vue";
import CalcGoldPhaseItem from "@/components/raidGold/CalcGoldPhaseItem.vue";

const props = defineProps({
  raid: String,
  character: Object
});

let settings = inject('settings');
const characterSettings = computed(() => settings.value.characterSettings);

const getGoldFromRaid = computed(() => {
  let earned = 0;
  let spent = 0;
  const phases = raidGold[props.raid] || [];
  const savedPhases = characterSettings.value?.[props.character.name]?.phases?.[props.raid] || {};

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
        spent += phase["сундук"];
      } else {
        earned += (phase["привязанное"] || 0);
        earned += phase["золото"];
      }
    }
  });

  return {earned, spent, total: earned - spent};
});

const isDisabledGoldRaidStatus = computed(() => {
  return characterSettings.value?.[props.character.name]?.phases?.[props.raid]?.disabled || false;
});

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
  <div class="calc-raid-gold__raid-name">
    <customCheckbox
      :text="raid"
      class="calc-raid-gold__checkbox"
      label-class="calc-raid-gold__label"
      :checked="!isDisabledGoldRaidStatus"
      @change="toggleRaid(character.name, raid)"
    />
  </div>
  <div v-for="(phase, index) in raidGold[raid]" :key="index" class="calc-raid-gold__phase">
    <calc-gold-phase-item :character-name="character.name" :index="index" :phase="phase" :raid="raid" />
  </div>

  <div class="calc-raid-gold__raid-total">
    <div class="calc-raid-gold__raid-total-item">
      <coin class="icon icon_very-small coin-icon"/>
      Получено: {{ getGoldFromRaid.earned }}
    </div>
    <div class="calc-raid-gold__raid-total-item">
      <chest class="icon icon_very-small chest-icon"/>
      Потрачено на сундуки: {{ getGoldFromRaid.spent }}
    </div>
    <div class="calc-raid-gold__raid-total-item">
      <money class="icon icon_very-small money-icon"/>
      Всего: {{ getGoldFromRaid.total }}
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