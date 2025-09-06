<template>
  <van-nav-bar title="投递详情" fixed placeholder left-arrow @click-left="onClickLeft" />

  <div class="page">
    <div class="page-top-bg"></div>
    <!-- 基本信息 -->
    <section class="card candidate">
      <div class="row top">
        <div class="left">
          <div class="name">
            {{ detail.name }}
            <img height="18" src="/images/recruit/campus/apply/female.svg" alt="female" />
            <img height="17" src="/images/recruit/campus/apply/male.svg" alt="female" />
          </div>
        </div>
        <div class="right">
          <div class="resume-download" @click="onPreviewResume">
            <img height="18" src="/images/recruit/campus/apply/CV.svg" alt="CV" />
            简历附件
          </div>
        </div>
      </div>
      <div class="row">
        <van-tag plain type="primary">标签</van-tag>
        <van-tag plain type="primary">标签</van-tag>
      </div>
      <van-cell-group inset>
        <van-cell title="应聘渠道" :value="detail.channel" />
        <van-cell title="推荐人" :value="detail.referrer" />
      </van-cell-group>
      <van-cell-group title="求职期望">
        <van-cell title="意向岗位" :value="detail.position" />
        <van-cell title="意向地点" :value="detail.city" />
      </van-cell-group>
    </section>

    <!-- 评估结果 -->
    <section class="card result">
      <div class="title">评估结果</div>
      <div class="result-box">
        <img v-if="iconSrc" class="status-img" :src="iconSrc" :alt="statusText" />
        <div class="status-text" :class="statusClass">
          {{ statusText }}
        </div>
        <div class="status-desc">
          {{ finalDesc }}
        </div>
      </div>
    </section>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';

const route = useRoute();

// 1) 状态：pending | retest | pass | reject
const status = computed(() => route.query.status || 'pending');

// 2) 图标（放 public/images/recruit/campus/apply/ 下）
const icons = reactive({
  pending: '/images/recruit/campus/apply/status-pending.svg',
  retest: '/images/recruit/campus/apply/status-retest.svg',
  pass: '/images/recruit/campus/apply/status-pass.svg',
  reject: '/images/recruit/campus/apply/status-reject.svg',
});

const STATUS_MAP = {
  pending: { text: '评估中', color: '#3478F6', desc: '请耐心等待评估结果' },
  retest: {
    text: '需要复试（一面）',
    color: '#FF8A00',
    desc: '简历初筛通过，但需复试；请注意接听 HR 来电',
  },
  pass: { text: '已通过', color: '#00C07F', desc: '恭喜通过评估；请等待 HR 入职通知' },
  reject: { text: '未通过', color: '#FF3B30', desc: '很遗憾，未通过本轮；期待未来再次合作' },
};

const statusCfg = computed(() => STATUS_MAP[status.value] || STATUS_MAP.pending);
const statusText = computed(() => statusCfg.value.text);
const statusClass = computed(() => `s--${status.value}`);
const finalDesc = computed(() => statusCfg.value.desc);
const iconSrc = computed(() => icons[status.value] || '');

// 3) 详情（这里演示静态，实际可根据 route.params.applyId 请求接口）
const detail = reactive({
  name: '王大锤',
  gender: 'F',
  school: 'XXXX大学',
  major: 'XXXX专业',
  channel: '同学推荐',
  referrer: '张三（推荐方在此行内容）',
  expect: '机械工程师',
  position: '机械工程师',
  city: '浙江台州黄岩区',
  resumeUrl: '',
});

onMounted(async () => {
  const id = route.params.applyId;
  if (id) {
    // TODO: 根据 id 请求真实数据并覆盖 detail/status
    // const res = await api.getApplyDetail(id)
    // Object.assign(detail, res.data.detail)
    // status.value = res.data.status
  }
});

function onPreviewResume() {
  if (!detail.resumeUrl) return showToast('暂无简历附件');
  window.open(detail.resumeUrl, '_blank');
}
</script>

<style lang="scss" scoped>
// ========== Tokens ==========
$brand: #3060ed;
$brand-weak: rgba(48, 96, 237, 0.3);
$bg-page: #f7f8fa;
$text-strong: #333333;
$text-weak: #8c8c8c;
$radius-lg: 12px;
$shadow-soft: 0 2px 12px rgba(0, 0, 0, 0.04);
$gap: 12px;

// 状态色（自动生成 .status-text.s--xxx）
$statuses: (
  pending: #3478f6,
  retest: #ff8a00,
  pass: #00c07f,
  reject: #ff3b30,
);

// ========== Mixins / Utils ==========
@mixin card {
  position: relative;
  margin: 0 $gap $gap;
  padding: $gap;
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: $shadow-soft;
}

@function safe-bottom($fallback: 12px) {
  @return max(env(safe-area-inset-bottom), $fallback);
}

// 统一标题样式（复用 :deep 覆盖 Vant）
@mixin group-title {
  padding: 10px 0;
  color: $text-strong;
  font-weight: 600;
}

// ========== Page ==========
.page {
  min-height: 100vh;
  background: $bg-page;
  padding: $gap 0 safe-bottom(12px);
  position: relative;

  .page-top-bg {
    position: absolute;
    inset: 0 0 auto 0;
    height: 196px;
    background: linear-gradient(180deg, $brand 0%, $brand-weak 64%, rgba(48, 96, 237, 0) 100%);
    z-index: 0;
    pointer-events: none;
  }

  .resume-download {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #1d65f3;
    cursor: pointer;

    img {
      display: block;
    }
  }

  // 卡片
  .card {
    @include card;
  }
}

// ========= Vant overrides =========
:deep(.van-cell-group__title) {
  @include group-title;
}

:deep(.van-cell-group) {
  margin: 0;

  .van-cell {
    // 让每组更紧凑点
    padding: var(--van-cell-vertical-padding) 0;
  }
}

// ========== Candidate ==========
.candidate {
  .row.top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0 8px;
  }

  .name {
    font-size: 18px;
    font-weight: 600;

    img {
      vertical-align: middle;
      margin-left: 4px;
    }
  }

  .sub {
    margin-top: 4px;
    color: $text-weak;
    font-size: 13px;
  }
}

// ========== Tag（描边浅底） ==========
.van-tag--plain {
  margin-right: 5px;
  padding: 4px 8px;
  color: $brand;
  background-color: rgba($brand, 0.3);
  border-radius: 4px;
  border-color: #fff;
}

// ========== Result Box ==========
.result {
  .title {
    font-weight: 600;
    margin: 4px 4px 12px;
  }
}

.result-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px 8px;
  text-align: center;

  .status-img {
    width: 128px;
    height: 128px;
    object-fit: contain;
    margin-bottom: 8px;
  }

  .status-text {
    font-size: 18px;
    font-weight: 700;
    margin: 6px 0 4px;

    // 根据 $statuses 自动生成颜色类
    @each $key, $color in $statuses {
      &.s--#{$key} {
        color: $color;
      }
    }
  }

  .status-desc {
    color: $text-weak;
    font-size: 13px;
    line-height: 1.4;
    padding: 0 8px 4px;
  }
}

// ========== Safe bottom ==========
.safe-bottom {
  height: env(safe-area-inset-bottom);
}

// ========== 小屏微调 ==========
@media (max-width: 360px) {
  .candidate .name {
    font-size: 16px;
  }
  .result-box .status-img {
    width: 112px;
    height: 112px;
  }
}
</style>
