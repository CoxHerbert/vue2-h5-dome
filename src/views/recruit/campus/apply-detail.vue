<template>
  <van-nav-bar title="投递详情" fixed placeholder />

  <div class="page">
    <!-- 基本信息 -->
    <section class="card candidate">
      <div class="row top">
        <div class="left">
          <div class="name">
            {{ detail.name }}
            <van-tag v-if="detail.gender" round type="primary" class="ml8">
              {{ detail.gender === 'F' ? '女' : '男' }}
            </van-tag>
          </div>
          <div class="sub">{{ detail.school }} · {{ detail.major }}</div>
        </div>
        <div class="right">
          <van-button size="mini" round plain type="primary" @click="onPreviewResume">
            简历附件
          </van-button>
        </div>
      </div>

      <van-cell-group inset>
        <van-cell title="应聘渠道" :value="detail.channel" />
        <van-cell title="推荐人" :value="detail.referrer" />
        <van-cell title="求职期望" :value="detail.expect" />
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
  name: '张**',
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

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 12px 12px max(env(safe-area-inset-bottom), 12px);
}
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 12px;
  margin-bottom: 12px;
}
.candidate .row.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 4px 8px;
}
.candidate .name {
  font-size: 18px;
  font-weight: 600;
}
.ml8 {
  margin-left: 8px;
}
.candidate .sub {
  margin-top: 4px;
  color: #8c8c8c;
  font-size: 13px;
}

.result .title {
  font-weight: 600;
  margin: 4px 4px 12px;
}
.result-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px 8px;
  text-align: center;
}
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
}
.status-text.s--pending {
  color: #3478f6;
}
.status-text.s--retest {
  color: #ff8a00;
}
.status-text.s--pass {
  color: #00c07f;
}
.status-text.s--reject {
  color: #ff3b30;
}
.status-desc {
  color: #8c8c8c;
  font-size: 13px;
  line-height: 1.4;
  padding: 0 8px 4px;
}
.safe-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
