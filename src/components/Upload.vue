<template>
  <div class="app-uploader">
    <van-uploader
      :after-read="onAfterRead"
      :max-count="maxCount"
      :multiple="multiple"
      :disabled="disabled"
      :accept="accept"
    />
    <div v-if="progress > 0 && progress < 100">上传中：{{ progress }}%</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { apiUpload } from '../apis/example';
const props = defineProps({
  multiple: { type: Boolean, default: true },
  maxCount: { type: Number, default: 5 },
  accept: { type: String, default: '*' },
  disabled: { type: Boolean, default: false },
});
const progress = ref(0);

async function onAfterRead(file) {
  const fd = new FormData();
  // 兼容多文件/单文件
  const files = Array.isArray(file) ? file.map((i) => i.file) : [file.file];
  files.forEach((f) => fd.append('files', f));
  await apiUpload(fd, (e) => {
    if (e.total) progress.value = Math.round((e.loaded / e.total) * 100);
  });
}
</script>

<style scoped>
.app-uploader {
  padding: 12px;
}
</style>
