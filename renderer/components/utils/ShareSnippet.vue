<script setup>
import html2canvas from 'html2canvas';
import {ref} from 'vue';
import Tooltip from "@/components/utils/Tooltip.vue";
import share from "../../../public/assets/svg/share.svg"
const targetRef = ref(null);

async function capture() {
  const canvas = await html2canvas(targetRef.value, {backgroundColor: "#000000"});
  canvas.toBlob(blob => {
    const item = new ClipboardItem({'image/png': blob});
    navigator.clipboard.write([item]).then(() => {
      document.querySelector("#message").innerText = "Скриншот скопирован в буфер обмена";
      document.querySelector("#message").classList.add("active");
      setTimeout(() => document.getElementById("message").classList.remove("active"), 3500);
    });
  });
}
</script>

<template>
  <div class="share-snippet">
    <div ref="targetRef">
      <slot/>
    </div>
    <tooltip>
      <button class="button button_icon share-snippet__button" @click="capture"><share class="icon share-icon" /></button>
      <template #tooltip>Поделиться</template>
    </tooltip>
  </div>
</template>

<style scoped lang="scss">
.share-snippet__button {
  margin-left: auto;
  margin-top: 10px;
}
</style>