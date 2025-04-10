<script setup>
import CharacterListItem from "@/components/charactersList/CharacterListItem.vue";
import ShareSnippet from "@/components/utils/ShareSnippet.vue";
import {onMounted, ref, watch} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";
import {saveSettings} from "../../../utils/utils.js";

const emit = defineEmits(["showRaidSelector"]);
const props = defineProps({
  characterList: Array,
  characterSettings: Object,
  groupOrder: Array,
  isEditMode: Boolean,
});

const isGridView = ref(false);
const windowWidth = ref(window.innerWidth);
const grouped = ref({});
const editableGroupTitles = ref({});
const newGroupName = ref("");
let draggedCharacter = ref(null);
let draggedFromGroup = ref(null);
let draggedGroup = ref(null);

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
  if (!name || !fromGroup) return;

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
</script>

<template>
  <h1 class="title character-list__title">
    <span>Список персонажей</span>
    <tooltip>
      <button class="button button_icon character-list__button" @click="isGridView = !isGridView">🔷</button>
      <template #tooltip>Изменить отображение</template>
    </tooltip>
  </h1>

  <share-snippet>
    <div class="group-controls">
      <input v-model="newGroupName" placeholder="Новая группа"/>
      <button class="button" @click="createGroup">➕ Добавить группу</button>
    </div>

    <div id="character-list" class="character-list" :class="{'grid': isGridView || windowWidth < 980}" v-if="grouped">
      <div v-for="group in props.groupOrder" :key="group" class="character-group">
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
              <span draggable="true">{{ group }}</span>
              <div class="character-group__controls" v-if="group !== 'Без группы'">
                <tooltip>
                <button class="button button_icon" @click="enableRenameGroup(group)">✏️</button>
                  <template #tooltip>Переименовать группу</template>
                </tooltip>
                  <tooltip>
                <button class="button button_icon" @click="deleteGroup(group)">🗑️</button>
                    <template #tooltip>Удалить группу</template>
                  </tooltip>
              </div>
            </template>
          </div>
        </div>

        <div class="character-dropzone">
          <template v-for="(character, index) in grouped[group]" :key="character.name">
            <character-list-item
                :character="character"
                :is-edit-mode="isEditMode"
                :window-width="windowWidth"
                :character-settings="characterSettings[character.name]"
                @show-raid-selector="(characterName) => emit('showRaidSelector', characterName)"
                @dragstart="onCharacterDragStart(character.name, group, $event)"
                @dragover.prevent
                @drop="onCharacterDrop($event)"
                :data-group="group"
                :data-index="index"
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
    </div>
  </share-snippet>
</template>

<style lang="scss">
.character-list__title {
  display: flex;
  justify-content: space-between;
}

.character-list__button {
  @media screen and (max-width: 980px){
    display: none !important;
  }
}

.character-dropzone {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex-direction: column;
  width: 100%;
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
</style>