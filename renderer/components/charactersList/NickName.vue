<script setup>
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
      <div id="nickname" class="nickname-block__nickname tooltip"
           data-tooltip="Ник необходим для загрузки твоих персонажей">
        <input v-show="isEditMode" type="text" id="nickname-input" placeholder="Введите ник" autofocus v-model="model" />
        <span v-show="!isEditMode">Ваш ник: {{ model }}</span>
      </div>
      <button type="button" id="edit-nickname" class="button button_icon nickname-block__button tooltip"
              data-tooltip="Редактировать ник" v-show="!isEditMode" @click="isEditMode = true">✏️
      </button>
      <button id="save-nickname" class="button button_icon tooltip" data-tooltip="Сохранить ник"
              style="display:none" v-show="isEditMode" @click="saveNickname(model)">💾
      </button>
    </div>
    <div id="controls" class="controls">
      <button type="button" id="refresh-characters" class="button button_icon tooltip refresh-characters"
              data-tooltip="Обновить персонажей" @click="emit('refresh-characters')">🔄
      </button>
      <button type="button" id="edit-characters" class="button button_icon" @click="editCharacters">✏️</button>
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