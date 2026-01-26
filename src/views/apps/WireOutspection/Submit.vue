<template>
  <div class="page wire-inspection-submit">
    <van-nav-bar title="线材质检出库" left-arrow @click-left="goBack" />

    <div class="wire-inspection-submit__body">
      <van-cell-group>
        <van-cell title="库位编码" :value="form.locatorNo" />
        <van-cell title="出库类型" :value="outTypeOptions.find((item) => item.value === form.outType)?.label || '未知'" />
      </van-cell-group>

      <van-form ref="formRef" :model="form" scroll-to-error>
        <div class="section__header">
          <div class="section__title">明细信息</div>
          <div class="section__actions">
            <!-- <van-button size="small" type="primary" plain @click="addRow()">新增行</van-button> -->
            <dc-scan-code v-model="rowScanCode" @confirm="handleRowScanConfirm" @error="handleScanError">
              <template #default="{ open, disabled, loading }">
                <van-button size="mini" type="success" plain :loading="loading" :disabled="disabled" @click="open">
                  扫码录入
                </van-button>
              </template>
            </dc-scan-code>
          </div>
        </div>

        <ProductList v-if="form.data.length" :list="form.data" @remove="removeProduct"
          @quantity-change="handleQuantityChange" />

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
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import ProductList from './components/ProductList.vue';
import { useDictStore } from '@/store/dict';
import Api from '@/api';
import { goBackOrHome } from '@/utils/navigation';

defineOptions({ name: 'WireInspectionSubmit' });

const router = useRouter();
const route = useRoute();
const dictStore = useDictStore();

const formRef = ref(null);
const rowScanCode = ref('');

let uid = 0;

const form = reactive({
  locatorNo: '',
  outType: '',
  warehouseId: '',
  warehouseLocationId: '',
  warehouseCountId: '',
  data: [],
});

const { locatorNo = '', outType = '', warehouseId = '', warehouseLocationId = '' } = route.query;
const inStockData = ref([]);

// 初始化表单值
form.locatorNo = locatorNo;
form.outType = outType;
form.warehouseId = warehouseId;
form.warehouseLocationId = warehouseLocationId;

const outTypeOptions = ref([]);

async function initOutTypeDict() {
  try {
    const list = await dictStore.get('DC_WMS_OUT_TYPE_WMS');
    outTypeOptions.value = Array.isArray(list)
      ? list.map((item) => {
        const text = item?.label ?? item?.text ?? item?.raw?.dictLabel ?? '';
        const value = item?.value ?? item?.dictValue ?? item?.raw?.dictValue ?? '';
        return {
          text,
          label: text,
          value,
          raw: item?.raw ?? item,
        };
      })
      : [];
    syncOutTypeName();
  } catch (error) {
    console.error('failed to load out stock dict', error);
  }
}

initOutTypeDict();

function syncOutTypeName(value = form.outType) {
  const target = value != null ? String(value) : '';
  if (!target) {
    form.outStockTypeName = '';
    return;
  }
  const option = outTypeOptions.value.find((item) => String(item?.value ?? '') === target);
  form.outStockTypeName = option?.text ?? option?.label ?? '';
}

const picker = reactive({
  show: false,
  rowIndex: null,
  columns: [],
});

function removeProduct(index) {
  form.data.splice(index, 1);
}

function goBack() {
  goBackOrHome(router);
}

/** ✅ 工具：从“扫码返回的明细 data”里尽可能取到产品编码（你说的 productCode） */
function getPayloadProductCode(payload = {}) {
  // 兼容多种字段命名：productCode / itemMaterialNumber / materialNumber / code 等
  return (
    payload.productCode ??
    payload.itemMaterialNumber ??
    payload.materialNumber ??
    payload.productNo ??
    payload.code ??
    ''
  );
}

/** ✅ 工具：判断库存里是否存在该 productCode */
function hasStockByProductCode(productCode) {
  const code = productCode != null ? String(productCode).trim() : '';
  if (!code) return false;
  return (inStockData.value || []).some((row) => String(row?.productCode ?? '').trim() === code);
}

/**
 * ✅ 新增一行：新增前校验 productCode 是否存在于 inStockData
 * - 存在：正常新增
 * - 不存在：弹提示并阻止新增
 */
function addRow(payload = {}) {
  const productCode = getPayloadProductCode(payload);

  // 只有当库存数据已拉到时才做严格校验（否则避免“还没查库存就误判”）
  if (Array.isArray(inStockData.value) && inStockData.value.length) {
    const ok = hasStockByProductCode(productCode);
    if (!ok) {
      showToast({
        type: 'fail',
        message: `未找到产品库存：${productCode || '未知编码'}`,
      });
      return;
    }
  } else {
    // 兜底：库存还没回来/为空时给出更友好的提示（不强制阻止，避免卡死业务）
    // 如果你希望“必须有库存数据才能新增”，把下面两行改成 return 即可
    if (!productCode) {
      showToast({ type: 'fail', message: '扫码数据缺少产品编码，无法校验库存' });
      return;
    }
  }

  form.data.unshift({
    _uid: ++uid,

    // ✅ 把 productCode 写进行数据（便于后续显示/提交/排查）
    productCode,

    executeId: payload.itemId ?? payload.executeId ?? '',
    specification: payload.specification ?? '',
    drawQty: payload.drawQty ?? '1',
    maxDrawQty: payload.drawQty ?? '999',
    isQualified: payload.isQualified ?? '1',
    noQty: payload.noQty ?? '0',
    execeptionType: payload.execeptionType ?? '',
    remark: payload.remark ?? '',
    bomNo: payload.bomNo ?? '',
    bomVersion: payload.bomVersion ?? '',
    no: payload.no ?? '',
    itemMaterialNumber: payload.itemMaterialNumber ?? '',
    itemMaterialName: payload.itemMaterialName ?? '',
    mtoNo: payload.mtoNo ?? '',
    unit: payload.unit ?? '',
    finishMaterialNumber: payload.finishMaterialNumber ?? '',
    finishMaterialName: payload.finishMaterialName ?? '',
    maxOutQty: payload.maxOutQty ?? 0,
  });
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

async function handleRowScanConfirm(code) {
  if (!code) return;
  try {
    const res = await Api.application.wireInspection.getDrawContent({ key: code });
    const payload = res?.data || {};
    const { code: status, data, msg } = payload;
    if (status !== 200 || !data) throw new Error(msg || '未获取到明细信息');
    // ✅ 这里 addRow 内部会校验 productCode 是否存在库存
    addRow({ ...data, drawQty: String(data?.drawQty ?? ''), maxOutQty: resolveMaxDrawQty(data) });

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
    await showConfirmDialog({ title: '提示', message: '确认提交质检出库记录吗？' });
  } catch (_err) {
    return;
  }

  const payload = {
    executeVoList: form.data.map((item) => ({
      executeDetailId: item.executeId,
      outQty: Number(item.drawQty) || 0,
      warehouseLocationId: form.warehouseLocationId,
      warehouseCountId: form.warehouseCountId,
    })),
  };

  try {
    // 你当前接口是 outChangExecute(payload.executeVoList)
    const res = await Api.application.wireInspection.outChangExecute(payload.executeVoList);
    const { code, msg } = res?.data || {};
    if (code !== 200) throw new Error(msg || '提交失败');

    showToast({ type: 'success', message: '提交成功' });

    // 清空当前数据
    form.locatorNo = '';
    form.outType = '';
    form.data = [];
    router.go(-1);
  } catch (err) {
    showToast({ type: 'fail', message: err?.message || '提交失败' });
  }
}

async function handleSearch() {
  if (!form.locatorNo) {
    showToast({ message: '请先扫描库位', type: 'fail' });
    return;
  }
  try {
    const res = await Api.application.wireInspection.searchProduct({
      warehouseId: form.warehouseId,
      // locationName: form.locatorNo,
    });
    const payload = res?.data || {};
    const { code, msg, data } = payload;
    if (code !== 200 || !data) throw new Error(msg || '未获取到库存信息');

    form.warehouseCountId = data.records?.[0]?.id || '';
    inStockData.value = data.records || [];
  } catch (err) {
    showToast({ type: 'fail', message: err?.message || '查询失败' });
  }
}

handleSearch();

/** 你 template 里有用到但没贴出来的事件，这里留个空实现避免报错（如果你本来就有，可删掉） */
function handleQuantityChange() { }

/**
 * ✅ 最大可出库数量：drawQty - fullQty
 * - 负数按 0 处理
 * - 兼容 undefined / 字符串
 * - 返回整数（因为 stepper integer）
 */
const resolveMaxDrawQty = (item) => {
  if (!item) return 0
  const drawQty = toNum(item.drawQty)
  const fullQty = toNum(item.fullQty)
  const max = drawQty - fullQty;
  return Math.max(0, Math.floor(max))
}

const toNum = (val) => {
  const num = Number(val)
  return Number.isFinite(num) ? num : 0
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
  background: #fff;
  box-shadow: 0 6px 12px rgba(31, 35, 41, 0.05);
  padding: 10px 16px;
  margin-top: 8px;
  margin-bottom: 12px;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.meta-row {
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.meta-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item .label {
  color: #969799;
  font-size: 11px;
}

.meta-item .value {
  color: #323233;
  font-size: 12px;
  font-weight: 500;
  word-break: break-all;
  line-height: 1.4;
}

.detail-card__content {
  width: 100%;
  margin-left: 20px;
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
