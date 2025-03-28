<script setup>
import CharacterListItem from "@/components/charactersList/CharacterListItem.vue";

const emit = defineEmits(['showRaidSelector']);

defineProps({
  characterList: [],
  isEditMode: false,
});
</script>

<template>
  <h1 class="title">Список персонажей</h1>
  <div id="character-list" class="character-list" :class="{'edit-mode': isEditMode}">
    <character-list-item v-for="character in characterList" :is-edit-mode="isEditMode" :character="character" :key="character.name" @show-raid-selector="(characterName) => emit('showRaidSelector', characterName)" />
  </div>
</template>

<style scoped lang="scss">

</style>