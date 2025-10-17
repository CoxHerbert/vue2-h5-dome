<template>
  <div class="page">
    <ScrollAwareNavBar :title="t('routes.home')" fixed />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
<style lang="scss" scoped></style>
