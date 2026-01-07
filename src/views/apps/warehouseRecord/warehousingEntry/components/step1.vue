<template>
  <div class="wrap-left-form">
    <van-form ref="ruleFormRef">
      <div class="form-group-title">基本信息</div>
      <van-cell-group inset>
        <van-field
          label="入库类型"
          :model-value="inTypeLabel"
          readonly
          is-link
          @click="showInTypePicker = true"
        />
        <van-popup v-model:show="showInTypePicker" position="bottom" round>
          <van-picker
            :columns="inTypeOptions"
            @confirm="handleInTypeConfirm"
            @cancel="showInTypePicker = false"
          />
        </van-popup>
        <van-field>
          <template #input>
            <dc-select-dialog
              v-model="formData.warehouseId"
              label="仓库名称"
              :disabled="[null, '', undefined].includes(formData.inType)"
              :placeholder="
                [null, '', undefined].includes(formData.inType)
                  ? '请先选择入库类型'
                  : '请点击选择仓库'
              "
              object-name="warehouse"
              type="input"
              :multiple="false"
              :multiple-limit="1"
              :clearable="true"
              :params="{
                stockType: getStockType(formData.inType),
              }"
              @change="(row) => handleWarehouseChange(row, 'warehouse')"
            />
          </template>
        </van-field>
        <dc-select-dialog
          v-if="formData.inType === 'DC_WMS_IN_TYPE_RETURN'"
          v-model="formData.inSourceNumber"
          label="来源单号"
          object-name="outboundOrder"
          type="input"
          :multiple="false"
          :multiple-limit="1"
          :clearable="true"
          :params="{
            outStockStatus: 'DC_WMS_OUT_STATUS_BORROW',
          }"
          @change="(row) => handleWarehouseChange(row, 'outboundOrder')"
        />
        <van-field v-else label="来源单号">
          <template #input>
            <van-field
              v-model="formData.inSourceNumber"
              placeholder="请输入选择来源单号"
              :readonly="formData.inType === 'DC_WMS_IN_TYPE_OTHER'"
              @blur="handleSerch"
            />
          </template>
        </van-field>
        <dc-select-dialog
          v-model="formData.applicantId"
          label="申请人"
          placeholder="请选择"
          object-name="user"
          :multiple="false"
          :disabled="isShow"
        />
        <dc-select-dialog
          v-model="formData.processingPersonnel"
          label="处理人"
          placeholder="请选择"
          object-name="user"
          :multiple="false"
          :disabled="isShow"
        />
        <van-field
          v-if="formData.reject"
          v-model="formData.reject"
          label="驳回原因"
          type="textarea"
          rows="2"
          readonly
        />
      </van-cell-group>
      <div class="form-group-title">入库明细</div>
      <van-button v-if="btnOpen" class="mb-5" type="primary" @click="addRow">新增</van-button>
      <van-uploader v-if="btnOpen" :after-read="uploadFile" accept=".xls,.xlsx" class="ml-2 mr-2">
        <van-button type="primary">导入</van-button>
      </van-uploader>
      <van-button v-if="btnOpen" class="mb-5" type="primary" @click="addExport"
        >下载模板</van-button
      >
      <van-cell-group inset class="tabel-border">
        <van-cell
          v-for="(item, index) in formData.detailList"
          :key="index"
          :title="item.productName"
          :label="`编码：${item.productCode || '-'}`"
        >
          <template #value>
            <div class="detail-values">
              <div>规格：{{ item.productSpec || '-' }}</div>
              <div>数量：{{ item.productQty ?? '-' }}</div>
              <div>单位：{{ item.productUnit || '-' }}</div>
              <div>
                仓位：
                <dc-view
                  v-model="item.locationId"
                  object-name="warehouseLocation"
                  show-key="locationName"
                />
              </div>
              <div class="detail-actions">
                <van-button size="small" type="primary" plain @click="handleUpdate(item)">
                  编辑
                </van-button>
                <van-button
                  v-if="btnOpen"
                  size="small"
                  type="danger"
                  plain
                  @click="removeEvaluate(item)"
                >
                  删除
                </van-button>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <div class="form-itme-btn">
        <van-button type="primary" block @click="submitForm">保存</van-button>
        <van-button type="primary" block :loading="loading" @click="submitAudit">审核</van-button>
        <van-button block @click="cancelSubmit">取消</van-button>
      </div>
    </van-form>
  </div>
  <van-popup v-model:show="open" position="right" class="drawer-popup" @close="closeDrawer">
    <div class="drawer-content">
      <div class="drawer-title">{{ title }}</div>
      <van-form ref="formRef">
        <van-cell-group inset>
          <van-field
            v-model="formDataTable.productCode"
            label="物料编号"
            placeholder="产品编码"
            :readonly="show"
          />
          <van-field
            v-model="formDataTable.productName"
            label="物料名称"
            placeholder="产品名称"
            :readonly="show"
          />
          <van-field
            v-model="formDataTable.productSpec"
            label="规格型号"
            placeholder="规格型号"
            :readonly="show"
          />
          <van-field label="数量">
            <template #input>
              <van-stepper v-model="formDataTable.productQty" :disabled="show" />
            </template>
          </van-field>
          <van-field v-model="formDataTable.productUnit" label="单位" readonly />
          <van-field label="仓位编号">
            <template #input>
              <dc-select-dialog
                v-model="formDataTable.locationId"
                placeholder="请点击仓位编号"
                object-name="warehouseLocation"
                type="input"
                :multiple="false"
                :multiple-limit="1"
                :clearable="true"
                :params="{
                  warehouseId: props.info.warehouseId,
                }"
              />
            </template>
          </van-field>
        </van-cell-group>
      </van-form>
      <div class="drawer-footer">
        <van-button type="primary" block @click="submitFormTable">提交</van-button>
        <van-button block @click="closeDrawer">取消</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, onMounted, ref, computed } from 'vue';
import Api from '@/api';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import axios from 'axios';

const inTypeMap = {
  // 现场仓库
  DC_WMS_IN_TYPE_ON_SITE_STORAGE: 'DC_WMS_STOCK_TYPE_SCENE',
  // 线边仓入库
  DC_WMS_IN_TYPE_LEW: 'DC_WMS_STOCK_TYPE_LINE_EDGE',
  // 其他入库
  DC_WMS_IN_TYPE_OTHER: '',
};

// 获取入库类型
const getStockType = (inType) => {
  return inType && inTypeMap[inType] ? inTypeMap[inType] : undefined;
};

const router = useRouter();
const { proxy } = getCurrentInstance();
const route = useRoute();
const userinfo = computed(() => proxy.$store.getters.userInfo);
const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: {},
  },
});
const { DC_WMS_IN_TYPE_WMS } = proxy.dicts(['DC_WMS_IN_TYPE_WMS']);
const showInTypePicker = ref(false);
const inTypeOptions = computed(() =>
  (DC_WMS_IN_TYPE_WMS?.value || []).map((item) => ({
    text: item.dictValue,
    value: item.dictKey,
  }))
);

const pageData = reactive({
  loading: false,
  rules: {
    warehouseId: [{ required: true, message: '请选择仓库', trigger: 'blur' }],
    inType: [{ required: true, message: '请输入入库类型', trigger: 'blur' }],
    applicantId: [{ required: true, message: '请选择申请人', trigger: 'blur' }],
    processingPersonnel: [
      {
        required: true,
        validator(_, value, callback) {
          if ([null, '', undefined].includes(value)) {
            callback(new Error('请选择处理人'));
          }
          if (value && value?.split?.(',')?.length > 1) {
            callback(new Error('不允许有多个处理人'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
  },
  formData: {
    inType: 'DC_WMS_IN_TYPE_ON_SITE_STORAGE',
    detailList: [],
  },
  formDataTable: {},
  open: false,
  title: '',
  editIndex: null,
  show: true,
  btnOpen: false,
  unitList: [],
  inStockNumberList: [],
});

const {
  loading,
  rules,
  formData,
  formDataTable,
  open,
  title,
  editIndex,
  show,
  btnOpen,
  unitList,
  inStockNumberList,
} = toRefs(pageData);

const inTypeLabel = computed(() => {
  const list = DC_WMS_IN_TYPE_WMS?.value || [];
  const hit = list.find((item) => item.dictKey === formData.value.inType);
  return hit?.dictValue || '';
});

const validateForm = async () => {
  const formRef = proxy.$refs.ruleFormRef;
  if (formRef?.validate) {
    await formRef.validate();
  }
};

const handleInTypeConfirm = (value) => {
  const selected = Array.isArray(value) ? value[0] : value;
  formData.value.inType = selected?.value ?? selected;
  showInTypePicker.value = false;
  hangleInTypeChange();
};

// 确认创建
const submitForm = () => {
  (async () => {
    try {
      await validateForm();
    } catch {
      return;
    }
    loading.value = true;
    try {
      const warehouseId =
        typeof formData.value.warehouseId === 'object'
          ? formData.value.warehouseId?.id
          : formData.value.warehouseId;
      const parmas = {
        ...formData.value,
        warehouseId: warehouseId,
      };
      const res = await Api.application.warehousingEntry.submit(parmas);
      const { code, msg } = res.data;
      loading.value = false;
      if (code === 200) {
        proxy.$message({ type: 'success', message: '保存成功' });
        router.push({
          path: '/wms/warehouseRecord/warehousingEntry',
          params: {},
        });
      }
    } catch (err) {
      loading.value = false;
    }
  })();
};

onMounted(() => {
  if (route.params.id != 'create') {
    loading.value = true;
    const timer = setTimeout(() => {
      formData.value = props.info;
      loading.value = false;
      if (formData.value.inType == 'DC_WMS_IN_TYPE_OTHER') {
        btnOpen.value = true;
      }
      clearTimeout(timer);
    }, 300);
  }
  formData.value.applicantId = userinfo.value.user_id;
  getUnitData();
});

// 获取单位下拉列表
const getUnitData = async () => {
  const res = await Api.application.warehousingEntry.unitList();
  const { code, data } = res.data;
  if (code === 200) {
    unitList.value = data;
  }
};

// 审核
const submitAudit = () => {
  (async () => {
    try {
      await validateForm();
    } catch {
      return;
    }
    loading.value = true;
    const warehouseId =
      typeof formData.value.warehouseId === 'object'
        ? formData.value.warehouseId?.id
        : formData.value.warehouseId;

    const dataList = formData.value.detailList.map((item) => ({
      ...item,
      warehouseId: warehouseId,
    }));
    const form = {
      ...formData.value,
      warehouseId: warehouseId,
      detailList: dataList,
    };

    const res = await Api.application.warehousingEntry.submitAudit(form);
    const { code, msg } = res.data;
    if (code === 200) {
      proxy.$message({ type: 'success', message: '审核成功' });
      loading.value = false;
      router.push({
        path: '/wms/warehouseRecord/warehousingEntry',
        params: {},
      });
    }
  })();
};

// 表格编辑
const handleUpdate = (row) => {
  show.value = true;
  editIndex.value = formData.value.detailList.findIndex((item) => item === row);
  if (editIndex.value !== -1) {
    open.value = true;
    formDataTable.value = { ...row }; // 创建一个新对象，避免直接修改引用
  }
};

// 提交修改
const submitFormTable = async () => {
  if (editIndex.value !== null && editIndex.value !== -1) {
    // 编辑模式：更新原列表中的数据
    formData.value.detailList[editIndex.value] = { ...formDataTable.value };
    editIndex.value = null;
  } else {
    // 新增模式
    formData.value.detailList.push({ ...formDataTable.value });
  }
  formDataTable.value = {}; // 清空表单
  open.value = false; // 关闭抽屉
};

// 表格删除
const removeEvaluate = async (row) => {
  const index = formData.value.detailList.findIndex((item) => item === row);
  if (index !== -1) {
    formData.value.detailList.splice(index, 1);
  }
};

const addRow = () => {
  title.value = '新增';
  open.value = true;
};

// 抽屉取消
const closeDrawer = () => {
  formDataTable.value = {};
  open.value = false;
};
// 取消
const cancelSubmit = () => {
  router.push({
    path: '/wms/warehouseRecord/warehousingEntry',
    params: {},
  });
};

const handleSerch = async (row) => {
  if (row) {
    try {
      loading.value = true;
      const params = {
        type: formData.value.inType,
        sourceId: formData.value.inSourceNumber,
      };
      const res = await Api.application.warehousingEntry.detailList(params);
      const { code, data } = res.data;
      if (code === 200) {
        formData.value.detailList = data;
      }
      loading.value = false;
    } catch (err) {
      loading.value = false;
    }
  } else {
    formData.value.detailList = [];
  }
};

// 选中入库类型监听事件
const hangleInTypeChange = () => {
  formData.value.inSourceNumber = null;
  if (formData.value.inType == 'DC_WMS_IN_TYPE_OTHER') {
    formData.value.inSourceNumber = null;
    show.value = false;
    btnOpen.value = true;
    formData.value.detailList = [];
  } else {
    formData.value.inSourceNumber = null;
    show.value = true;
    btnOpen.value = false;
    formData.value.detailList = [];
  }
};

// 仓库监听事件
const handleWarehouseChange = (row, type) => {
  if (type == 'warehouse') {
    formData.value.processingPersonnel = row.warehouseSupervisor;
  } else if (type == 'outboundOrder') {
    formData.value.processingPersonnel = row.id;
    getOutboundDetail(row.id);
  }
};

// 入库明细
const getOutboundDetail = async (id) => {
  if (id) {
    const params = {
      id: id,
    };
    const res = await Api.application.warehousingEntry.outboundDetail(params);
    const { code, data } = res.data;
    if (code === 200) {
      formData.value.detailList = data.detailList;
    }
  }
};

// 获取来源单号下拉列表
const getInStockNumberList = async (query) => {
  const params = {
    code: query || null,
  };
  const res = await Api.application.warehousingEntry.inStockNumberList(params);
  const { code, data } = res.data;
  if (code === 200) {
    inStockNumberList.value = data;
  }
};

// 搜索来源单号监听事件
const remoteMethod = (query) => {
  if (query.length > 3) {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      getInStockNumberList(query);
    }, 800);
  }
};

const uploadFile = async (fileObj) => {
  const form = new FormData();
  form.append('file', fileObj.file);
  const param =
    typeof formData.value.warehouseId === 'object'
      ? formData.value.warehouseId?.id
      : formData.value.warehouseId;
  const url = `/blade-bip/dc-wms-in-stock/import-excel?warehouseId=${param}`;
  loading.value = true;
  try {
    const response = await axios.post(url, form);
    if (response.data.code === 200) {
      loading.value = false;
      showToast({ type: 'success', message: '导入成功！' });
      formData.value.detailList = response.data.data;
    } else {
      showToast({ type: 'fail', message: response.data.message || '导入失败' });
    }
  } catch (error) {
    loading.value = false;
    console.error('导入失败', error);
    showToast({ type: 'fail', message: '导入失败，请稍后重试' });
  }
};

const addExport = () => {
  const excelUrl =
    'https://static.eastwinbip.com/static/%E7%8E%B0%E5%9C%BA%E4%BB%93%E5%85%B6%E4%BB%96%E5%85%A5%E5%BA%93%E6%98%8E%E7%BB%86.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dc-minio%2F20250320%2F%2Fs3%2Faws4_request&X-Amz-Date=20250320T054333Z&X-Amz-Expires=432000&X-Amz-SignedHeaders=host&X-Amz-Signature=212ade78cb1367e391b29ff742d6187320255943cdc26a1a273c543cb41bbe30';

  const link = document.createElement('a');
  link.href = excelUrl;
  link.download = 'example.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
<style lang="scss" scoped>
.tabel-border {
  border: 1px solid #edeae8;
}
.wrap-left-form {
  padding: 16px;
  background: #f5f7fb;
}
.form-group-title {
  font-weight: 600;
  color: #303133;
  margin: 16px 4px 12px;
  font-size: 15px;
}
.wrap-left-form :deep(.van-cell-group) {
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.wrap-left-form :deep(.van-cell) {
  padding-left: 12px;
  padding-right: 12px;
}
.detail-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}
.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.form-itme-btn {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drawer-popup {
  width: 85%;
  max-width: 420px;
}
.drawer-content {
  padding: 16px;
}
.drawer-title {
  font-weight: 600;
  margin-bottom: 12px;
}
.drawer-footer {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
