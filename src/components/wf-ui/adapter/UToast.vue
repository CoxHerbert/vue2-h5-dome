<template>
  <div></div>
</template>

<script setup>
import { Toast } from 'vant';

function show(options = {}) {
  const { title, type, duration = 2000 } = options;
  const mapper = {
    success: Toast.success,
    error: Toast.fail,
    warning: Toast.fail,
    loading: Toast.loading,
  };
  const handler = mapper[type] || Toast.show;
  handler({ message: title || '', duration, forbidClick: type === 'loading' });
}

defineExpose({ show });
</script>
