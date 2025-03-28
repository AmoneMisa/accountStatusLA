<script setup>
import {computed, inject, ref} from "vue";
import {saveSettings} from "../../../utils/utils.js";
const props = defineProps({
  notification: Object,
  index: Number
})

const emit = defineEmits(['remove']);

const daysMap = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
  7: "Вс",
};

const formattedDays = computed(() =>
    props.notification.days.map(day => daysMap[day]).join(', ')
);

let settings = inject('settings');
const customNotifications = computed(() => settings.value.customNotifications);

function onToggle() {
  const settings = customNotifications.value || [];
  settings[props.index].enable = props.notification.enable;
  saveSettings({ customNotifications: settings });
}

function onDelete() {
  const settings = customNotifications.value || [];
  settings.splice(props.index, 1);
  saveSettings({ customNotifications: settings });
  emit('remove', props.index);
}
</script>

<template>
  <div class="notification-item">
    <div class="notification-item__cell">{{ notification.name }}</div>
    <div class="notification-item__cell">
      Дни недели: {{ formattedDays }}
    </div>
    <div class="notification-item__cell">
      Частота: {{ notification.frequency }} мин
    </div>
    <label class="custom-label notification-item__cell">
      Вкл. уведомления
      <input
          type="checkbox"
          class="notification-item__checkbox"
          v-model="notification.enable"
          @change="onToggle"
      />
    </label>
    <div class="notification-item__controls">
      <button
          class="notification-item__delete button button_icon tooltip"
          data-tooltip="Удалить напоминание"
          @click="onDelete"
      >
        🗑
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>