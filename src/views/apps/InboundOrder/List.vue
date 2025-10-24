<template>
  <div class="page inbound-order-list">
    <!-- 顶部导航：主色蓝 -->
    <van-nav-bar
      fixed
      :z-index="999"
      title="入库单"
      left-arrow
      class="nav-primary"
      @click-left="goBack"
    />

    <div class="page-body">
      <!-- 吸顶头部：搜索 + 状态 Tabs -->
      <div class="sticky-header">
        <div class="search-bar">
          <van-search
            v-model="keyword"
            placeholder="请输入入库单号"
            clearable
            shape="round"
            background="#fff"
            @search="onSearch"
            @clear="onSearch"
          />
          <van-button class="search-btn" type="primary" round @click="onSearch">搜索</van-button>
        </div>

        <van-tabs
          v-model:active="activeTab"
          :title-active-color="PRIMARY"
          :color="PRIMARY"
          background="#fff"
        >
          <van-tab title="全部" />
          <van-tab title="全部合格" />
          <van-tab title="存在异常" />
        </van-tabs>
      </div>

      <!-- 统计工具条（不吸顶） -->
      <div class="toolbar">
        <div class="toolbar__meta">
          <span class="toolbar__label">入库单数量</span>
          <span class="toolbar__value">{{ displayOrders.length }}</span>
        </div>
        <div class="toolbar__meta">
          <span class="toolbar__label">总明细</span>
          <span class="toolbar__value">{{ totalCount }}</span>
        </div>
        <van-button type="primary" size="small" class="toolbar__button" @click="handleCreate">
          <van-icon name="plus" size="16" /> 新增入库单
        </van-button>
      </div>

      <!-- 列表（下拉刷新） -->
      <van-pull-refresh v-model="refreshing" class="list-wrapper" @refresh="onRefresh">
        <template v-if="displayOrders.length">
          <div
            v-for="order in displayOrders"
            :key="order.id"
            class="order-card"
            @click="openDetail(order.id)"
          >
            <div class="order-card__header">
              <div class="order-card__title">{{ order.inboundNo }}</div>
              <van-tag :type="getStatus(order).type">{{ getStatus(order).label }}</van-tag>
            </div>
            <div class="order-card__meta">
              <span>库位：{{ order.locatorNo || '-' }}</span>
              <span>创建人：{{ order.createdBy }}</span>
            </div>
            <div class="order-card__meta">
              <span>创建时间：{{ order.createdAt }}</span>
              <span>明细：{{ order.items.length }} 条</span>
            </div>
            <div class="order-card__footer">
              <div class="order-card__footer-item">
                <span class="label">图档数量合计</span>
                <span class="value">{{ sumDrawQty(order.items) }}</span>
              </div>
              <div class="order-card__footer-item">
                <span class="label">备注</span>
                <span class="value">{{ order.remark || '-' }}</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <van-empty description="暂无入库单">
            <van-button round type="primary" @click="handleCreate">新增入库单</van-button>
          </van-empty>
        </template>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import useInboundOrders from '@/composables/useInboundOrders';

const PRIMARY = 'rgb(48, 96, 237)';

const router = useRouter();
const { orders, totalCount } = useInboundOrders();

const refreshing = ref(false);

// 搜索 & 状态筛选（前端本地筛选）
const keyword = ref('');
const activeTab = ref(0); // 0: 全部 1: 全部合格 2: 存在异常

const onSearch = () => {
  // 本地筛选无需额外处理；存在后端搜索时可在此触发请求
};

const filterByTab = (order) => {
  const hasException = order.items?.some((it) => it.isQualified === '0');
  if (activeTab.value === 1) return !hasException; // 全部合格
  if (activeTab.value === 2) return hasException; // 存在异常
  return true; // 全部
};

const filterByKeyword = (order) => {
  const kw = keyword.value?.trim();
  if (!kw) return true;
  return String(order.inboundNo || '').includes(kw);
};

const displayOrders = computed(() =>
  [...(orders.value || [])]
    .filter((o) => filterByKeyword(o) && filterByTab(o))
    .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
);

const goBack = () => router.back();
const handleCreate = () => router.push({ name: 'appsInboundOrderCreate' });
const openDetail = (id) => router.push({ name: 'appsInboundOrderDetail', params: { id } });

const sumDrawQty = (items = []) => items.reduce((acc, item) => acc + Number(item.drawQty ?? 0), 0);

const getStatus = (order) => {
  const hasException = order.items?.some((item) => item.isQualified === '0');
  return hasException
    ? { label: '存在异常', type: 'danger' }
    : { label: '全部合格', type: 'success' };
};

const onRefresh = () => {
  // 如果需要联动服务端，这里触发拉取；当前示例仅本地状态，做个动效延迟
  setTimeout(() => (refreshing.value = false), 500);
};
</script>

<!-- 全局主题主色（不要 scoped） -->
<style lang="scss">
$primary: rgb(48, 96, 237);
:root {
  --van-primary-color: #{$primary};
}
</style>

<!-- 页面样式（蓝色调 + 吸顶头部），改为 SCSS -->
<style lang="scss" scoped>
$primary: rgb(48, 96, 237);
$shadow: 0 8px 22px rgba(0, 0, 0, 0.04);
$split: rgba(48, 96, 237, 0.12);
$nav-height: 46px;

.page {
  min-height: 100vh;
  background: #f7f8fa;
}

/* 顶部导航主色 */
.nav-primary {
  :deep(.van-nav-bar__content) {
    background: $primary;
    color: #fff;
  }
  :deep(.van-nav-bar .van-icon),
  :deep(.van-nav-bar__title) {
    color: #fff;
  }
}

.page-body {
  padding: ($nav-height + 12px) 16px 24px; // 预留 NavBar 高度
  box-sizing: border-box;
}

/* 吸顶头部（搜索 + Tabs） */
.sticky-header {
  position: sticky;
  top: $nav-height; // 紧贴导航栏底部
  z-index: 998;
  background: #fff;
  border-radius: 10px;
  box-shadow: $shadow;
  margin-bottom: 16px;
  overflow: hidden;

  .search-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 10px 6px 10px;

    .search-btn {
      min-width: 84px;
    }
  }

  :deep(.van-tabs__wrap) {
    box-shadow: inset 0 -1px 0 $split;
  }
  :deep(.van-tabs__line) {
    background: $primary;
  }
}

/* 工具条（统计） */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-bottom: 16px;

  &__meta {
    display: flex;
    flex-direction: column;
    background: rgba(48, 96, 237, 0.06);
    padding: 8px 12px;
    border-radius: 8px;
  }
  &__label {
    font-size: 12px;
    color: #4060ed;
  }
  &__value {
    font-size: 18px;
    font-weight: 600;
    color: #1f3bd9;
  }
  &__button {
    margin-left: auto;
  }
}

/* 列表 */
.list-wrapper {
  min-height: calc(100vh - 188px);
}

/* 卡片 */
.order-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: $shadow;
  margin-bottom: 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
  }
  &__meta {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #666;
    margin-bottom: 6px;
  }
  &__footer {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid $split;
    display: grid;
    gap: 8px;
  }
  &__footer-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;

    .label {
      color: #999;
    }
    .value {
      color: #333;
    }
  }
}

/* 兜底：按钮主色 */
:deep(.van-button--primary) {
  background: $primary;
  border-color: $primary;
}
</style>
