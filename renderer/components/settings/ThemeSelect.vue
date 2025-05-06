<script setup>
import {ref, watch} from "vue";

const props = defineProps({
  "currentTheme": String
});

const theme = ref(props.currentTheme);

const emit = defineEmits({
  'changeTheme': String
})

watch(theme, (newVal) => {
  emit("changeTheme", newVal);
});
</script>

<template>
  <select id="theme" v-model="theme" class="theme-select">
    <option value="dark">Тёмная</option>
    <option value="light">Светлая</option>
    <option value="blue">Синяя</option>
    <option value="red">Красная</option>
    <option value="green">Зелёная</option>
    <option value="yellow">Жёлтая</option>
    <option value="gradient-dark">Тёмный градиент</option>
    <option value="rose">Розовая</option>
    <option value="light-blue">Нежно-голубая</option>
    <option value="mint">Мятная</option>
    <option value="forest">Лесная</option>
    <option value="oceanic">Океаническая</option>
    <option value="purple">Фиолетовая</option>
    <option value="dark-blue-gradient">Тёмно-синий градиент</option>
    <option value="orange">Апельсиновая</option>
    <option value="peach">Персиковая</option>
    <option value="raspberry">Малиновая</option>
    <option value="rainy-asphalt">Мокрый асфальт</option>
  </select>
</template>

<style scoped lang="scss">
.theme-select {
  max-height: 60px;
  margin-bottom: initial;
}
</style>