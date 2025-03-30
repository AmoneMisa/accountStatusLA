<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  date: String,
  gifts: Object
});

const emit = defineEmits(['close', 'save']);
const giftTypes = [1500, 3000, 10000, 20000, 50000, 100000, 200000];

const localGifts = ref({});

onMounted(() => {
  localGifts.value = { ...props.gifts };
});

function save() {
  emit("save", localGifts.value);
}

</script>

<template>
  <div class="popup">
    <div class="popup__content">
    <div>Подарки за {{ date }}</div>
    <div v-for="gift in giftTypes" :key="gift" class="popup__gift">
      <label class="popup__label">{{ gift }} золота:</label>
      <input type="number" min="0" v-model.number="localGifts[gift]" />
    </div>
    <button class="button" @click="save">Сохранить</button>
    <button class="button" @click="$emit('close')">Отмена</button>
  </div>
  </div>
</template>

<style scoped lang="scss">
.popup {
  max-height: fit-content;
  height: fit-content;
}

.popup__gift {
  display: flex;
  justify-content: space-between;
}

.popup__label {
  font-size: 14px;
  margin-right: 5px;
}
</style>
