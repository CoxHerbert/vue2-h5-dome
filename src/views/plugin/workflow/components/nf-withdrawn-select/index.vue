<!-- LaborSelectDialogVant.vue -->
<template>
  <!-- 用 Popup 实现弹窗 -->
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    :style="{ height: '85vh' }"
    @close="handleClose()"
  >
    <!-- 顶部栏 -->
    <div class="header">
      <div class="title">{{ title }}</div>
      <van-icon name="cross" class="close" @click="handleClose()" />
    </div>

    <!-- 搜索区 -->
    <div class="search-bar">
      <van-search
        v-model="query.name"
        placeholder="请输入人员姓名"
        shape="round"
        clearable
        show-action
        @search="onSearch"
        @clear="onReset"
      >
        <template #action>
          <van-button size="small" type="primary" @click="onSearch">搜索</van-button>
        </template>
      </van-search>
    </div>

    <!-- 内容区：下拉刷新 + 上拉加载 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoadMore"
      >
        <!-- 单选 -->
        <van-radio-group v-if="checkType === 'radio'" v-model="radioValue">
          <div v-for="row in data" :key="row.id" class="row-card" @click="rowClick(row)">
            <div class="row-head">
              <div class="left">
                <van-radio :name="row.id" />
                <div class="name">{{ row.name || row.realName || '-' }}</div>
              </div>
              <van-tag v-if="row.jobGradeDict" type="primary" plain>{{ row.jobGradeDict }}</van-tag>
            </div>

            <div class="row-body">
              <div class="kv">
                <span class="k">劳务公司：</span>
                <span class="v">
                  <dc-view
                    v-if="hasDcView"
                    v-model="row.companyId"
                    object-name="company"
                    show-key="id"
                  />
                  <span v-else>{{ row.companyId ?? '-' }}</span>
                </span>
              </div>

              <div class="kv">
                <span class="k">部门：</span>
                <span class="v">
                  <dc-view v-if="hasDcView" v-model="row.deptId" object-name="dept" show-key="id" />
                  <span v-else>{{ row.deptId ?? '-' }}</span>
                </span>
              </div>

              <div class="kv">
                <span class="k">岗位等级：</span>
                <span class="v">{{ row.positionDictCode ?? '-' }}</span>
              </div>

              <div class="kv">
                <span class="k">岗位：</span>
                <span class="v">{{ row.jobGradeDict ?? '-' }}</span>
              </div>

              <div class="kv">
                <span class="k">直属上级：</span>
                <span class="v">
                  <dc-view v-if="hasDcView" v-model="row.leaderId" object-name="user" />
                  <span v-else>{{ row.leaderId ?? '-' }}</span>
                </span>
              </div>

              <div class="kv">
                <span class="k">入职时间：</span>
                <span class="v">{{ row.joinedDate ?? '-' }}</span>
              </div>
            </div>
          </div>
        </van-radio-group>

        <!-- 多选 -->
        <van-checkbox-group v-else v-model="checkedIds">
          <div v-for="row in data" :key="row.id" class="row-card" @click="rowClick(row)">
            <div class="row-head">
              <div class="left">
                <van-checkbox :name="row.id" @click.stop />
                <div class="name">{{ row.name || row.realName || '-' }}</div>
              </div>
              <van-tag v-if="row.jobGradeDict" type="primary" plain>{{ row.jobGradeDict }}</van-tag>
            </div>

            <div class="row-body">
              <div class="kv">
                <span class="k">劳务公司：</span>
                <span class="v">
                  <dc-view
                    v-if="hasDcView"
                    v-model="row.companyId"
                    object-name="company"
                    show-key="id"
                  />
                  <span v-else>{{ row.companyId ?? '-' }}</span>
                </span>
              </div>

              <div class="kv">
                <span class="k">部门：</span>
                <span class="v">
                  <dc-view v-if="hasDcView" v-model="row.deptId" object-name="dept" show-key="id" />
                  <span v-else>{{ row.deptId ?? '-' }}</span>
                </span>
              </div>

              <div class="kv">
                <span class="k">岗位等级：</span>
                <span class="v">{{ row.positionDictCode ?? '-' }}</span>
              </div>

              <div class="kv">
                <span class="k">岗位：</span>
                <span class="v">{{ row.jobGradeDict ?? '-' }}</span>
              </div>

              <div class="kv">
                <span class="k">直属上级：</span>
                <span class="v">
                  <dc-view v-if="hasDcView" v-model="row.leaderId" object-name="user" />
                  <span v-else>{{ row.leaderId ?? '-' }}</span>
                </span>
              </div>

              <div class="kv">
                <span class="k">入职时间：</span>
                <span class="v">{{ row.joinedDate ?? '-' }}</span>
              </div>
            </div>
          </div>
        </van-checkbox-group>

        <!-- 空状态 -->
        <van-empty v-if="!loading && data.length === 0" description="暂无数据" />
      </van-list>
    </van-pull-refresh>

    <!-- 底部操作栏 -->
    <div class="footer">
      <van-button block plain type="default" @click="handleClose">取消</van-button>
      <van-button block type="primary" @click="handleConfirm">确定</van-button>
    </div>
  </van-popup>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';
import { showToast } from 'vant';
import Api from '@/api';

const props = defineProps({
  title: { type: String, default: '列表查询' },
  modelValue: [String, Number, Object], // 保留，不强依赖
  voUrl: { type: String, default: '/blade-bip/laborRegister/list-select' },
  customOption: Object,
  checkType: { type: String, default: 'radio' }, // radio | checkbox
  fuseorgid: { type: String, default: '' },

  // ✅ 兼容你原来的默认勾选能力：
  // radio：传 { id: xxx }
  // checkbox：传 "1,2,3"
  defaultChecked: { type: [String, Object], default: '' },
});

const emit = defineEmits(['onConfirm']);

// ---------- 复用你原项目的全局能力（$axios / useCache / dc-view） ----------
const ins = getCurrentInstance();
const proxy = ins?.proxy;

const hasDcView = computed(() => {
  // 只要项目里注册了 dc-view，就能渲染（否则 fallback 展示 id）
  return true;
});

const axiosGet = (url, params) => {
  if (proxy.$http.request)
    return proxy.$http.request({
      url,
      method: 'get',
      params,
    });

  return proxy.$http.request({
    url,
    method: 'get',
    params,
  });
};

// ---------- state ----------
const visible = ref(false);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);

const page = reactive({
  pageSize: 10,
  currentPage: 1,
  total: 0,
});

const query = reactive({
  name: '',
});

const data = ref([]);

// 勾选缓存：多选用 Set（跨页不丢）
const selectionMap = ref(new Map()); // id -> row

// radio
const radioValue = ref('');

// checkbox
const checkedIds = ref([]);

// 字典岗位
const jobList = ref([]);

// ---------- computed（兼容你原来的 ids/names） ----------
const selectionList = computed(() => Array.from(selectionMap.value.values()));

const ids = computed(() => {
  const s = new Set(selectionList.value.map((x) => x.id));
  return Array.from(s).join(',');
});

const names = computed(() => {
  const s = new Set(selectionList.value.map((x) => x.realName || x.name));
  return Array.from(s).join(',');
});

// ---------- methods ----------
function open() {
  visible.value = true;
  // 每次打开重置并拉取第一页
  resetAndLoad();
}

function handleClose() {
  visible.value = false;
}

function handleConfirm() {
  if (selectionList.value.length === 0) {
    showToast('请选择至少一条数据');
    return;
  }
  emit('onConfirm', selectionList.value);
  handleClose();
}

function onSearch() {
  resetAndLoad();
}

function onReset() {
  query.name = '';
  resetAndLoad();
}

function onRefresh() {
  refreshing.value = true;
  resetAndLoad(true);
}

function onLoadMore() {
  // 上拉加载下一页
  if (finished.value) return;
  page.currentPage += 1;
  fetchList(false);
}

function resetAndLoad(isRefresh = false) {
  finished.value = false;
  page.currentPage = 1;
  if (!isRefresh) {
    // 不清 selectionMap：保持“跨页勾选不丢”
    // selectionClear();
  }
  fetchList(true);
}

function selectionClear() {
  selectionMap.value = new Map();
  radioValue.value = '';
  checkedIds.value = [];
}

function rowClick(row) {
  const id = row.id;

  if (props.checkType === 'radio') {
    selectionMap.value = new Map([[id, row]]);
    radioValue.value = id;
    return;
  }

  // checkbox
  const next = new Map(selectionMap.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.set(id, row);
  }
  selectionMap.value = next;
  checkedIds.value = Array.from(selectionMap.value.keys());
}

function returnPositionDict(code) {
  if (!code) return '-';
  return jobList.value.find((item) => item.dictKey == code)?.dictValue || '-';
}

async function changeDefaultChecked() {
  const def = props.defaultChecked;
  if (!def) return;

  if (props.checkType === 'checkbox') {
    const checks = String(def).split(',').filter(Boolean);
    if (!checks.length) return;

    for (const c of checks) {
      // 1) 当前页查找
      let row = data.value.find((d) => String(d.id) === String(c));
      // 2) 已勾选缓存
      if (!row) row = selectionMap.value.get(c);
      // 3) 接口查找补齐
      if (!row) {
        try {
          const res = await Api.system.labor.getDetail(c);
          if (res?.data?.data) row = res.data.data;
        } catch (e) {}
      }
      if (row) selectionMap.value.set(row.id, row);
    }
    checkedIds.value = Array.from(selectionMap.value.keys());
  } else {
    // radio：期待 { id: xxx }
    const id = def?.id ?? def;
    if (!id) return;

    let row = data.value.find((d) => String(d.id) === String(id));
    if (!row) {
      try {
        const res = await Api.system.labor.getDetail({ id });
        if (res?.data?.data) row = res.data.data;
      } catch (e) {}
    }

    if (row) {
      selectionMap.value = new Map([[row.id, row]]);
      radioValue.value = row.id;
    } else {
      selectionMap.value = new Map();
      radioValue.value = '';
    }
  }
}

async function fetchList(replace = true) {
  loading.value = true;

  const params = {
    current: page.currentPage || 1,
    size: page.pageSize || 10,
    ...query,
  };
  try {
    const res = await axiosGet(props.voUrl, params);
    const total = res?.data?.total ?? 0;
    const records = res?.data?.records ?? [];

    page.total = total;

    const mapped = records.map((record) => ({
      ...record,
      name: record.name ?? record.realName,
      jobGradeDict: returnPositionDict(record.jobGradeDictCode),
    }));

    if (replace) data.value = mapped;
    else data.value = data.value.concat(mapped);

    // 是否加载完
    finished.value = data.value.length >= page.total;

    await changeDefaultChecked();
  } finally {
    loading.value = false;
    if (refreshing.value) refreshing.value = false;
  }
}

// ---------- lifecycle ----------
onMounted(async () => {
  try {
    if (proxy?.useCache) {
      const { DC_LABOR_POSITION } = await proxy.useCache([{ key: 'DC_LABOR_POSITION' }]);
      jobList.value = DC_LABOR_POSITION || [];
    }
  } catch (e) {}
});

// ---------- watch：checkType 切换时行为 ----------
watch(
  () => props.checkType,
  () => {
    selectionClear();
  },
  { immediate: true }
);

// ---------- 暴露给父组件调用 ----------
defineExpose({
  open,
  close: handleClose,
  reload: () => resetAndLoad(),
  selectionClear,
  ids,
  names,
  selectionList,
});
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px;
  border-bottom: 1px solid #f2f3f5;

  .title {
    font-size: 16px;
    font-weight: 700;
  }
  .close {
    font-size: 18px;
    padding: 6px;
  }
}

.search-bar {
  padding: 8px 12px 4px;

  :deep(.van-search__action) {
    padding-left: 8px;
  }
}

.row-card {
  margin: 10px 12px;
  padding: 12px;
  border: 1px solid #f2f3f5;
  border-radius: 12px;
  background: #fff;

  .row-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;

      .name {
        font-size: 15px;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
      }
    }
  }

  .row-body {
    margin-top: 10px;
    display: grid;
    gap: 6px;

    .kv {
      display: flex;
      gap: 6px;
      font-size: 13px;
      line-height: 18px;

      .k {
        color: #666;
        flex: 0 0 auto;
      }
      .v {
        color: #222;
        min-width: 0;
        word-break: break-all;
      }
    }
  }
}

.footer {
  position: sticky;
  bottom: 0;
  padding: 10px 12px 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  border-top: 1px solid #f2f3f5;
  background: #fff;
}
</style>
