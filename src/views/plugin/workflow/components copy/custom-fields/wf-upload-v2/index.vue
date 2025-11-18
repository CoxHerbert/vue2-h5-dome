<!-- src/components/DcUploaderElp.vue -->
<template>
  <div class="dc-uploader-elp">
    <div class="header">
      <el-upload
        v-model:file-list="epFileList"
        :accept="acceptStr"
        :limit="maxCountAttr"
        :multiple="multiple"
        :disabled="disabled"
        :show-file-list="false"
        :before-upload="handleBeforeUpload"
        :on-exceed="onExceed"
        :http-request="customRequest"
      >
        <el-button type="primary" :disabled="disabled">
          <el-icon class="mr-6"><Upload /></el-icon>选择文件
        </el-button>
      </el-upload>

      <div class="meta">
        <span v-if="placeholder && simpleModels.length === 0" class="placeholder"> </span>
        <span v-if="showTypeHint && acceptDisplay" class="type-hint">
          支持：{{ acceptDisplay }}
          <span v-if="maxSizeMB">，单文件 ≤ {{ maxSizeMB }}MB</span>
          <span v-if="maxCount && maxCount !== Infinity">，最多 {{ maxCount }} 个</span>
        </span>
      </div>
    </div>

    <!-- 文件列表 -->
    <el-card v-if="fileObjs.length" class="list-card" shadow="never">
      <div
        v-for="(obj, i) in fileObjs"
        :key="(obj.attachId || obj.name || '') + '_' + i"
        class="row"
      >
        <div class="name">
          <el-icon class="mr-6"><Document /></el-icon>
          <span class="link">{{ displayName(obj) }}</span>
        </div>

        <div class="ops">
          <el-text
            v-if="deletable && !disabled"
            style="margin-right: 8px"
            link
            type="danger"
            @click="removeAt(i)"
            title="删除"
          >
            <el-icon><Delete /></el-icon>
          </el-text>
          <!-- 预览 -->
          <el-text style="margin-right: 8px" link type="primary" @click="previewAt(i)" title="预览">
            <el-icon><View /></el-icon>
          </el-text>
          <el-text
            style="margin-right: 8px"
            link
            type="primary"
            @click="downloadAt(i)"
            title="下载"
          >
            <el-icon><Download /></el-icon>
          </el-text>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="previewVisible"
      width="80%"
      :title="previewTitle"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="preview-body">
        <iframe
          v-if="finalUrl"
          :src="finalUrl"
          title="简历预览"
          frameborder="0"
          border="0"
          marginwidth="0"
          marginheight="0"
          scrolling="auto"
          allowtransparency="yes"
        ></iframe>
        <div v-else class="no-file">暂无可预览的简历文件</div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
// 定义组件名称
export default {
  name: 'wf-upload-v2',
};
</script>
<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Upload, Document, Delete, Download, View } from '@element-plus/icons-vue';
import Api from '@/api/index';
import { downloadFileBlob } from '@/utils/util';

/**
 * v-model：
 * - multiple=false: { path: string, attachId: string } | null
 * - multiple=true : Array<{ path: string, attachId: string }>
 *
 * @change：返回 [{ link, name, originalName, attachId }]
 */
const props = defineProps({
  modelValue: { type: [Object, Array, String, null], default: null },
  multiple: { type: Boolean, default: true },
  maxCount: { type: Number, default: Infinity },
  disabled: { type: Boolean, default: false },
  accept: { type: [String, Array], default: () => ['image/*'] },
  maxSizeMB: { type: Number, default: null },
  uploader: { type: Function, default: Api?.common?.upload?.postFile },
  placeholder: { type: String, default: '请上传文件' },
  showTypeHint: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true },
  previewBaseDomain: { type: String, default: '' },
  serverDir: { type: String, default: 'upload/selfResume' },
  apiPrefix: { type: String, default: '/api' },
  filePreviewBase: { type: String, default: import.meta.env.VITE_FILE_URL },
});

const emits = defineEmits(['update:modelValue', 'change']);

/** 仅保存四字段 */
const fileObjs = ref([]); // [{ link, name, originalName, attachId }]
const simpleModels = ref([]); // [{ path, attachId }]
const epFileList = ref([]); // Element Plus UploadFile[]
const previewVisible = ref(false);
const previewTitle = ref('');
const previewTitleMuted = ref('');
const previewIndex = ref(-1); // 记录当前预览的文件索引
// const finalUrl = ref('');
/* ============ accept / maxCount ============ */
const acceptStr = computed(() =>
  Array.isArray(props.accept) ? props.accept.join(',') : props.accept || ''
);
const acceptDisplay = computed(() =>
  acceptStr.value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .join('、')
);
const maxCountAttr = computed(() =>
  !props.multiple ? 1 : props.maxCount === Infinity ? undefined : props.maxCount
);

/* ============ 工具 ============ */
const extname = (nameOrUrl = '') => {
  const clean = String(nameOrUrl || '').split('?')[0];
  const i = clean.lastIndexOf('.');
  return i >= 0 ? clean.slice(i).toLowerCase() : '';
};
const basename = (p = '') => {
  const clean = String(p || '').split('?')[0];
  const i = clean.lastIndexOf('/');
  return i >= 0 ? clean.slice(i + 1) : clean;
};
const isImageExt = ex => ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'].includes(ex);
const isImageObj = obj => {
  const hint = obj?.originalName || obj?.name || obj?.link || '';
  return isImageExt(extname(hint));
};
const displayName = obj => obj?.originalName || basename(obj?.name || obj?.link || '');
const joinUrl = (a, b) => {
  const A = String(a || ''),
    B = String(b || '');
  if (!A) return B;
  if (!B) return A;
  return `${A.replace(/\/+$/, '')}/${B.replace(/^\/+/, '')}`;
};
const composeLink = obj => {
  const link = String(obj?.link || '');
  const name = String(obj?.name || '');
  if (link) return link;
  if (props.previewBaseDomain && name) return joinUrl(props.previewBaseDomain, name);
  return '';
};

/* ============ 入口保险：深提取 path / attachId，强制字符串化 ============ */
const getPathFromAny = val => {
  if (typeof val === 'string') return val.trim();
  if (typeof File !== 'undefined' && val instanceof File) return val.name || '';
  if (val && typeof val === 'object') {
    const pick = obj => {
      if (!obj || typeof obj !== 'object') return '';
      if (typeof obj.path === 'string' && obj.path) return obj.path.trim();
      if (typeof obj.name === 'string' && obj.name) return obj.name.trim();
      if (typeof obj.url === 'string' && obj.url) return obj.url.trim();
      if (typeof obj.link === 'string' && obj.link) return obj.link.trim();
      return '';
    };
    let p = pick(val);
    if (p) return p;
    if (val.path && typeof val.path === 'object') {
      p = pick(val.path);
      if (p) return p;
    }
  }
  return '';
};
const getAttachIdFromAny = val => {
  if (val && typeof val === 'object') {
    if (typeof val.attachId === 'string') return val.attachId;
    if (typeof val.id === 'string') return val.id;
  }
  return '';
};

/* ============ 简化模型 <-> 展示对象（四字段） ============ */
const toSimple = full => ({
  path: String(full?.link || full?.name || ''), // name 也兜底
  attachId: String(full?.attachId || ''),
});

const fromSimple = simple => {
  const rawPath = getPathFromAny(simple?.path ?? simple);
  const name = String(rawPath || '');
  const attachId = String(getAttachIdFromAny(simple) || '');
  const tentative = { name, link: '' };
  const link = composeLink(tentative);
  const originalName = String(basename(name) || basename(link) || '');
  return {
    link: String(link || ''),
    name: String(name || ''),
    originalName,
    attachId,
  };
};

/* ============ emit：出口再保险，全部 String(...) ============ */
const emitChange = () => {
  const list = fileObjs.value.map(o => ({
    link: String(o.link || composeLink(o) || ''),
    name: String(o.name || ''),
    originalName: String(o.originalName || basename(o.name || o.link || '') || ''),
    attachId: String(o.attachId || ''),
  }));
  emits('change', list);
};
const emitModel = () => {
  if (props.multiple) {
    emits(
      'update:modelValue',
      simpleModels.value.map(x => ({
        path: String(x.path || ''),
        attachId: String(x.attachId || ''),
      }))
    );
  } else {
    const first = simpleModels.value[0];
    emits(
      'update:modelValue',
      first ? { path: String(first.path || ''), attachId: String(first.attachId || '') } : null
    );
  }
};

/* ============ 模型 <-> 视图 同步 ============ */
const rebuildEpFileList = () => {
  epFileList.value = fileObjs.value.map(obj => ({
    name: displayName(obj),
    url: composeLink(obj),
    status: 'success',
  }));
};
const syncFromModel = () => {
  const mv = props.modelValue;
  let simples = [];
  if (Array.isArray(mv)) {
    simples = mv
      .map(x => ({ path: getPathFromAny(x?.path ?? x), attachId: getAttachIdFromAny(x) }))
      .filter(x => x.path);
  } else if (mv && typeof mv === 'object') {
    const path = getPathFromAny(mv?.path ?? mv);
    const attachId = getAttachIdFromAny(mv);
    simples = path ? [{ path, attachId }] : [];
  } else if (typeof mv === 'string') {
    simples = mv
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(p => ({ path: p, attachId: '' }));
  } else {
    simples = [];
  }
  simples = simples.map(s => ({ path: String(s.path || ''), attachId: String(s.attachId || '') }));
  simpleModels.value = props.multiple ? simples : simples.slice(0, 1);
  fileObjs.value = simpleModels.value.map(fromSimple);
  rebuildEpFileList();
};
watch(() => props.modelValue, syncFromModel, { immediate: true });

/* ============ 列表操作 ============ */
const removeAt = index => {
  fileObjs.value.splice(index, 1);
  simpleModels.value.splice(index, 1);
  rebuildEpFileList();
  emitModel();
  emitChange();
};

/* ============ 前置校验（类型/大小/数量） ============ */
const normalizeAcceptItems = computed(() =>
  acceptStr.value
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
);
const matchAccept = file => {
  if (!normalizeAcceptItems.value.length) return true;
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  const ex = extname(name);

  return normalizeAcceptItems.value.some(rule => {
    if (rule === '*/*') return true;
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, rule.indexOf('/*')) + '/');
    if (rule.startsWith('.')) return ex === rule;
    return type === rule;
  });
};
const currentCount = () => simpleModels.value.length;
const handleBeforeUpload = file => {
  if (props.maxCount !== Infinity) {
    if (currentCount() + 1 > (maxCountAttr.value ?? Infinity)) {
      ElMessage.warning(`最多上传 ${maxCountAttr.value} 个文件`);
      return false;
    }
  }
  if (!matchAccept(file)) {
    ElMessage.error('文件类型不支持');
    return false;
  }
  if (props.maxSizeMB && file.size > props.maxSizeMB * 1024 * 1024) {
    ElMessage.error(`单文件不能超过 ${props.maxSizeMB}MB`);
    return false;
  }
  return true;
};
const onExceed = () => {
  if (maxCountAttr.value) {
    ElMessage.warning(`最多上传 ${maxCountAttr.value} 个文件`);
  }
};

/* ============ 覆盖上传请求（与后端结构适配） ============ */
const customRequest = async opt => {
  const { file, onProgress, onError, onSuccess } = opt;
  const formData = new FormData();
  formData.append('file', file);

  const params = { filePath: props.serverDir };

  try {
    // 允许 uploader 接收 (formData, params, onProgress?)，若你已有进度回调，可在 uploader 内调用 onProgress
    const { data: resp } = await props.uploader(formData, params);
    if (!resp || resp.code !== 200 || !resp.data) throw new Error(resp?.msg || '上传失败');

    const full = {
      link: String(resp.data.link || ''),
      name: String(resp.data.link || ''),
      originalName: String(resp.data.originalName || file.name || ''),
      attachId: String(resp.data.attachId || ''),
    };
    if (!full.link && props.previewBaseDomain && resp?.data?.link) {
      full.link = joinUrl(props.previewBaseDomain, resp.data.link);
    }
    if (!full.link) throw new Error('上传接口未返回文件路径（link）');

    // 写入本地状态
    if (props.multiple) {
      fileObjs.value.push(full);
      simpleModels.value.push(toSimple(full));
    } else {
      fileObjs.value = [full];
      simpleModels.value = [toSimple(full)];
    }

    rebuildEpFileList();
    emitModel();
    emitChange();

    onProgress?.({ percent: 100 });
    onSuccess?.(resp, file);
  } catch (e) {
    onError?.(e);
    ElMessage.error(e?.message || '上传失败');
  }
};

function toApiUploadPath(input) {
  try {
    const u = new URL(input);
    const parts = u.pathname.split('/'); // ["", "000000-bip2-dev", "upload", "selfResume", "...docx"]
    const idx = parts.indexOf('upload');
    if (idx !== -1) return parts.slice(idx).join('/'); // "api/upload/selfResume/....docx"
    // 没有 upload 就退化处理
    return u.pathname.startsWith('/') ? u.pathname : '/' + u.pathname;
  } catch {
    // 传进来是相对路径也兼容
    const m = String(input)
      .replace(/^https?:\/\/[^/]+/, '')
      .match(/\/upload\/.*/);
    return m ? m[0] : String(input).startsWith('/') ? String(input) : '/' + String(input);
  }
}

/* ============ 下载 ============ */
const downloadAt = index => {
  const obj = fileObjs.value[index];
  if (!obj) return;
  // const finalUrl = toApiUploadPath(obj.name) || '';
  console.log(obj);
  const finalUrl = obj.name || '';
  console.log(finalUrl);
  if (!finalUrl) {
    ElMessage.warning('暂无可下载地址');
    return;
  }
  const filename = displayName(obj) || 'download';
  try {
    downloadFileBlob(finalUrl, filename);
  } catch (err) {
    ElMessage.error(err?.message || '下载失败');
  }
};
/* ============ 预览KKview ============ */
/** 相对地址 → 绝对地址 */
function absoluteUrl(u) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/')) return `${location.origin}${u}`;
  return `${location.origin}/${u}`;
}

/** 拼装最终预览地址（file gateway + base64(url)） */
const finalUrl = computed(() => {
  if (previewIndex.value < 0 || previewIndex.value >= fileObjs.value.length) return '';

  const obj = fileObjs.value[previewIndex.value];
  if (!obj) return '';

  const raw = obj.link || obj.name || '';
  const abs = absoluteUrl(raw);
  if (!abs) return '';

  const base = (props.filePreviewBase || '').trim();
  if (!base) return abs; // 网关缺失时，直接打开原地址

  // 使用安全的 base64 编码方法，支持 Unicode 字符
  try {
    // 先将字符串转换为 UTF-8 字节数组，然后再进行 base64 编码
    const utf8Bytes = new TextEncoder().encode(abs);
    let binaryString = '';
    utf8Bytes.forEach(byte => {
      binaryString += String.fromCharCode(byte);
    });
    const base64 = btoa(binaryString);
    return `${base}?url=${encodeURIComponent(base64)}`;
  } catch (e) {
    console.error('Base64编码失败:', e);
    return abs;
  }
});

/** 预览弹窗 */
const previewAt = index => {
  const obj = fileObjs.value[index];
  if (!obj) return;

  previewIndex.value = index; // 设置当前预览的文件索引
  previewVisible.value = true;
  previewTitle.value = displayName(obj) || '预览';
  previewTitleMuted.value = obj.originalName || '';
};
</script>

<style lang="scss" scoped>
.dc-uploader-elp {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .meta {
    display: flex;
    align-items: baseline;
    gap: 10px;

    .placeholder {
      color: var(--el-text-color-placeholder);
    }
    .type-hint {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }
}

.list-card {
  padding: 0;
  :deep(.el-card__body) {
    padding: 0;
  }
  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 2px;
    padding: 4px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .name {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      cursor: pointer;
      .link {
        color: var(--el-color-primary);
        word-break: break-all;
      }
    }
    .ops {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      cursor: pointer;
    }
  }
}

.mr-6 {
  margin-right: 6px;
}
.preview-body {
  height: calc(100vh - 350px);
  padding: 0;
  display: flex;
  > iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  .no-file {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }
}
</style>
