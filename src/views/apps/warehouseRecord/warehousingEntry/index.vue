<template>
  <div class="wrap-box">
    <van-steps :active="step">
      <van-step v-for="(item, index) in DC_WMS_IN_STATUS" :key="index">
        {{ item.label }}
      </van-step>
    </van-steps>
    <step1 v-if="steps2 === 0" :info="info" />
    <step2 v-if="steps2 === 1" :info="info" @detail="getDetail" />
    <step3 v-if="steps2 === 2" :info="info" @detail="getDetail" />
  </div>
</template>

<script setup name="CustomerSubmit">
import { reactive, toRefs, onBeforeMount, computed, getCurrentInstance } from 'vue';
import step1 from './components/step1.vue';
import step2 from './components/step2.vue';
import step3 from './components/step3.vue';
import { useRoute } from 'vue-router';
import Api from '@/api/index';
import { showToast } from 'vant';

const route = useRoute();

const { proxy } = getCurrentInstance();

// 数据字典
const { DC_WMS_IN_STATUS } = proxy.dicts(['DC_WMS_IN_STATUS']);

const pageData = reactive({
  loading: false,
  step: 0,
  pageId: null,
  info: {},
});

const { loading, step, pageId, info } = toRefs(pageData);

const steps2 = computed(() => {
  if (route.params.id !== 'create') {
    step.value = 0;
    pageId.value = route.params.id;
    if (info.value.inStockStatus == 'DC_WMS_IN_STATUS_S') {
      step.value = 0;
    }
    if (info.value.inStockStatus === 'DC_WMS_IN_STATUS_A') {
      step.value = 1;
    }
    if (info.value.inStockStatus === 'DC_WMS_IN_STATUS_C') {
      step.value = 2;
    }
  }
  return step.value;
});

onBeforeMount(() => {
  pageId.value = route.params.id;
  if (route.params.id !== 'create') getDetail();
});

// const uesrIdMaps = {
//   '1899335959778770945': 'createUserId',
//   '1899336056260345857': 'auditUserId',
//   '1899336133913690113': 'tpmHeaderOperatorId',
// };
// const AuditTimeMaps = {
//   '1899335959778770945': 'createTime',
//   '1899336056260345857': 'auditTime',
//   '1899336133913690113': 'operationOperatorDate',
// };

// const getUserId = item => {
//   return info.value?.[uesrIdMaps[item.id]];
// };

// const getTime = item => {
//   console.log('item======>', item);
//   return info.value?.[AuditTimeMaps[item.id]];
// };

// const stepProps = computed(() => {
//   return {
//     options: DC_WMS_IN_STATUS.value?.map(item => {
//       return {
//         ...item,
//         userId: getUserId(item),
//         time: getTime(item),
//       };
//     }),
//     activeIndex: steps2,
//     labelKey: 'dictValue',
//     timeKey: 'time',
//     nameKey: 'userId',
//     nameType: 'userId',
//   };
// });

const getDetail = async () => {
  try {
    loading.value = true;
    const res = await Api.application.warehousingEntry.detail({ id: pageId.value });
    const { code, msg, data } = res.data;
    if (code === 200) {
      info.value = data;
    } else {
      showToast({ type: 'warning', message: msg });
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.wrap-box {
  padding: 16px;
  background: #f5f7fb;
  min-height: 100%;
}
:deep(.van-steps) {
  margin-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px 8px;
}
</style>
