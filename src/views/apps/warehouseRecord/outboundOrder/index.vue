<template>
  <div class="wrap-box" v-loading="loading">
    <div class="wrap-left">
      <el-steps :active="step">
        <el-step v-for="(item, index) in dictData" :key="index">
          <template #icon>
            <div class="step-item" :class="getCalss(index)">
              <span class="step-num">
                <span v-if="index >= step">{{ index + 1 }}</span>
                <el-icon v-else><Check /></el-icon>
              </span>
              <span class="step-title">{{ item.dictValue }}</span>
            </div>
          </template>
        </el-step>
      </el-steps>
      <step1
        v-if="steps2 === 0"
        :info="info"
        @out-stock-type-change="handleOutStockTypeChange"
      ></step1>
      <step2
        v-if="steps2 === 1"
        :info="info"
        @out-stock-type-change="handleOutStockTypeChange"
        @detail="getDetail"
      ></step2>
      <step3
        v-if="steps2 === 2"
        :info="info"
        @out-stock-type-change="handleOutStockTypeChange"
        @detail="getDetail"
      ></step3>
      <step4
        v-if="steps2 === 3"
        :info="info"
        @out-stock-type-change="handleOutStockTypeChange"
      ></step4>
      <step5
        v-if="steps2 === 4"
        :info="info"
        @out-stock-type-change="handleOutStockTypeChange"
      ></step5>
      <step6
        v-if="steps2 === 5"
        :info="info"
        @out-stock-type-change="handleOutStockTypeChange"
      ></step6>
    </div>
  </div>
</template>

<script setup name="CustomerSubmit">
import { reactive, toRefs, onBeforeMount, onMounted } from 'vue';
import step1 from './components/step1.vue';
import step2 from './components/step2.vue';
import step3 from './components/step3.vue';
import step4 from './components/step4.vue';
import step5 from './components/step5.vue';
import step6 from './components/step6.vue';
import { useRoute } from 'vue-router';
import Api from '@/api/index';

const route = useRoute();

const { proxy } = getCurrentInstance();
const dictData = ref([]);

// 数据字典
const { DC_WMS_OUT_STATUS } = proxy.useCache([{ key: 'DC_WMS_OUT_STATUS' }]);

const dictOutStockStatus = value => {
  let dcWmsOutStatus = DC_WMS_OUT_STATUS.value;
  if (value === 'DC_WMS_OUT_TYPE_BORROW') {
    dictData.value = dcWmsOutStatus.filter(item => item.dictKey !== 'DC_WMS_OUT_STATUS_C');
    console.log(dictData.value);
  } else {
    dictData.value = dcWmsOutStatus.slice(0, 4);
  }
};

const pageData = reactive({
  loading: false,
  step: 0,
  pageId: null,
  steps: [],
  info: {},
});

const { loading, step, pageId, steps, info } = toRefs(pageData);

const steps2 = computed(() => {
  if (route.params.id !== 'create') {
    step.value = 0;
    pageId.value = route.params.id;
    // 借用出库类型特殊处理 - 增加待归还和已归还状态
    // 判断是否为借用出库类型（领用出库）

    // 其他出库类型保持原有逻辑
    if (info.value.outStockStatus == 'DC_WMS_OUT_STATUS_PM') {
      step.value = 1;
    }
    if (info.value.outStockStatus === 'DC_WMS_OUT_STATUS_MPC') {
      step.value = 2;
    }
    if (info.value.outStockStatus === 'DC_WMS_OUT_STATUS_C') {
      step.value = 3;
    }
    // if (info.value.outStockStatus === 'DC_WMS_OUT_TYPE_BOM') {
    //   step.value = 4;
    // }
    if (info.value.outStockStatus === 'DC_WMS_OUT_STATUS_BORROW') {
      step.value = 4;
    }
    if (info.value.outStockStatus === 'DC_WMS_OUT_STATUS_RETURN') {
      step.value = 5;
    }
  }
  return step.value;
});

onBeforeMount(() => {
  pageId.value = route.params.id;
  if (route.params.id !== 'create') getDetail();
});

onMounted(() => {
  if (route.params.id === 'create') {
    setTimeout(() => {
      dictOutStockStatus('DC_WMS_OUT_TYPE_OTHER');
    }, 1000);
  }
});

const getCalss = index => {
  if (step.value === index) return 'step-item-process';
  if (step.value < index) return 'step-item-wait';
  if (step.value > index) return 'step-item-finish';
};
const getDetail = async () => {
  try {
    loading.value = true;
    const res = await Api.wms.outboundOrder.detail({ id: pageId.value });
    const { code, msg, data } = res.data;
    if (code === 200) {
      info.value = data;
    } else {
      proxy.$message({
        type: 'warning',
        message: msg,
      });
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// 处理出库类型变化
const handleOutStockTypeChange = newOutStockType => {
  if (route.params.id === 'create') {
    info.value.outStockType = newOutStockType;
    console.log('出库类型已变更:', newOutStockType);
    dictOutStockStatus(newOutStockType);
    // 重置步骤，确保步骤条正确显示
    // step.value = 0;
  } else {
    dictOutStockStatus(newOutStockType);
  }
};
</script>
<style lang="scss">
@media (max-width: 1360px) {
  .form-itme-width_50 {
    width: 100% !important;
    margin-right: 0;
  }
}
.wrap-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background: #f5f5f5;
  .wrap-left {
    padding: 30px 100px;
    flex: 1;
    height: 100%;
    overflow: auto;
    background: #fff;
    margin-right: 16px;
    .wrap-left-form {
      display: flex;
      justify-content: center;
    }
    .form-group-title {
      display: flex;
      align-items: center;
      width: 100%;
      margin: 28px 0 17px 0;
      font-weight: 600;
      font-size: 16px;
      color: #333;

      &::before {
        margin-right: 4px;
        display: block;
        content: '';
        width: 4px;
        height: 13px;
        background-color: #f78431;
      }
      .add-box {
        display: flex;
        align-items: center;
        margin-left: 40px;
        font-weight: 400;
        font-size: 14px;
        color: #f78431;
        cursor: pointer;
      }
    }
  }
  .wrap-right {
    width: 240px;
    .nav-wrap {
      width: 224px;
      background: #fff;
      border-radius: 8px;
      .nav-item {
        padding: 24px 0 24px 25px;
        font-weight: 500;
        font-size: 14px;
        color: #333;
        line-height: 14px;
        cursor: pointer;
        user-select: none;
        .process-state {
          &_finish {
            color: #f78431;
          }
          &_processing {
            color: #e12137;
          }
        }
      }
    }
  }
  .custom-form {
    display: flex;
    flex-wrap: wrap;

    .form-item-info {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }

    .group-box {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      &-item {
        width: 100%;
      }
      &-head {
        padding-left: 50px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 11px;
        font-weight: 400;
        font-size: 14px;
        color: #848488;
        line-height: 14px;
      }

      .form-item-btn {
        padding: 8px 8px 8px 10px;
        display: inline-flex;
        box-sizing: border-box;
        flex-direction: column;
        justify-content: space-between;
        width: 120px;
        height: 48px;
        background: #f6f8fa;
        border-radius: 2px;
        border: 1px solid #dadbe0;
        margin-right: 20px;
        font-size: 14px;
        color: #333;
        line-height: 14px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        &:last-child {
          margin-right: 0;
        }

        &_active {
          background: rgba(247, 132, 49, 0.1);
          border-radius: 2px;
          border: 1px solid #dadbe0;
        }
      }
    }

    .form-itme-width {
      &_50 {
        width: 50%;
        margin-right: 0;

        .form-item-value {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
      }

      &_100 {
        width: 100%;
        margin-right: 0;

        .form-itme-btn {
          padding-top: 20px;
          width: 100%;
          display: flex;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>
