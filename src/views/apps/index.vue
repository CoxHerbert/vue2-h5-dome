<template>
  <div class="dc-apps page">
    <van-nav-bar :title="t('routes.apps')" />

    <div class="dc-apps__content">
      <van-grid class="dc-apps__grid" :column-num="4" :gutter="12" clickable :border="false">
        <van-grid-item
          v-for="app in apps"
          :key="app.routeName || app.url || app.label"
          :to="app.url ? undefined : app.routeName ? { name: app.routeName } : undefined"
          style="padding: 0"
          @click="handleClick(app)"
        >
          <template #icon>
            <img :src="withBase(app.icon)" :alt="app.label" class="dc-apps__icon" loading="lazy" />
          </template>
          <template #text>
            <span class="dc-apps__label">{{ app.label }}</span>
          </template>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { withBase } from '@/utils/util';

const { t } = useI18n();

/**
 * 规则：
 * - 有 url 就外链新开；
 * - 否则若有 routeName 交给 :to 处理；
 * - 两者都没有则不跳。
 */
const handleClick = (app) => {
  if (app?.url) {
    // 如需同页打开可改为 '_self'
    window.open(app.url, '_blank', 'noopener,noreferrer');
  }
};
import.meta.env.BASE_URL;
const apps = [
  { label: '流程中心', icon: '/images/apps/流程中心.svg', routeName: 'home' },
  {
    label: '料况跟进',
    icon: '/images/apps/料况跟进.svg',
    routeName: 'appsMaterialTracking',
    url: 'http://board.eastwinsz.com:8022/webroot/decision/view/report?viewlet=DC%252Fphone%252Fsuplier.cpt&username=',
  },
  { label: '入库单', icon: '/images/apps/入库单.svg', routeName: 'appsInboundOrder' },
  { label: '现场计划单', icon: '/images/apps/现场计划单.svg', routeName: 'appsSitePlanning' },
  { label: '工时汇报', icon: '/images/apps/工时汇报.svg', routeName: 'appsWorkReport' },
  { label: '工序外发', icon: '/images/apps/工序外发.svg', routeName: 'appsOutSourcing' },
  { label: '确认领料', icon: '/images/apps/确认领料.svg', routeName: 'appsPickingConfirmation' },
  {
    label: '物料信息维护',
    icon: '/images/apps/物料信息维护.svg',
    routeName: 'appsMaterialMaintenance',
  },
  {
    label: '线材质检入库',
    icon: '/images/apps/线材质检.svg',
    routeName: 'appsWireInspectionSubmit',
  },
  {
    label: '线材质检出库',
    icon: '/images/apps/线材质检.svg',
    routeName: 'appsWireOutspectionList',
  },
  // { label: '出货资料上传', icon: '/images/apps/出货资料上传.svg', routeName: 'appsShipmentUpload' },
  { label: '外协核价', icon: '/images/apps/外协核价.svg', routeName: 'appsOutsourcingQuotation' },
  { label: '装配工具借用', icon: '/images/apps/测试.svg', routeName: 'appsWarehouseRecord' },
  { label: '装配工具归还', icon: '/images/apps/测试.svg', routeName: 'appsWarehousingEntry' },
  { label: '自助出库', icon: '/images/apps/自助出库.svg', routeName: 'appsSelfOutbound' },
  { label: '铭牌绑定', icon: '/images/apps/名牌绑定.svg', routeName: 'appsNameplateBinding' },
];
</script>

<style lang="scss" scoped>
.dc-apps {
  // 主题变量（可按需覆盖）
  --dc-page-bg: #f7f8fa;
  --dc-card-bg: #ffffff;
  --dc-text: #323233;
  --dc-radius: 16px;

  min-height: 100vh;
  background: var(--dc-page-bg);

  &__content {
    padding: 16px;
    box-sizing: border-box;
  }

  // 覆盖 van-grid-item 内边距
  :deep(.van-grid-item),
  :deep(.van-grid-item__content) {
    padding: 0;
  }

  &__grid {
    background: var(--dc-card-bg);
    border-radius: var(--dc-radius);
    padding: 12px 0;

    // 小的悬浮与按压反馈
    :deep(.van-grid-item__content) {
      border-radius: 12px;
      transition:
        transform 0.12s ease,
        box-shadow 0.12s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      }

      &:active {
        transform: translateY(0);
        box-shadow: none;
      }
    }
  }

  &__icon {
    width: 48px;
    height: 48px;
    display: block;
    margin: 0 auto;
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: #585b61;
  }
}
</style>
