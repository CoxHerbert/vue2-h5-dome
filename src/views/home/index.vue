<!-- pages/CascaderDemo.vue -->
<template>
  <div class="page home">
    <ScrollAwareNavBar :title="t('routes.home')" fixed />
    <div class="apps__content">
      <!-- 基础用法：一次性数据（request=false） -->
      <section class="block">
        <h3>一次性数据（request=false）</h3>
        <wf-cascader
          v-model:value="selectedValue"
          :item-list="treeData"
          :default-item-list="defaultPath"
          :props="cascaderProps"
          :text="'请选择'"
          :clearable="true"
          @change="onChange"
          @complete="onComplete"
        />
        <div class="result">
          <div>当前 path: {{ currentPath }}</div>
          <div>选中值: {{ selectedValue }}</div>
        </div>
      </section>

      <hr />

      <!-- 按需加载：分级异步（request=true） -->
      <section class="block">
        <h3>按层级异步加载（request=true）</h3>
        <wf-cascader
          v-model:value="asyncValue"
          :item-list="level1"
          :receive-data="receiveData"
          :request="true"
          :props="cascaderProps"
          :text="'请选择'"
          :clearable="true"
          @change="onChangeRequest"
          @complete="onCompleteRequest"
        />
        <div class="result">
          <div>异步 path: {{ asyncPath }}</div>
          <div>异步选中值: {{ asyncValue }}</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
// 如果未全局注册，保持本地引入
import WfCascader from '@/components/wf-ui/components/wf-cascader/wf-cascader.vue';

const { t } = useI18n();

// 字段映射（与组件内部一致）
const cascaderProps = {
  label: 'text',
  value: 'value',
  children: 'children',
  desc: 'subText',
};

/** ---------------- 一次性数据（request=false） ---------------- */
const treeData = ref([
  {
    text: '华东',
    value: 'east',
    subText: '区域A',
    children: [
      {
        text: '上海',
        value: 'sh',
        subText: '直辖市',
        children: [
          { text: '浦东新区', value: 'pudong', subText: 'L3' },
          { text: '黄浦区', value: 'huangpu', subText: 'L3' },
        ],
      },
      {
        text: '江苏',
        value: 'js',
        subText: '省份',
        children: [
          { text: '南京', value: 'nj', subText: '省会' },
          { text: '苏州', value: 'sz', subText: '园林' },
        ],
      },
    ],
  },
  {
    text: '华南',
    value: 'south',
    subText: '区域B',
    children: [
      {
        text: '广东',
        value: 'gd',
        subText: '省份',
        children: [
          { text: '广州', value: 'gz', subText: '省会' },
          { text: '深圳', value: 'sz_gd', subText: '特区' },
        ],
      },
    ],
  },
]);

// ✅ 预选路径：仅真实节点，**不要**包含占位“请选择”
const defaultPath = ref([
  {
    text: '上海',
    subText: '直辖市',
    value: 'sh',
    index: 0,
  },
  {
    text: '黄浦区',
    subText: 'L3',
    value: 'huangpu',
    index: 1,
  },
]);

const selectedValue = ref(); // 受控值
const currentPath = ref('');

function onChange(payload) {
  // { layer, subIndex, ...node } — 可埋点或联动
  // console.log('change', payload)
}

function onComplete(payload) {
  // { result, value, label, desc, src }
  currentPath.value = payload.label;
  selectedValue.value = payload.value;
}

/** ---------------- 分级异步（request=true） ---------------- */
const level1 = ref([
  { text: 'A类', value: 'A', subText: '一级' },
  { text: 'B类', value: 'B', subText: '一级' },
]);

const receiveData = ref([]); // 注入下一层
const asyncValue = ref();
const asyncPath = ref('');

// 模拟接口
function mockFetchChildren(parentValue, layer) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (layer === 0) {
        resolve(
          parentValue === 'A'
            ? [
                { text: 'A-1', value: 'A1', subText: '二级' },
                { text: 'A-2', value: 'A2', subText: '二级' },
              ]
            : [
                { text: 'B-1', value: 'B1', subText: '二级' },
                { text: 'B-2', value: 'B2', subText: '二级' },
              ]
        );
      } else if (layer === 1) {
        resolve([
          { text: parentValue + '-x', value: parentValue + 'x', subText: '三级' },
          { text: parentValue + '-y', value: parentValue + 'y', subText: '三级' },
        ]);
      } else {
        resolve([]);
      }
    }, 400);
  });
}

// 每层选择后拉下一层并注入
async function onChangeRequest({ layer, value }) {
  const next = await mockFetchChildren(value, layer);
  receiveData.value = next;
}

function onCompleteRequest(payload) {
  asyncPath.value = payload.label;
  asyncValue.value = payload.value;
}
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  background: #f7f8fa;
}
.apps__content {
  padding: 24px 16px;
  padding-top: calc(72px + var(--van-safe-area-top, 0px));
  box-sizing: border-box;
}
.block {
  margin-bottom: 28px;
}
.result {
  margin-top: 10px;
  font-size: 13px;
  color: #555;
  word-break: break-all;
}
hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
}
</style>
