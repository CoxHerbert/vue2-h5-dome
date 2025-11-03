<!-- pages/MaterialInfo.vue -->
<template>
  <div class="page-container page-material-info">
    <!-- 顶部栏 -->
    <van-nav-bar
      :z-index="999"
      title="物料信息维护"
      left-arrow
      class="mi-navbar"
      @click-left="$router?.back?.()"
    />

    <div ref="pageBodyRef" class="page-body">
      <!-- 搜索区（吸顶） -->
      <van-sticky
        :offset-top="stickyTop"
        :container="pageBodyRef"
        :z-index="998"
        @scroll="onStickyScroll"
      >
        <div class="search-container" :class="{ 'is-fixed': isSearchSticky }">
          <van-search
            v-model="snCode"
            placeholder="请输入物料编码查询"
            shape="square"
            :show-action="false"
            :input-align="'left'"
            class="mi-search"
            @search="doAction('search')"
          />
          <van-button type="success" @click="doAction('handleSearch')">
            <van-icon name="search" size="18" /> 查询
          </van-button>
          <van-button type="primary" @click="doAction('scanCode')">
            <van-icon name="scan" size="18" />
          </van-button>
        </div>
      </van-sticky>

      <!-- 表单 -->
      <div v-if="formData.id" class="form-box">
        <van-form ref="formRef" :model="formData" :rules="rules">
          <div v-for="(group, i) in groups" :key="i" class="group">
            <div class="group-title">{{ group.label }}</div>
            <div class="group-content">
              <!-- 字段渲染 -->
              <div
                v-for="(item, j) in group.columns || []"
                :key="j"
                class="mi-form-item"
                :class="{ disabled: item.props && item.props.disabled }"
              >
                <!-- input -->
                <van-field
                  v-if="item.type === 'input'"
                  v-model="formData[item.prop]"
                  :name="item.prop"
                  :label="item.label"
                  :placeholder="`请输入${item.label}`"
                  v-bind="item.props"
                />

                <!-- ✅ Vant 选择（字典）: van-field + van-popup + van-picker -->
                <van-field
                  v-else-if="item.type === 'select-dict'"
                  :label="item.label"
                  is-link
                  readonly
                  :model-value="displayDictText(item)"
                  :placeholder="item.props?.placeholder || '请选择'"
                  @click="openDictPicker(item)"
                />

                <!-- ✅ Vant 选择（通用下拉 / 原 dc-select-popup 语义） -->
                <van-field
                  v-else-if="item.type === 'dc-select-popup'"
                  :label="item.label"
                  is-link
                  readonly
                  :model-value="displayOptionText(item)"
                  :placeholder="item.props?.placeholder || '请选择'"
                  @click="openOptionsPicker(item)"
                />

                <!-- ✅ Vant 数字：替代 number -->
                <van-field
                  v-else-if="item.type === 'number'"
                  :label="item.label"
                  type="number"
                  :name="item.prop"
                  :placeholder="item.props?.placeholder || `请输入${item.label}`"
                  :formatter="(v) => formatDecimal(v, item.props?.precision, item.props?.min)"
                  format-trigger="onChange"
                  :model-value="formData[item.prop]"
                  v-bind="filterFieldProps(item)"
                  @update:model-value="(val) => onNumberInput(item, val)"
                />

                <!-- ✅ Vant 数字（重量）：替代 weight -->
                <van-field
                  v-else-if="item.type === 'weight'"
                  :label="item.label"
                  type="number"
                  :name="item.prop"
                  :placeholder="item.props?.placeholder || `请输入${item.label}`"
                  :formatter="(v) => formatDecimal(v, item.props?.precision, item.props?.min)"
                  format-trigger="onChange"
                  :model-value="formData[item.prop]"
                  v-bind="filterFieldProps(item)"
                  @update:model-value="(val) => onNumberInput(item, val)"
                />

                <!-- 上传 -->
                <div v-else-if="item.type === 'upload-img'" class="upload-img-box">
                  <div class="upload-box">
                    <WfUpload v-model="formData[item.prop]" :column="item.props.column" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-form>
      </div>

      <!-- 底部按钮 -->
      <div v-if="formData.id" class="page-body_footer">
        <van-button block type="success" @click="doAction('submit')">
          <van-icon name="passed" size="18" /> 提交
        </van-button>
      </div>

      <!-- 无数据提示 -->
      <div v-if="!formData.id" class="no-data">暂无数据, 请先扫码查询</div>
    </div>

    <!-- 扫码弹窗（按你备注保留原有逻辑/接口） -->
    <dc-scan-code v-if="show" ref="scanCodeRef" @confirm="handleScanCode" />

    <!-- 统一 Picker 弹层：字典 / 选项共用 -->
    <van-popup v-model:show="picker.show" position="bottom" round>
      <van-picker
        :columns="picker.columns"
        @confirm="onPickerConfirm"
        @cancel="picker.show = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { closeToast, showToast } from 'vant';
import WfUpload from '@/components/wf-ui/components/wf-upload/wf-upload.vue';
import Api from '@/api';

defineOptions({ name: 'MaterialInfo' });

/** ======= state ======= */
const pageBodyRef = ref(null);
const stickyTop = ref(0);
const isSearchSticky = ref(false);

const show = ref(false);
const snCode = ref('');
const formData = reactive({});
const formRef = ref(null);

// Vant Form 的 rules：{ [fieldName]: Rule[] }
const rules = reactive({
  // 示例：
  // qty: [{ required: true, message: '请输入数量', trigger: 'onBlur' }]
});

// 字典缓存
const dictMap = reactive({
  DC_ERP_UNIT: [],
});

// 统一 picker 状态（字典/普通下拉共用）
const picker = reactive({
  show: false,
  forProp: '', // 作用字段
  columns: [], // [{ text, value }]
  source: 'dict', // 'dict' | 'options'
  meta: null, // 记录 item 与 props
});

// 字段分组（保持不变）
const groups = ref([
  {
    label: '基本信息',
    columns: [
      { label: '物料名称', prop: 'materialName', type: 'input', props: { disabled: true } },
      { label: '物料编码', prop: 'materialNumber', type: 'input', props: { disabled: true } },
      { label: '品牌', prop: 'brand', type: 'input', props: { disabled: true } },
      { label: '规格型号', prop: 'specification', type: 'input', props: { disabled: true } },
      {
        label: '单位',
        prop: 'unitDict',
        type: 'select-dict',
        props: {
          disabled: true,
          dictKey: 'DC_ERP_UNIT',
          labelKey: 'dictValue',
          valueKey: 'dictKey',
          placeholder: '请选择',
        },
      },
      { label: '物料属性', prop: 'attribute', type: 'input', props: { disabled: true } },
      { label: '存货类别', prop: 'categoryName', type: 'input', props: { disabled: true } },
    ],
  },
  {
    label: '尺寸信息',
    columns: [
      {
        label: '尺寸单位',
        prop: 'sizeUnit',
        type: 'select-dict',
        props: {
          dictKey: 'DC_ERP_UNIT',
          labelKey: 'dictValue',
          valueKey: 'dictKey',
          placeholder: '请选择',
        },
      },
      { label: '长', prop: 'length', type: 'number', props: { min: 0, precision: 4 } },
      { label: '宽', prop: 'width', type: 'number', props: { min: 0, precision: 4 } },
      { label: '高', prop: 'height', type: 'number', props: { min: 0, precision: 4 } },
    ],
  },
  {
    label: '重量信息',
    columns: [
      {
        label: '数量',
        prop: 'qty',
        type: 'number',
        props: { placeholder: '请输入', min: 1, precision: 0 },
      },
      {
        label: '重量单位',
        prop: 'weightUnit',
        type: 'select-dict',
        props: {
          dictKey: 'DC_ERP_UNIT',
          labelKey: 'dictValue',
          valueKey: 'dictKey',
          placeholder: '请选择',
        },
      },
      {
        label: '毛重',
        prop: 'grossWeight',
        type: 'weight',
        props: { placeholder: '请输入', min: 0, precision: 4 },
      },
      {
        label: '净重',
        prop: 'netWeight',
        type: 'weight',
        props: { placeholder: '请输入', min: 0, precision: 4 },
      },
    ],
  },
  {
    label: '附件信息',
    columns: [
      {
        label: '附件',
        prop: 'attachId',
        type: 'upload-img',
        props: {
          column: {
            type: 'upload',
            label: '上传',
            span: 24,
            display: true,
            showFileList: true,
            multiple: false,
            limit: 1,
            propsHttp: { url: 'attachId', name: 'originalName', res: 'data' },
            prop: 'attachId',
            action: '/blade-resource/oss/endpoint/put-file-attach-path',
            drag: true,
            headers: { filePath: 'scm/material' },
          },
        },
      },
    ],
  },
]);

/** ======= lifecycle (created) ======= */
loadDicts(['DC_ERP_UNIT']);

/** ======= methods（setup 版） ======= */
// Sticky
function onStickyScroll(e) {
  isSearchSticky.value = !!e?.isFixed;
}

// 字典与下拉
async function loadDicts(keys = []) {
  const tasks = keys.map(async (k) => {
    try {
      if (Api?.application?.materialMaintenance?.getDict) {
        const res = await Api.application.materialMaintenance.getDict({ key: k });
        const list = (res?.data?.data ?? res?.data ?? []).filter(Boolean);
        dictMap[k] = Array.isArray(list) ? list : [];
      } else {
        dictMap[k] = [];
      }
    } catch (err) {
      dictMap[k] = [];
    }
  });
  await Promise.allSettled(tasks);
}

function displayDictText(item) {
  const { dictKey, labelKey = 'label', valueKey = 'value' } = item.props || {};
  const list = dictMap?.[dictKey] || [];
  const val = formData?.[item.prop];
  const hit = list.find((x) => x?.[valueKey] === val);
  return hit ? hit[labelKey] : '';
}

function displayOptionText(item) {
  const { options = [], labelKey = 'label', valueKey = 'value' } = item.props || {};
  const val = formData?.[item.prop];
  const hit = options.find((x) => x?.[valueKey] === val);
  return hit ? hit[labelKey] : '';
}

function openDictPicker(item) {
  const { dictKey, labelKey = 'label', valueKey = 'value' } = item.props || {};
  const list = dictMap?.[dictKey] || [];
  const open = (arr) => {
    picker.forProp = item.prop;
    picker.columns = arr.map((x) => ({ text: x[labelKey], value: x[valueKey] }));
    picker.source = 'dict';
    picker.meta = item;
    picker.show = true;
  };

  if (!list.length) {
    loadDicts([dictKey]).then(() => {
      const again = dictMap?.[dictKey] || [];
      if (!again.length) showToast({ message: '暂无可选项' });
      open(again);
    });
    return;
  }
  open(list);
}

function openOptionsPicker(item) {
  const { options = [], labelKey = 'label', valueKey = 'value' } = item.props || {};
  if (!options.length) {
    showToast({ message: '暂无可选项' });
    return;
  }
  picker.forProp = item.prop;
  picker.columns = options.map((x) => ({ text: x[labelKey], value: x[valueKey] }));
  picker.source = 'options';
  picker.meta = item;
  picker.show = true;
}

function onPickerConfirm({ selectedValues, selectedOptions }) {
  const opt = selectedOptions?.[0] || selectedOptions || {};
  const value = (selectedValues && selectedValues[0]) ?? opt?.value;
  if (picker.forProp) {
    formData[picker.forProp] = value;
  }
  picker.show = false;
}

// 数值输入（替代 number / weight）
function filterFieldProps(item) {
  const p = item.props || {};
  const { disabled, clearable, maxlength, inputAlign } = p;
  return { disabled, clearable, maxlength, 'input-align': inputAlign };
}

function formatDecimal(value, precision = 0, min) {
  if (value === undefined || value === null) return '';
  let v = String(value).replace(/[^\d.-]/g, '');
  const neg = v.startsWith('-');
  v = v.replace(/-/g, '');
  const parts = v.split('.');
  v = parts[0].replace(/^0+(\d)/, '$1');
  if (parts.length > 1) v += '.' + parts[1].slice(0, Math.max(0, precision));
  if (neg && (min === undefined || min < 0)) v = '-' + v;

  if (v === '' || v === '-' || v === '.') return v;
  const num = Number(v);
  if (!Number.isNaN(num)) {
    if (typeof min === 'number' && num < min) return String(min);
    if (typeof precision === 'number') {
      return num.toFixed(precision).replace(new RegExp(`(\\.\\d{0,${precision}})\\d*$`), '$1');
    }
  }
  return v;
}

function onNumberInput(item, val) {
  const str = formatDecimal(val, item.props?.precision, item.props?.min);
  const num = str === '' || str === '-' || str === '.' ? null : Number(str);
  formData[item.prop] = num;
  handleFormItemChange(item, num);
}

/** 扫码/查询/提交 */
const scanCodeRef = ref(null);

function scanCode() {
  show.value = true;
  nextTick(() => {
    scanCodeRef.value
      ?.open()
      .then((val) => {
        if (!val) return;
        snCode.value = val;
        handleSearch();
        show.value = false;
      })
      .catch(() => {
        show.value = false;
      });
  });
}

function handleScanCode(code) {
  if (!code) return;
  snCode.value = code;
  handleSearch();
}

function handleSearch() {
  Api.application.materialMaintenance
    .load({ qrcode: snCode.value })
    .then((res) => {
      closeToast();
      const { code, data } = res.data || {};
      if (code === 200) {
        Object.assign(formData, {
          ...data,
          materialFileId: undefined,
          attachId: data?.materialFileId ? [{ value: data.materialFileId }] : [],
        });
        if (data?.materialFileId) {
          Api.application.materialMaintenance
            .getFileById({ ids: data.materialFileId })
            .then((resFile) => {
              const { code: fileCode, data: fileData } = resFile || {};
              if (fileCode === 200 && fileData?.[0]) {
                formData.attachId = [{ label: fileData[0].originalName, value: fileData[0].id }];
              }
            });
        }
      }
    })
    .catch(() => {
      closeToast();
    });
}

function doAction(action) {
  if (['scanCode', 'handleSearch', 'search'].includes(action)) {
    return action === 'scanCode' ? scanCode() : handleSearch();
  }
  if (action === 'submit') {
    formRef.value?.validate?.().then(() => {
      Api.application.materialMaintenance
        .update({
          scmMaterial: { ...formData, attachId: undefined },
          attachId: formData.attachId?.length ? formData.attachId?.[0] : undefined,
        })
        .then((res) => {
          closeToast();
          const { code } = res || {};
          if (code === 200) {
            showToast({ message: '保存成功' });
          }
        })
        .catch((error) => {
          closeToast();
          showToast({ message: error?.msg || '保存失败' });
        });
    });
  }
}

// 原有联动逻辑（照搬）
function handleFormItemChange(col, val) {
  if (col.prop === 'grossWeight') {
    if (![undefined, null].includes(val)) {
      formData[col.prop] = (val / formData.qty).toFixed(4);
    }
    if (![undefined, null].includes(formData.qty)) {
      formData.grossWeight = null;
    }
  } else if (col.prop === 'netWeight') {
    if (![undefined, null].includes(val)) {
      formData[col.prop] = (val / formData.qty).toFixed(4);
    }
    if (![undefined, null].includes(formData.qty)) {
      formData.netWeight = null;
    }
  } else if (col.prop === 'qty') {
    formData.grossWeight = null;
    formData.netWeight = null;
  }
}
</script>

<style lang="scss" scoped>
.page-material-info {
  /* 顶部吸顶的偏移量：NavBar 不固定时为 0；若 NavBar 固定，可在外层或页面里把此变量设为 46px + safe-area */
  --mi-sticky-top: 0px;

  min-height: 100vh;
  display: flex;
  flex-flow: column nowrap;
  background: linear-gradient(180deg, #f7e9df 0%, rgba(255, 255, 255, 0) 12%) !important;
  padding-bottom: 200rpx;
  box-sizing: border-box;

  .no-data {
    width: 100%;
    text-align: center;
    margin-top: 100px;
    color: #999;
  }

  :deep(.van-field__control) {
    width: calc(100% - 16px);
  }

  .disabled :deep(.van-field__control) {
    background-color: rgba(0, 0, 0, 0.05) !important;
  }

  /* ✅ 搜索吸顶：跟随 .page-body（内部滚动容器）吸顶 */
  .search-container {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #fff;

    position: sticky;
    top: var(--mi-sticky-top);
    z-index: 9;
    border-bottom: 1px solid #f2f3f5;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);

    .mi-search {
      flex: 1;
    }

    :deep(.van-button) {
      padding: 0 12px;
      height: 34px;
      line-height: 32px;
    }
  }

  .page-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto; /* 作为 sticky 的滚动容器 */
    -webkit-overflow-scrolling: touch;
    /* 若 NavBar 改为 fixed，可在运行时覆盖：
       --mi-sticky-top: calc(46px + env(safe-area-inset-top));
    */
  }

  .group-title {
    padding: 10px 0;
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    line-height: 2;
  }

  .group-content {
    border-radius: 6px;
    background-color: #fff;
    padding: 4px 0;
  }

  .mi-form-item + .mi-form-item {
    border-top: 1px solid #f5f5f5;
  }

  .page-body_footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 100;
    padding: 12px 16px calc(24rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.04);
  }

  .upload-img-box {
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-flow: row nowrap;
    position: relative;

    .upload-box {
      flex: 1;
    }

    :deep(.wf-upload) {
      width: calc(100% - 80px);
      min-width: 200px;
      flex: 1;

      .wf-upload-file {
        width: 200px;
      }
      .wf-upload-file__item--name {
        display: block;
        width: 200px;
      }
    }

    .clear {
      background-color: gray;
      width: 80px;
    }
  }
}
</style>
