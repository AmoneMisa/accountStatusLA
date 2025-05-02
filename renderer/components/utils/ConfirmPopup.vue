<script setup>
import cross from "../../../src/svg/cross.svg";

defineEmits(['close-popup', 'accept', 'reject']);
defineProps({
  text: String,
  title: String,
  note: String,
})
</script>

<template>
<div class="popup">
  <div class="popup__content">
    <div class="popup__title" v-if="title">{{ title }}</div>
    <div class="popup__text" v-if="text">{{ text }}</div>
    <div class="popup__note" v-if="note">{{ note }}</div>
    <div class="popup__buttons">
      <button class="button" @click="$emit('accept')">Да</button>
      <button class="button" @click="$emit('reject')">Нет</button>
    </div>
    <button class="cross button button_icon" @click="$emit('close-popup')"><cross class="icon icon_very-small cross-icon" /></button>
  </div>
</div>
</template>

<style scoped lang="scss">
.popup__buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.popup__title {
  font-size: var(--font-h2);
}

.popup__note {
  font-size: var(--font-tiny);
}
</style>