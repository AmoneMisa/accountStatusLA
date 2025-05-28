<script setup>
import CustomCheckbox from "@/components/utils/CustomCheckbox.vue";
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";

const props = defineProps({
  index: Number,
  phase: Object,
  characterName: String,
  raid: String
});

const emit = defineEmits({
  'toggle-chest': Object
});

let settings = inject('settings');
const characterSettings = computed(() => settings.value.characterSettings);
const calcGoldMode = computed(() => settings.value.calcGoldMode || 'default');

const isChestBought = computed(() => {
  return characterSettings.value?.[props.characterName]?.phases?.[props.raid]?.[props.index]?.chestBought || false;
});

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

  characterSettings.value[charName].phases[raid][phaseIndex] = {chestBought: !getChestStatus(charName, raid, phaseIndex)};
  emit('toggle-chest', {raid, phaseIndex, status: getChestStatus(charName, raid, phaseIndex)});
  saveSettings({characterSettings: characterSettings.value});
}
</script>

<template>
  <template v-if="calcGoldMode === 'minimized'">
    <tooltip>
      <div>{{ index + 1 }}: {{ phase.золото + phase.привязанное }}</div>
      <template #tooltip>Количество привязанного золота: {{ phase.привязанное }}</template>
    </tooltip>
    <tooltip>
      <customCheckbox
          text="Сундук"
          class="calc-raid-gold__checkbox"
          label-class="calc-raid-gold__label"
          :checked="isChestBought"
          @change="(elem) => toggleChest(characterName, raid, index, elem)"
      />
      <template #tooltip>{{ phase['сундук'] }} золота.<br>*Сначала тратится привязанное</template>
    </tooltip>
  </template>
  <template v-else>
    <div> Фаза {{ index + 1 }}: {{ phase.золото }} золота</div>
    <customCheckbox
        :text="`Сундук (${phase['сундук']} золота)`"
        class="calc-raid-gold__checkbox"
        label-class="calc-raid-gold__label"
        :checked="isChestBought"
        @change="(elem) => toggleChest(characterName, raid, index, elem)"
    />
  </template>
</template>

<style scoped lang="scss">

</style>