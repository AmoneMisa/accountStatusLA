<script setup>
import CharacterListItem from "@/components/charactersList/CharacterListItem.vue";
import draggable from 'vuedraggable';

const emit = defineEmits({'showRaidSelector': String, "dragEnd": Array});

const props = defineProps({
  characterList: Array,
  isEditMode: false,
});

function onDragEnd() {
  emit("dragEnd", props.characterList);
}
</script>

<template>
  <h1 class="title">Список персонажей</h1>
  <div id="character-list" class="character-list" :class="{'edit-mode': isEditMode}">
    <draggable
        :list="characterList"
        item-key="name"
        handle=".character__drag"
        ghost-class="dragging"
        @end="onDragEnd"
    >
      <template #item="{ element: character }">
        <character-list-item
            :is-edit-mode="isEditMode"
            :character="character"
            :key="character.name"
            @show-raid-selector="(characterName) => emit('showRaidSelector', characterName)"/>
      </template>
    </draggable>
  </div>
</template>

<style lang="scss">
.character-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex-direction: column;
  width: 100%;
}

.character-list.edit-mode {
  flex-direction: row;
}

.character-list.edit-mode .character {
  flex: 25%;
}

@media screen and (max-width: 750px) {
  .character-list {
    grid-template-areas: "a b";
  }
}

@media screen and (max-width: 530px) {
  .character-list {
    grid-template-areas: "a";
  }
}
</style>