<script setup>
import {ref, computed, onMounted, inject} from "vue";
import { DateTime } from "luxon";
import CalendarDayPopup from "./CalendarPopup.vue";
import { saveSettings } from "../../../utils/utils.js";

const now = DateTime.now();
const selectedMonth = ref(now.month);
const selectedYear = ref(now.year);
const daysInMonth = ref([]);
const showPopup = ref(false);
const selectedDate = ref(null);


let settings = inject('settings');
const currentMonthKey = computed(() => `${selectedYear.value}-${selectedMonth.value}`);
const calendarData = ref(settings.value.calendar || {});

// Генерация дней месяца
function generateCalendar() {
  const startOfMonth = DateTime.local(selectedYear.value, selectedMonth.value, 1);
  const endOfMonth = startOfMonth.endOf('month');
  const days = [];

  for (let day = 1; day <= endOfMonth.day; day++) {
    const date = DateTime.local(selectedYear.value, selectedMonth.value, day);
    days.push(date);
  }

  daysInMonth.value = days;
}

onMounted(() => {
  generateCalendar();
});

// Подсчёт золота за день
function getGoldSumForDay(dateKey) {
  const dayData = calendarData.value?.[currentMonthKey.value]?.[dateKey];
  if (!dayData) return 0;

  return Object.entries(dayData).reduce((sum, [gift, count]) => {
    return sum + Number(gift) * count;
  }, 0);
}

function openPopup(date) {
  selectedDate.value = date.toFormat("yyyy-MM-dd");
  showPopup.value = true;
}

function saveDayGifts(data) {
  const monthKey = currentMonthKey.value;
  if (!calendarData.value[monthKey]) {
    calendarData.value[monthKey] = {};
  }
  calendarData.value[monthKey][selectedDate.value] = data;
  saveSettings({ calendar: calendarData.value });
  showPopup.value = false;
}

const giftTypes = [1500, 3000, 10000, 20000, 50000, 100000, 200000];

function calculateMonthlyGifts() {
  const currentMonth = DateTime.now().toFormat('yyyy-MM');
  const giftsCount = {};
  let totalGold = 0;

  giftTypes.forEach(val => giftsCount[val] = 0);

  for (const [date, gifts] of Object.entries(calendarData)) {
    if (date.startsWith(currentMonth)) {
      for (const [giftValue, count] of Object.entries(gifts)) {
        const val = parseInt(giftValue);
        if (giftTypes.includes(val)) {
          giftsCount[val] += count;
          totalGold += val * count;
        }
      }
    }
  }

  return { totalGold, giftsCount };
}
</script>

<template>
  <div class="calendar">
    <div class="calendar__grid">
      <div
          class="calendar__day"
          v-for="day in daysInMonth"
          :key="day.toISODate()"
          @click="openPopup(day)"
      >
        <div class="calendar__day-number">{{ day.day }}</div>
        <div class="calendar__gold-tooltip">
          {{ getGoldSumForDay(day.toFormat("yyyy-MM-dd")) }} золота
        </div>
      </div>
    </div>
    <div class="calendar__total">
      <span class="calendar__total-gifts" v-for="[key, value] in Object.entries(calculateMonthlyGifts().giftsCount)">{{ key }} x {{ value }}</span>
      <span class="calendar__total-gold" >Всего золота: {{ calculateMonthlyGifts().totalGold }}</span>
    </div>

    <calendar-day-popup
        v-if="showPopup"
        :date="selectedDate"
        :gifts="calendarData?.[currentMonthKey]?.[selectedDate] || {}"
        @close="showPopup = false"
        @save="saveDayGifts"
    />
  </div>
</template>

<style scoped lang="scss">
.calendar {
  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }

  &__day {
    border: 1px solid var(--grey);
    padding: 8px;
    position: relative;
    cursor: pointer;
    background: var(--black);
    color: var(--white);
    border-radius: 5px;
    text-align: end;

    &:hover .calendar__gold-tooltip {
      display: block;
    }
  }

  &__day-number {
    font-weight: bold;
  }

  &__gold-tooltip {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    background: var(--light-grey);
    padding: 4px;
    font-size: 12px;
    border-radius: 4px;
  }
}

.calendar__total {
  margin-top: 20px;
  text-align: right;
}

.calendar__total-gifts {
  margin-right: 10px;
  font-size: 13px;
}

.calendar__total-gold {
  font-size: 14px;
  font-weight: bold;
}
</style>
