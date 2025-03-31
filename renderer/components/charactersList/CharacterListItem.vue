<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject} from "vue";

const props = defineProps({
  character: Object,
  isEditMode: Boolean
});

const emit = defineEmits({'updateCharacter': null, 'showRaidSelector': String});
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
  emit('updateCharacter', props.character.name);
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
  emit('updateCharacter', props.character.name);
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
    emit('updateCharacter', props.character.name);
  }
}
</script>
<template>
  <div v-if="!(characterSettings.delete && !isEditMode)"
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

<style lang="scss">
.character {
  border-radius: 10px;
  background-color: var(--dark-grey);
  border: 1px solid var(--grey);
  color: var(--white);
  transition: .2s ease;
  cursor: pointer;
  padding: 16px;
  max-width: -webkit-fill-available;
  box-shadow: var(--shadow);

  &.view-mode {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    margin-bottom: 10px;
    width: 100%;
    text-align: center;
    font-size: var(--font-very-small);
  }

  &:not(.view-mode) .character__icons {
    display: flex;
    flex-direction: row;
  }

  &.character_support.view-mode .character__info div:last-child {
    color: var(--support);
    font-family: Caveat, serif;
    font-size: var(--font-body);
  }

  &.character_dd.view-mode .character__info div:last-child {
    color: var(--dd);
    font-family: Caveat, serif;
    font-size: var(--font-body);
  }

  &:hover {
    background-color: var(--grey);
  }

  &:hover .character__cell:not(:last-child) {
    border-right: 2px solid var(--dark-grey);
  }

  &:hover .character__cell:not(:last-child) .raid {
    border-right: 1px solid var(--dark-grey);
  }
}

.character__cell {
  display: flex;
  min-width: 20px;
  padding: 0 10px;

  &:not(:last-child) {
    border-right: 2px solid var(--grey);
  }
}

.character__drag {
  width: 20px;
  padding-right: 0;
  height: 60px;
  align-items: center;
}

.drag-burger {
  height: 100%;
  display: flex;
  align-items: center;
  cursor: grab;
}

.character__icons,
.character__info {
  flex-direction: column;
}

.character__info {
  width: 140px;
  gap: 5px;
}

.character__raids {
  gap: 10px;
  width: -webkit-fill-available;
}

.raid {
  width: max-content;
  border-right: 1px solid var(--grey);
}

.raid__header {
  min-width: 80px;
  width: max-content;
  font-size: var(--font-very-small);
  display: flex;
  align-items: center;
}

.raid-status {
  width: 100%;
  text-align: center;
}

.character__info div:nth-child(2) {
  color: var(--gs);
}

.grid {
  .character {
    display: grid;
    grid-template-areas: "grab icons info" "raid1 raid2 raid3" "plus plus plus";
    gap: 0;
    margin-bottom: 0;
  }

  .character__raids {
    display: grid;
    grid-template-areas: "a b";
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-column: 1 / -1;
    gap: 0;
    border-top: 1px solid var(--grey);
    border-bottom: 1px solid var(--grey);
    border-left: 1px solid var(--grey);
    border-right: 1px solid var(--grey);
    padding: 0;
  }

  .raid__header {
    min-width: initial;
    width: auto;
  }

  .character__drag {
    border-left: 1px solid var(--grey);
    justify-content: center;
    width: -webkit-fill-available;
    padding: 0 5px;
  }

  .character__info {
    border-right: 1px solid var(--grey);
    grid-area: info;
  }

  .character__icons {
    flex-wrap: wrap;
    height: -webkit-fill-available;
    border-right: 1px solid var(--grey);
    border-left: 1px solid var(--grey);
    grid-area: icons;
  }

  .character__actions {
    grid-area: plus;
    margin: auto;
  }

  .add-raid {
    border-radius: 0;
    width: -webkit-fill-available;
    grid-column: 1 / -1;
    justify-content: center;
  }

  .raid {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid var(--grey);

    &:nth-child(odd) {
      border-left: 1px solid var(--grey);
    }

    &:last-child:only-child {
      grid-column: 1 / -1;
    }
  }

  .character:hover {
    .character__info,
    .character__icons {
      border-right: 1px solid var(--dark-grey);
    }

    .character__drag,
    .character__icons {
      border-left: 1px solid var(--dark-grey);
    }

    .character__raids {
      border-top: 1px solid var(--dark-grey);
      border-bottom: 1px solid var(--dark-grey);
    }

    .raid {
      border-bottom: 1px solid var(--dark-grey);
    }

    .raid:nth-child(odd) {
      border-left: 1px solid var(--dark-grey);
    }
  }
}
</style>