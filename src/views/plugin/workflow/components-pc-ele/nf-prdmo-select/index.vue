<template>
  <van-popup
    v-model:show="visible"
    class="nf-dialog"
    position="center"
    round
    closeable
    close-icon="cross"
    close-icon-position="top-right"
    :close-on-click-overlay="true"
    @close="handleClose"
  >
    <div class="nf-dialog__container">
      <header class="nf-dialog__header">
        <span class="nf-dialog__title">专案物料查询</span>
      </header>
      <section class="nf-dialog__body">
        <van-radio-group v-model="form.radio">
          <nf-crud
            v-if="isInit && visible"
            ref="crudRef"
            :option="option"
            :props="tableProps"
            :table-loading="loading"
            :data="data"
            v-model:page="page"
            v-model="form"
            @search-change="searchChange"
            @search-reset="searchReset"
            @selection-change="onSelectionChange"
            @current-change="onCurrentChange"
            @size-change="onSizeChange"
            @row-click="rowClick"
            @on-load="onLoad"
          >
            <template v-if="checkType === 'radio'" #radio="{ row }">
              <van-radio :name="row.id" icon-size="16">
                <template #icon="{ checked }">
                  <span class="nf-radio-icon" :class="{ 'nf-radio-icon--checked': checked }"></span>
                </template>
              </van-radio>
            </template>
          </nf-crud>
        </van-radio-group>
      </section>
      <footer class="nf-dialog__footer">
        <van-button size="small" @click="handleClose">取 消</van-button>
        <van-button type="primary" size="small" @click="handleConfirm">确 定</van-button>
      </footer>
    </div>
  </van-popup>
</template>

<script setup>
import { computed, defineEmits, defineProps, defineExpose, onMounted, reactive, ref, watch, nextTick } from 'vue';
import { showToast } from 'vant';
import request from '@/utils/http';
import { findObject } from '@/components/wf-ui/util/index.js';
import { getMaterialDetail } from '@/api/system/user';

defineOptions({ name: 'nf-prdmo-select' });

const props = defineProps({
  modelValue: { type: [String, Number, Object], default: '' },
  defaultChecked: { type: [String, Number, Object], default: '' },
  voUrl: {
    type: String,
    default: () => '/blade-erp/v-prd-mo-material/list',
  },
  customOption: { type: Object, default: null },
  checkType: {
    type: String,
    default: () => 'radio',
  },
  fuseorgid: {
    type: String,
    default: () => '',
  },
});

const emit = defineEmits(['onConfirm']);

const visible = ref(false);
const isInit = ref(false);
const loading = ref(false);
const form = ref({ radio: '' });
const page = ref({ size: 10, current: 1, total: 0, pageSize: 10 });
const query = ref({});
const data = ref([]);
const selectionList = ref([]);
const crudRef = ref();

const tableProps = reactive({
  id: 'id',
  name: 'realName',
  records: 'data.data.records',
  total: 'data.data.total',
});

const option = reactive({
  size: 'default',
  searchSize: 'default',
  align: 'center',
  menu: false,
  addBtn: false,
  header: false,
  border: true,
  tip: false,
  reserveSelection: true,
  highlightCurrentRow: true,
  gutter: 5,
  searchMenuSpan: 6,
  selection: true,
  column: [
    { label: '', prop: 'radio', type: 'radio', width: 55, hide: true },
    { label: '计划跟踪号', prop: 'motno', overHidden: true, search: true },
    { label: '物料编码', prop: 'materialCode', overHidden: true, width: 90, search: true },
    { label: '物料名称', prop: 'materialName', overHidden: true, search: true },
    { label: '规格型号', prop: 'specification', overHidden: true },
    { label: '数量', prop: 'qty', overHidden: true },
  ],
});

const checkType = computed(() => props.checkType);
const resolvedDefaultChecked = computed(() => props.defaultChecked || props.modelValue);

const ids = computed(() => Array.from(new Set(selectionList.value.map((item) => item.id))).join(','));
const names = computed(() => Array.from(new Set(selectionList.value.map((item) => item.realName))).join(','));

function applyCustomOption() {
  if (!props.customOption) return;
  const { column, userProps } = props.customOption;
  if (Array.isArray(column) && column.length) {
    option.column = column;
  }
  if (userProps && typeof userProps === 'object') {
    Object.assign(tableProps, userProps);
  }
}

function toggleSelectionType(val) {
  const radioColumn = findObject(option.column, 'radio');
  if (val === 'radio') {
    option.selection = false;
    if (radioColumn && typeof radioColumn === 'object') radioColumn.hide = false;
  } else {
    option.selection = true;
    if (radioColumn && typeof radioColumn === 'object') radioColumn.hide = true;
  }
}

watch(
  () => props.checkType,
  (val) => {
    toggleSelectionType(val);
  },
  { immediate: true }
);

watch(
  resolvedDefaultChecked,
  (val) => {
    if (visible.value && val) {
      changeDefaultChecked();
    }
  },
  { deep: true }
);

onMounted(() => {
  init();
});

function init() {
  if (isInit.value) return;
  applyCustomOption();
  isInit.value = true;
}

function handleConfirm() {
  if (!selectionList.value.length) {
    showToast({ message: '请选择至少一条数据' });
    return;
  }
  emit('onConfirm', selectionList.value);
  handleClose();
}

function handleClose() {
  visible.value = false;
}

function searchReset() {
  query.value = {};
  onLoad(page.value);
}

async function searchChange(params, done) {
  query.value = params;
  page.value.current = 1;
  try {
    await onLoad(page.value, params);
  } finally {
    if (typeof done === 'function') done();
  }
}

function onSelectionChange(list = []) {
  selectionList.value = list;
}

function onCurrentChange(val) {
  page.value.current = val;
}

function onSizeChange(val) {
  page.value.pageSize = val;
}

function rowClick(row) {
  if (props.checkType === 'radio') {
    selectionList.value = [row];
    form.value.radio = row.id;
  } else {
    crudRef.value?.toggleSelection?.([row]);
  }
}

function selectionClear() {
  selectionList.value = [];
  crudRef.value?.toggleSelection?.();
}

async function changeDefaultChecked() {
  const defaultChecked = resolvedDefaultChecked.value;
  if (!defaultChecked) return;
  if (props.checkType === 'checkbox') {
    const checks = Array.isArray(defaultChecked)
      ? defaultChecked
      : String(defaultChecked)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
    if (!checks.length) return;
    await nextTick();
    checks.forEach(async (c) => {
      let row = data.value.find((d) => d.id == c) || selectionList.value.find((d) => d.id == c);
      if (!row) {
        try {
          const res = await getMaterialDetail(c);
          row = res.data?.data;
        } catch (error) {
          row = null;
        }
      }
      if (row) {
        crudRef.value?.toggleRowSelection?.(row, true);
      }
    });
  } else {
    const targetId = typeof defaultChecked === 'object' ? defaultChecked.id : defaultChecked;
    if (!targetId) return;
    let row = data.value.find((d) => d.id == targetId);
    if (!row) {
      try {
        const res = await getMaterialDetail({ materialCode: targetId });
        row = res.data?.data;
      } catch (error) {
        row = null;
      }
    }
    if (row) {
      selectionList.value = [row];
      form.value.radio = targetId;
    } else {
      selectionList.value = [];
      form.value.radio = '';
    }
  }
}

async function onLoad(pageInfo, params = {}) {
  loading.value = true;
  const mergedQuery = { ...params, ...query.value };
  const size = pageInfo.pageSize || pageInfo.size || 10;
  const requestParams = {
    current: pageInfo.current || 1,
    size,
    ...mergedQuery,
  };
  try {
    const res = await request.get(props.voUrl, { params: requestParams });
    const responseData = res.data?.data || {};
    page.value.total = responseData.total || 0;
    data.value = responseData.records || [];
    await changeDefaultChecked();
  } finally {
    loading.value = false;
  }
}

defineExpose({
  visible,
  open: () => {
    visible.value = true;
  },
  close: handleClose,
  selectionClear,
  ids,
  names,
});
</script>

<style scoped lang="scss">
.nf-dialog {
  width: 90vw;
  max-width: 960px;
  .nf-dialog__container {
    display: flex;
    flex-direction: column;
    max-height: 80vh;
  }
  .nf-dialog__header {
    padding: 16px 20px 0;
    font-size: 16px;
    font-weight: 600;
  }
  .nf-dialog__body {
    flex: 1;
    padding: 12px 20px 0;
    overflow: auto;
  }
  .nf-dialog__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 12px 20px 20px;
  }
}

.nf-radio-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #c8c9cc;
  box-sizing: border-box;
}

.nf-radio-icon--checked {
  border-color: var(--van-primary-color);
  background: radial-gradient(circle, var(--van-primary-color) 0%, var(--van-primary-color) 60%, transparent 65%);
}
</style>
