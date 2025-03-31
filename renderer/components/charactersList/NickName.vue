<script setup>
import Tooltip from "@/components/utils/Tooltip.vue";

const props = defineProps({
  isEditMode: false
})

const emit = defineEmits(['refresh-characters', 'edit-characters', 'save-nickname']);

function saveNickname(newNickname) {
  emit('save-nickname', newNickname);
  props.isEditMode.value = false;
}

const model = defineModel();

function editCharacters() {
  if (props.isEditMode.value) {
    return;
  }
  emit('edit-characters');
}
</script>

<template>
  <div class="main-header">
    <div class="nickname-block">
      <tooltip>
        <div id="nickname" class="nickname-block__nickname">
          <input v-show="isEditMode" type="text" id="nickname-input" placeholder="Введите ник" autofocus
                 v-model="model"/>
          <span v-show="!isEditMode">Ваш ник: {{ model }}</span>
        </div>
        <template #tooltip>Ник необходим для загрузки твоих персонажей</template>
      </tooltip>
      <tooltip>
        <button type="button" id="edit-nickname" class="button button_icon nickname-block__button"
                v-show="!isEditMode" @click="isEditMode = true">✏️
        </button>
        <template #tooltip>Редактировать ник</template>
      </tooltip>
      <tooltip>
        <button id="save-nickname" class="button button_icon"
                style="display:none" v-show="isEditMode" @click="saveNickname(model)">💾
        </button>
        <template #tooltip>Сохранить ник</template>
      </tooltip>
    </div>
    <div id="controls" class="controls">
      <tooltip>
        <button type="button" id="refresh-characters" class="button button_icon refresh-characters"
                @click="emit('refresh-characters')">🔄
        </button>
        <template #tooltip>Обновить персонажей</template>
      </tooltip>
      <tooltip>
        <button type="button" id="edit-characters" class="button button_icon" @click="editCharacters">✏️</button>
        <template #tooltip>Редактировать персонажей</template>
      </tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.nickname-block {
  display: flex;
  min-width: 300px;
  max-width: 80%;
  align-items: center;
}

.nickname-block__nickname {
  display: flex;
  gap: 5px;
  align-items: center;
}

.controls {
  display: flex;
  gap: 5px;
}
</style>