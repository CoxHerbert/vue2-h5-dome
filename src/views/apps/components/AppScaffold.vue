<template>
  <div class="page">
    <ScrollAwareNavBar :title="title" fixed />
    <section class="app-scaffold">
      <img v-if="icon" :src="icon" :alt="title" class="app-scaffold__icon" />
      <h1 class="app-scaffold__title">{{ title }}</h1>
      <p class="app-scaffold__description">
        <slot>{{ description }}</slot>
      </p>
    </section>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  description: {
    type: String,
    default: '功能正在规划中，敬请期待。',
  },
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100%;
  padding: 56px 16px 32px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f7f8fa 0%, #ffffff 60%);
}

.app-scaffold {
  margin-top: 24px;
  padding: 32px 24px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.app-scaffold__icon {
  width: 72px;
  height: 72px;
}

.app-scaffold__title {
  margin: 0;
  font-size: 20px;
  color: #111827;
}

.app-scaffold__description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
}
</style>
