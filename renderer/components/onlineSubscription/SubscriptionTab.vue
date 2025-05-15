<script setup>
import Tooltip from "@/components/utils/Tooltip.vue";
import OnlineModule from "../../../utils/OnlineModule.js";
import {inject, ref, toRaw} from "vue";
import {saveSettings} from "../../../utils/utils.js";
import UserRaidTable from "@/components/onlineSubscription/UserRaidTable.vue";
import _ from "lodash";
import CopyWrapper from "@/components/utils/CopyWrapper.vue";
import UserCard from "@/components/onlineSubscription/UserCard.vue";

let settings = inject('settings');

const online = new OnlineModule(settings.value.nickname, toRaw(Object.assign(settings.value.characterSettings, {characterList: settings.value.characterList})));

let user = ref({});
let inviteKey = ref("");

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

  if (!user.value.inviteKey && !settings.value.inviteKey) {
    const res = await online.resetInviteKey(user.value._id);
    user.value.inviteKey = res.data.inviteKey;
    saveSettings({inviteKey: user.value.inviteKey});
  }
})();

async function resetKey() {
  const res = await online.resetInviteKey(user.value._id);
  user.value.inviteKey = res.data.inviteKey;
  saveSettings({inviteKey: user.value.inviteKey});
}

let subs = ref([]);
(async function () {
  const res = await online.getSubscribers(settings.value?.inviteKey || user.value?.inviteKey);
  subs.value = res.data;
})();

let localSubs = ref(settings.value?.online?.subs || []);

function toggleSub(inviteKey) {
  const index = localSubs.value.indexOf(inviteKey);
  if (index === -1) {
    localSubs.value.push(inviteKey);
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
let filteredUsers = ref([]); // 'all' | 'subs'
const filterUsers = async () => {
  let subUsers = [];
  for (let inviteKey of localSubs.value) {
    let sub;
    const res = await online.getUserByInviteKey(inviteKey);

    if (res.status !== 200) {
      continue;
    }

    sub = res.data;
    subUsers.push(sub);
  }

  filteredUsers.value = filter.value === 'all'
      ? subUsers.filter(u => localSubs.value.includes(u.inviteKey))
      : subUsers;
};

await filterUsers();

let selectedUser = ref(null);

function selectUser(user) {
  selectedUser.value = user;
}

function goBack() {
  selectedUser.value = null;
}

const foundedUser = ref({});

async function searchUser(inviteKey) {
  if (inviteKey.length !== 12) {
    return;
  }

  const res = await online.getUserByInviteKey(inviteKey);
  foundedUser.value = res.data;
}
</script>

<template>
  <div class="online-subs">
    <tooltip has-icon="true" class="title-row">
      <h1 class="title">Подписки</h1>
      <template #tooltip>Список всех доступных пользователей для подписки</template>
    </tooltip>
    <div class="online-subs__row">
      <div v-if="user.inviteKey || settings.inviteKey" class="online-subs__invite-key">
        <div class="online-subs__invite-key-code">Твой код приглашения:
          <copy-wrapper>{{ user.inviteKey || settings.inviteKey }}</copy-wrapper>
        </div>
        <div class="online-subs__invite-key-button-wrapper">
          <button class="button" @click="resetKey">Сбросить код</button>
        </div>
      </div>
      <div class="online-subs__search">
        <label class="label" for="searchSub">
          Введите код другого пользователя, чтобы найти его
        </label>
        <input id="searchSub" class="input" type="search" :placeholder="user.inviteKey || settings.inviteKey"
               v-model="inviteKey"
               @input="searchUser(inviteKey)" maxlength="12" minlength="12">
      </div>
    </div>
    <div class="group-filters">
      <div class="group-filters__list">
        <div :class="{ 'group-filters__list-item_current': filter === 'all' }" class="group-filters__list-item"
             @click="filter = 'all'">Подписки
        </div>
        <div :class="{ 'group-filters__list-item_current': filter === 'subs' }" class="group-filters__list-item"
             @click="filter = 'subs'">Мои подписчики
        </div>
      </div>
    </div>

    <div v-if="selectedUser">
      <button @click="goBack" class="button">← Назад</button>
      <UserRaidTable :user="selectedUser"/>
    </div>

    <div v-if="foundedUser.hasOwnProperty('inviteKey') && filter === 'all'" class="online-subs__list">
      <user-card :user="foundedUser"
                 :is-subscribed="localSubs.includes(foundedUser.inviteKey)"
                 @select="selectUser(foundedUser)"
                 @toggle="toggleSub"
      />
    </div>
    <div v-if="!foundedUser.hasOwnProperty('inviteKey') && filteredUsers.length && !selectedUser && filter === 'all'"
         class="online-subs__list">
      <user-card v-for="_user in filteredUsers"
                 :key="_user.nickname"
                 :user="_user"
                 @click="selectUser(_user)"
                 :is-subscribed="localSubs.includes(_user.inviteKey)"
                 @toggle="toggleSub"
      />
    </div>
    <div v-else-if="subs.length && !selectedUser && filter === 'subs'" class="online-subs__list">
      <user-card v-for="_user in subs"
                 :key="_user.nickname"
                 :user="_user"
                 :is-subscribed="localSubs.includes(_user.inviteKey)"
                 @click="selectUser(_user)"
                 @toggle="toggleSub"
      />
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

.online-subs__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.online-subs__search {
  margin-bottom: 20px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: fit-content;

  .label {
    font-size: var(--font-small);
  }
}

.online-subs__invite-key {
  width: 100%;
  font-size: var(--font-very-small);
}

.online-subs__invite-key-code {
  margin-bottom: 10px;
}
</style>