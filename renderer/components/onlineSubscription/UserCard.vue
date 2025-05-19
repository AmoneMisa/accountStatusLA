<script setup>
import Tooltip from '@/components/utils/Tooltip.vue';
import heart from "../../../src/svg/heart.svg";
import { DateTime } from 'luxon';

const props = defineProps({
  user: Object,
  isSubscribed: Boolean,
});

const emit = defineEmits(['select', 'toggle']);

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
  <div class="online-subs__list-item" @click="emit('select', user)">
    <span class="online-subs__list-item-nickname">{{ user.nickname }}</span>
    <span class="online-subs__list-item-update">
      Последнее обновление: {{
        user?.lastUpdateAt ? format(user?.lastUpdateAt) : format(user?.createdAt)
      }}
    </span>
    <tooltip class="online-subs__button">
      <button type="button"
              class="button button_icon online-subs__button"
              :class="{ 'online-subs__button_active': isSubscribed }"
              @click.stop="emit('toggle', user.inviteKey)">
        <heart class="icon heart-icon" />
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