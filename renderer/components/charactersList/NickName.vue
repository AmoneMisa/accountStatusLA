<script setup>
import Tooltip from "@/components/utils/Tooltip.vue";
import pencil from "../../../src/svg/pencil.svg";
import update from "../../../src/svg/update.svg";
import cross from "../../../src/svg/cross.svg";
import save from "../../../src/svg/save.svg";

const props = defineProps({
  isEditMode: false
})

const emit = defineEmits(['update-characters', 'edit-characters', 'save-nickname', 'edit-nickname', 'reset-characters']);

function saveNickname(newNickname) {
  if (newNickname.length < 4) {
    const message = document.getElementById("message");
    message.innerText = `Обновление загружено. Нажмите для установки.`;
    message.classList.add("active");
    setTimeout(() => document.getElementById("message").classList.remove("active"), 3500);
    return;
  }

  emit('save-nickname', newNickname);
}

const model = defineModel();

function editCharacters() {
  if (props.isEditMode.value) {
    return;
  }

  emit('edit-characters');
}
</script>

<template>
  <div class="main-header">
    <div class="nickname-block">
      <tooltip has-icon="true">
        <div id="nickname" class="nickname-block__nickname">
          <input v-show="isEditMode" type="text" id="nickname-input" placeholder="Введите ник" autofocus
                 v-model="model"/>
          <span v-show="!isEditMode" :class="{'error': !model || !model?.length}">{{ model && model.length ? `Ваш ник ${model}` : "Введите ник!" }}</span>
        </div>
        <template #tooltip>Ник необходим для загрузки твоих персонажей</template>
      </tooltip>
      <tooltip>
        <button type="button" id="edit-nickname" class="button button_icon nickname-block__button"
                v-show="!isEditMode" @click="$emit('edit-nickname')"><pencil class="icon pencil-icon"/>
        </button>
        <template #tooltip>Редактировать ник</template>
      </tooltip>
      <tooltip>
        <button id="save-nickname" class="button button_icon"
                style="display:none" v-show="isEditMode" @click="saveNickname(model)"><save class="icon save-icon" />
        </button>
        <template #tooltip>Сохранить ник</template>
      </tooltip>
    </div>
    <div id="controls" class="controls">
      <tooltip>
        <button type="button" id="update-characters" class="button button_icon update-characters"
                @click="emit('update-characters')"><update class="icon update-icon" />
        </button>
        <template #tooltip>Обновить персонажей</template>
      </tooltip>
      <tooltip>
        <button type="button" id="update-characters" class="button button_icon update-characters"
                @click="emit('reset-characters')"><cross class="icon update-icon" />
        </button>
        <template #tooltip>Сбросить прогресс у всех персонажей</template>
      </tooltip>
      <tooltip>
        <button type="button" id="edit-characters" class="button button_icon" @click="editCharacters"><pencil class="icon pencil-icon"/></button>
        <template #tooltip>Редактировать персонажей</template>
      </tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.nickname-block {
  display: flex;
  min-width: 300px;
  max-width: 80%;
  align-items: center;
}

.nickname-block__nickname {
  display: flex;
  gap: 5px;
  align-items: center;
}

.controls {
  display: flex;
  gap: 5px;
}
</style>