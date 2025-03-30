<script setup>
import NotificationsPopup from "@/components/notifications/NotificationsPopup.vue";
import {computed, inject, ref} from "vue";
import NotificationsItem from "@/components/notifications/NotificationsItem.vue";

let isOpenPopup = ref(false);
let settings = inject('settings');
const customNotifications = computed(() => settings.value.customNotifications);
</script>

<template>
  <h1 class="tooltip" data-tooltip="Напоминания приходят в центр уведомлений Windows">Список напоминаний</h1>
  <div id="notification-table" class="notification-list">
    <notifications-item v-for="(notification, index) of customNotifications" :notification="notification" :key="index" :index="index" />
  </div>
  <button type="button" class="notification-table__button-add button" @click="isOpenPopup = true">
    Создать
  </button>
  <notifications-popup v-show="isOpenPopup" @close="isOpenPopup = false" @save-item="isOpenPopup = false" />
</template>

<style scoped lang="scss">
.notification-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

</style>