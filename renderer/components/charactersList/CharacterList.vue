<script setup>
import CharacterListItem from "@/components/charactersList/CharacterListItem.vue";
import CharacterListItemExtended from "@/components/charactersList/CharacterListItemExtended.vue";
import ShareSnippet from "@/components/utils/ShareSnippet.vue";
import {computed, inject, onMounted, ref, watch} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";
import {saveSettings} from "../../../utils/utils.js";

import trash from "../../../src/svg/trash.svg";
import changeMenu from "../../../src/svg/menu.svg";
import pencil from "../../../src/svg/pencil.svg";
import plus from "../../../src/svg/plus.svg";
import minus from "../../../src/svg/minus.svg";
import update from "../../../src/svg/update.svg";

const emit = defineEmits(["show-raid-selector", "update-character-group", "update-character", "fetch-character"]);
const props = defineProps({
  isExtendedMode: Boolean,
  characterList: Array,
  characterSettings: Object,
  groupOrder: Array,
  isEditMode: Boolean,
});

let settings = inject('settings');
const isGridView = ref(settings.value?.isCharactersGridView || false);
const currentFilter = ref("none");
const currentTag = ref("none");
const searchCharacter = ref("");
const rangeGSCharacter = ref({from: 1580, to: 1735});
const grouped = ref({});
const editableGroupTitles = ref({});
const newGroupName = ref("");
let draggedCharacter = ref(null);
let draggedFromGroup = ref(null);
let draggedGroup = ref(null);
let isHiddenFilters = ref(settings.value?.isCharactersFiltersHidden || false);

function buildGrouped() {
  const sorted = {};
  props.characterList.forEach((char) => {
    const settings = props.characterSettings[char.name] || {};
    const group = settings.group || "Без группы";
    if (!sorted[group]) {
      sorted[group] = [];
    }
    sorted[group].push({...char, ...settings});
  });
  props.groupOrder.forEach((group) => {
    if (!sorted[group]) {
      sorted[group] = [];
    }
  });
  grouped.value = sorted;
}

buildGrouped();

onMounted(() => {
  window.addEventListener("dragover", handleAutoscroll);
});

watch([
      () => props.characterList,
      () => props.groupOrder,
      () => props.characterSettings
    ],
    () => buildGrouped()
);

function handleAutoscroll(e) {
  const margin = 60;
  const speed = 15;
  const y = e.clientY;
  const height = window.innerHeight;

  if (y < margin) {
    window.scrollBy(0, -speed);
  } else if (y > height - margin) {
    window.scrollBy(0, speed);
  }
}

function onCharacterDragStart(characterName, fromGroup, event) {
  draggedCharacter.value = characterName;
  draggedFromGroup.value = fromGroup;
  event.dataTransfer.setDragImage(event.currentTarget, 0, 0);
}

function onCharacterDrop(event) {
  const name = draggedCharacter.value;
  const fromGroup = draggedFromGroup.value;
  if (!name || !fromGroup) {
    return;
  }

  const toGroup = event.currentTarget.dataset.group;
  const toIndex = parseInt(event.currentTarget.dataset.index);
  if (!toGroup || isNaN(toIndex)) {
    return;
  }

  const character = grouped.value[fromGroup].find((c) => c.name === name);
  grouped.value[fromGroup] = grouped.value[fromGroup].filter((c) => c.name !== name);
  grouped.value[toGroup].splice(toIndex, 0, character);

  const updatedSettings = {
    ...props.characterSettings,
    [name]: {
      ...props.characterSettings[name],
      group: toGroup,
    },
  };

  saveSettings({
    characterSettings: updatedSettings,
    characterList: rebuildCharacterList(),
  });

  draggedCharacter.value = null;
  draggedFromGroup.value = null;
}

function onDropToEmptyGroup(group) {
  const name = draggedCharacter.value;
  const fromGroup = draggedFromGroup.value;
  if (!name || !fromGroup) {
    return;
  }

  const character = grouped.value[fromGroup].find((c) => c.name === name);
  grouped.value[fromGroup] = grouped.value[fromGroup].filter((c) => c.name !== name);
  grouped.value[group].push(character);

  const updatedSettings = {
    ...props.characterSettings,
    [name]: {
      ...props.characterSettings[name],
      group,
    },
  };

  saveSettings({
    characterSettings: updatedSettings,
    characterList: rebuildCharacterList(),
  });

  draggedCharacter.value = null;
  draggedFromGroup.value = null;
}

function rebuildCharacterList() {
  const seen = new Set();
  const updatedList = [];
  for (const group of props.groupOrder) {
    const chars = grouped.value[group] || [];
    for (const c of chars) {
      if (!seen.has(c.name)) {
        seen.add(c.name);
        const original = props.characterList.find((o) => o.name === c.name);
        if (original) {
          updatedList.push(original);
        }
      }
    }
  }
  return updatedList;
}

function onGroupDragStart(group) {
  draggedGroup.value = group;
}

function onGroupDrop(targetGroup) {
  const from = draggedGroup.value;
  if (!from || from === targetGroup) {
    return;
  }

  const newOrder = [...props.groupOrder];
  const fromIndex = newOrder.indexOf(from);
  const toIndex = newOrder.indexOf(targetGroup);
  newOrder.splice(fromIndex, 1);
  newOrder.splice(toIndex, 0, from);

  saveSettings({groupOrder: newOrder});
  draggedGroup.value = null;
}

function createGroup() {
  const name = newGroupName.value.trim();
  if (!name || props.groupOrder.includes(name)) {
    return;
  }

  const newOrder = [...props.groupOrder, name];
  saveSettings({groupOrder: newOrder});
  newGroupName.value = "";
}

function enableRenameGroup(group) {
  editableGroupTitles.value[group] = group;
}

function renameGroup(oldName, newName) {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName || props.groupOrder.includes(trimmed)) {
    delete editableGroupTitles.value[oldName];
    return;
  }

  const newOrder = props.groupOrder.map((g) => (g === oldName ? trimmed : g));
  const newSettings = {};
  for (const [char, setting] of Object.entries(props.characterSettings)) {
    newSettings[char] = {
      ...setting,
      group: setting.group === oldName ? trimmed : setting.group,
    };
  }

  saveSettings({
    groupOrder: newOrder,
    characterSettings: newSettings,
  });

  delete editableGroupTitles.value[oldName];
}

function deleteGroup(group) {
  const characters = grouped.value[group] || [];
  const newSettings = {...props.characterSettings};
  characters.forEach((c) => {
    newSettings[c.name] = {
      ...newSettings[c.name],
      group: "Без группы",
    };
  });

  const newOrder = props.groupOrder.filter((g) => g !== group);

  if (!props.groupOrder.includes("Без группы") && characters.length) {
    newOrder.push("Без группы");
  }

  saveSettings({
    groupOrder: newOrder,
    characterSettings: newSettings,
  });
}

const getGs = (char) => parseFloat(char.gearScore?.replace(',', '') || 0);

const minGs = computed(() => {
  if (!props.characterList || !props.characterList.length) {
    return 0;
  }

  return [...props.characterList].sort((a, b) => getGs(a) - getGs(b))[0]?.gearScore.replace(',', '');
});

const maxGs = computed(() => {
  if (!props.characterList || !props.characterList.length) {
    return 0;
  }

  return [...props.characterList].sort((a, b) => getGs(b) - getGs(a))[0]?.gearScore.replace(',', '');

});

function validateGsInput(input) {
  if (input.value < parseFloat(input.min)) {
    input.value = input.min;
  } else if (input.value > parseFloat(input.max)) {
    input.value = input.max;
  }

  if (input.name === "gs-to") {
    rangeGSCharacter.value.to = input.value;
  } else if (input.name === "gs-from") {
    rangeGSCharacter.value.from = input.value;
  }
}

const visibleCharactersCount = computed(() => {
  let counter = {};

  for (let [groupName, group] of Object.entries(grouped.value)) {
    counter[groupName] = group.filter(char => !char.delete).length;
  }

  return counter;
});

const availableClasses = computed(() => {
  const classes = [];

  for (let character of props.characterList) {
    if (props.characterSettings?.[character.name]?.delete) {
      continue;
    }

    if (classes.find(obj => obj.value === character.className || obj.label === character.className)) {
      continue;
    }

    classes.push({value: character.className, label: character.className});
  }

  return classes;
});

const tagOptions = [
  {label: 'Все', value: 'none'},
  {label: 'ДД', value: 'dd'},
  {label: 'Сап', value: 'sup'},
  {label: 'Легат', value: 'legate'},
  {label: 'Избранные', value: 'favorite'},
  {label: 'Золото получатели', value: 'goldReceiver'}
];

function toggleFilters() {
  isHiddenFilters.value = !isHiddenFilters.value;
  saveSettings({isCharactersFiltersHidden: isHiddenFilters.value });
}

function toggleView() {
  isGridView.value = !isGridView.value;
  saveSettings({isCharactersGridView: isGridView.value });
}
</script>

<template>
  <h1 class="title character-list__title">
    <span>Список персонажей</span>
    <tooltip v-if="!isExtendedMode">
      <button class="button button_icon character-list__button" @click="toggleView">
        <changeMenu class="icon menu-icon"/>
      </button>
      <template #tooltip>Изменить отображение</template>
    </tooltip>
  </h1>

  <div class="group-controls" v-if="!isEditMode">
    <input v-model="newGroupName" placeholder="Новая группа"/>
    <button class="button" @click="createGroup">
      <plus class="icon icon_small plus-icon plus-icon_small"/>
      Добавить группу
    </button>
  </div>

  <tooltip>
    <button type="button" class="button button_icon group-filters-button" @click="toggleFilters">
      <plus v-if="isHiddenFilters" class="icon minus-icon"></plus>
      <minus v-else class="icon minus-icon"></minus>
    </button>
    <template #tooltip>Скрыть или показать список фильтров</template>
  </tooltip>

  <div class="group-filters" v-if="!isEditMode && !isHiddenFilters">
    <div class="group-filters__title">Фильтр групп</div>
    <div class="group-filters__list">
      <div class="group-filters__list-item" :class="{'group-tags__list-item_current': currentFilter === 'none'}"
           @click="currentFilter = 'none'">Все
      </div>
      <div class="group-filters__list-item" :class="{'group-tags__list-item_current': currentFilter === group}"
           v-for="group in props.groupOrder" :key="group" @click="currentFilter = group">{{ group }}
      </div>
    </div>
  </div>

  <div class="group-tags" v-if="!isEditMode && !isHiddenFilters">
    <div class="group-tags__col">
      <div class="group-tags__title">Фильтр персонажей</div>
      <div class="group-tags__list">
        <div
            v-for="tag in [...tagOptions, ...availableClasses]"
            :key="tag.value"
            class="group-tags__list-item"
            :class="{ 'group-tags__list-item_current': currentTag === tag.value }"
            @click="currentTag = tag.value"
        >
          {{ tag.label }}
        </div>
      </div>
    </div>
    <div class="group-tags__col">
      <div class="group-tags__search">
        <label class="custom-label group-tags__search-label" for="search-character">
          Поиск по нику персонажа
        </label>
        <input class="input group-tags__search-input" id="search-character" type="search" v-model="searchCharacter"
               placeholder="Nickname">
      </div>
    </div>
    <div class="group-tags__col">
      <div class="group-tags__gear-score">
        <label class="custom-label group-tags__gear-score-label" for="gs-character">
          Поиск по ГС персонажа. Значение: {{ rangeGSCharacter.from }} - {{ rangeGSCharacter.to }}
        </label>
        <input class="input input_number group-tags__gear-score-input" id="gs-character-input-min" type="number"
               @change="({target}) => validateGsInput(target)" :value="rangeGSCharacter.from"
               placeholder="От" :min="minGs" :max="maxGs" name="gs-from">
        <input class="input input_number group-tags__gear-score-input" id="gs-character-input-max" type="number"
               @change="({target}) => validateGsInput(target)" :value="rangeGSCharacter.to"
               placeholder="До" :min="minGs" :max="maxGs" name="gs-to">
        <input class="input group-tags__gear-score-input" id="gs-character" type="range"
               v-model="rangeGSCharacter.from"
               :min="minGs" :max="maxGs">
        <input class="input group-tags__gear-score-input" id="gs-character" type="range" v-model="rangeGSCharacter.to"
               :min="minGs" :max="maxGs">
      </div>
    </div>
  </div>
  <share-snippet>
    <!--    <div id="character-list" class="character-list" :class="{'grid': !isExtendedMode && (isGridView || windowWidth < 980)}" v-if="grouped">-->
    <div id="character-list" class="character-list" :class="{'grid': !isExtendedMode && isGridView}" v-if="grouped">
      <template v-for="group in props.groupOrder" :key="group">
        <div class="character-group" v-if="currentFilter === group || currentFilter === 'none'">
          <div
              class="character-group__title-wrapper"
              @dragstart="onGroupDragStart(group)"
              @dragover.prevent
              @drop="onGroupDrop(group)"
          >
            <div class="character-group__title">
              <template v-if="editableGroupTitles[group]">
                <input
                    v-model="editableGroupTitles[group]"
                    @blur="renameGroup(group, editableGroupTitles[group])"
                    @keyup.enter="renameGroup(group, editableGroupTitles[group])"
                />
              </template>
              <template v-else>
                <span draggable="true">{{ group }}
                  <tooltip>({{ visibleCharactersCount[group] }} / {{ grouped[group].length }} перс.)
                  <template #tooltip>Отображает видимое и скрытое количество персонажей в группе</template>
                  </tooltip>
                </span>
                <div class="character-group__controls" v-if="group !== 'Без группы' && !isEditMode">
                  <tooltip>
                    <button class="button button_icon" @click="enableRenameGroup(group)">
                      <pencil class="icon pencil-icon"/>
                    </button>
                    <template #tooltip>Переименовать группу</template>
                  </tooltip>
                  <tooltip>
                    <button class="button button_icon" @click="deleteGroup(group)">
                      <trash class="icon trash-icon"/>
                    </button>
                    <template #tooltip>Удалить группу</template>
                  </tooltip>
                  <tooltip>
                    <button class="button button_icon" @click="emit('update-character-group', grouped[group])">
                      <update class="icon update-icon"/>
                    </button>
                    <template #tooltip>Обновить группу</template>
                  </tooltip>
                </div>
              </template>
            </div>
          </div>

          <div class="character-dropzone" :class="{'character-dropzone_extended': isExtendedMode}">
            <template v-for="(character, index) in grouped[group]" :key="character.name">
              <character-list-item-extended
                  v-if="isExtendedMode"
                  :character="character"
                  :is-edit-mode="isEditMode"
                  :character-settings="characterSettings[character.name]"
                  @show-raid-selector="(characterName) => emit('show-raid-selector', characterName)"
                  @dragstart="onCharacterDragStart(character.name, group, $event)"
                  @dragover.prevent
                  @drop="onCharacterDrop($event)"
                  :data-group="group"
                  :data-index="index"
                  :currentTag="currentTag"
                  :searchCharacter="searchCharacter"
                  :gsFilter="rangeGSCharacter"
                  @updateCharacter="(characterName) => emit('update-character', characterName)"
                  @fetchCharacter="(characterName) => emit('fetch-character', characterName)"
              />
              <character-list-item
                  v-else
                  :character="character"
                  :is-edit-mode="isEditMode"
                  :is-grid="isGridView"
                  :character-settings="characterSettings[character.name]"
                  @show-raid-selector="(characterName) => emit('show-raid-selector', characterName)"
                  @dragstart="onCharacterDragStart(character.name, group, $event)"
                  @dragover.prevent
                  @drop="onCharacterDrop($event)"
                  :data-group="group"
                  :data-index="index"
                  :currentTag="currentTag"
                  :searchCharacter="searchCharacter"
                  :gsFilter="rangeGSCharacter"
                  @updateCharacter="(characterName) => emit('update-character', characterName)"
                  @fetchCharacter="(characterName) => emit('fetch-character', characterName)"
              />
            </template>

            <div
                v-if="grouped[group] && grouped[group].length === 0"
                class="character-dropzone empty"
                @dragover.prevent
                @drop="() => onDropToEmptyGroup(group)"
            >
              <em>Перетащи персонажа сюда</em>
            </div>
          </div>
        </div>
      </template>
    </div>
  </share-snippet>
</template>

<style lang="scss">
.character-list__title {
  display: flex;
  justify-content: space-between;
}

.character-dropzone {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex-direction: column;
  width: 100%;

  @media screen and (max-width: 801px) {
    flex-direction: row;
  }

  &_extended {
    flex-direction: row;
  }
}

.character-list.edit-mode {
  .character-dropzone {
    flex-direction: row;
  }
}

.character-list.grid {
  .character-dropzone {
    display: grid;
    grid-template-areas: "a a a" "b c d";

    @media screen and (max-width: 760px) {
      grid-template-areas: "a a" "b c";
    }

    @media screen and (max-width: 560px) {
      grid-template-areas: "a" "b";
    }
  }
}

.character-list.edit-mode {
  .character {
    flex: 25%;
  }
}

.character-group__title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
  font-size: var(--font-h2);
  cursor: grab;
}

.character-group__title {
  display: flex;
  gap: 20px;
  align-items: center;
}

.character-group__controls {
  display: flex;
  gap: 10px;
}

.group-controls {
  display: flex;
  gap: 20px;
}

.character-group {
  margin-top: 30px;
  border-top: 1px solid var(--grey);
}

.group-filters-button {
  color: var(--gold);
  margin-top: 10px;
}

.group-filters,
.group-tags {
  border-top: 1px solid var(--grey);
  padding: 10px;
  margin-top: 15px;
}

.group-tags {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;

  @media screen and (max-width: 820px) {
    flex-direction: column;
  }
}

.group-tags__col {
  max-width: 33%;

  @media screen and (max-width: 820px) {
    max-width: 100%;
  }
}

.group-filters__title,
.group-tags__title {
  font-size: var(--font-small);
  margin-bottom: 10px;
}

.group-filters__list,
.group-tags__list {
  display: flex;
  font-size: var(--font-tiny);
}

.group-tags__list {
  flex-wrap: wrap;
  gap: 5px;
}

.group-filters__list-item,
.group-tags__list-item {
  margin-right: 10px;
  cursor: pointer;
  transition: .2s ease;
  padding-bottom: 3px;
  border-bottom: 1px solid transparent;

  &_current {
    color: var(--gold);
    border-bottom-color: var(--gold);
  }

  &:hover {
    color: var(--gs);
  }
}

.group-tags__search,
.group-tags__gear-score {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.group-tags__search-label,
.group-tags__gear-score-label {
  font-size: var(--font-very-small);
  margin-bottom: 10px;
}

.group-tags__gear-score {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>