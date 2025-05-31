<script setup>
import {computed} from 'vue';
import checkArrow from "../../../src/svg/check.svg";
import cross from "../../../src/svg/cross.svg";
import prison from "../../../src/svg/prison.svg";
import seller from "../../../src/svg/seller.svg";

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

const characterList = computed(() => {
  const all = props.user?.settings?.characterList || [];
  return all.filter(char => {
    const meta = props.user?.settings[char.name];
    return meta && !meta.delete;
  });
});
</script>

<template>
  <div class="raid-table">
    <h2 class="title">Персонажи игрока: {{ user.nickname }}</h2>
    <div class="raid-table__row" v-if="user.settings?.telegram && user.settings?.isShowTelegram">Telegram: {{ user.settings.telegram }}</div>
    <div class="raid-table__row" v-if="user.settings?.discord && user.settings?.isShowDiscord">Discord: {{ user.settings.discord }}</div>
    <table>
      <thead>
      <tr>
        <th>Ник</th>
        <th>ГС</th>
        <th>Класс</th>
        <th>Рейды и статус</th>
      </tr>
      </thead>
      <tbody class="raid-table__characters characters">
      <tr v-for="char in characterList" :key="char.name" class="characters__item">
        <td class="characters__item-name">{{ char.name }}</td>
        <td class="characters__item-gs">{{ char.gearScore }}</td>
        <td class="characters__item-class">{{ char.className }}</td>
        <td>
          <ul class="raid-table__raids">
            <li class="raid-table__raid" v-for="raid in user.settings[char.name].raids" :key="raid">
              <span class="raid-table__raid-name">{{ raid }}</span>
              <checkArrow class="raid-table__icon icon check-icon" v-if="user.settings[char.name].raidStatus?.[raid] === 'finished'"/>
              <prison class="raid-table__icon icon check-icon" v-else-if="user.settings[char.name].raidStatus?.[raid] === 'prison'"/>
              <seller class="raid-table__icon icon check-icon" v-else-if="user.settings[char.name].raidStatus?.[raid] === 'sell'"/>
              <cross class="raid-table__icon icon cross-icon" v-else/>
            </li>
          </ul>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.raid-table {
  max-width: 100%;
  overflow-x: auto;
  font-size: var(--font-small);
}

.raid-table__row {
  margin-bottom: 10px;
  color: var(--gold);
}

.title {
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 8px;
  border-bottom: 1px solid var(--grey);
  vertical-align: middle;
}

ul {
  padding-left: 0;
  margin: 0;
}

.raid-table__raid {
  display: flex;
  align-items: center;
  gap: 10px;
}

.characters__item-name {
  color: var(--gold);
  font-family: var(--font-family-decorative), serif;
  font-size: var(--font-h2);
}

.raid-table__icon {
  min-width: 28px;
}
</style>
