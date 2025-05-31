<script setup>
import Tooltip from '@/components/utils/Tooltip.vue';
import heart from "../../../src/svg/heart.svg";
import save from "../../../src/svg/save.svg";
import pencil from "../../../src/svg/pencil.svg";
import cross from "../../../src/svg/cross.svg";
import {DateTime} from 'luxon';
import {computed, inject, onMounted, ref} from "vue";
import {saveSettings} from "../../../utils/utils.js";

const props = defineProps({
  user: Object,
  isSubscribed: Boolean,
  userNickname: String,
  userNote: String,
});

let settings = inject('settings');
const note = ref("");

const subNotes = ref({});

function fillSubNotes() {
  subNotes.value = settings.value?.online?.subsNotes;
}

onMounted(() => fillSubNotes());

const isEditNote = ref(false);

function saveNote(inviteKey) {
  isEditNote.value = false;

  if (note.value.length < 1) {
    return;
  }

  if (note.value.length > 24) {
    note.value = note.value.slice(0, 24);
  }

  if (!subNotes.value) {
    subNotes.value = {};
  }

  subNotes.value[inviteKey] = note.value;

  saveSettings({
    online: {
      ...settings.value.online,
      ["subsNotes"]: subNotes.value
    }
  });
}

function clearNote(inviteKey) {
  isEditNote.value = false;

  if (!subNotes.value) {
    subNotes.value = {};
  }

  subNotes.value[inviteKey] = "";

  saveSettings({
    online: {
      ...settings.value.online,
      ["subsNotes"]: subNotes.value
    }
  });
}

const emit = defineEmits(['select', 'toggle']);

function format(date) {
  const dt = typeof date === 'string'
      ? DateTime.fromISO(date)
      : DateTime.fromJSDate(date);

  return dt.isValid
      ? dt.toLocal().toFormat('HH:mm - dd.MM.yyyy')
      : 'Invalid date';
}

const isShowUser = computed(() => {
  if (props?.userNickname?.length > 0) {
    return props?.user?.nickname?.toLowerCase().includes(props?.userNickname?.toLowerCase());
  }

  if (props?.userNote?.length > 0 && subNotes.value && subNotes.value?.[props?.user?.inviteKey]) {
    return subNotes.value?.[props?.user?.inviteKey].toLowerCase().includes(props.userNote.toLowerCase())
  }

  return true;
});
</script>

<template>
  <div v-if="isShowUser && user.nickname" class="online-subs__list-item" :class="{ 'online-subs__list-item_active': isSubscribed }">
    <tooltip>
      <span class="online-subs__list-item-nickname" @click.stop="emit('select', user)">{{ user.nickname }}</span>
      <template #tooltip>Открыть карточку пользователя</template>
    </tooltip>
    <span class="online-subs__list-item-update">
      Последнее обновление: {{
        user?.lastUpdateAt ? format(user?.lastUpdateAt) : format(user?.createdAt)
      }}
    </span>
    <div class="online-subs__note">
      <div v-if="!isEditNote && subNotes && subNotes[user.inviteKey]" class="online-subs__note-row">
        {{ subNotes[user.inviteKey] }}
        <tooltip>
          <button class="button button_icon">
            <pencil class="icon pencil-icon" @click="isEditNote = true"/>
          </button>
          <template #tooltip>Редактировать заметку</template>
        </tooltip>

      </div>
      <div v-else-if="isEditNote || !subNotes?.[user.inviteKey]" class="online-subs__note-row">
        <label class="label" :for="`userNote_${user.nickname}`">Заметка:</label>
        <input class="input"
               :id="`userNote_${user.nickname}`"
               v-model="note"
               placeholder="Заметка..."
               minlength="0"
               maxlength="24">
        <button class="button button_icon" @click="saveNote(user.inviteKey)">
          <save class="icon save-icon"/>
        </button>
        <tooltip>
          <button class="button button_icon" @click="clearNote(user.inviteKey)">
            <cross class="icon cross-icon"/>
          </button>
          <template #tooltip>Удалить заметку у пользователя</template>
        </tooltip>

      </div>
    </div>
    <tooltip class="online-subs__button">
      <button type="button"
              class="button button_icon online-subs__button"
              :class="{ 'online-subs__button_active': isSubscribed }"
              @click.stop="emit('toggle', user.inviteKey)">
        <heart class="icon heart-icon"/>
      </button>
      <template #tooltip>{{ isSubscribed ? 'Отписаться' : 'Подписаться' }}</template>
    </tooltip>
  </div>
</template>

<style scoped lang="scss">
.online-subs__list-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--grey);
  box-shadow: var(--shadow);
  max-width: 300px;
  font-size: var(--font-small);
  padding: 10px;
  border-radius: 5px;
  position: relative;
  transition: .35s ease;
  cursor: pointer;
  width: -webkit-fill-available;
  flex-basis: calc((100% - 30px) / 4);
  flex-grow: 1;

  &_active {
    border-color: var(--gold);
  }

  @media screen and (max-width: 1024px){
    flex: 1 1 calc((100% - 30px) / 3);
  }

  &:hover {
    transform: scale(1.05);
  }
}

.online-subs__list-item-nickname {
  color: var(--gold);
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
  transition: ease-in .2s;

  &:hover {
    color: var(--gs);
    border-bottom-color: var(--gs);
  }
}

.online-subs__button {
  position: absolute;
  top: 0;
  right: 5px;

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

.online-subs__list-item-note {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.online-subs__note-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
}
</style>