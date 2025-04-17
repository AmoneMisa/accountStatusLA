<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";

const props = defineProps({
  character: Object,
  isEditMode: Boolean,
  windowWidth: Number,
  characterSettings: Object
});

const emit = defineEmits({'updateCharacter': null, 'showRaidSelector': String});
let settings = inject('settings');
const isSupport = ['Художница', 'Менестрель', 'Паладин'].includes(props.character.className);

function toggleIcon(icon, statusTitle) {
  if (!props.isEditMode) {
    return;
  }

  icon.target.classList.toggle("inactive");

  if (!props.characterSettings) {
      settings.value.characterSettings[props.character.name] = {};
  }

    saveSettings({
      characterSettings: {
        ...settings.value.characterSettings,
        [props.character.name]: {
          ...props.characterSettings || {},
          [statusTitle]: props.characterSettings ? !props.characterSettings[statusTitle] : true
        }
      }
    });


  emit('updateCharacter', props.character.name);
}

function toggleRaidStatus(raid) {
  props.characterSettings.raidStatus = props.characterSettings.raidStatus || {};
  props.characterSettings.raidStatus[raid] = !props.characterSettings.raidStatus[raid];

  saveSettings({
    characterSettings: {
      ...settings.value.characterSettings,
      [props.character.name]: {
        ...props.characterSettings || {},
        raidStatus: {
          ...props.characterSettings.raidStatus,
          [raid]: props.characterSettings.raidStatus[raid]
        }
      }
    }
  });
  emit('updateCharacter', props.character.name);
}

function removeRaid(raid) {
  if (props.characterSettings.raids) {
    props.characterSettings.raids = props.characterSettings.raids.filter(r => r !== raid);
    delete props.characterSettings.raidStatus?.[raid];
    saveSettings({
      characterSettings: {
        ...settings.value.characterSettings,
        [props.character.name]: {
          ...props.characterSettings || {},
          raidStatus: {
            ...props.characterSettings.raidStatus,
            [raid]: props.characterSettings.raidStatus[raid]
          }
        }
      }
    });
    emit('updateCharacter', props.character.name);
  }
}

const chunkedRaids = computed(() => {
  const raids = props.characterSettings.raids || [];
  const chunkSize = 3;
  const result = [];

  for (let i = 0; i < raids.length; i += chunkSize) {
    result.push(raids.slice(i, i + chunkSize));
  }

  return result;
});
</script>
<template>
  <div v-if="!((characterSettings && characterSettings.delete) && !isEditMode)"
       class="character"
       :class="[isEditMode ? '' : 'view-mode', isSupport ? 'character_support' : 'character_dd']"
       :data-name="character.name"
       :data-gs="character.gearScore"
  >
    <tooltip v-if="!isEditMode">
      <div class="character__cell character__drag" draggable="true">≡</div>
      <template #tooltip>Изменить порядок персонажей</template>
    </tooltip>

    <div class="character__cell character__icons">
      <tooltip
          v-for="icon in ['legate', 'goldReceiver', 'favorite']"
          :key="icon"
      >
        <div
            class="character__icon"
            :data-type="icon"
            :class="{ inactive: !characterSettings?.[icon] }"
            @click="(elem) => toggleIcon(elem, icon)"
        >
          {{ icon === 'legate' ? '👑' : icon === 'goldReceiver' ? '💰' : '⭐' }}
        </div>
        <template #tooltip>
          {{ icon === 'legate' ? 'Легат' : icon === 'goldReceiver' ? 'Получатель голды' : 'Избранное' }}
        </template>
      </tooltip>

      <tooltip v-if="isEditMode">
        <div
            class="character__icon"
            :class="{ inactive: !characterSettings?.delete }"
            data-type="delete"
            @click="(elem) => toggleIcon(elem, 'delete')"
        >
          ❌
        </div>
        <template #tooltip>Скрыть из списка</template>
      </tooltip>
    </div>

    <div class="character__cell character__info">
      <div class="character__name">{{ character.name }}</div>
      <div class="character__gearscore">{{ character.gearScore }}</div>
      <div class="character__class">{{ character.className }}</div>
    </div>

    <div class="character__cell character__raids raids" v-if="!isEditMode">
      <template v-if="windowWidth > 980">
        <div
            v-for="raid in characterSettings?.raids || []"
            :key="raid"
            class="raid"
            :data-raid="raid"
        >
          <div class="raid__header">
            <div class="raid__name">{{ raid }}</div>
            <tooltip>
              <button class="remove-raid button button_icon" @click="removeRaid(raid)">🗑️</button>
              <template #tooltip>Удалить рейд</template>
            </tooltip>
          </div>
          <tooltip>
            <button class="raid-status button button_icon" @click="toggleRaidStatus(raid)">
              {{ characterSettings?.raidStatus?.[raid] ? '✅' : '❌' }}
            </button>
            <template #tooltip>Рейд пройден</template>
          </tooltip>
        </div>
      </template>

      <template v-else>
        <div class="raids__row" v-for="(row, rowIndex) in chunkedRaids" :key="rowIndex">
          <div v-for="raid in row" :key="raid" class="raid" :data-raid="raid">
            <div class="raid__header">
              <div class="raid__name">{{ raid }}</div>
              <tooltip>
                <button class="remove-raid button button_icon" @click="removeRaid(raid)">🗑️</button>
                <template #tooltip>Удалить рейд</template>
              </tooltip>
            </div>
            <tooltip>
              <button class="raid-status button button_icon" @click="toggleRaidStatus(raid)">
                {{ characterSettings?.raidStatus?.[raid] ? '✅' : '❌' }}
              </button>
              <template #tooltip>Пройдено ли</template>
            </tooltip>
          </div>
        </div>
      </template>
    </div>

    <div class="character__cell character__actions" v-if="!isEditMode">
      <tooltip>
        <button class="button button_icon add-raid" @click="emit('showRaidSelector', character.name)">
          ➕
        </button>
        <template #tooltip>Добавить активность</template>
      </tooltip>
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

  &.character_support.view-mode .character__info {
    color: var(--support);
    font-family: Caveat, serif;
    font-size: var(--font-body);
  }

  &.character_dd.view-mode .character__info {
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
    grid-template-areas: "grab info" "raid1 raid2" "plus plus";
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
    grid-area: grab;
    width: 40px;
    border-right: 1px solid var(--grey);
  }

  .character__info {
    border-right: 1px solid var(--grey);
    grid-area: info;
  }

  .character__icons {
    display: none;
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

  .raids__row {
    &:first-child {
      border-right: 1px solid var(--grey);
    }
  }

  .raid {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    align-items: center;

    &:nth-child(odd) {
      border-right: none;
    }

    &:last-child:only-child {
      grid-column: 1 / -1;
    }

    &:not(:last-child) {
      border-bottom: 1px solid var(--grey);
    }
  }

  .character:hover {
    .character__raids {
      border-top: 1px solid var(--dark-grey);
      border-bottom: 1px solid var(--dark-grey);
      border-left: 1px solid var(--dark-grey);
      border-right: 1px solid var(--dark-grey);
    }

    .character__info {
      border-right: 1px solid var(--dark-grey);
    }

    .character__drag {
      border-left: 1px solid var(--dark-grey);
      border-right: 1px solid var(--dark-grey);
    }

    .raids__row:first-child {
      border-right: 1px solid var(--dark-grey);
    }

    .character__cell:not(:last-child) {
      .raid {
        border-right: 1px solid var(--dark-grey);
      }
    }

    .raid:not(:last-child) {
      border-bottom: 1px solid var(--dark-grey);
    }
  }
}
</style>