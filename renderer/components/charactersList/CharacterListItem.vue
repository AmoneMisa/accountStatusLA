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
}

.character:not(.view-mode) .character__icons {
  display: flex;
  flex-direction: row;
}

.character.view-mode {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  width: 100%;
  text-align: center;
  font-size:  var(--font-very-small);
}

.character_support.view-mode .character__info div:last-child {
  color: var(--support);
  font-family: Caveat, serif;
  font-size:  var(--font-body);;
}

.character_dd.view-mode .character__info div:last-child {
  color: var(--dd);
  font-family: Caveat, serif;
  font-size:  var(--font-body);;
}

.character:hover {
  background-color: var(--grey);
}

@media screen and (min-width: 981px) {
  .character__cell:not(:last-child) {
    border-right: 2px solid var(--grey);
  }

  .character:hover .character__cell:not(:last-child) {
    border-right: 2px solid var(--dark-grey);
  }

  .character:hover .character__cell:not(:last-child) .raid {
    border-right: 1px solid var(--dark-grey);
  }
}

.character__cell {
  display: flex;
  min-width: 20px;
  padding: 0 10px;
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
  font-size:  var(--font-very-small);
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

.save-button {
  margin-top: 20px;
  margin-left: auto;
}

.refresh-characters {
  margin-right: 5px;
}

.controls {
  display: flex;
  justify-content: space-between;
}

.raid-selector {
  border-radius: 5px;
  width: 300px;
  height: 350px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: var(--black);
  color: var(--white);
  padding: 20px;
  margin: auto;
}

.raid-selector .cross {
  top: 0;
  right: 0;
}

.raid-selector__label {
  font-size:  var(--font-tiny);
}

.raid-selector__label i {
  font-style: normal;
  font-family: Caveat, serif;
  color: var(--gold);
  font-size:  var(--font-body);;
}

.raid-selector__select {
  height: 200px;
  margin-top: 10px;
}

.character-table {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.character-table__settings {
  display: flex;
  flex-wrap: wrap;
  font-size:  var(--font-small);
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.character-table__row {
  display: flex;
  align-items: center;
  width: fit-content;
  border-bottom: 1px solid var(--grey);
  border-left: 1px solid var(--grey);
  border-right: 1px solid var(--grey);
  margin: auto;
  box-shadow: var(--shadow);
}

.character-table__row:first-child {
  border-top: 1px solid var(--grey);
  border-radius: 3px 3px 0 0;
}

.character-table__row:nth-child(even) .character-table__cell {
  background-color: var(--middle-grey);
}

.character-table__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  padding: 8px;
  height: 60px;
}

.character-table__cell:last-child {
  border-right: 1px solid var(--grey);
}

.character-table__cell:not(:last-child) {
  border-right: 1px solid var(--grey);
}

.character-table__cell_name {
  width: 240px;
  flex: none;
}

.character-table__input {
  width: 50px;
  margin-bottom: 5px;
}

.character-table__controls {
  display: flex;
  gap: 5px;
}

.character-table_support {
  color: var(--support);
}

.character-table_dd {
  color: var(--dd);
}

@media screen and (max-width: 980px) {
  .character.view-mode {
    display: grid;
    grid-template-areas: "grab icons info"
                             "raid1 raid2 raid3"
                             "plus plus plus ";
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
    border-right: 1px solid var(--grey);
    border-bottom: 1px solid var(--grey);
  }

  .raid:nth-child(odd) {
    border-left: 1px solid var(--grey);
  }

  .character:hover .character__info,
  .character:hover .character__icons,
  .character:hover .raid {
    border-right: 1px solid var(--dark-grey);
  }

  .character:hover .character__drag,
  .character:hover .raid:nth-child(odd),
  .character:hover .character__icons {
    border-left: 1px solid var(--dark-grey);
  }

  .character:hover .character__raids {
    border-top: 1px solid var(--dark-grey);
  }

  .character:hover .raid,
  .character:hover .character__raids {
    border-bottom: 1px solid var(--dark-grey);
  }
}

@media screen and (max-width: 750px) {
  .character__raids {
    grid-template-areas: "a b";
  }
}
</style>