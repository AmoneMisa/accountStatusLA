<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject} from "vue";

const props = defineProps({
  character: Object,
  isEditMode: Boolean
});

const emit = defineEmits({'updateCharacter': String, 'showRaidSelector': String});
let settings = inject('settings');
const characterSettings = computed(() => settings.value.characterSettings?.[props.character.name]);
const isSupport = ['Художница', 'Менестрель', 'Паладин'].includes(props.character.className);

function toggleIcon(icon, statusTitle) {
  if (!props.isEditMode) {
    return;
  }

  icon.target.classList.toggle("inactive");

  saveSettings({characterSettings: {
      ...settings.value.characterSettings,
      [props.character.name]: {
        ...characterSettings.value || {},
        [statusTitle]: !characterSettings.value[statusTitle]
      }
    }});
  emit('updateCharacter');
}

function toggleRaidStatus(raid) {
  characterSettings.value.raidStatus = characterSettings.value.raidStatus || {};
  characterSettings.value.raidStatus[raid] = !characterSettings.value.raidStatus[raid];

  saveSettings({characterSettings: {
      ...settings.value.characterSettings,
      [props.character.name]: {
        ...characterSettings.value || {},
        raidStatus: {
          ...characterSettings.value.raidStatus,
          [raid]:characterSettings.value.raidStatus[raid]
        }
      }
    }});
  emit('updateCharacter');
}

function removeRaid(raid) {
  if (characterSettings.value.raids) {
    characterSettings.value.raids = characterSettings.value.raids.filter(r => r !== raid);
    delete characterSettings.value.raidStatus?.[raid];
    saveSettings({characterSettings: {
        ...settings.value.characterSettings,
        [props.character.name]: {
          ...characterSettings.value || {},
          raidStatus: {
            ...characterSettings.value.raidStatus,
            [raid]:characterSettings.value.raidStatus[raid]
          }
        }
      }});
    emit('updateCharacter');
  }
}
</script>
<template>
  <div
      v-if="!(characterSettings.delete && !isEditMode)"
      class="character"
      :class="[isEditMode ? '' : 'view-mode', isSupport ? 'character_support' : 'character_dd']"
      :data-name="character.name"
      :data-gs="character.gearScore"
  >
    <div v-if="!isEditMode" class="character__cell character__drag" data-tooltip="Изменить порядок персонажей">≡</div>

    <div class="character__cell character__icons">
      <div
          v-for="icon in ['legate', 'goldReceiver', 'favorite']"
          :key="icon"
          class="tooltip character__icon"
          :data-type="icon"
          :class="{ inactive: !characterSettings?.[icon] }"
          :data-tooltip="icon"
          @click="(elem) => toggleIcon(elem, icon)"
      >
        {{ icon === 'legate' ? '👑' : icon === 'goldReceiver' ? '💰' : '⭐' }}
      </div>

      <div
          v-if="isEditMode"
          class="tooltip character__icon"
          :class="{ inactive: !characterSettings?.delete }"
          data-type="delete"
          data-tooltip="Скрыть из списка"
          @click="(elem) => toggleIcon(elem, 'delete')"
      >
        ❌
      </div>
    </div>

    <div class="character__cell character__info">
      <div class="character__name">{{ character.name }}</div>
      <div class="character__gearscore">{{ character.gearScore }}</div>
      <div class="character__class">{{ character.className }}</div>
    </div>

    <div class="character__cell character__raids" v-if="!isEditMode">
      <div v-for="raid in characterSettings?.raids || []" :key="raid" class="raid" :data-raid="raid">
        <div class="raid__header">
          <div class="raid__name">{{ raid }}</div>
          <button
              class="tooltip remove-raid button button_icon"
              data-tooltip="Удалить рейд"
              @click="removeRaid(raid)"
          >
            🗑️
          </button>
        </div>
        <button
            class="tooltip raid-status button button_icon"
            data-tooltip="Пройдено ли"
            @click="toggleRaidStatus(raid)"
        >
          {{ characterSettings?.raidStatus?.[raid] ? '✅' : '❌' }}
        </button>
      </div>
    </div>

    <div class="character__cell character__actions" v-if="!isEditMode">
      <button class="tooltip button button_icon add-raid" @click="emit('showRaidSelector', character.name)">
        ➕
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>