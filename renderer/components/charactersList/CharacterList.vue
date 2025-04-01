<script setup>
import CharacterListItem from "@/components/charactersList/CharacterListItem.vue";
import draggable from 'vuedraggable';
import ShareSnippet from "@/components/utils/ShareSnippet.vue";
import {computed, ref, watch} from "vue";
import Tooltip from "@/components/utils/Tooltip.vue";

const emit = defineEmits(['showRaidSelector', 'dragEnd']);
const props = defineProps({
  characterList: Array,
  isEditMode: Boolean,
  characterSettings: Object,
});

const isGridView = ref(false);
const windowWidth = ref(window.innerWidth);
window.addEventListener("resize", () => {
  setTimeout(() => {
    windowWidth.value = window.innerWidth;
  }, 1000);
});

// 🧠 Получаем список групп
const groupedCharacters = computed(() => {
  const groups = {};
  props.characterList.forEach((char) => {
    const group = props.characterSettings?.[char.name]?.group || "Без группы";
    if (!groups[group]) groups[group] = [];
    groups[group].push(char);
  });
  return groups;
});

const groupOrder = ref(Object.keys(groupedCharacters.value));

watch(groupedCharacters, (val) => {
  const newGroups = Object.keys(val);
  if (groupOrder.value.length === 0 || newGroups.some(g => !groupOrder.value.includes(g))) {
    groupOrder.value = newGroups;
  }
});

function onGroupDragEnd() {
  emit("dragEnd", flattenGroupedCharacters());
}

function onCharacterDragEnd(groupName) {
  return () => {
    emit("dragEnd", flattenGroupedCharacters());
  };
}

function flattenGroupedCharacters() {
  const flat = [];
  groupOrder.value.forEach(group => {
    const characters = groupedCharacters.value[group] || [];
    characters.forEach(char => {
      if (props.characterSettings[char.name]?.group !== group) {
        props.characterSettings[char.name].group = group;
      }
      flat.push(char);
    });
  });
  return flat;
}
</script>

<template>
  <h1 class="title character-list__title"><span>Список персонажей</span>
    <tooltip>
      <button class="button button_icon" @click="isGridView = !isGridView">🔷</button>
      <template #tooltip>Изменить отображение</template>
    </tooltip>
  </h1>
  <share-snippet>
    <div id="character-list" class="character-list" :class="{ 'edit-mode': isEditMode, 'grid': isGridView || windowWidth < 980 }">
      <draggable v-model="groupOrder" item-key="group" @end="onGroupDragEnd">
        <template #item="{ element: group }">
          <div class="character-group">
            <h2 class="character-group__title">{{ group }}</h2>
            <draggable
                :list="groupedCharacters[group]"
                item-key="name"
                group="characters"
                handle=".character__drag"
                ghost-class="dragging"
                @end="onCharacterDragEnd(group)"
            >
              <template #item="{ element: character }">
                <character-list-item
                    :character="character"
                    :is-edit-mode="isEditMode"
                    :window-width="windowWidth"
                    @show-raid-selector="(characterName) => emit('showRaidSelector', characterName)"
                />
              </template>
            </draggable>
          </div>
        </template>
      </draggable>
    </div>
  </share-snippet>
</template>

<style lang="scss">
.character-list__title {
  display: flex;
  justify-content: space-between;
}

.character-group > div {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex-direction: column;
    width: 100%;
}

.character-list.edit-mode {
  .character-group > div {
    flex-direction: row;
  }
}

.character-list.grid {
  .character-group > div {
    display: grid;
    grid-template-areas: "a a a" "b c d";

    @media screen and (max-width: 760px){
      grid-template-areas: "a a" "b c";
    }

    @media screen and (max-width: 560px){
      grid-template-areas: "a" "b";
    }
  }
}

.character-list.edit-mode {
  .character-group {
    .character {
      flex: 25%;
    }
  }
}
</style>