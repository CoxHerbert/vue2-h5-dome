<template>
  <van-nav-bar v-bind="forwardedAttrs">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
  </van-nav-bar>
</template>

<script setup>
import { computed } from 'vue';
import { useAttrs } from 'vue';

defineOptions({ name: 'DcNavBar' });

const attrs = useAttrs();

const forwardedAttrs = computed(() => {
  const { fixed: _fixed, placeholder: _placeholder, class: className, ...rest } = attrs;

  return {
    ...rest,
    class: ['dc-nav-bar', className].filter(Boolean),
  };
});
</script>

<style scoped>
.dc-nav-bar {
  position: relative;
}
</style>
