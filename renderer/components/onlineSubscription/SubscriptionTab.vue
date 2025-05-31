<script setup>
import Tooltip from "@/components/utils/Tooltip.vue";
import OnlineModule from "../../../utils/OnlineModule.js";
import {computed, inject, ref, toRaw, watch} from "vue";
import {saveSettings} from "../../../utils/utils.js";
import UserRaidTable from "@/components/onlineSubscription/UserRaidTable.vue";
import _ from "lodash";
import CopyWrapper from "@/components/utils/CopyWrapper.vue";
import UserCard from "@/components/onlineSubscription/UserCard.vue";
import CustomCheckbox from "@/components/utils/CustomCheckbox.vue";

let settings = inject('settings');

const onlineSettings = computed(() => {
  return toRaw(Object.assign({}, settings.value?.characterSettings, {
    characterList: settings.value?.characterList,
    online: {
      subs: settings.value?.online?.subs || [],
      isPublic: settings.value?.online?.isPublic || false
    }
  }));
});

const online = new OnlineModule(settings.value.nickname, onlineSettings.value);

let user = ref({});
let inviteKey = ref("");
const isShowLoader = inject("isShowLoader");
let localSubs = ref(settings.value?.online?.subs || []);

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

let displayedUsers = ref([]);

// Получить список моих подписок
async function getSubsUsers() {
  let subUsers = [];
  try {
    isShowLoader.value = true;
    for (let inviteKey of localSubs.value) {
      try {
        const res = await online.getUserByInviteKey(inviteKey);
        if (res.status === 200) subUsers.push(res.data);
      } catch (e) {
        console.error("User not found by InviteKey:", inviteKey, e);
      }
    }
    return subUsers;
  } finally {
    isShowLoader.value = false;
  }
}

// Получить список подписчиков
async function getSubscribersUsers() {
  try {
    isShowLoader.value = true;
    const res = await online.getSubscribers(settings.value?.inviteKey || user.value?.inviteKey);
    if (res.status === 200) return res.data;
    return [];
  } catch (e) {
    console.error("Error with getting subscribers:", e);
    return [];
  } finally {
    isShowLoader.value = false;
  }
}

// Получить список публичных профилей
async function getPublicUsersList() {
  try {
    isShowLoader.value = true;
    const res = await online.getUsers(user.value._id);
    if (res.status === 200) return res.data;
    return [];
  } catch (e) {
    console.error("Error with getting public users:", e);
    return [];
  } finally {
    isShowLoader.value = false;
  }
}

let filter = ref('all'); // 'all' | 'subs' | public
const foundedUser = ref(null);
let selectedUser = ref(null);

await getSubsUsers();

function deduplicateByNickname(users) {
  // Ключ — nickname, значение — объект пользователя с самой свежей датой
  const map = {};

  for (const user of users) {
    const prev = map[user.nickname];
    if (!prev || new Date(user.lastUpdateAt) > new Date(prev.lastUpdateAt)) {
      map[user.nickname] = user;
    }
  }

  // Вернуть массив только свежих инстансов
  return Object.values(map);
}

watch(filter, async (newFilter) => {
  if (selectedUser.value) {
    return;
  } // если открыт юзер — ничего не делаем

  isShowLoader.value = true;
  try {
    // Мои подписки
    if (newFilter === 'all') {
      displayedUsers.value = deduplicateByNickname(await getSubsUsers());
    } else if (newFilter === 'subs') {
      // Мои подписчики
      displayedUsers.value = deduplicateByNickname(await getSubscribersUsers());
    } else if (newFilter === 'public') {
      // Публичные профили
      displayedUsers.value = deduplicateByNickname(await getPublicUsersList());
    }
  } catch (e) {
    displayedUsers.value = [];
  } finally {
    isShowLoader.value = false;
  }
}, { immediate: true });

function createSubsProperty() {
  if (!settings.value.hasOwnProperty('online')) {
    settings.value.online = {};
  }

  if (!settings.value.online.hasOwnProperty('subs')) {
    settings.value.online.subs = [];
  }
}

createSubsProperty();

function toggleSub(inviteKey) {
  const index = localSubs.value.indexOf(inviteKey);
  if (index === -1) {
    localSubs.value.push(inviteKey);
  } else {
    localSubs.value.splice(index, 1);
  }

  saveSettings({
    online: {
      ...settings.value.online,
      subs: localSubs.value
    }
  });
}

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

const isPublicProfile = ref(settings.value?.online?.isPublic || false);
const isShowDiscord = ref(settings.value?.online?.isShowDiscord || false);
const isShowTelegram = ref(settings.value?.online?.isShowTelegram || false);
const telegram = ref(settings.value?.online?.telegram || "");
const discord = ref(settings.value?.online?.discord || "");

async function changePublicProfile() {
  isPublicProfile.value = !isPublicProfile.value;

  saveSettings({
    online: {
      ...settings.value.online,
      isPublic: isPublicProfile.value
    }
  });

  const res = await online.update(user.value._id);
  user.value = res.data;
}

async function changePublicDiscord() {
  isShowDiscord.value = !isShowDiscord.value;

  saveSettings({
    online: {
      ...settings.value.online,
      isShowDiscord: isShowDiscord.value
    }
  });

  const res = await online.update(user.value._id);
  user.value = res.data;
}

async function changePublicTelegram() {
  isShowTelegram.value = !isShowTelegram.value;

  saveSettings({
    online: {
      ...settings.value.online,
      isShowTelegram: isShowTelegram.value
    }
  });

  const res = await online.update(user.value._id);
  user.value = res.data;
}

async function updateTelegram() {
  if (!telegram.value) {
    return;
  }

  if (telegram.value.length < 4) {
    return;
  }

  if (telegram.value.length > 32) {
    return;
  }

  saveSettings({
    online: {
      ...settings.value.online,
      telegram: telegram.value
    }
  });

  const res = await online.update(user.value._id);
  user.value = res.data;
}

async function updateDiscord() {
  if (!discord.value) {
    return;
  }

  if (discord.value.length < 4) {
    return;
  }

  if (discord.value.length > 32) {
    return;
  }

  saveSettings({
    online: {
      ...settings.value.online,
      discord: discord.value
    }
  });

  const res = await online.update(user.value._id);
  user.value = res.data;
}

</script>

<template>
  <div class="online-subs">
    <tooltip has-icon="true" class="title-row">
      <h1 class="title">Подписки</h1>
      <template #tooltip>Список всех доступных пользователей для подписки</template>
    </tooltip>
    <div class="online-subs__row" v-if="!selectedUser">
      <div class="online-subs__row-item">
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
      <div class="online-subs__row-item">
        <div class="online-subs__setting">
          <custom-checkbox text="Отображать профиль в публичном списке профилей" @change="changePublicProfile" :checked="isPublicProfile"/>
        </div>
        <div class="online-subs__setting">
          <custom-checkbox text="Отображать Discord" @change="changePublicDiscord" :checked="isShowDiscord"/>
          <label class="custom-label">Никнейм в Discord</label>
          <input class="input" v-model="discord" @input="updateDiscord" placeholder="#abebus3213"/>
        </div>
        <div class="online-subs__setting">
          <custom-checkbox text="Отображать Telegram" @change="changePublicTelegram" :checked="isShowTelegram"/>
          <label class="custom-label">Никнейм в Telegram</label>
          <input class="input" v-model="telegram" @input="updateTelegram" placeholder="@telegram" />
        </div>
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
        <div :class="{ 'group-filters__list-item_current': filter === 'public' }" class="group-filters__list-item"
             @click="filter = 'public'">Публичные профили
        </div>
      </div>

      <div class="group-filters__search">
        <div class="group-filters__search-item">
          <label class="label" for="user-search">Поиск по нику пользователя</label>
          <input class="input" id="user-search" type="search" placeholder="Введите ник..." v-model="userNickname">
        </div>
        <div class="group-filters__search-item">
          <label class="label" for="note-search">Поиск по заметке пользователя</label>
          <input class="input" id="note-search" type="search" placeholder="Введите заметку..." v-model="userNote">
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
    <div v-else-if="displayedUsers.length && !selectedUser && !foundedUser" class="online-subs__list">
      <template v-for="_user in displayedUsers" :key="_user.nickname">
        <user-card
            :user-nickname="userNickname"
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
    <div v-else-if="!foundedUser && !displayedUsers.length && filter === 'all' && !selectedUser" class="online-subs__list">
      Ты ещё ни на кого не подписан
    </div>
    <div v-else-if="!foundedUser && !displayedUsers.length && filter === 'subs' && !selectedUser" class="online-subs__list">
      Ещё никто на тебя не подписался
    </div>
    <div v-else-if="!foundedUser && !displayedUsers.length && filter === 'public' && !selectedUser" class="online-subs__list">
      Нет публичных профилей
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

.online-subs__list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
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
  font-size: var(--font-small);
}

.online-subs__invite-key-code {
  margin-bottom: 10px;
}

.online-subs__row-item {
  font-size: var(--font-very-small);

  &:last-child {
    align-self: flex-start;
    max-width: 300px;
  }
}

.online-subs__setting {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  flex-direction: column;
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