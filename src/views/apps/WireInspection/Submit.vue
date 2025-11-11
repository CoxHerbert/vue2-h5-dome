<template>
  <div class="page wire-inspection-submit">
    <van-nav-bar title="线材质检" left-arrow fixed @click-left="goBack" />

    <div class="wire-inspection-submit__body">
      <van-form ref="formRef" :model="form" scroll-to-error>
        <van-cell-group inset class="section">
          <van-field
            v-model="form.locatorNo"
            name="locatorNo"
            label="库位编码"
            placeholder="请输入库位编码"
            :rules="[{ required: true, message: '请输入库位编码' }]"
          >
            <template #button>
              <dc-scan-code
                v-model="form.locatorNo"
                @confirm="handleLocatorScanSuccess"
                @error="handleScanError"
              >
                <template #default="{ open, disabled, loading }">
                  <van-button
                    size="small"
                    type="primary"
                    :loading="loading"
                    :disabled="disabled"
                    @click="open"
                  >
                    扫码
                  </van-button>
                </template>
              </dc-scan-code>
            </template>
          </van-field>
        </van-cell-group>

        <div class="section__header">
          <div class="section__title">明细信息</div>
          <div class="section__actions">
            <van-button size="small" type="primary" plain @click="addRow()">新增行</van-button>
            <dc-scan-code
              v-model="rowScanCode"
              @confirm="handleRowScanConfirm"
              @error="handleScanError"
            >
              <template #default="{ open, disabled, loading }">
                <van-button
                  size="small"
                  type="success"
                  plain
                  :loading="loading"
                  :disabled="disabled"
                  @click="open"
                >
                  扫码录入
                </van-button>
              </template>
            </dc-scan-code>
          </div>
        </div>

        <div v-if="form.data.length" class="detail-list">
          <div v-for="(row, index) in form.data" :key="row._uid" class="detail-card">
            <div class="detail-card__header">
              <div class="detail-card__title">#{{ index + 1 }}</div>
              <van-button size="mini" type="danger" plain @click="removeRow(index)">
                删除
              </van-button>
            </div>

            <div class="detail-card__meta">
              <div class="meta-row"><span class="label">BOM编码</span>{{ row.bomNo || '—' }}</div>
              <div class="meta-row"><span class="label">BOM版本</span>{{ row.bomVersion || '—' }}</div>
              <div class="meta-row"><span class="label">执行单号</span>{{ row.no || '—' }}</div>
              <div class="meta-row"><span class="label">物料编码</span>{{ row.exeMaterialNumber || row.itemMaterialNumber || '—' }}</div>
              <div class="meta-row"><span class="label">物料名称</span>{{ row.exeMaterialName || row.itemMaterialName || '—' }}</div>
              <div class="meta-row"><span class="label">专案号</span>{{ row.mtoNo || '—' }}</div>
            </div>

            <van-cell-group inset>
              <van-field
                v-model="row.drawQty"
                :name="`data[${index}].drawQty`"
                label="图档数量"
                type="digit"
                placeholder="请输入图档数量"
                :rules="[{ required: true, message: '请输入图档数量' }]"
              />
              <van-field
                :name="`data[${index}].isQualified`"
                label="是否合格"
                :rules="[{ required: true, message: '请选择是否合格' }]"
              >
                <template #input>
                  <van-radio-group
                    v-model="row.isQualified"
                    direction="horizontal"
                    @change="() => handleQualifiedChange(row)"
                  >
                    <van-radio
                      v-for="option in qualifiedOptions"
                      :key="option.value ?? option.dictValue"
                      :name="option.value ?? option.dictValue"
                    >
                      {{ option.label ?? option.dictLabel }}
                    </van-radio>
                  </van-radio-group>
                </template>
              </van-field>

              <van-field
                v-if="row.isQualified === '0'"
                :name="`data[${index}].execeptionType`"
                label="异常类型"
                is-link
                readonly
                :model-value="resolveDictLabel('DC_WIRE_EXCEPTION_TYPE', row.execeptionType)"
                placeholder="请选择异常类型"
                :rules="[{ required: true, message: '请选择异常类型' }]"
                @click="openExceptionPicker(index)"
              />

              <van-field
                v-model="row.remark"
                :name="`data[${index}].remark`"
                label="备注"
                type="textarea"
                rows="2"
                autosize
                placeholder="请输入备注"
              />
            </van-cell-group>
          </div>
        </div>

        <van-empty v-else class="detail-empty" description="请新增或扫码录入质检明细" />
      </van-form>
    </div>

    <div class="wire-inspection-submit__footer">
      <van-button block type="success" @click="handleSubmit">提交</van-button>
    </div>

    <van-popup v-model:show="picker.show" position="bottom" round>
      <van-picker :columns="picker.columns" @confirm="onPickerConfirm" @cancel="picker.show = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, reactive, ref, unref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import Api from '@/api';
import { goBackOrHome } from '@/utils/navigation';

defineOptions({ name: 'WireInspectionSubmit' });

const { proxy } = getCurrentInstance();
const router = useRouter();

const formRef = ref(null);
const rowScanCode = ref('');

let uid = 0;

const form = reactive({
  locatorNo: '',
  data: [],
});

const dictRefs = proxy?.dicts ? proxy.dicts(['QualifiedEnum', 'DC_WIRE_EXCEPTION_TYPE']) : {};

const defaultQualified = [
  { label: '合格', value: '1' },
  { label: '不合格', value: '0' },
];

const qualifiedOptions = computed(() => {
  const resolved = unref(dictRefs?.QualifiedEnum);
  if (Array.isArray(resolved) && resolved.length) return resolved;
  return defaultQualified;
});

const exceptionOptions = computed(() => {
  const resolved = unref(dictRefs?.DC_WIRE_EXCEPTION_TYPE);
  return Array.isArray(resolved) ? resolved : [];
});

const picker = reactive({
  show: false,
  rowIndex: null,
  columns: [],
});

function resolveDictLabel(key, value) {
  const source = key === 'QualifiedEnum' ? qualifiedOptions.value : exceptionOptions.value;
  const hit = source?.find?.((item) => item?.value === value || item?.dictValue === value);
  return hit?.label || hit?.dictLabel || '';
}

function goBack() {
  goBackOrHome(router);
}

function addRow(payload = {}) {
  form.data.unshift({
    _uid: ++uid,
    drawQty: payload.drawQty ?? '',
    isQualified: payload.isQualified ?? '',
    execeptionType: payload.execeptionType ?? '',
    remark: payload.remark ?? '',
    bomNo: payload.bomNo ?? '',
    bomVersion: payload.bomVersion ?? '',
    no: payload.no ?? '',
    exeMaterialNumber: payload.exeMaterialNumber ?? payload.itemMaterialNumber ?? '',
    exeMaterialName: payload.exeMaterialName ?? payload.itemMaterialName ?? '',
    mtoNo: payload.mtoNo ?? '',
    unit: payload.unit ?? '',
    finishMaterialNumber: payload.finishMaterialNumber ?? '',
    finishMaterialName: payload.finishMaterialName ?? '',
  });
}

function removeRow(index) {
  showConfirmDialog({ title: '提示', message: '确定删除该条明细吗？' })
    .then(() => {
      form.data.splice(index, 1);
    })
    .catch(() => {});
}

function handleQualifiedChange(row) {
  if (row.isQualified !== '0') {
    row.execeptionType = '';
  }
}

function openExceptionPicker(index) {
  picker.rowIndex = index;
  picker.columns = exceptionOptions.value.map((item) => ({
    text: item.label ?? item.dictLabel,
    value: item.value ?? item.dictValue,
  }));
  picker.show = true;
}

function onPickerConfirm({ selectedOptions, selectedValues }) {
  const option = selectedOptions?.[0] || selectedOptions || {};
  const value = (selectedValues && selectedValues[0]) ?? option?.value;
  if (picker.rowIndex !== null && form.data[picker.rowIndex]) {
    form.data[picker.rowIndex].execeptionType = value ?? '';
  }
  picker.show = false;
}

function isCancelError(err) {
  const message = err?.message || '';
  return message.includes('取消') || message.toLowerCase().includes('cancel');
}

function handleScanError(err) {
  if (isCancelError(err)) return;
  showToast({ message: err?.message || '扫码失败', type: 'fail' });
}

function handleLocatorScanSuccess(code) {
  if (!code) return;
  form.locatorNo = code;
}

async function handleRowScanConfirm(code) {
  if (!code) return;
  try {
    const res = await Api.application.wireInspection.getDrawContent({ key: code });
    const payload = res?.data || {};
    const { code: status, data, msg } = payload;
    if (status !== 200 || !data) throw new Error(msg || '未获取到明细信息');
    addRow({ ...data, drawQty: String(data?.drawQty ?? '') });
    showToast({ type: 'success', message: '扫码成功' });
    rowScanCode.value = '';
  } catch (err) {
    handleScanError(err);
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch (_err) {
    showToast({ type: 'fail', message: '请完善必填信息' });
    return;
  }

  if (!form.data.length) {
    showToast({ type: 'fail', message: '请至少添加一条质检明细' });
    return;
  }

  try {
    await showConfirmDialog({ title: '提示', message: '确认提交质检记录吗？' });
  } catch (_err) {
    return;
  }

  const payload = form.data.map((item) => ({
    ...item,
    locatorNo: form.locatorNo,
  }));

  try {
    const res = await Api.application.wireInspection.batchSave(payload);
    const { code, msg } = res?.data || {};
    if (code !== 200) throw new Error(msg || '提交失败');
    showToast({ type: 'success', message: '提交成功' });
    router.replace({ name: 'appsWireInspection', query: { refresh: Date.now() } });
  } catch (err) {
    showToast({ type: 'fail', message: err.message || '提交失败' });
  }
}
</script>

<style scoped>
.wire-inspection-submit {
  min-height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.wire-inspection-submit__body {
  flex: 1;
  padding-top: calc(46px + var(--van-safe-area-top, 0px));
  padding-bottom: 72px;
  box-sizing: border-box;
  overflow: auto;
}

.section {
  margin: 12px 16px;
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-top: 8px;
}

.section__title {
  font-weight: 600;
  color: #323233;
}

.section__actions {
  display: flex;
  gap: 8px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px 80px;
}

.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.detail-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-card__title {
  font-weight: 600;
  color: #323233;
}

.detail-card__meta {
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: #646566;
  margin-bottom: 8px;
}

.meta-row {
  display: flex;
  gap: 6px;
}

.meta-row .label {
  color: #969799;
  min-width: 72px;
}

.detail-empty {
  margin: 24px 0;
}

.wire-inspection-submit__footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px calc(12px + var(--van-safe-area-bottom, 0px));
  background: linear-gradient(180deg, rgba(247, 248, 250, 0.92), #f7f8fa);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
}
</style>
