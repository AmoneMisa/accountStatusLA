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

<style scoped lang="scss">

</style>