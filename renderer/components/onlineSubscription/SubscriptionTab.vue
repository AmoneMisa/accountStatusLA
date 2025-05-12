<script setup>
import Tooltip from "@/components/utils/Tooltip.vue";
import OnlineModule from "../../../utils/OnlineModule.js";
import {inject, ref, toRaw} from "vue";
import {saveSettings} from "../../../utils/utils.js";
import heart from "../../../src/svg/heart.svg";
import {DateTime} from "luxon";

let settings = inject('settings');

const online = new OnlineModule(settings.value.nickname, toRaw(Object.assign(settings.value.characterSettings, {characterList: settings.value.characterList})));

let user = ref({});

(async function () {
  if (settings.value.UUID) {
    try {
      const res = await online.getUser(settings.value.UUID);
      user.value = res.data;
    } catch (e) {
      console.warn("User not found. Try to register:", e);
      const res = await online.register();
      user.value = res.data;
      saveSettings({UUID: user.value._id});
    }
  } else {
    const res = await online.register();
    user.value = res.data;
    saveSettings({UUID: user.value._id});
  }
})();

let users = ref([]);
(async function () {
  const res = await online.getUsers(user.value._id);
  users.value = res.data;
})();

function format(date) {
  const dt = typeof date === 'string'
      ? DateTime.fromISO(date)
      : DateTime.fromJSDate(date);

  return dt.isValid
      ? dt.toLocal().toFormat('HH:mm - dd.MM.yyyy')
      : 'Invalid date';
}
</script>

<template>
  <div class="online-subs">
    <tooltip has-icon="true" class="title-row">
      <h1 class="title">Подписки</h1>
      <template #tooltip>Список всех доступных пользователей для подписки</template>
    </tooltip>
    <div v-if="users" class="online-subs__list">
      <div v-for="_user in users" :key="_user.nickname" class="online-subs__list-item">
        <span class="online-subs__list-item-nickname">{{ _user.nickname }}</span>
        <span class="online-subs__list-item-update">Последнее обновление: {{ _user?.lastUpdateAt ? format(_user?.lastUpdateAt) : format(_user?.createdAt) }}</span>
        <tooltip class="online-subs__button">
          <button type="button" class="button button_icon">
            <heart class="icon heart-icon"/>
          </button>
          <template #tooltip>Подписаться на пользователя</template>
        </tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.title {
  margin: 0;
}

.title-row {
  margin-top: 20px;
  margin-bottom: 20px;
}

.online-subs__list-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  border: 1px solid var(--grey);
  box-shadow: var(--shadow);
  max-width: 300px;
  font-size: var(--font-small);
  padding: 10px;
  border-radius: 5px;
  position: relative;
}

.online-subs__list-item-nickname {
  color: var(--gold);
}

.online-subs__button {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>