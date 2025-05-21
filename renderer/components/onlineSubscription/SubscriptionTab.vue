<script setup>
import Tooltip from "@/components/utils/Tooltip.vue";
import OnlineModule from "../../../utils/OnlineModule.js";
import {computed, inject, ref, toRaw} from "vue";
import {saveSettings} from "../../../utils/utils.js";
import UserRaidTable from "@/components/onlineSubscription/UserRaidTable.vue";
import _ from "lodash";
import CopyWrapper from "@/components/utils/CopyWrapper.vue";
import UserCard from "@/components/onlineSubscription/UserCard.vue";

let settings = inject('settings');

const onlineSettings = computed(() => {
  return toRaw(Object.assign({}, settings.value?.characterSettings, {
    characterList: settings.value?.characterList,
    online: {
      subs: settings.value?.online?.subs || []
    }
  }));
});

const online = new OnlineModule(settings.value.nickname, onlineSettings.value);

let user = ref({});
let inviteKey = ref("");
const isShowLoader = inject("isShowLoader");

async function getUser() {
  isShowLoader.value = true;

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

  const userCharacterSettingsKeys = Object.keys(user.value.settings).filter(key => {
    return key !== "online";
  });
  const userCharacterSettingsObj = {};

  for (const userSettingsKey of userCharacterSettingsKeys) {
    userCharacterSettingsObj[userSettingsKey] = toRaw(user.value.settings[userSettingsKey]);
  }

  if (!_.isEqual(userCharacterSettingsObj, toRaw(settings.value?.characterSettings))
      || !_.isEqual(user.value?.settings?.online?.subs, settings.value?.online?.subs)) {
    const res = await online.update(user.value._id);
    user.value = res.data;
  }

  if (!user.value.inviteKey && !settings.value.inviteKey) {
    const res = await online.resetInviteKey(user.value._id);
    user.value.inviteKey = res.data.inviteKey;
    saveSettings({inviteKey: user.value.inviteKey});
  }

  isShowLoader.value = false;
}

await getUser();

async function resetKey() {
  isShowLoader.value = true;

  const res = await online.resetInviteKey(user.value._id);
  user.value.inviteKey = res.data.inviteKey;
  saveSettings({inviteKey: user.value.inviteKey});

  isShowLoader.value = false;
}

let subs = ref([]);
(async function () {
  try {
    isShowLoader.value = true;
    const res = await online.getSubscribers(settings.value?.inviteKey || user.value?.inviteKey);
    subs.value = res.data;
    isShowLoader.value = false;
  } catch (e) {
    console.error("Error with getting subscribers for inviteKey:", inviteKey, e);
  }
})();

function createSubsProperty() {
  if (!settings.value.hasOwnProperty('online')) {
    settings.value.online = {};
  }

  if (!settings.value.online.hasOwnProperty('subs')) {
    settings.value.online.subs = [];
  }
}

createSubsProperty();

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
const foundedUser = ref(null);

const filterUsers = async () => {
  isShowLoader.value = true;

  let subUsers = [];
  for (let inviteKey of localSubs.value) {
    let sub;

    try {
      const res = await online.getUserByInviteKey(inviteKey);

      if (res.status !== 200) {
        continue;
      }

      sub = res.data;
      subUsers.push(sub);
    } catch (e) {
      console.error("User not found by InviteKey:", inviteKey, e);
    }
  }

  filteredUsers.value = filter.value === 'all'
      ? subUsers.filter(u => localSubs.value.includes(u.inviteKey))
      : subUsers;

  isShowLoader.value = false;
};

await filterUsers();

let selectedUser = ref(null);

async function selectUser(user) {
  isShowLoader.value = true;
  const res = await online.getUser(user._id);
  selectedUser.value = res.data;
  isShowLoader.value = false;
}

function goBack() {
  selectedUser.value = null;
}

async function searchUser(inviteKey) {
  if (inviteKey.length !== 12) {
    foundedUser.value = null;

    return;
  }

  try {
    isShowLoader.value = true;
    const res = await online.getUserByInviteKey(inviteKey);
    foundedUser.value = res.data;
    isShowLoader.value = false;
  } catch (e) {
    console.error("User not found by InviteKey:", inviteKey, e);
  }
}

const userNickname = ref("");
const userNote = ref("");

</script>

<template>
  <div class="online-subs">
    <tooltip has-icon="true" class="title-row">
      <h1 class="title">Подписки</h1>
      <template #tooltip>Список всех доступных пользователей для подписки</template>
    </tooltip>
    <div class="online-subs__row" v-if="!selectedUser">
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
    <div class="group-filters" v-if="!selectedUser">
      <div class="group-filters__list">
        <div :class="{ 'group-filters__list-item_current': filter === 'all' }" class="group-filters__list-item"
             @click="filter = 'all'">Подписки
        </div>
        <div :class="{ 'group-filters__list-item_current': filter === 'subs' }" class="group-filters__list-item"
             @click="filter = 'subs'">Мои подписчики
        </div>
      </div>

      <div class="group-filters__search">
        <div class="group-filters__search-item">
          <label class="label" for="user-search">Поиск по нику пользователя</label>
          <input class="input" id="user-search" type="search" placeholder="Введите ник..." v-model="userNickname">
        </div>
        <div class="group-filters__search-item">
          <label class="label" for="note-search">Поиск по заметке пользователя</label>
          <input class="input" id="note-search" type="search" placeholder="Введите заметку..."  v-model="userNote">
        </div>
      </div>
    </div>

    <div v-if="selectedUser">
      <button @click="goBack" class="button">← Назад</button>
      <UserRaidTable :user="selectedUser"/>
    </div>

    <div v-if="!foundedUser && inviteKey.length" class="online-subs__list">
      Пользователь не найден
    </div>
    <div v-else-if="!foundedUser && filteredUsers.length && !selectedUser && filter === 'all'"
         class="online-subs__list">
      <template v-for="_user in filteredUsers"
                :key="_user.nickname">
        <user-card :user-nickname="userNickname"
                   :user-note="userNote"
                   :user="_user"
                   @select="selectUser(_user)"
                   :is-subscribed="localSubs.includes(_user.inviteKey)"
                   @toggle="toggleSub"
        />
      </template>
    </div>
    <div v-else-if="subs.length && !selectedUser && filter === 'subs'" class="online-subs__list">
      <template v-for="_user in subs"
                :key="_user.nickname">
        <user-card :user-nickname="userNickname"
                   :user-note="userNote"
                   :user="_user"
                   @select="selectUser(_user)"
                   :is-subscribed="localSubs.includes(_user.inviteKey)"
                   @toggle="toggleSub"
        />
      </template>
    </div>
    <div v-else-if="foundedUser && filter === 'all'" class="online-subs__list">
      <user-card :user="foundedUser"
                 :is-subscribed="localSubs.includes(foundedUser.inviteKey)"
                 @select="selectUser(foundedUser)"
                 @toggle="toggleSub"
      />
    </div>
    <div v-else-if="!foundedUser && !filteredUsers.length && filter === 'all' && !selectedUser " class="online-subs__list">
      Ты ещё ни на кого не подписан
    </div>
    <div v-else-if="!foundedUser && !subs.length && filter === 'subs' && !selectedUser " class="online-subs__list">
      Ещё никто на тебя не подписался
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
  flex-wrap: wrap;
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

.group-filters__search {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--font-very-small);
  margin-top: 10px;
  justify-self: left;
  flex-wrap: wrap;
}

.group-filters__search-item {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 10px;
}

.group-filters {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--grey);
  padding-right: 0;
  padding-left: 0;
}
</style>