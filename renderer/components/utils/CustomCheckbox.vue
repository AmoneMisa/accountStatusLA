<script setup>
defineProps({
  text: String,
  labelClass: String,
  modelValue: Boolean
});

defineEmits(['update:modelValue']);

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <label class="custom-label" :class="labelClass">
    <input v-bind="$attrs" :checked="modelValue" type="checkbox" @change="$emit('update:modelValue', $event.target.checked)">
    <span v-if="text">{{ text }}</span>
  </label>
</template>

<style scoped lang="scss">

</style>