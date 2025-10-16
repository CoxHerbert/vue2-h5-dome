<template>
  <div class="me-page">
    <van-nav-bar :title="t('me.navTitle')" fixed />

    <div class="me-header" :style="{ paddingTop: '54px' }">
      <div class="me-profile">
        <img
          class="avatar"
          :src="user.avatar || defaultAvatar"
          alt="avatar"
          @error="onAvatarError"
        />
        <div class="meta">
          <div class="name">
            {{ user.realName || user.name || user.username || t('me.profile.unnamed') }}
            <van-tag v-if="user.deptName" plain type="primary" class="ml8">{{
              user.deptName
            }}</van-tag>
          </div>
          <div class="sub">
            <span v-if="user.account">{{ t('me.profile.account') }}：{{ user.account }}</span>
            <span v-if="user.phone" class="dot">·</span>
            <span v-if="user.phone">{{ user.phone }}</span>
          </div>
        </div>
      </div>

      <div class="me-dashboard">
        <button
          type="button"
          class="points-card interactive"
          @click="navigateToRoute('mePoints')"
        >
          <span class="points-label">{{ t('me.dashboard.pointsLabel') }}</span>
          <span class="points-value">{{ stats.pointsDisplay }}</span>
          <span class="points-meta">{{ joinDaysText }}</span>
        </button>

        <div class="metrics-grid">
          <button
            v-for="metric in metrics"
            :key="metric.key"
            type="button"
            class="metric interactive"
            @click="navigateToRoute(metric.routeName)"
          >
            <span class="metric-label">{{ metric.label }}</span>
            <span class="metric-value">{{ metric.display }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="me-body">
      <section class="me-card interactive" @click="navigateToRoute('mePunch')">
        <div class="card-title-row">
          <span class="card-title">{{ t('me.dashboard.todayPunch.title') }}</span>
          <van-icon name="arrow" class="card-arrow" />
        </div>

        <div v-if="punchRecords.length" class="timeline">
          <div class="timeline-item" v-for="(time, index) in punchRecords" :key="index">
            <div class="timeline-left">
              <span class="timeline-dot"></span>
              <span
                v-if="index !== punchRecords.length - 1"
                class="timeline-line"
              ></span>
            </div>
            <div class="timeline-content">
              <div class="timeline-title">{{ t('me.dashboard.todayPunch.timeLabel') }}</div>
              <div class="timeline-time">{{ time }}</div>
            </div>
          </div>
        </div>
        <div v-else class="timeline-empty">{{ t('me.dashboard.todayPunch.empty') }}</div>
      </section>

      <section class="me-card">
        <div class="card-title-row">
          <span class="card-title">{{ t('me.dashboard.functions.title') }}</span>
        </div>
        <div class="func-grid">
          <button
            v-for="item in functionItems"
            :key="item.key"
            type="button"
            class="func-item interactive"
            @click="handleFunction(item)"
          >
            <span class="func-icon">
              <van-icon :name="item.icon" />
            </span>
            <span class="func-text">{{ item.label }}</span>
          </button>
        </div>
      </section>

      <van-cell-group inset class="mt12">
        <van-cell :title="t('me.language.title')">
          <template #right-icon>
            <van-radio-group v-model="selectedLocale" direction="horizontal">
              <van-radio name="zh-CN">{{ t('me.language.zhCN') }}</van-radio>
              <van-radio name="en-US">{{ t('me.language.enUS') }}</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 只展示：职位、角色、入职时间、邮箱 -->
      <van-cell-group inset class="mt12">
        <van-cell :title="t('me.cells.position')" :value="postText" />
        <van-cell :title="t('me.cells.role')" :value="roleText" />
        <van-cell :title="t('me.cells.joinedDate')" :value="joinedDateText" />
        <van-cell :title="t('me.cells.email')" :value="user.email || '-'" />
      </van-cell-group>

      <van-cell-group inset class="mt12">
        <van-cell :title="t('me.actions.changePassword')" is-link @click="openPwdPopup" />
        <van-cell :title="t('me.actions.logout')" is-link @click="confirmLogout" />
      </van-cell-group>
    </div>

    <!-- 修改密码 -->
    <van-popup
      v-model:show="pwd.show"
      position="bottom"
      round
      closeable
      :style="{ height: 'auto' }"
    >
      <div class="sheet">
        <div class="sheet-title">{{ t('me.form.title') }}</div>
        <van-form ref="pwdFormRef" @submit="submitChangePwd">
          <van-field
            v-model="pwd.oldPassword"
            type="password"
            :label="t('me.form.oldPassword.label')"
            :placeholder="t('me.form.oldPassword.placeholder')"
            :rules="[{ required: true, message: t('me.form.oldPassword.placeholder') }]"
            clearable
          />
          <van-field
            v-model="pwd.newPassword"
            type="password"
            :label="t('me.form.newPassword.label')"
            :placeholder="t('me.form.newPassword.placeholder')"
            :rules="[
              { required: true, message: t('me.form.newPassword.placeholder') },
              { validator: validateNewPwd, message: t('me.validation.newPassword') },
            ]"
            clearable
          />
          <van-field
            v-model="pwd.confirmPassword"
            type="password"
            :label="t('me.form.confirmPassword.label')"
            :placeholder="t('me.form.confirmPassword.placeholder')"
            :rules="[{ validator: validateConfirmPwd, message: t('me.validation.confirmPassword') }]"
            clearable
          />
          <div class="action">
            <van-button type="default" block class="mr8" @click="pwd.show = false"
              >{{ t('me.form.cancel') }}</van-button
            >
            <van-button type="primary" block native-type="submit" :loading="pwd.loading"
              >{{ t('me.form.confirm') }}</van-button
            >
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, getCurrentInstance, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import Api from '@/api';
import { changeLocale } from '@/locales';

const { proxy } = getCurrentInstance();
const router = useRouter();
const auth = useAuthStore();
const userStore = useUserStore();
const { t, locale } = useI18n();

const selectedLocale = ref(locale.value);

watch(locale, (val) => {
  if (val && val !== selectedLocale.value) {
    selectedLocale.value = val;
  }
});

watch(
  selectedLocale,
  (val, oldVal) => {
    if (val && val !== oldVal && val !== locale.value) {
      changeLocale(val);
    }
  },
  { flush: 'sync' }
);

// 页面取用户信息：来自 user 仓库
const user = computed(() => userStore.userInfo || {});

const stats = computed(() => {
  const info = user.value || {};
  const toNumber = (val) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : 0;
  };
  const rawPunches = Array.isArray(info.punchCardDetail) ? info.punchCardDetail : [];
  const punches = rawPunches.map((item) => String(item));
  const points = toNumber(info.points);

  return {
    points,
    pointsDisplay: points.toLocaleString(),
    leaveDays: toNumber(info.leaveDateCount),
    travelDays: toNumber(info.travelDateCount),
    overtimeHours: toNumber(info.overDateCount),
    joinDays: toNumber(info.joinDateCount),
    punchRecords: punches,
  };
});

const joinDaysText = computed(() =>
  t('me.dashboard.joinDays', { days: stats.value.joinDays || 0 })
);

const metrics = computed(() => [
  {
    key: 'leave',
    label: t('me.dashboard.metrics.leave'),
    value: stats.value.leaveDays,
    display: stats.value.leaveDays.toLocaleString(),
    routeName: 'meLeave',
  },
  {
    key: 'travel',
    label: t('me.dashboard.metrics.travel'),
    value: stats.value.travelDays,
    display: stats.value.travelDays.toLocaleString(),
    routeName: 'meTravel',
  },
  {
    key: 'overtime',
    label: t('me.dashboard.metrics.overtime'),
    value: stats.value.overtimeHours,
    display: stats.value.overtimeHours.toLocaleString(),
    routeName: 'meOvertime',
  },
]);

const punchRecords = computed(() => stats.value.punchRecords || []);

const functionItems = computed(() => [
  {
    key: 'workTime',
    label: t('me.dashboard.functions.items.workTime'),
    icon: 'clock-o',
    routeName: 'meWorkTime',
  },
  {
    key: 'punchRecord',
    label: t('me.dashboard.functions.items.punchRecord'),
    icon: 'underway-o',
    routeName: 'mePunchRecord',
  },
]);

function navigateToRoute(name) {
  if (!name) return;
  if (typeof router.hasRoute === 'function' && !router.hasRoute(name)) return;
  router.push({ name });
}

function handleFunction(item) {
  if (!item) return;
  navigateToRoute(item.routeName);
}

// 工具：数组/逗号字符串 → 文本
const toNiceText = (v) => {
  if (!v) return '';
  if (Array.isArray(v)) return v.filter(Boolean).join('、') || '';
  return (
    String(v)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .join('、') || ''
  );
};

const roleText = computed(
  () => toNiceText(user.value.roleNames) || toNiceText(user.value.roleName) || '-'
);
const postText = computed(
  () => toNiceText(user.value.postNames) || toNiceText(user.value.postName) || '-'
);
const joinedDateText = computed(() => {
  const s = user.value.joinedDate;
  return s ? String(s).split(' ')[0] : '-';
});

// 默认头像：/public/images/logo.png
const defaultAvatar = proxy.$assetUrl('/images/logo.png');
const onAvatarError = (e) => {
  e.target.src = defaultAvatar;
};

// 修改密码
const pwd = reactive({
  show: false,
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  loading: false,
});
const pwdFormRef = ref();
function openPwdPopup() {
  pwd.show = true;
}
function validateNewPwd(v) {
  return String(v || '').length >= 6;
}
function validateConfirmPwd(v) {
  return v === pwd.newPassword && !!v;
}

async function submitChangePwd() {
  if (!validateNewPwd(pwd.newPassword)) return showToast(t('me.validation.newPassword'));
  if (!validateConfirmPwd(pwd.confirmPassword))
    return showToast(t('me.validation.confirmPassword'));
  try {
    pwd.loading = true;
    await Api.user.updatePassword({
      oldPassword: pwd.oldPassword,
      newPassword: pwd.newPassword,
    });
    showToast(t('me.toast.changePasswordSuccess'));
    pwd.show = false;
    pwd.oldPassword = '';
    pwd.newPassword = '';
    pwd.confirmPassword = '';
    // await doLogout(true);
  } catch (err) {
    showToast(err?.message || t('me.toast.changePasswordFail'));
  } finally {
    pwd.loading = false;
  }
}

async function confirmLogout() {
  try {
    await showConfirmDialog({
      title: t('me.dialog.logoutTitle'),
      message: t('me.dialog.logoutMessage'),
    });
    await doLogout();
  } catch {}
}

// 你的页面里
async function doLogout(force = false) {
  auth.logout(); // 清 token/refreshToken/用户信息:contentReference[oaicite:5]{index=5}
  router.replace(force ? { path: '/login', query: { relogin: 1 } } : { path: '/login' });
}

// 若进入页面时本地无资料，则拉一次
onMounted(() => {
  if (!userStore.userInfo && auth.isLogin) {
    userStore.fetchUserInfo().catch(() => {});
  }
});
</script>

<style scoped>
.me-page {
  min-height: 100vh;
  background: #f7f8fa;
}
.me-header {
  background: #fff;
}
.me-profile {
  display: flex;
  align-items: center;
  padding: 16px;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  background: #f2f3f5;
  border: 1px solid #eee;
}
.meta {
  margin-left: 12px;
  flex: 1;
  min-width: 0;
}
.name {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.sub {
  margin-top: 6px;
  color: #888;
  font-size: 13px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.dot::before {
  content: '•';
  margin-right: 6px;
  color: #ccc;
}
.mt12 {
  margin-top: 12px;
}
.ml8 {
  margin-left: 8px;
}
.interactive {
  cursor: pointer;
  transition: transform 0.2s ease;
}
.interactive:active {
  transform: scale(0.98);
}
.me-dashboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 16px;
}
.points-card {
  border: none;
  outline: none;
  border-radius: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #3060ed 0%, #5c87ff 100%);
  color: #fff;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font: inherit;
}
.points-label {
  font-size: 14px;
  opacity: 0.85;
}
.points-value {
  font-size: 28px;
  font-weight: 700;
}
.points-meta {
  font-size: 13px;
  opacity: 0.85;
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.metric {
  border: none;
  outline: none;
  border-radius: 14px;
  background: #f3f6ff;
  padding: 14px 12px;
  text-align: left;
  color: #1f2b3d;
  font: inherit;
}
.metric-label {
  font-size: 12px;
  color: #5f6b7a;
}
.metric-value {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 600;
}
.me-body {
  padding: 0 16px 24px;
}
.me-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(48, 96, 237, 0.08);
  margin-top: 16px;
}
.me-card:first-of-type {
  margin-top: 0;
}
.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2b3d;
}
.card-arrow {
  color: #c8cdd8;
}
.timeline {
  margin-top: 16px;
}
.timeline-item {
  display: flex;
  align-items: flex-start;
}
.timeline-item + .timeline-item {
  margin-top: 12px;
}
.timeline-left {
  width: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3060ed;
  border: 3px solid #dbe4ff;
  box-sizing: border-box;
}
.timeline-line {
  flex: 1;
  width: 2px;
  margin-top: 6px;
  background: linear-gradient(180deg, rgba(48, 96, 237, 0.2) 0%, rgba(48, 96, 237, 0) 100%);
}
.timeline-content {
  flex: 1;
  padding-left: 12px;
}
.timeline-title {
  font-size: 12px;
  color: #5f6b7a;
}
.timeline-time {
  margin-top: 4px;
  font-size: 16px;
  font-weight: 500;
  color: #1f2b3d;
}
.timeline-empty {
  margin-top: 16px;
  font-size: 13px;
  color: #9aa2b1;
}
.func-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.func-item {
  border: none;
  outline: none;
  border-radius: 14px;
  background: #f7f8fb;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font: inherit;
}
.func-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e4ebff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3060ed;
  font-size: 24px;
}
.func-text {
  font-size: 14px;
  color: #1f2b3d;
}
.sheet {
  padding: 16px;
}
.sheet-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}
.action {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0 8px;
}
</style>
