<script setup>
import {saveSettings} from "../../../utils/utils.js";
import {computed, inject, ref} from "vue";
import cross from "../../../src/svg/cross.svg";
import CustomCheckbox from "@/components/utils/CustomCheckbox.vue";

const emit = defineEmits(['close', 'saveItem']);
let selectDays = ref([]);
let selectFrequency = ref();
let inputValue = ref();
let settings = inject('settings');
const customNotifications = computed(() => settings.value.customNotifications || []);

function saveItem() {
  if (inputValue.length < 1) {
    return;
  }

  const selectedOptions = selectDays.value;

  customNotifications.value.push({name: inputValue.value, frequency: selectFrequency.value, days: selectedOptions, enable: false});
  inputValue.value = "";
  selectDays.value = [];
  selectFrequency.value = "";

  saveSettings({customNotifications: customNotifications.value});
  emit("saveItem");
}

function close() {
  inputValue = "";
  emit("close");
}

const daysMap = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
  7: "Вс"
}

function toggleDay(index) {
  const dayIndex = Number(index);
  const i = selectDays.value.indexOf(dayIndex);

  if (i !== -1) {
    selectDays.value.splice(i, 1);
  } else {
    selectDays.value.push(dayIndex);
  }
}
</script>

<template>
  <div class="popup notification-popup">
    <div class="popup__content notification-popup__content">
      <button class="cross button button_icon notification-popup__cross" @click="close"><cross class="icon icon_very-small cross-icon" /></button>
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
        <div class="popup__label">
          Дни для напоминаний
        </div>
          <custom-checkbox
              v-for="[index, day] in Object.entries(daysMap)"
              :text="day"
              :checked="selectDays.includes(Number(index))"
              @change="() => toggleDay(index)"
          />

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