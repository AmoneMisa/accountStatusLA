<script setup>
import {ref} from 'vue';
import cross from "../../../public/assets/svg/cross.svg";

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
      <button class="cross button button_icon" @click="close"><cross class="icon icon_very-small cross-icon" /></button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>