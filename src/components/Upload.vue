<!-- src/components/DcUploader.vue -->
<template>
  <div class="dc-uploader">
    <!-- 选择前限制 -->
    <van-uploader
      v-model:file-list="fileList"
      :accept="acceptStr"
      :multiple="multiple"
      :max-count="maxCountAttr"
      :disabled="disabled"
      :preview-full-image="false"
      :before-read="handleBeforeRead"
      :after-read="handleAfterRead"
      result-type="file"
      :deletable="deletable && !disabled"
      upload-icon="description"
      @delete="onDelete"
    />

    <!-- 顶部说明 -->
    <div class="dc-uploader__header">
      <div v-if="placeholder && filePaths.length === 0" class="placeholder">
        {{ placeholder }}
      </div>
      <div v-if="showTypeHint && acceptDisplay" class="type-hint">
        支持：{{ acceptDisplay }}
        <span v-if="maxSizeMB">，单文件 ≤ {{ maxSizeMB }}MB</span>
        <span v-if="maxCount && maxCount !== Infinity">，最多 {{ maxCount }} 个</span>
      </div>
    </div>

    <!-- 列表（通用展示） -->
    <van-cell-group v-if="fileObjs.length" inset class="dc-uploader__list">
      {{ fileObjs }}
      <van-cell
        v-for="(obj, i) in fileObjs"
        :key="(obj.attachId || obj.link || obj.name || '') + '_' + i"
        :title="displayName(obj)"
        :label="obj.name"
      >
        <template #icon>
          <van-icon :name="isImageObj(obj) ? 'photo-o' : 'description'" class="mr8" />
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
import Api from '@/api/index';

/**
 * 期望：
 * - v-model （字符串）："upload/selfResume/a.docx,upload/selfResume/b.png"
 * - @change （数组）：[{ link, domain, name, originalName, attachId }, ...]
 */
const props = defineProps({
  modelValue: { type: String, default: '' }, // 仅路径串（后端对象的 name）
  multiple: { type: Boolean, default: true },
  maxCount: { type: Number, default: Infinity },
  disabled: { type: Boolean, default: false },

  // 字符串或数组：'.png,.jpg,application/pdf' | ['.png','.jpg','image/*']
  accept: { type: [String, Array], default: () => ['image/*'] },

  // 单文件最大尺寸（MB）
  maxSizeMB: { type: Number, default: null },

  // 上传函数：(formData, extraParams) => Promise<UploadObj | string | {data: UploadObj}>
  // UploadObj 形如：{ link, domain, name, originalName, attachId }
  uploader: { type: Function, default: Api?.common?.upload?.postFile },

  // 展示
  placeholder: { type: String, default: '请上传文件' },
  showTypeHint: { type: Boolean, default: true },
  uploadText: { type: String, default: '' },
  deletable: { type: Boolean, default: true },

  // v-model 分隔符
  separator: { type: String, default: ',' },

  // 当只有路径时（无 link/domain），用于拼出预览 url：`${previewBaseDomain}/${name}`
  previewBaseDomain: { type: String, default: '' },

  // 服务端保存目录（作为上传额外参数）
  serverDir: { type: String, default: 'upload/selfResume' },
});

const emits = defineEmits(['update:modelValue', 'change']);

// —— 内部状态 —— //
const fileObjs = ref([]); // 完整对象数组：[{ link, domain, name, originalName, attachId }]
const filePaths = ref([]); // 路径数组：['upload/selfResume/a.docx', ...] —— 来自 v-model
const fileList = ref([]); // 供 Vant 展示：[{ url, status, isImage, message }, ...]

// —— accept / maxCount / 文案 —— //
const acceptStr = computed(() =>
  Array.isArray(props.accept) ? props.accept.join(',') : props.accept || ''
);
const acceptDisplay = computed(() =>
  acceptStr.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('、')
);
const maxCountAttr = computed(() => (props.maxCount === Infinity ? undefined : props.maxCount));
const uploadTextAttr = computed(() => props.uploadText || props.placeholder);

// —— 工具 —— //
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

const basename = (p = '') => {
  const qIdx = p.indexOf('?');
  const clean = qIdx >= 0 ? p.slice(0, qIdx) : p;
  const i = clean.lastIndexOf('/');
  return i >= 0 ? clean.slice(i + 1) : clean;
};

const isImageExt = (ex) => ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'].includes(ex);

const isImageObj = (obj) => {
  const hint = obj?.originalName || obj?.name || obj?.link || '';
  return isImageExt(extname(hint));
};

const displayName = (obj) => obj?.originalName || basename(obj?.name || obj?.link || '');

const joinUrl = (a, b) => {
  if (!a) return b || '';
  if (!b) return a;
  return `${a.replace(/\/+$/, '')}/${b.replace(/^\/+/, '')}`;
};

// 兼容仅路径，拼出预览 url
const composeUrl = (obj) => {
  if (obj?.link) return obj.link;
  if (obj?.domain && obj?.name) return joinUrl(obj.domain, obj.name);
  if (props.previewBaseDomain && obj?.name) return joinUrl(props.previewBaseDomain, obj.name);
  return ''; // 没有可预览的 URL，也能正常展示
};

// 统一归一化上传结果
const normalizeUploadResult = (res, rawFile) => {
  // 兼容 { data: {...} }
  if (res && typeof res === 'object' && 'data' in res && res.data) res = res.data;
  console.log(res, '-----+++++');
  if (res && typeof res === 'object') {
    return {
      link: res.link || res.url || '',
      domain: res.domain || '',
      name: res.name || res.path || '',
      originalName: res.originalName || rawFile?.name || basename(res.name || res.link || ''),
      attachId: res.attachId || res.id || '',
    };
  }
  if (typeof res === 'string') {
    const looksLikeHttp = /^https?:\/\//i.test(res);
    return {
      link: looksLikeHttp
        ? res
        : props.previewBaseDomain
          ? joinUrl(props.previewBaseDomain, res)
          : '',
      domain: looksLikeHttp ? '' : props.previewBaseDomain || '',
      name: looksLikeHttp ? '' : res,
      originalName: rawFile?.name || basename(res),
      attachId: '',
    };
  }
  return {
    link: '',
    domain: '',
    name: '',
    originalName: rawFile?.name || '',
    attachId: '',
  };
};

// —— emit 工具 —— //
const emitChange = () => {
  const fullList = fileObjs.value.map((o) => ({ ...o }));
  console.log(fullList);
  emits('change', fullList);
};

const updateModelOnly = () => {
  const joined = stringifyModel(fileObjs.value.map((o) => o.name).filter(Boolean));
  emits('update:modelValue', joined);
};

// —— 模型 <-> 视图 同步 —— //
const rebuildFileListFromObjs = () => {
  fileList.value = fileObjs.value.map((obj) => ({
    url: composeUrl(obj),
    isImage: isImageObj(obj),
    status: 'done',
  }));
};

const syncFromModel = () => {
  const paths = parseModel(props.modelValue);
  filePaths.value = paths;
  // 用路径构造最小对象，便于展示；外层若需要完整对象，可在下一次上传或回填时传入
  fileObjs.value = paths.map((p) => ({
    link: props.previewBaseDomain ? joinUrl(props.previewBaseDomain, p) : '',
    domain: props.previewBaseDomain || '',
    name: p,
    originalName: basename(p),
    attachId: '',
  }));
  rebuildFileListFromObjs();
};

watch(() => props.modelValue, syncFromModel, { immediate: true });

// —— 删除 —— //
const removeAt = (index) => {
  fileObjs.value.splice(index, 1);
  filePaths.value.splice(index, 1);
  fileList.value.splice(index, 1);
  updateModelOnly();
  emitChange(); // 立刻通知外层：完整对象数组
};

const onDelete = (item, detail) => {
  const idx =
    typeof detail?.index === 'number' ? detail.index : fileList.value.findIndex((x) => x === item);
  if (idx >= 0) removeAt(idx);
};

// —— 选择前校验（类型 / 大小 / 数量） —— //
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

  return normalizeAcceptItems.value.some((rule) => {
    if (rule === '*/*') return true;
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, rule.indexOf('/*')) + '/');
    if (rule.startsWith('.')) return ex === rule;
    return type === rule;
  });
};

const handleBeforeRead = (fileOrFiles) => {
  const arr = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

  // 数量限制
  if (props.maxCount !== Infinity && fileObjs.value.length + arr.length > props.maxCount) {
    showToast(`最多上传 ${props.maxCount} 个文件`);
    return false;
  }
  // 类型 / 大小
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

// —— 选择后上传 —— //
const handleAfterRead = async (fileOrFiles) => {
  const items = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
  const params = { filePath: props.serverDir };

  for (const it of items) {
    const rawFile = it.file || it;
    it.status = 'uploading';
    it.message = '上传中...';

    const data = new FormData();
    data.append('file', rawFile);

    try {
      const res = await props.uploader(data, params);
      console.log(res.data.data, '-----');
      const obj = normalizeUploadResult(res.data.data, rawFile);
      console.log(obj, 'obj');

      if (!obj.originalName) {
        throw new Error('上传接口未返回文件路径（originalName）');
      }
      it.status = 'done';
      it.url = composeUrl(obj);
      it.isImage = isImageObj(obj);

      // 同步内部状态
      fileObjs.value.push(obj);
      filePaths.value.push(obj.originalName);

      // 关键：**每个文件成功后**都立即通知外层（即使路径串无变化也会触发）
      updateModelOnly();
      emitChange();
    } catch (e) {
      it.status = 'failed';
      it.message = '上传失败';
      showToast(e?.message || '上传失败');
    }
  }

  // 刷新预览列表
  rebuildFileListFromObjs();
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
