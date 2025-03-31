<script setup>
import html2canvas from 'html2canvas';
import {ref} from 'vue';

const targetRef = ref(null);

async function capture() {
  const canvas = await html2canvas(targetRef.value);
  canvas.toBlob(blob => {
    const item = new ClipboardItem({'image/png': blob});
    navigator.clipboard.write([item]).then(() => {
      document.querySelector("#message").innerText = "Скриншот скопирован в буфер обмена";
    });
  });
}
</script>

<template>
  <div class="share-snippet">
    <div ref="targetRef">
      <slot />
    </div>
    <button class="button button_icon share-snippet__button tooltip" data-tooltip="Поделиться" @click="capture">✉️</button>
  </div>
</template>

<style scoped lang="scss">
.share-snippet {
  background-color: var(--black);
}

.share-snippet__button {
  margin-left: auto;
}
</style>