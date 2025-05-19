<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject, ref, toRaw} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";

import checkArrow from "../../../src/svg/check.svg";
import cross from "../../../src/svg/cross.svg";
import heart from "../../../src/svg/heart.svg";
import crown from "../../../src/svg/crown.svg";
import coin from "../../../src/svg/coin.svg";
import plus from "../../../src/svg/plus.svg";
import trash from "../../../src/svg/trash.svg";
import burger from "../../../src/svg/burger.svg";
import update from "../../../src/svg/update.svg";
import _ from "lodash";
import OnlineModule from "../../../utils/OnlineModule.js";

const props = defineProps({
  character: Object,
  isEditMode: Boolean,
  windowWidth: Number,
  characterSettings: Object,
  currentTag: String,
  searchCharacter: String,
  gsFilter: Object
});

const emit = defineEmits({'show-raid-selector': String, 'update-character': String, 'fetch-character': String});
let settings = inject('settings');
const isSupport = ['Художница', 'Менестрель', 'Паладин'].includes(props.character.className);
const draggedRaid = ref(null);

function onRaidDragStart(raid) {
  draggedRaid.value = raid;
}

function onRaidDrop(targetRaid) {
  if (!draggedRaid.value || draggedRaid.value === targetRaid) return;

  const raids = props.characterSettings.raids;
  const fromIndex = raids.indexOf(draggedRaid.value);
  const toIndex = raids.indexOf(targetRaid);

  if (fromIndex !== -1 && toIndex !== -1) {
    const newRaids = [...raids];
    const [moved] = newRaids.splice(fromIndex, 1);
    newRaids.splice(toIndex, 0, moved);

    saveSettings({
      characterSettings: {
        ...settings.value.characterSettings,
        [props.character.name]: {
          ...props.characterSettings,
          raids: newRaids
        }
      }
    });

    emit('update-character', props.character.name);
    draggedRaid.value = null;
  }
}

function toggleIcon(target, statusTitle) {
  if (!props.isEditMode) {
    return;
  }

  target.closest(".character__icon").classList.toggle("inactive");

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


  emit('update-character', props.character.name);
}

async function updateOnlineProfile () {
  const online = new OnlineModule(settings.value.nickname, toRaw(Object.assign(settings.value.characterSettings, {characterList: settings.value.characterList})));

  let user;
  
  if (settings.value.UUID) {
    try {
      const res = await online.getUser(settings.value.UUID);
      user = res.data;
    } catch (e) {
      console.warn("User not found. Try to register:", e);
      const res = await online.register();
      user = res.data;
      saveSettings({UUID: user._id});
    }
  } else {
    const res = await online.register();
    user = res.data;
    saveSettings({UUID: user._id});
  }

  if (!_.isEqual(user.characterSettings, settings.value.characterSettings)
      || !_.isEqual(user.characterList, settings.value.characterList)) {
    await online.update(user._id);
  }
}

async function toggleRaidStatus(raid) {
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
  emit('update-character', props.character.name);

  await updateOnlineProfile();
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
    emit('update-character', props.character.name);
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

const isShowCharacter = computed(() => {
  if ((props.characterSettings && props.characterSettings.delete) && !props.isEditMode) {
    return false;
  }

  if (props.searchCharacter !== "") {
    if (!props.character.name.toLowerCase().includes(props.searchCharacter.toLowerCase())) {
      return false;
    }
  }

  if (!(props.currentTag === 'none'
      || props.characterSettings[props.currentTag]
      || props.currentTag === 'sup' && isSupport
      || props.currentTag === 'dd' && !isSupport
      ) && props.character.className !== props.currentTag) {
    return false;
  }

  if (parseFloat(props.character.gearScore.replace(",", '')) < props.gsFilter.from) {
    return false;
  }

  if (parseFloat(props.character.gearScore.replace(",", '')) > props.gsFilter.to) {
    return false;
  }

  return true;
});
</script>
<template>
  <div v-if="isShowCharacter"
       class="character"
       :class="[isEditMode ? '' : 'view-mode', isSupport ? 'character_support' : 'character_dd']"
  >
    <tooltip v-if="!isEditMode">
      <div class="character__cell character__drag" draggable="true">
        <burger class="icon burger-icon"/>
      </div>
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
            :class="{ inactive: !characterSettings?.[icon], 'character__icon_edit': isEditMode }"
            @click="({target}) => toggleIcon(target, icon)"
        >
          <crown class="icon crown-icon" v-if="icon === 'legate'"/>
          <coin class="icon coin-icon" v-if="icon === 'goldReceiver'"/>
          <heart class="icon heart-icon" v-if="icon === 'favorite'"/>
        </div>
        <template #tooltip>
          {{ icon === 'legate' ? 'Легат' : icon === 'goldReceiver' ? 'Получатель голды' : 'Избранное' }}
        </template>
      </tooltip>

      <tooltip v-if="isEditMode">
        <div
            class="character__icon"
            :class="{ inactive: !characterSettings?.delete, 'character__icon_edit': isEditMode }"
            data-type="delete"
            @click="({target}) => toggleIcon(target, 'delete')"
        >
          <cross class="icon cross-icon"/>
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
            draggable="true"
            @dragstart.stop="() => onRaidDragStart(raid)"
            @dragover.prevent
            @drop="() => onRaidDrop(raid)"
        >
          <div class="raid__header">
            <div class="raid__name">{{ raid }}</div>
            <tooltip>
              <button class="remove-raid button button_icon" @click="removeRaid(raid)">
                <trash class="icon trash-icon"/>
              </button>
              <template #tooltip>Удалить рейд</template>
            </tooltip>
          </div>
          <tooltip>
            <button class="raid-status button button_icon" @click="toggleRaidStatus(raid)">
              <checkArrow class="icon check-icon" v-if="characterSettings?.raidStatus?.[raid]"/>
              <cross class="icon cross-icon" v-else/>
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
                <button class="remove-raid button button_icon" @click="removeRaid(raid)">
                  <trash class="icon trash-icon"/>
                </button>
                <template #tooltip>Удалить рейд</template>
              </tooltip>
            </div>
            <tooltip>
              <button class="raid-status button button_icon" @click="toggleRaidStatus(raid)">
                <checkArrow class="icon check-icon" v-if="characterSettings?.raidStatus?.[raid]"/>
                <cross class="icon cross-icon" v-else/>
              </button>
              <template #tooltip>Пройдено ли</template>
            </tooltip>
          </div>
        </div>
      </template>
    </div>

    <div class="character__cell character__actions" v-if="!isEditMode">
      <tooltip>
        <button class="button button_icon add-raid" @click="emit('show-raid-selector', character.name)">
          <plus/>
        </button>
        <template #tooltip>Добавить активность</template>
      </tooltip>
      <tooltip>
        <button type="button" id="update-character" class="button button_icon update-characters"
                @click="emit('fetch-character', character.name)">
          <update class="icon update-icon"/>
        </button>
        <template #tooltip>Обновить персонажа</template>
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
    flex-wrap: wrap;
  }

  &.character_support.view-mode .character__info {
    color: var(--support);
    font-family: var(--font-family-decorative), serif;
    font-size: var(--font-body);
  }

  &.character_dd.view-mode .character__info {
    color: var(--dd);
    font-family: var(--font-family-decorative), serif;
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
  justify-content: center;
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
    flex-wrap: wrap;
    flex-direction: row;
    width: -webkit-fill-available;
    height: -webkit-fill-available;
    align-items: center;
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

.character__icon_edit {
  width: 22px;
  margin-right: 5px;
}

.check-icon {
  color: var(--check);
}

.heart-icon {
  color: var(--error);
}

.crown-icon {
  color: var(--crown);
}

</style>