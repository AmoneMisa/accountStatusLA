<script setup>
import Tooltip from "@/components/utils/Tooltip.vue";
import OnlineModule from "../../../utils/OnlineModule.js";
import {computed, inject, ref, toRaw} from "vue";
import {saveSettings} from "../../../utils/utils.js";
import heart from "../../../src/svg/heart.svg";
import {DateTime} from "luxon";
import UserRaidTable from "@/components/onlineSubscription/UserRaidTable.vue";
import _ from "lodash";

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

  if (!_.isEqual(user.value.characterSettings, settings.value.characterSettings)
      || !_.isEqual(user.value.characterList, settings.value.characterList)) {
    const res = await online.update(user.value._id);
    user.value = res.data;
  }
})();

let users = ref([]);
(async function () {
  const res = await online.getUsers(settings.value?.UUID || user.value?._id);
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

let localSubs = ref(settings.value.online?.subs || []);

function toggleSub(nickname) {
  const index = localSubs.value.indexOf(nickname);
  if (index === -1) {
    localSubs.value.push(nickname);
  } else {
    localSubs.value.splice(index, 1);
  }

  saveSettings({
    online: {
      subs: localSubs.value
    }
  });
}

let filter = ref('all'); // 'all' | 'subs'

const filteredUsers = computed(() =>
    filter.value === 'subs'
        ? users.value.filter(u => localSubs.value.includes(u.nickname))
        : users.value
);

let selectedUser = ref(null);

function selectUser(user) {
  selectedUser.value = user;
}

function goBack() {
  selectedUser.value = null;
}
</script>

<template>
  <div class="online-subs">
    <tooltip has-icon="true" class="title-row">
      <h1 class="title">Подписки</h1>
      <template #tooltip>Список всех доступных пользователей для подписки</template>
    </tooltip>
    <div class="group-filters">
      <div class="group-filters__list">
        <div :class="{ 'group-filters__list-item_current': filter === 'all' }" class="group-filters__list-item"
             @click="filter = 'all'">Все
        </div>
        <div :class="{ 'group-filters__list-item_current': filter === 'subs' }" class="group-filters__list-item"
             @click="filter = 'subs'">Только подписки
        </div>
      </div>
    </div>

    <div v-if="selectedUser">
      <button @click="goBack" class="button">← Назад</button>
      <UserRaidTable :user="selectedUser"/>
    </div>

    <div v-if="filteredUsers.length && !selectedUser" class="online-subs__list">
      <div v-for="_user in filteredUsers" :key="_user.nickname" class="online-subs__list-item"
           @click="selectUser(_user)">
        <span class="online-subs__list-item-nickname">{{ _user.nickname }}</span>
        <span class="online-subs__list-item-update">Последнее обновление: {{
            _user?.lastUpdateAt ? format(_user?.lastUpdateAt) : format(_user?.createdAt)
          }}</span>
        <tooltip class="online-subs__button">
          <button type="button"
                  class="button button_icon online-subs__button"
                  :class="{ 'online-subs__button_active': localSubs.includes(_user.nickname) }"
                  @click.stop="toggleSub(_user.nickname)">
            <heart class="icon heart-icon"/>
          </button>
          <template #tooltip>{{ localSubs.includes(_user.nickname) ? 'Отписаться' : 'Подписаться' }}</template>
        </tooltip>
      </div>
    </div>
    <div v-else-if="filteredUsers.length < 1" class="online-subs__list">
      Пока ещё нет доступных пользователей
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
  transition: .35s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
}

.online-subs__list-item-nickname {
  color: var(--gold);
}

.online-subs__button {
  position: absolute;
  top: 0;
  right: 0;

  .heart-icon {
    filter: grayscale(1);
    transition: .3s ease;
  }

  &_active {
    .heart-icon {
      filter: none;
    }
  }
}
</style>