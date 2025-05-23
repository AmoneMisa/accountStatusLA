<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject, onMounted, ref, toRaw} from "vue";
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
import prison from "../../../src/svg/prison.svg";
import seller from "../../../src/svg/seller.svg";
import _ from "lodash";
import OnlineModule from "../../../utils/OnlineModule.js";

const props = defineProps({
  character: Object,
  isEditMode: Boolean,
  characterSettings: Object,
  currentTag: String,
  searchCharacter: String,
  gsFilter: Object
});

const emit = defineEmits({'show-raid-selector': String, 'update-character': String, 'fetch-character': String});
let settings = inject('settings');
const isSupport = ['Художница', 'Менестрель', 'Паладин'].includes(props.character.className);
const draggedRaid = ref(null);

const raidPrices = ref({});

function fillRaidPrices() {
  if (!props.characterSettings?.raids?.length) {
    return;
  }

  for (let raid of props.characterSettings.raids) {
    raidPrices.value[raid] = props.characterSettings?.customRaidPrices?.[raid] || 0;
  }
}

onMounted(() => fillRaidPrices());

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

async function updateOnlineProfile() {
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

function updateOldTypes() {
  if (!props.characterSettings?.raids?.length) {
    return;
  }

  for (let raid of props.characterSettings.raids) {
    if (props.characterSettings.raidStatus[raid] === true) {
      props.characterSettings.raidStatus[raid] = "finished";
    }

    if (props.characterSettings.raidStatus[raid] === false) {
      props.characterSettings.raidStatus[raid] = "unfinished";
    }
  }
}

updateOldTypes();

async function toggleRaidStatus(elem, raid) {
  props.characterSettings.raidStatus = props.characterSettings.raidStatus || {};
  props.characterSettings.raidStatus[raid] = elem.target.value;

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

function editRaidPrice(target, raid) {
  if (target.value < 0) {
    target.value = 0;
  }

  if (target.value > 9999999) {
    target.value = 9999999;
  }

  raidPrices.value[raid] = parseInt(target.value);

  saveSettings({
    characterSettings: {
      ...settings.value.characterSettings,
      [props.character.name]: {
        ...props.characterSettings || {},
        customRaidPrices: {
          ...props.characterSettings.customRaidPrices,
          [raid]: raidPrices.value[raid]
        }
      }
    }
  });
}
</script>
<template>
  <div v-if="isShowCharacter"
       class="character"
       :class="[isEditMode ? '' : 'view-mode', isSupport ? 'character_support' : 'character_dd']"
  >
    <div class="character__row character__header">
      <div class="character__row-item">
        <tooltip v-if="!isEditMode">
          <div class="character__cell character__drag" draggable="true">
            <burger class="icon burger-icon"/>
          </div>
          <template #tooltip>Изменить порядок персонажей</template>
        </tooltip>
        <div class="character__icons">
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
      </div>

      <div class="character__info">
        <div class="character__name">{{ character.name }}</div>
        <div class="character__gearscore">{{ character.gearScore }}</div>
        <div class="character__class">{{ character.className }}</div>
      </div>
    </div>

    <div class="character__row character__raids raids" v-if="!isEditMode">
      <div
          v-for="raid in characterSettings?.raids || []"
          :key="raid"
          class="raid"
          :class="{
              'raid_unfinished': characterSettings?.raidStatus?.[raid] === 'unfinished',
              'raid_finished': characterSettings?.raidStatus?.[raid] === 'finished',
              'raid_seller': characterSettings?.raidStatus?.[raid] === 'sell',
              'raid_prison': characterSettings?.raidStatus?.[raid] === 'prison'
            }"
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
        <div class="raid__select-status">
          <select class="select" @change="(value) => toggleRaidStatus(value , raid)"
                  :value="characterSettings?.raidStatus?.[raid]">
            <option value="unfinished">Не пройден</option>
            <option value="finished">Пройден</option>
            <option value="prison">Тюрьма</option>
            <option value="sell">Продажа</option>
          </select>
        </div>
        <div class="raid__price" v-if="characterSettings?.raidStatus?.[raid] === 'sell'">
          <label class="label" for="raidPrice">
            Стоимость проводки
          </label>
          <input @input="({target}) => editRaidPrice(target, raid)"
                 :value="raidPrices[raid]"
                 type="number"
                 class="input raid__input"
                 id="raid-price"
                 placeholder="Цена..."
                 min="0">
        </div>
      </div>
    </div>

    <div class="character__row character__actions" v-if="!isEditMode">
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

<style scoped lang="scss">
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
  font-size: var(--font-very-small);
  width: calc(100% / 3 - 40px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media screen and (max-width: 980px) {
    width: calc(100% / 2 - 40px);
  }

  &:hover {
    background-color: var(--grey);

    select, input {
      border-color: var(--dark-grey);
    }

    .character__row {
      border-bottom-color: var(--dark-grey);
    }
  }
}

.character__drag {
  width: 20px;
  padding-right: 0;
  height: 30px;
  align-items: center;
  margin-right: 15px;
}

.character__icons {
  display: flex;
  gap: 5px;
}

.character__icon {
  max-width: 20px;
}

.drag-burger {
  height: 100%;
  display: flex;
  align-items: center;
  cursor: grab;
}

.character__actions {
  justify-content: center;
  padding-top: 10px;
}

.character__header {
  justify-content: space-between;
}

.character__row {
  display: flex;
  height: fit-content;
  flex-wrap: wrap;
  align-items: flex-start;

  &:first-child {
    border-bottom: 1px solid var(--grey);
  }

  &:last-child {
    border-top: 1px solid var(--grey);
  }
}

.character__row-item {
  display: flex;
}

.character_support .character__info {
  color: var(--support);
  font-family: var(--font-family-decorative), serif;
  font-size: var(--font-body);
  display: flex;
  gap: 10px;
}

.character_dd .character__info {
  color: var(--dd);
  font-family: var(--font-family-decorative), serif;
  font-size: var(--font-body);
  display: flex;
  gap: 10px;
}

.character__gearscore {
  color: var(--gs);
}

.character__raids {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

.character__info {
 flex-wrap: wrap;
}

.raid {
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  align-items: stretch;
  padding: 5px 10px;

  &_unfinished {
    color: var(--error);
  }

  &_finished {
    color: var(--check);
  }

  &_prison {
    color: var(--color-prison);
  }

  &_seller {
    color: var(--color-seller);
  }
}

.raid__header {
  display: flex;
  align-items: center;
}

.select {
  height: 40px;
  margin-bottom: 0;
  margin-right: 0;
}

.raid__price {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  gap: 5px;
}

.character__icon_edit {
  width: 22px;
  margin-right: 5px;
}
</style>