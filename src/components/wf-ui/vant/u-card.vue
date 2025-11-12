<template>
  <div class="u-card">
    <div class="u-card__body">
      <slot />
    </div>
    <template v-if="$slots.foot">
      <div class="u-card__footer">
        <slot name="foot" />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'u-card',
};
</script>

<style scoped>
.u-card {
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.u-card__body {
  padding: 16px;
}

.u-card__footer {
  border-top: 1px solid #f2f2f2;
  padding: 12px 16px;
}
</style>
