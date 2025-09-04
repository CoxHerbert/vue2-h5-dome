<template>
  <div class="dc-uploader">
    <!-- Vant 上传器（限制在选择前做） -->
    <van-uploader
      v-model:file-list="fileList"
      :accept="acceptStr"
      :multiple="multiple"
      :max-count="maxCount"
      :disabled="disabled"
      :preview-full-image="false"
      :before-read="handleBeforeRead"
      :after-read="handleAfterRead"
      :result-type="'file'"
      :deletable="deletable && !disabled"
      @delete="onDelete"
    />

    <!-- 顶部说明行：占位文案 + 支持类型 -->
    <div class="dc-uploader__header">
      <div v-if="placeholder && fileUrls.length === 0" class="placeholder">
        {{ placeholder }}
      </div>
      <div v-if="showTypeHint && acceptDisplay" class="type-hint">
        支持：{{ acceptDisplay }} <span v-if="maxSizeMB">，单文件 ≤ {{ maxSizeMB }}MB</span>
        <span v-if="maxCount && maxCount !== Infinity">，最多 {{ maxCount }} 个</span>
      </div>
    </div>

    <!-- 文件列表（通用展示：图片/非图片都支持） -->
    <van-cell-group v-if="fileUrls.length" inset class="dc-uploader__list">
      <van-cell v-for="(u, i) in fileUrls" :key="u + '_' + i" :title="fileName(u)" :label="u">
        <template #icon>
          <van-icon :name="isImageUrl(u) ? 'photo-o' : 'description'" class="mr8" />
        </template>
        <template #right-icon>
          <van-icon v-if="deletable && !disabled" name="delete-o" @click.stop="removeAt(i)" />
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { showToast } from 'vant';

/**
 * Props
 * - v-model 为逗号分隔字符串（如 "a.jpg,b.pdf"）
 */
const props = defineProps({
  modelValue: { type: String, default: '' }, // 逗号分隔的 URL 串
  multiple: { type: Boolean, default: true },
  maxCount: { type: Number, default: Infinity },
  disabled: { type: Boolean, default: false },

  // 可传字符串或字符串数组。示例：'.png,.jpg,.jpeg,application/pdf' 或 ['.png','.jpg','image/*']
  accept: { type: [String, Array], default: () => ['image/*'] },

  // 单文件最大尺寸（MB）。不传则不限制
  maxSizeMB: { type: Number, default: null },

  // 上传函数： (file: File) => Promise<string> ，需返回文件可访问的 URL
  uploader: { type: Function, required: true },

  // 展示
  placeholder: { type: String, default: '请上传文件' },
  showTypeHint: { type: Boolean, default: true },
  uploadText: { type: String, default: '' }, // 不传则用 placeholder
  deletable: { type: Boolean, default: true },

  // 模型分隔符
  separator: { type: String, default: ',' },
});

const emits = defineEmits(['update:modelValue', 'change']);

/** —— 内部状态 —— **/
const fileUrls = ref([]); // 纯 URL 数组
const fileList = ref([]); // Vant Uploader 文件列表 [{url, status, message}...]

/** —— accept 规范化 —— **/
const acceptStr = computed(() => {
  if (Array.isArray(props.accept)) return props.accept.join(',');
  return props.accept || '';
});

const acceptDisplay = computed(() => {
  // 仅做可读性展示：去空格
  return acceptStr.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('、');
});

/** —— 工具函数 —— **/
const parseModel = (val) =>
  (val || '')
    .split(props.separator)
    .map((s) => s.trim())
    .filter(Boolean);

const stringifyModel = (arr) => (arr || []).filter(Boolean).join(props.separator);

const extname = (nameOrUrl = '') => {
  const qIdx = nameOrUrl.indexOf('?');
  const clean = qIdx >= 0 ? nameOrUrl.slice(0, qIdx) : nameOrUrl;
  const i = clean.lastIndexOf('.');
  return i >= 0 ? clean.slice(i).toLowerCase() : '';
};

const isImageUrl = (url = '') => {
  const ex = extname(url);
  return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'].includes(ex);
};

const fileName = (url = '') => {
  const qIdx = url.indexOf('?');
  const clean = qIdx >= 0 ? url.slice(0, qIdx) : url;
  const i = clean.lastIndexOf('/');
  return i >= 0 ? clean.slice(i + 1) : clean;
};

/** —— 接受类型匹配 —— **/
const normalizeAcceptItems = computed(() =>
  acceptStr.value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

const matchAccept = (file) => {
  if (!normalizeAcceptItems.value.length) return true;
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  const ex = extname(name);

  // 任意一个匹配即可
  return normalizeAcceptItems.value.some((rule) => {
    if (rule === '*/*') return true;
    if (rule.endsWith('/*')) {
      // 形如 image/* 、video/*
      const prefix = rule.slice(0, rule.indexOf('/*'));
      return type.startsWith(prefix + '/');
    }
    if (rule.startsWith('.')) {
      // 扩展名 .png
      return ex === rule;
    }
    // 具体 mime 类型
    return type === rule;
  });
};

/** —— 模型与 fileList 双向同步 —— **/
const syncFromModel = () => {
  const urls = parseModel(props.modelValue);
  fileUrls.value = urls;
  fileList.value = urls.map((u) => ({
    url: u,
    isImage: isImageUrl(u),
    status: 'done',
  }));
};

const syncToModel = () => {
  const joined = stringifyModel(fileUrls.value);
  emits('update:modelValue', joined);
  emits('change', joined);
};

watch(() => props.modelValue, syncFromModel, { immediate: true });

/** —— 删除 —— **/
const removeAt = (index) => {
  fileUrls.value.splice(index, 1);
  fileList.value.splice(index, 1);
  syncToModel();
};

const onDelete = (item) => {
  const idx = fileList.value.findIndex((x) => x === item);
  if (idx >= 0) removeAt(idx);
};

/** —— 选择前校验（类型 / 大小 / 数量） —— **/
const handleBeforeRead = (fileOrFiles) => {
  const arr = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
  // 数量
  if (props.maxCount !== Infinity && fileUrls.value.length + arr.length > props.maxCount) {
    showToast(`最多上传 ${props.maxCount} 个文件`);
    return false;
  }
  // 类型/大小
  for (const it of arr) {
    const f = it instanceof File ? it : it.file;
    if (!matchAccept(f)) {
      showToast('文件类型不支持');
      return false;
    }
    if (props.maxSizeMB && f.size > props.maxSizeMB * 1024 * 1024) {
      showToast(`单文件不能超过 ${props.maxSizeMB}MB`);
      return false;
    }
  }
  return true;
};

/** —— 选择后上传 —— **/
const handleAfterRead = async (fileOrFiles) => {
  const items = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

  for (const it of items) {
    // Vant 的对象形态：{ file: File, status, message, content }
    const file = it.file || it;
    it.status = 'uploading';
    it.message = '上传中...';
    try {
      const url = await props.uploader(file);
      if (!url) throw new Error('上传接口未返回 URL');
      it.status = 'done';
      it.url = url;

      // 维护我们的 URL 列表
      fileUrls.value.push(url);
    } catch (e) {
      it.status = 'failed';
      it.message = '上传失败';
      showToast(e?.message || '上传失败');
    }
  }
  syncToModel();
};
</script>

<style lang="scss" scoped>
.dc-uploader {
  display: flex;
  flex-direction: column;
}
.dc-uploader__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
}
.placeholder {
  color: var(--van-gray-6);
}
.type-hint {
  color: var(--van-gray-6);
  font-size: 12px;
}
.dc-uploader__list {
  :deep(.van-cell__title) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  :deep(.van-cell) {
    display: flex;
    align-items: center;
    padding: 0;
  }
}
.mr8 {
  margin-right: 8px;
}
</style>
