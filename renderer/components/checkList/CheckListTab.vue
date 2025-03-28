<script setup>
import {computed, inject, ref} from 'vue';
import CheckListPopup from "@/components/checkList/CheckListPopup.vue";
import CheckListItem from "@/components/checkList/CheckListItem.vue";
import {saveSettings} from "../../../utils/utils.js";

const isOpenPopup = ref(false);
let settings = inject('settings');
const todos = computed(() => settings.value.todos)

function deleteItem(index) {
  todos.value.splice(index, 1);
  saveSettings({todos: todos.value});
}

function checkStatus(index, checked) {
  todos.value[index].complete = checked;
  saveSettings({todos: todos.value});
}

function saveItem(todo) {
  isOpenPopup.value = false;
  todos.value.push(todo);
  saveSettings({ todos: JSON.parse(JSON.stringify(todos.value)) });
}
</script>

<template>
  <h1>Твой список задач</h1>
  <div id="check-list-table" class="check-list-table">
    <check-list-item v-for="(todo, index) in todos" :checked="todo.complete" :text="todo.text" :index="index"
                     :key="index"
                     @delete="() => deleteItem(index)"
                     @toggle="(checked) => checkStatus(index, checked)"/>
  </div>
  <button type="button" class="check-list-table__button-add button" @click="isOpenPopup = true">
    Добавить задачу
  </button>
  <check-list-popup @closePopup="isOpenPopup = false" v-show="isOpenPopup" @saveItem="saveItem"/>
</template>

<style scoped lang="scss">

</style>