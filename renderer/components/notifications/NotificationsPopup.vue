<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject, ref} from "vue";

const emit = defineEmits(['close', 'saveItem']);
let selectDays = ref();
let selectFrequency = ref();
let inputValue = ref();
let settings = inject('settings');
const customNotifications = computed(() => settings.value.customNotifications);

function saveItem() {
  if (inputValue.length < 1) {
    return;
  }

  const selectedOptions = Array.from(selectDays.value);

  customNotifications.value.push({name: inputValue.value, frequency: selectFrequency.value, days: selectedOptions, enable: false});
  inputValue.value = "";
  selectDays.value = "";
  selectFrequency.value = "";

  saveSettings({customNotifications: customNotifications.value});
  emit("saveItem");
}

function close() {
  inputValue = "";
  emit("close");
}
</script>

<template>
  <div class="popup notification-popup">
    <div class="popup__content notification-popup__content">
      <button class="cross button button_icon notification-popup__cross" @click="close">✖</button>
      <label class="popup__label">
        Название напоминания
        <input v-model="inputValue" type="text" placeholder="Название напоминания" class="notification__create-title popup__input"/>
      </label>
      <label class="popup__label">
        Частота напоминаний
        <select class="notification__create-select-frequency" v-model="selectFrequency">
          <option value="1">Каждую минуту</option>
          <option value="5">Каждые 5 минут</option>
          <option value="15">Каждые 15 минут</option>
          <option value="30">Каждые 30 минут</option>
          <option value="60">Каждый час</option>
          <option value="120">Каждые 2 часа</option>
        </select>
      </label>
      <div class="notification__create-days">
        <label class="popup__label">
          Дни для напоминаний.<br>
          Нажми <i>Cntrl</i> для мульти-выбора
          <select class="notification__create-select-days" multiple  v-model="selectDays">
            <option value="1">Пн</option>
            <option value="2">Вт</option>
            <option value="3">Ср</option>
            <option value="4">Чт</option>
            <option value="5">Пт</option>
            <option value="6">Сб</option>
            <option value="7">Вс</option>
          </select>
        </label>
      </div>
      <button class="button notification__create-button" @click="saveItem">Сохранить</button>
    </div>
  </div>
</template>

<style scoped lang="scss">

.notification-popup {
  font-size:  var(--font-small);
  height: 350px;
}

.notification-popup__content {
  gap: 10px;
}

.notification__create-select-frequency {
  max-height: 40px;
  margin-top: 5px;
}

.notification__create-select-days {
  height: 115px;
  margin-top: 5px;
}

.notification-popup input {
  margin-top: 5px;
}

</style>