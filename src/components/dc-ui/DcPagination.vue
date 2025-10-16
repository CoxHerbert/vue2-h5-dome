<template>
  <div class="dc-pagination">
    <slot name="header"></slot>

    <van-pull-refresh v-model="isRefreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="isLoading"
        class="dc-pagination__list"
        :finished="finished"
        :finished-text="finishedText"
        :error="loadStatus === 'error'"
        :error-text="errorText"
        :offset="lowerThreshold"
        :immediate-check="false"
        :loading-text="loadingText"
        @load="onLoadMore"
      >
        <template v-if="list.length">
          <div
            v-for="(item, index) in list"
            :key="index"
            class="dc-pagination__item"
          >
            <slot :item="item" :index="index"></slot>
          </div>
        </template>
        <template v-else-if="!isLoading && !isRefreshing">
          <div class="dc-pagination__empty">
            <slot name="empty">暂无数据</slot>
          </div>
        </template>
      </van-list>
    </van-pull-refresh>

    <slot name="footer"></slot>
  </div>
</template>

<script setup>
import { closeToast, showLoadingToast } from 'vant';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps({
  request: {
    type: Function,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  params: {
    type: Object,
    default: () => ({}),
  },
  lowerThreshold: {
    type: Number,
    default: 50,
  },
  immediate: {
    type: Boolean,
    default: true,
  },
  showLoading: {
    type: Boolean,
    default: true,
  },
  responseAdapter: {
    type: Function,
    default: (res) => {
      const data = res?.data ?? {};
      return {
        list: data.records ?? [],
        total: data.total ?? 0,
        current: data.current ?? 1,
        pages: data.pages ?? 1,
      };
    },
  },
  loadingText: {
    type: String,
    default: '加载中...',
  },
  finishedText: {
    type: String,
    default: '没有更多了',
  },
  errorText: {
    type: String,
    default: '加载失败，点击重试',
  },
  loadingOverlayText: {
    type: String,
    default: '加载中...',
  },
});

const emit = defineEmits(['updated', 'error']);

const current = ref(1);
const list = ref([]);
const loadStatus = ref('loadmore');
const isRefreshing = ref(false);
const isLoading = ref(false);
const finished = ref(false);
const internalParams = ref({ ...props.params });

watch(
  () => props.params,
  (value) => {
    internalParams.value = { ...value };
  },
  { deep: true }
);

watch(
  list,
  (value) => {
    emit('updated', value);
  },
  { deep: true }
);

const queryParams = computed(() => ({
  ...internalParams.value,
  current: current.value,
  size: props.pageSize,
}));

const load = async (isRefresh = false) => {
  if ((finished.value && !isRefresh) || isLoading.value) {
    return;
  }

  if (isRefresh) {
    current.value = 1;
    finished.value = false;
    list.value = [];
  }

  const shouldShowOverlay = props.showLoading && !isRefreshing.value;

  if (shouldShowOverlay) {
    showLoadingToast({
      message: props.loadingOverlayText,
      forbidClick: true,
      duration: 0,
    });
  }

  isLoading.value = true;
  loadStatus.value = 'loading';

  try {
    const response = await props.request({ ...queryParams.value });
    const { list: records = [], current: currentPage = current.value, pages = 1 } =
      props.responseAdapter(response) ?? {};

    list.value = isRefresh ? [...records] : [...list.value, ...records];

    if (!records.length || currentPage >= pages) {
      finished.value = true;
      loadStatus.value = 'nomore';
    } else {
      finished.value = false;
      current.value = currentPage + 1;
      loadStatus.value = 'loadmore';
    }
  } catch (error) {
    loadStatus.value = 'error';
    emit('error', error);
  } finally {
    if (shouldShowOverlay) {
      closeToast();
    }
    isLoading.value = false;
    isRefreshing.value = false;
  }
};

const onRefresh = () => {
  if (isLoading.value) {
    isRefreshing.value = false;
    return;
  }
  isRefreshing.value = true;
  load(true);
};

const onLoadMore = () => {
  if (loadStatus.value === 'loadmore' || loadStatus.value === 'error') {
    load();
  }
};

const refresh = () => {
  onRefresh();
};

const reload = (newParams = {}) => {
  internalParams.value = { ...props.params, ...newParams };
  finished.value = false;
  current.value = 1;
  list.value = [];

  nextTick(() => {
    load(true);
  });
};

const getList = () => list.value;

onMounted(() => {
  if (props.immediate) {
    load();
  }
});

defineExpose({
  load,
  refresh,
  reload,
  getList,
});
</script>

<style scoped lang="scss">
.dc-pagination {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(.van-pull-refresh) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(.van-pull-refresh__track) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__list {
    flex: 1;
    overflow: auto;
  }

  &__item {
    padding: 20rpx;
    border-radius: 16rpx;
    background-color: #fff;
    margin: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  }

  &__empty {
    text-align: center;
    padding: 80rpx;
    color: #999;
    font-size: 28rpx;
  }
}
</style>
