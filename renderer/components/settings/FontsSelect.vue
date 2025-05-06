<script setup>
import {ref, onMounted, watch} from 'vue';

const props = defineProps({
  "currentFont": String
});

const font = ref(props.currentFont);

const emit = defineEmits({
  'changeFont': String
})

watch(font, (newVal) => {
  emit("changeFont", newVal);
});

const fonts = ref([]);

onMounted(async () => {
  fonts.value = await window.electron.ipcRenderer.getSystemFonts();
});
</script>

<template>
  <select v-model="font" class="font-select">
    <option v-for="font in fonts" :key="font" :value="font">
      {{ font }}
    </option>
  </select>
  <p :style="{ fontFamily: currentFont }">
    Пример текста:
    съешь ещё этих мягких французских булок, да выпей чаю<br>
    The quick brown fox jumps over the lazy dog.
  </p>
</template>

<style scoped lang="scss">
.font-select {
  max-height: 60px;
  width: 165px;
  margin-bottom: initial;
}
</style>