<script setup>
import copy from "../../../src/svg/copy.svg";
import Tooltip from "@/components/utils/Tooltip.vue";

function copyToClipboard(el) {
  const text = el.target?.innerText?.trim()
  if (text) {
    navigator.clipboard.writeText(text);
    document.getElementById("message").innerText = "Текст скопирован";
    document.getElementById("message").classList.add("active");
    setTimeout(() => document.getElementById("message").classList.remove("active"), 1500);
  }
}
</script>

<template>
  <div @click="copyToClipboard" class="copy-wrapper">
    <slot/> <tooltip><copy class="icon copy-icon" /> <template #tooltip>Скопировать</template></tooltip>
  </div>
</template>

<style scoped lang="scss">
.copy-wrapper {
  display: inline-flex;
  text-shadow: var(--shadow);
  color: var(--gold);
  cursor: copy;
  align-items: center;
  transition: color .2s ease-in;

  &:hover {
    color: var(--gs);
  }
}

.copy-icon {
  margin-left: 5px;
  max-width: 14px;
}
</style>