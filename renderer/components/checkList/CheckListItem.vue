<script setup>
defineProps({
  text: "",
  index: Number,
  checked: false
});

const emit = defineEmits(['delete', 'toggle']);
</script>

<template>
<div class="check-list-table__item">
  <label class="custom-label">
    <input type="checkbox" class="check-list-table__checkbox" :checked="checked" :data-index="index"  @change="emit('toggle', $event.target.checked)" />
  </label>
  <span class="check-list-table__item-text">
    {{ text }}
  </span>
  <button type="button" class="check-list-table__item-delete button button_icon" title="Удалить" :data-index="index" @click="emit('delete', index)">
    🗑
  </button>
</div>
</template>

<style scoped lang="scss">

</style>