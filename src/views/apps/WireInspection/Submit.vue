<template>
  <div class="page wire-inspection-submit">
    <van-nav-bar
      title="线材质检"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <div class="page-body">
      <van-form>
        <section class="wi-section">
          <header class="wi-section__header">基本信息</header>
          <van-field
            v-model="form.locatorNo"
            label="库位编码"
            placeholder="请输入库位编码"
            clearable
            required
          />
        </section>

        <section class="wi-section">
          <header class="wi-section__header wi-section__header--with-action">
            <span>明细信息</span>
            <div class="wi-section__actions">
              <van-button size="small" type="primary" plain icon="plus" @click="handleAddRow">
                新增
              </van-button>
              <van-button size="small" type="success" plain icon="scan" @click="handleScan">
                扫码
              </van-button>
            </div>
          </header>

          <div v-if="!form.data.length" class="wi-empty">
            暂无明细，请先扫码或新增。
          </div>

          <div v-for="(row, index) in form.data" :key="row.itemId || index" class="wi-card">
            <div class="wi-card__header">
              <span class="wi-card__title">#{{ index + 1 }}</span>
              <van-button
                size="small"
                type="danger"
                plain
                icon="delete"
                @click="handleRemoveRow(index)"
              >
                删除
              </van-button>
            </div>

            <div class="wi-card__meta">
              <div v-for="field in readonlyFields" :key="field.prop" class="wi-meta-row">
                <span class="wi-meta-row__label">{{ field.label }}</span>
                <span class="wi-meta-row__value">{{ row[field.prop] || '-' }}</span>
              </div>
            </div>

            <div class="wi-card__form">
              <van-field
                v-model="row.drawQty"
                label="图档数量"
                type="digit"
                placeholder="请输入图档数量"
                clearable
                required
              />

              <div class="wi-radio-group">
                <div class="wi-radio-group__label">是否合格</div>
                <van-radio-group v-model="row.isQualified" direction="horizontal" @change="onQualifiedChange(row)">
                  <van-radio v-for="opt in qualifiedOptions" :key="opt.value" :name="opt.value">
                    {{ opt.label }}
                  </van-radio>
                </van-radio-group>
              </div>

              <van-field
                v-if="row.isQualified === '0'"
                :model-value="displayExceptionLabel(row.execeptionType)"
                label="异常类型"
                placeholder="请选择异常类型"
                readonly
                is-link
                @click="openExceptionPicker(index)"
              />

              <van-field
                v-model="row.remark"
                label="备注"
                type="textarea"
                rows="2"
                maxlength="200"
                show-word-limit
                placeholder="请输入备注"
              />
            </div>
          </div>
        </section>
      </van-form>
    </div>

    <div class="submit-footer">
      <van-button block type="primary" icon="passed" @click="handleSubmit">保存</van-button>
    </div>

    <dc-scan-code v-if="showScanner" ref="scannerRef" @confirm="handleScanResult" />

    <van-popup v-model:show="exceptionPicker.show" position="bottom" round>
      <van-picker
        show-toolbar
        :columns="exceptionPickerColumns"
        @confirm="onExceptionConfirm"
        @cancel="exceptionPicker.show = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { Dialog, showToast, showLoadingToast } from 'vant';
import Api from '@/api';
import {
  createEmptyRow,
  normalizeApiRow,
  readonlyRowFields as readonlyFields,
  fallbackQualifiedOptions,
  fallbackExceptionOptions,
  normalizeDictOptions,
  resolveDictLabel,
} from './constants';

defineOptions({ name: 'WireInspectionSubmit' });

const router = useRouter();
const { proxy } = getCurrentInstance();
const dicts = proxy?.dicts?.(['QualifiedEnum', 'DC_WIRE_EXCEPTION_TYPE']) || {};

const form = reactive({
  locatorNo: '',
  data: [],
});

const showScanner = ref(false);
const scannerRef = ref(null);

const exceptionPicker = reactive({
  show: false,
  rowIndex: -1,
});

const qualifiedOptions = computed(() => {
  const normalized = normalizeDictOptions(dicts?.QualifiedEnum, []);
  return normalized.length ? normalized : fallbackQualifiedOptions;
});

const exceptionOptions = computed(() => {
  const normalized = normalizeDictOptions(dicts?.DC_WIRE_EXCEPTION_TYPE, []);
  return normalized.length ? normalized : fallbackExceptionOptions;
});

const exceptionPickerColumns = computed(() =>
  exceptionOptions.value.map((opt) => ({ text: opt.label, value: opt.value }))
);

function goBack() {
  router.back();
}

function handleAddRow() {
  const row = createEmptyRow();
  row.itemId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  form.data.unshift(row);
}

function handleRemoveRow(index) {
  Dialog.confirm({ title: '提示', message: '确定要删除该明细吗？' })
    .then(() => {
      form.data.splice(index, 1);
    })
    .catch(() => {});
}

function onQualifiedChange(row) {
  if (row.isQualified !== '0') {
    row.execeptionType = '';
  }
}

function openExceptionPicker(index) {
  if (!exceptionOptions.value.length) {
    showToast({ message: '暂无可选异常类型', type: 'fail' });
    return;
  }
  exceptionPicker.rowIndex = index;
  exceptionPicker.show = true;
}

function onExceptionConfirm({ selectedValues, selectedOptions }) {
  const row = form.data[exceptionPicker.rowIndex];
  if (row) {
    const option = selectedOptions?.[0] || selectedOptions || {};
    row.execeptionType = (selectedValues && selectedValues[0]) ?? option?.value ?? '';
  }
  exceptionPicker.show = false;
}

function displayExceptionLabel(value) {
  return resolveDictLabel(exceptionOptions.value, value) || '';
}

function handleScan() {
  showScanner.value = true;
  nextTick(() => {
    scannerRef.value
      ?.open()
      .then((code) => {
        if (code) {
          loadDrawContent(code);
        }
      })
      .catch(() => {})
      .finally(() => {
        showScanner.value = false;
      });
  });
}

function handleScanResult(code) {
  showScanner.value = false;
  if (!code) return;
  loadDrawContent(code);
}

async function loadDrawContent(code) {
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 });
  try {
    const res = await Api.application.wireInspection.getDrawContent({ key: code });
    const payload = res?.data ?? res ?? {};
    const { code: respCode, data, msg, message } = payload;
    if (respCode !== 200 || !data) {
      loading.close?.();
      showToast({ message: message || msg || '未获取到图档信息', type: 'fail' });
      return;
    }
    const row = normalizeApiRow(data);
    if (!row.itemId) {
      row.itemId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    const existsIndex = form.data.findIndex((item) => item.itemId && item.itemId === row.itemId);
    if (existsIndex > -1) {
      form.data.splice(existsIndex, 1, row);
    } else {
      form.data.unshift(row);
    }
    loading.close?.();
    showToast({ message: '扫码成功', type: 'success' });
  } catch (error) {
    loading.close?.();
    showToast({ message: error?.message || '获取图档信息失败', type: 'fail' });
  }
}

function validateForm() {
  if (!form.locatorNo || !form.locatorNo.toString().trim()) {
    return '请输入库位编码';
  }
  if (!form.data.length) {
    return '请至少添加一条明细信息';
  }
  for (let i = 0; i < form.data.length; i += 1) {
    const row = form.data[i];
    if (!row.drawQty || !row.drawQty.toString().trim()) {
      return `请输入第 ${i + 1} 行的图档数量`;
    }
    if (row.isQualified === '' || row.isQualified === null || row.isQualified === undefined) {
      return `请选择第 ${i + 1} 行的是否合格`; 
    }
    if (row.isQualified === '0' && (!row.execeptionType || !row.execeptionType.toString().trim())) {
      return `请选择第 ${i + 1} 行的异常类型`;
    }
  }
  return '';
}

async function handleSubmit() {
  const message = validateForm();
  if (message) {
    showToast({ message, type: 'fail' });
    return;
  }

  try {
    await Dialog.confirm({ title: '提示', message: '确定要提交吗？' });
  } catch {
    return;
  }

  const loading = showLoadingToast({ message: '保存中...', forbidClick: true, duration: 0 });
  try {
    const payload = form.data.map((item) => ({
      ...item,
      locatorNo: form.locatorNo,
      drawQty: item.drawQty,
    }));
    const res = await Api.application.wireInspection.batchSave(payload);
    const result = res?.data ?? res ?? {};
    const { code, msg, message: respMessage } = result;
    if (code === 200) {
      loading.close?.();
      showToast({ message: '保存成功', type: 'success' });
      window.dispatchEvent(new CustomEvent('wireInspection:refresh', { detail: true }));
      router.back();
    } else {
      loading.close?.();
      showToast({ message: respMessage || msg || '保存失败', type: 'fail' });
    }
  } catch (error) {
    loading.close?.();
    showToast({ message: error?.message || '保存失败', type: 'fail' });
  }
}
</script>

<style scoped lang="scss">
.wire-inspection-submit {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

.page-body {
  padding: 16px;
  box-sizing: border-box;
  padding-top: 0;
}

.wi-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  &__header {
    font-size: 15px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__header--with-action {
    margin-bottom: 16px;
  }

  &__actions {
    display: inline-flex;
    gap: 8px;
  }
}

.wi-empty {
  color: #969799;
  font-size: 13px;
  padding: 12px 0;
}

.wi-card {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__title {
    font-weight: 600;
    font-size: 15px;
    color: #323233;
  }

  &__meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 12px;
    margin-bottom: 12px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.wi-meta-row {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #646566;

  &__label {
    color: #969799;
    margin-bottom: 2px;
  }

  &__value {
    color: #323233;
    word-break: break-all;
  }
}

.wi-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    font-size: 14px;
    color: #646566;
  }
}

.submit-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px calc(env(safe-area-inset-bottom, 0) + 12px);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
}
</style>
