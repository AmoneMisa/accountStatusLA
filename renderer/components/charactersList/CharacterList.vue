<script setup>
import CharacterListItem from "@/components/charactersList/CharacterListItem.vue";
import draggable from 'vuedraggable';
import ShareSnippet from "@/components/utils/ShareSnippet.vue";
import {ref} from "vue";

const emit = defineEmits({'showRaidSelector': String, "dragEnd": Array});

const props = defineProps({
  characterList: Array,
  isEditMode: false,
});

function onDragEnd() {
  emit("dragEnd", props.characterList);
}

const isGridView = ref(false);
</script>

<template>
  <h1 class="title character-list__title"><span>Список персонажей</span>  <button class="button button_icon tooltip" data-tooltip="Изменить отображение" @click="isGridView = !isGridView">🔷</button></h1>
  <share-snippet>
    <div id="character-list" class="character-list" :class="{'edit-mode': isEditMode, 'grid': isGridView}">
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
  </share-snippet>

</template>

<style lang="scss">
.character-list__title {
  display: flex;
  justify-content: space-between;
}

.character-list {
  > div {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex-direction: column;
    width: 100%;
  }
}

.character-list.edit-mode {
  > div {
    flex-direction: row;
  }
}

.character-list.grid {
  > div {
    display: grid;
    grid-template-areas: "a b c";
  }
}

.character-list.edit-mode {
  > div {
    .character {
      flex: 25%;
    }
  }
}

@media screen and (max-width: 980px) {
  .character-list {
    > div {
      display: grid;
      grid-template-areas: "a b c";

      @media screen and (max-width: 750px) {
        grid-template-areas: "a b";
      }

      @media screen and (max-width: 530px) {
        grid-template-areas: "a";
      }
    }
  }
}

@media screen and (max-width: 750px) {
  .character-list {
    > div {
      grid-template-areas: "a b";
    }
  }
}

@media screen and (max-width: 530px) {
  .character-list {
    > div {
      grid-template-areas: "a";
    }
  }
}
</style>