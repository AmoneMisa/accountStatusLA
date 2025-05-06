<script setup>
import {nextTick, onBeforeUnmount, onMounted, ref} from 'vue';
import info from "../../../src/svg/info.svg";

defineProps({
  hasIcon: false
})

const show = ref(false);
const wrapper = ref(null);
const tooltip = ref(null);
const positionStyle = ref({});

function updatePosition() {
  const wrapperEl = wrapper.value;
  const tooltipEl = tooltip.value;
  if (!wrapperEl || !tooltipEl) return;

  const rect = wrapperEl.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();

  let top = rect.top - tooltipRect.height - 6;
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

  if (left < 4) {
    left = 4;
  }

  const rightEdge = left + tooltipRect.width;
  if (rightEdge > window.innerWidth - 4) {
    left = window.innerWidth - tooltipRect.width - 4;
  }

  if (top < 4) {
    top = rect.bottom + 6;
  }

  positionStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
}

function onShow() {
  show.value = true;
  nextTick(updatePosition);
}

function onHide() {
  show.value = false;
}

onMounted(() => {
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
});
</script>

<template>
  <span
      ref="wrapper"
      class="tooltip-wrapper"
      @mouseenter="onShow"
      @mouseleave="onHide"
  >
    <span v-if="hasIcon" class="tooltip-icon">
      <info class="icon" />
    </span>
    <slot />
    <teleport to="body">
      <div
          v-if="show"
          ref="tooltip"
          class="tooltip-content"
          :style="positionStyle"
      >
        <slot name="tooltip" />
      </div>
    </teleport>
  </span>
</template>

<style scoped lang="scss">
.tooltip-wrapper {
  display: flex;
  position: relative;
}

.tooltip-content {
  position: fixed;
  z-index: 1000;
  background: var(--black);
  color: var(--white);
  font-size: var(--font-tiny);
  padding: 6px 10px;
  border-radius: 4px;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  word-break: break-word;
  white-space: break-spaces;
}

.tooltip-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  cursor: pointer;
  color: var(--light-grey);
  margin-right: 3px;
}
</style>