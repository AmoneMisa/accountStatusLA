<script setup>
import NotificationsPopup from "@/components/notifications/NotificationsPopup.vue";
import {computed, inject, ref} from "vue";
import NotificationsItem from "@/components/notifications/NotificationsItem.vue";
import Tooltip from "@/components/utils/Tooltip.vue";

let isOpenPopup = ref(false);
let settings = inject('settings');
const customNotifications = computed(() => settings.value.customNotifications);
</script>

<template>
  <tooltip>
  <h1 class="title">Список напоминаний</h1>
  <template #tooltip>Напоминания приходят в центр уведомлений Windows</template>
  </tooltip>
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