<template>
  <div class="wrap-left-form">
    <van-form>
      <div class="form-group-title">基本信息</div>
      <van-cell-group inset>
        <van-field label="入库类型" :model-value="inTypeLabel" readonly />
        <dc-select-dialog
          v-model="formData.warehouseId"
          label="仓库名称"
          placeholder="请点击选择仓库"
          object-name="warehouse"
          type="input"
          :multiple="false"
          :multiple-limit="1"
          :clearable="true"
          :disabled="show"
        />
        <van-field label="来源单号">
          <template #input>
            <van-field v-model="formData.inSourceNumber" readonly />
          </template>
        </van-field>
        <dc-select-dialog
          v-model="formData.applicantId"
          label="申请人"
          placeholder="请选择"
          object-name="user"
          :multiple="false"
          disabled
        />
        <dc-select-dialog
          v-model="formData.processingPersonnel"
          label="处理人"
          placeholder="请选择"
          object-name="user"
          :multiple="false"
          disabled
        />
      </van-cell-group>
      <div class="form-group-title">入库明细</div>
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
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <div class="form-itme-btn">
        <van-button block @click="cancelSubmit">返回</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup name="customerSubmit">
import { reactive, toRefs, getCurrentInstance, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const { proxy } = getCurrentInstance();
const router = useRouter();
// 子组件调用父组件方法
const emit = defineEmits(['detail']);
const detail = () => {
  emit('detail');
};
const { DC_WMS_IN_TYPE_WMS } = proxy.dicts(['DC_WMS_IN_TYPE_WMS']);
const props = defineProps({
  // 详情
  info: {
    type: Object,
    default: {},
  },
});
const pageData = reactive({
  loading: false,
  rules: {},
  formData: {},
  show: true,
  btnOpen: false,
});

const { loading, rules, formData, show, btnOpen } = toRefs(pageData);
const inTypeLabel = computed(() => {
  const list = DC_WMS_IN_TYPE_WMS?.value || [];
  const hit = list.find((item) => item.dictKey === formData.value.inType);
  return hit?.dictValue || '';
});

onMounted(() => {
  formData.value = props.info;
});

const cancelSubmit = () => {
  router.push({
    path: '/wms/warehouseRecord/warehousingEntry',
    params: {},
  });
};
</script>
<style lang="scss" scoped>
.tabel-border {
  border: 1px solid #edeae8;
}
.wrap-left-form {
  padding: 12px;
  background: #f7f8fa;
}
.form-group-title {
  font-weight: 600;
  color: #303133;
  margin: 12px 4px;
}
.detail-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}
.form-itme-btn {
  margin-top: 16px;
}
</style>
