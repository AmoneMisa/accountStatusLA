<script setup>
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
    <slot/>
  </div>
</template>

<style scoped lang="scss">
.copy-wrapper {
  display: inline-block;
  text-shadow: var(--shadow);
  color: var(--gold);
  cursor: copy;
}
</style>