<script setup>
import {ref} from 'vue';

const emit = defineEmits(['closePopup', 'saveItem']);

const newTaskText = ref('');

function closePopup() {
  newTaskText.value = '';
}

function saveTask() {
  if (newTaskText.value.length < 1) {
    return;
  }

  emit('saveItem', {
    text: newTaskText.value,
    complete: false
  });

  closePopup();
}

const close = () => {
  closePopup(); // локальный метод
  emit('closePopup'); // эмитим в родителя
};
</script>

<template>
  <div class="popup check-list-table__popup">
    <div class="popup__content">
      <label class="popup__label check-list-table__popup__label">
        Введите текст задачи:
        <input v-model="newTaskText" type="text" class="popup__input check-list-table__popup__input"/>
      </label>
      <button class="button" @click="saveTask">Сохранить</button>
      <button class="cross button button_icon" @click="close">✖</button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>