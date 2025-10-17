<template>
  <div class="u-card" :style="{ margin }">
    <div class="u-card__head" :style="headStyle">
      <slot name="head"></slot>
    </div>
    <div class="u-card__body" :style="bodyStyle">
      <slot name="body"></slot>
    </div>
    <div v-if="hasFoot" class="u-card__foot" :style="footStyle">
      <slot name="foot"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';

const { headStyle, bodyStyle, footStyle, margin } = defineProps({
  headStyle: {
    type: Object,
    default: () => ({}),
  },
  bodyStyle: {
    type: Object,
    default: () => ({}),
  },
  footStyle: {
    type: Object,
    default: () => ({}),
  },
  margin: {
    type: String,
    default: '0',
  },
});

const slots = useSlots();
const hasFoot = computed(() => Boolean(slots.foot));
</script>

<style scoped>
.u-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.u-card__head,
.u-card__body,
.u-card__foot {
  padding: 16px;
}
</style>
