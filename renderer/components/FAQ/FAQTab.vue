<script setup>
const resources = [
  {
    type: "Калькулятор DPS",
    name: "LostBuilds",
    url: "https://lostbuilds.com/simul",
    language: "KR"
  },
  {
    type: "Калькулятор GS",
    name: "Zloa",
    url: "https://zloa.net/char/WideVibe",
    language: "KR"
  },
  {
    type: "Оружейка",
    name: "Lopec",
    url: "https://lopec.kr/",
    language: "KR"
  },
  {
    type: "Оружейка",
    name: "Loawa",
    url: "https://loawa.com/rank",
    language: "KR"
  },
  {
    type: "Оружейка",
    name: "Оружейная (РУ)",
    url: "https://xn--80aubmleh.xn--p1ai/Оружейная/",
    language: "RU"
  },
  {
    type: "Оружейка",
    name: "Uwuowo",
    url: "https://uwuowo.mathi.moe/",
    language: "EU"
  },
  {
    type: "Логи / DPS",
    name: "Raided.pro",
    url: "https://raided.pro/future",
    language: "EU"
  },
  {
    type: "Билды / Гайды",
    name: "Maxroll.gg",
    url: "https://maxroll.gg/lost-ark/",
    language: "EU"
  },
  {
    type: "Билды / Гайды",
    name: "LostArk Nexus",
    url: "https://www.lostark.nexus/",
    language: "EU"
  },
  {
    type: "Билды / Новости / Форум",
    name: "Inven",
    url: "https://lostark.inven.co.kr/",
    language: "KR"
  },
  {
    type: "Гайды / Библиотека",
    name: "Google Sheets (РУ)",
    url: "https://docs.google.com/spreadsheets/d/1rxkrjNIf8kgN5c0nkgQgeiqWHB6HTe8LlhH66ZYoMJs/edit#gid=1965249590",
    language: "RU"
  },
  {
    type: "Гайды",
    name: "MyGrind",
    url: "https://mygrind.ru/category/guides/lost-ark/",
    language: "RU"
  },
  {
    type: "Гайды / Видео",
    name: "Memorizer92 (YouTube)",
    url: "https://www.youtube.com/@memorizer92",
    language: "KR / EN"
  },
  {
    type: "Сообщество",
    name: "Reddit",
    url: "https://www.reddit.com/r/lostarkgame",
    language: "EN"
  },
  {
    type: "Сообщество / Discord",
    name: "Lost Ark Discord (РУ)",
    url: "https://discord.gg/lostarkru",
    language: "RU"
  },
  {
    type: "Официальный сайт",
    name: "KR официальный",
    url: "https://m-lostark.game.onstove.com/Event/DressRoom/250305",
    language: "KR"
  },
  {
    type: "Официальный сайт",
    name: "EU/NA официальный",
    url: "https://www.playlostark.com/en-us/game/releases",
    language: "EN"
  }
];

</script>

<template>
  <div class="faq">
    <div class="faq__title">Как пользоваться приложением</div>
    <div class="faq__content">
      <div class="faq__content-title">Персонажи</div>
      <div class="faq__content-text">
        <ul>
          <li>Для того, чтобы ваши персонажи подтянулись в программу, на первой странице
            необходимо ввести свой игровой ник.
          </li>
          <li>Спустя некоторое время твои персонажи будут загружены и ты сможешь их базово настроить.</li>
          <li>Если ты хочешь скрыть какого-то персонажа из списка, нажми на крестик.</li>
          <li>После сохранения статусов персонажей, ты сможешь задать им активности, нажав по плюсику в плашке каждого
            персонажа.
          </li>
          <li>Ты можешь вести одновременно несколько аккаунтов в одной сессии.</li>
          <li>Ты можешь менять порядок персонажей при помощи drag & drop.</li>
          <li>Персонажи, которые были скрыты на первой странице, не будут отображаться на остальных страницах - кубах,
            расчётах золота.
          </li>
          <li>В случае если при смене ника ваши персонажи не подгрузились, пожалуйста, нажмите на кнопку справа в углу -
            две
            стрелочки, это запустит загрузку заново. Прерывать загрузку как-либо настоятельно не рекомендуется.
          </li>

          <li>Чтобы снова настроить своих персонажей, нажмите на иконку карандаша справа в углу.</li>
        </ul>
      </div>
      <div class="faq__content-title">Кубы</div>
      <div class="faq__content-text">
        <ul>
          <li>Страница для отслеживания количества кубов у каждого персонажа.</li>
          <li>Чтобы скрыть
            ненужные колонку, сними галочку с чекбокса, соответствующего названию колонки
          </li>
        </ul>
      </div>
      <div class="faq__content-title">Чек-лист</div>
      <div class="faq__content-text">
        <ul>
          <li>Страница для отслеживания своих дел</li>
        </ul>
      </div>
      <div class="faq__content-title">Подсчёт золота с рейдов</div>
      <div class="faq__content-text">
        <ul>
          <li>Здесь отображаются все не скрытые персонажи и те, которые прошли хоть один рейд</li>
          <li>Ты можешь установить галочку на каждой фазе, что сундук куплен и его стоимость будет учтена в общем
            расчёте
            полученного золота
          </li>
          <li>Чтобы исключить персонажа из расчёта золота, нажми на крестик на ячейке персонажа</li>
        </ul>
      </div>
      <div class="faq__content-title">Уведомления</div>
      <div class="faq__content-text">
        <ul>
          <li>Ты можешь создать собственные уведомления, которые будут приходить в центр уведомлений Windows</li>
          <li>Можно выбрать один или несколько дней и задать им частоту.</li>
          <li>Можно включать и отключать показ уведомления.</li>
        </ul>
      </div>
    </div>
    <div class="faq__title">Полезные ссылки</div>
    <div class="faq__useful-links useful-links">
      <div class="useful-links__header">
        <div class="useful-links__col useful-links__col_type">Тип гайда</div>
        <div class="useful-links__col useful-links__col_name">Название</div>
        <div class="useful-links__col useful-links__col_link">Ссылка</div>
        <div class="useful-links__col useful-links__col_lang">Язык</div>
      </div>
      <div
          class="useful-links__row"
          v-for="(resource, index) in resources"
          :key="index"
      >
        <div class="useful-links__col useful-links__col_type">{{ resource.type }}</div>
        <div class="useful-links__col useful-links__col_name">{{ resource.name }}</div>
        <div class="useful-links__col useful-links__col_link">
          <a :href="resource.url" target="_blank">{{ resource.url }}</a>
        </div>
        <div class="useful-links__col useful-links__col_lang">{{ resource.language }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.faq {
  padding-top: 10px;
}

.faq__title {
  font-size: var(--font-h2);
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
  color: var(--gold);
}

.faq__content {
  margin-bottom: 40px;
  border-bottom: 2px solid var(--grey);
}

.useful-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--font-small);
  border-left: 1px solid var(--grey);
  border-right: 1px solid var(--grey);
  border-radius: 4px;
}

.useful-links__header,
.useful-links__row {
  display: flex;
  background-color: var(--black);
  padding: 6px 10px;
}

.useful-links__row {
  border-bottom: 1px solid var(--grey);

  &:last-child {
    border-radius: 4px;
  }
}

.useful-links__header {
  background-color: var(--middle-grey);
  font-weight: bold;
  color: var(--white);
  border-radius: 5px;
}

.useful-links__col {
  flex: 1;
  padding: 4px;
  word-break: break-word;

  &_type {
    flex: 1.2;
  }

  &_name {
    flex: 1.5;
  }

  &_link {
    flex: 3;
  }

  &_lang {
    flex: 0.5;
    text-align: right;
  }

  a {
    color: var(--support);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.faq__content-title {
  font-size: var(--font-h2);
  margin-bottom: 10px;
  font-weight: bold;
}

.faq__content-text {
  font-size: var(--font-small);
  margin-bottom: 20px;

  &:not(:last-child) {
    border-bottom: 1px solid var(--grey);
  }

  li {
    margin-bottom: 5px;
  }
}
</style>