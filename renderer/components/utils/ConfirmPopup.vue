<script setup>
import cross from "../../../src/svg/cross.svg";

defineEmits(['closePopup', 'accept', 'reject']);
defineProps({
  text: String
})
</script>

<template>
<div class="popup">
  <div class="popup__content">
    <div class="popup__text">{{ text }}</div>
    <button class="button" @click="$emit('accept')">Да</button>
    <button class="button" @click="$emit('reject')">Нет</button>
    <button class="cross button button_icon" @click="$emit('closePopup')"><cross class="icon icon_very-small cross-icon" /></button>
  </div>
</div>
</template>

<style scoped lang="scss">

</style>