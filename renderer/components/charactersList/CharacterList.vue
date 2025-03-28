<script setup>
import CharacterListItem from "@/components/charactersList/CharacterListItem.vue";
import draggable from 'vuedraggable';
import {ref} from "vue";

const emit = defineEmits({'showRaidSelector': String, "dragEnd": Array});

const props = defineProps({
  characterList: [],
  isEditMode: false,
});

const sortedCharactersList = ref({...props.characterList});

function onDragEnd() {
  emit("dragEnd", sortedCharactersList.value);
}
</script>

<template>
  <h1 class="title">Список персонажей</h1>
  <div id="character-list" class="character-list" :class="{'edit-mode': isEditMode}">
    <draggable
        v-model="sortedCharactersList"
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

<style scoped lang="scss">

</style>