<template>
  <div class="wf-upload">
    <DcUploader
      :model-value="innerValue"
      :multiple="multiple"
      :max-count="maxCount"
      :disabled="disabled"
      :accept="accept"
      :max-size-m-b="maxSizeMB"
      :placeholder="placeholder"
      :show-type-hint="showTypeHint"
      :deletable="deletable"
      :preview-base-domain="previewBaseDomain"
      :api-prefix="apiPrefix"
      :uploader="customUploader"
      @update:modelValue="handleUpdate"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import DcUploader from '@/components/dc-ui/components/Uploader/index.vue';
import request from '@/utils/http';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  column: { type: Object, default: () => ({}) },
});

const emits = defineEmits(['update:modelValue', 'change']);

const columnRef = computed(() => props.column || {});
const multiple = computed(() => columnRef.value.multiple !== false);
const maxCount = computed(() => {
  if (typeof columnRef.value.limit === 'number') return columnRef.value.limit;
  if (!multiple.value) return 1;
  return undefined;
});
const disabled = computed(() => columnRef.value.disabled === true);
const accept = computed(() => {
  if (Array.isArray(columnRef.value.accept)) return columnRef.value.accept.join(',');
  if (typeof columnRef.value.accept === 'string' && columnRef.value.accept) return columnRef.value.accept;
  if (Array.isArray(columnRef.value.fileType)) return columnRef.value.fileType.join(',');
  if (typeof columnRef.value.fileType === 'string' && columnRef.value.fileType) return columnRef.value.fileType;
  return '*/*';
});
const maxSizeMB = computed(() => {
  if (typeof columnRef.value.fileSize === 'number') return columnRef.value.fileSize;
  if (typeof columnRef.value.maxSizeMB === 'number') return columnRef.value.maxSizeMB;
  return null;
});
const placeholder = computed(() => columnRef.value.tip || columnRef.value.placeholder || '请上传文件');
const showTypeHint = computed(() => columnRef.value.showTypeHint !== false);
const deletable = computed(() => columnRef.value.deletable !== false);
const previewBaseDomain = computed(() => columnRef.value.previewBaseDomain || '');
const apiPrefix = computed(() => columnRef.value.apiPrefix || '/api');

const labelCache = new Map();

const convertModelToInner = (models) => {
  const list = Array.isArray(models) ? models : [];
  const normalized = list
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const label = item.label ?? item.name ?? '';
      const value = item.value ?? item.attachId ?? '';
      const path = item.path ?? label ?? value;
      if (value) {
        labelCache.set(String(value), { label: String(label || ''), path: String(path || value || '') });
      }
      if (!path && !value) return null;
      return { path: String(path || ''), attachId: String(value || '') };
    })
    .filter(Boolean);

  return multiple.value ? normalized : normalized[0] ?? null;
};

const innerValue = ref(multiple.value ? [] : null);
let syncingFromProps = false;

watch(
  () => props.modelValue,
  (val) => {
    syncingFromProps = true;
    innerValue.value = convertModelToInner(val);
    nextTick(() => {
      syncingFromProps = false;
    });
  },
  { immediate: true, deep: true }
);

const resolveByPath = (source, path) => {
  if (!path) return source;
  return String(path)
    .split('.')
    .reduce((acc, key) => (acc != null ? acc[key] : undefined), source);
};

const customUploader = (formData, params) => {
  const url = columnRef.value.action || '/blade-resource/oss/endpoint/put-file-attach-path';
  const method = columnRef.value.method || 'post';
  const headers = columnRef.value.headers || {};
  const extraParams = columnRef.value.params || columnRef.value.query || {};
  const extraData = columnRef.value.data || {};

  if (extraData && typeof extraData === 'object') {
    Object.entries(extraData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
  }

  const finalParams = { ...(params || {}), ...(extraParams || {}) };

  return request({
    url,
    method,
    data: formData,
    params: finalParams,
    headers,
  }).then((resp) => {
    const propsHttp = columnRef.value.propsHttp;
    if (propsHttp && resp && resp.data) {
      const rawData = resp.data;
      const target = resolveByPath(rawData, propsHttp.res || 'data');
      const pick = Array.isArray(target) ? target[0] : target;
      if (pick && typeof pick === 'object') {
        const linkKey = propsHttp.link || propsHttp.path || propsHttp.url || 'link';
        const nameKey = propsHttp.name || 'originalName';
        const valueKey = propsHttp.value || propsHttp.url || 'attachId';
        const linkVal = resolveByPath(pick, linkKey) || resolveByPath(pick, valueKey) || '';
        const nameVal = resolveByPath(pick, nameKey) || resolveByPath(pick, 'originalName') || '';
        const attachVal = resolveByPath(pick, valueKey) || resolveByPath(pick, 'attachId') || '';
        resp.data = {
          ...rawData,
          data: {
            link: linkVal,
            originalName: nameVal || linkVal,
            attachId: attachVal || linkVal,
          },
        };
      }
    }
    return resp;
  });
};

const handleUpdate = (val) => {
  innerValue.value = val;
  if (syncingFromProps) return;
  propagate();
};

const propagate = () => {
  const current = innerValue.value;
  const arr = multiple.value ? (Array.isArray(current) ? current : []) : current ? [current] : [];
  const result = arr
    .map((item) => {
      if (!item) return null;
      const attachId = item.attachId ? String(item.attachId) : '';
      const path = item.path ? String(item.path) : '';
      const cache = attachId ? labelCache.get(attachId) : null;
      const label = cache?.label || path || attachId;
      const value = attachId || path;
      if (!value) return null;
      return { label: String(label || ''), value: String(value) };
    })
    .filter(Boolean);

  emits('update:modelValue', result);
  emits('change', result);
};

const handleChange = (list) => {
  const arr = Array.isArray(list) ? list : [];
  arr.forEach((item) => {
    const attachId = item?.attachId ? String(item.attachId) : '';
    if (!attachId) return;
    const label = item?.originalName || item?.name || attachId;
    const path = item?.name || item?.link || label;
    labelCache.set(attachId, { label: String(label || ''), path: String(path || '') });
  });

  propagate();
};
</script>

<style scoped>
.wf-upload {
  width: 100%;
}
</style>
