<template>
  <div class="mine-page">
    <div class="top-bg"></div>
    <ScrollAwareNavBar
      :title="t('me.navTitle')"
      fixed
      :border="false"
      class="mine-nav"
      safe-area-inset-top
    />

    <section class="profile-card">
      <div class="bg-index bg-index-2"></div>
      <div class="bg-index bg-index-1"></div>

      <div class="profile-top">
        <div class="userinfo-wrap">
          <div class="userinfo-wrap-left">
            <div class="avatar-and-userinfo">
              <img
                class="avatar"
                :src="user.avatar || defaultAvatar"
                alt="avatar"
                @error="onAvatarError"
              />
              <div class="col">
                <span class="name">{{
                  user.realName || user.name || user.username || t('me.profile.unnamed')
                }}</span>
                <span class="uid">{{ user.account || '-' }}</span>
              </div>
            </div>
            <div v-if="roleTags.length" class="tags">
              <span v-for="(tag, idx) in roleTags" :key="idx" class="tag">{{ tag }}</span>
            </div>
          </div>
          <div class="points-card" @click="navigateToRoute('mePoints')">
            <span class="points-label">{{ t('me.dashboard.pointsLabel') }}</span>
            <span class="points-val">{{ stats.pointsDisplay }}</span>
          </div>
        </div>
      </div>

      <div class="stats">
        <button
          v-for="metric in metrics"
          :key="metric.key"
          type="button"
          class="stat"
          @click="navigateToRoute(metric.routeName)"
        >
          <span class="stat-label">{{ metric.label }}</span>
          <span class="stat-num">{{ metric.display }}</span>
        </button>
      </div>

      <div class="join-strip" :style="joinStripStyle">{{ joinDaysText }}</div>
    </section>

    <section class="card punch-card" @click="navigateToRoute('mePunch')">
      <div class="card-title-row">
        <span class="card-title">{{ t('me.dashboard.todayPunch.title') }}</span>
        <!-- <van-icon name="arrow" class="arrow" /> -->
      </div>
      <div v-if="punchRecords.length" class="timeline">
        <div v-for="(time, index) in punchRecords" :key="index" class="tl-item">
          <div class="tl-left">
            <span class="dot done"></span>
            <span v-if="index !== punchRecords.length - 1" class="line"></span>
          </div>
          <div class="tl-content">
            <div class="tl-title">{{ t('me.dashboard.todayPunch.timeLabel') }}</div>
            <div class="tl-time">{{ time }}</div>
          </div>
        </div>
      </div>
      <div v-else class="timeline-empty">{{ t('me.dashboard.todayPunch.empty') }}</div>
    </section>

    <section class="card func-card">
      <div class="card-title-row">
        <span class="card-title">{{ t('me.dashboard.functions.title') }}</span>
      </div>
      <div class="func-grid">
        <div
          v-for="item in functionItems"
          :key="item.key"
          class="func-item"
          @click="handleFunction(item)"
        >
          <span class="func-icon">
            <img :src="item.icon" :alt="item.label" class="func-icon__image" loading="lazy" />
          </span>
          <span class="func-text">{{ item.label }}</span>
        </div>
      </div>
    </section>

    <LanguageSelector />

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
            :rules="[
              { validator: validateConfirmPwd, message: t('me.validation.confirmPassword') },
            ]"
            clearable
          />
          <div class="action">
            <van-button type="default" block class="mr8" @click="pwd.show = false">{{
              t('me.form.cancel')
            }}</van-button>
            <van-button type="primary" block native-type="submit" :loading="pwd.loading">{{
              t('me.form.confirm')
            }}</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import Api from '@/api';
const { proxy } = getCurrentInstance();
const workTimeIcon = proxy.$assetUrl('/images/me/worktime.svg');
const punchRecordIcon = proxy.$assetUrl('/images/me/card.svg');
const router = useRouter();
const auth = useAuthStore();
const userStore = useUserStore();
const { t } = useI18n();

// 页面取用户信息：来自 user 仓库
const user = computed(() => userStore.userInfo || {});
const userH5 = reactive({});

const stats = computed(() => {
  const info = userH5.value || {};
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
    icon: workTimeIcon,
    routeName: 'meWorkTime',
  },
  {
    key: 'punchRecord',
    label: t('me.dashboard.functions.items.punchRecord'),
    icon: punchRecordIcon,
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

// 工具：数组/逗号字符串 → 数组
const toArrayValue = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

// 展示文本
const toNiceText = (v) => toArrayValue(v).join('、') || '';

const roleTags = computed(() => {
  const tags = toArrayValue(user.value.roleNames);
  if (tags.length) return tags;
  return toArrayValue(user.value.roleName);
});

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

const joinStripUrl = proxy.$assetUrl('/images/me/join-strip.svg');
const joinStripStyle = computed(() => ({
  backgroundImage: `url(${joinStripUrl})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
}));

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
    await userStore.changePassword({
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
      confirmButtonText: t('me.form.confirm'),
      cancelButtonText: t('me.form.cancel'),
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
  Api.user.getH5UserInfo().then((res) => {
    console.log(res);
    const { code, data } = res.data;
    if (code === 200) {
      userH5.value = data;
    }
  });
  // if (!userStore.userInfo && auth.isLogin) {
  //   userStore.fetchUserInfo().catch(() => {});
  // }
});
</script>

<style scoped>
.mine-page {
  position: relative;
  margin: 0 auto;
  min-height: 100vh;
  max-width: 750px;
  padding: 56px 0 120px;
  padding-bottom: calc(120px + constant(safe-area-inset-bottom));
  padding-bottom: calc(120px + env(safe-area-inset-bottom));
  background: #f6f7fb;
}

.top-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 240px;
  background: linear-gradient(
    180deg,
    #3060ed 0%,
    rgba(48, 96, 237, 0.3) 64%,
    rgba(48, 96, 237, 0) 100%
  );
  z-index: 0;
}

.mine-nav {
  background: transparent;
  color: #fff;
  --van-nav-bar-title-text-color: #fff;
  --van-nav-bar-icon-color: #fff;
  --van-nav-bar-text-color: #fff;
}

.profile-card {
  position: relative;
  margin: 40px 16px 0;
  padding: 24px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 12px 36px rgba(25, 81, 230, 0.08);
  z-index: 1;
}

.bg-index {
  position: absolute;
  top: -12px;
  left: 0;
  width: calc(100% - 16px);
  height: 260px;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 24px;
  transform-origin: center;
}

.bg-index-1 {
  z-index: -1;
  transform: rotate(-4deg);
}

.bg-index-2 {
  z-index: -2;
  transform: rotate(-8deg);
}

.profile-top {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.userinfo-wrap {
  display: flex;
  align-items: stretch;
  gap: 16px;
}

.userinfo-wrap-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-and-userinfo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
  border: 1px solid #dadbe0;
  background: #f2f3f5;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2b3d;
}

.uid {
  font-size: 13px;
  color: #8c9aaf;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 10px;
  border-radius: 12px;
  background: #baccff;
  color: #3060ed;
  font-size: 12px;
}

.points-card {
  width: 102px;
  min-width: 102px;
  height: 102px;
  border-radius: 24px;
  background: #3060ed;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: none;
  cursor: pointer;
}

.points-label {
  font-size: 12px;
  opacity: 0.85;
}

.points-val {
  font-size: 24px;
  font-weight: 700;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  background: #f7f8ff;
  border-radius: 16px;
  border: none;
  color: #1f2b3d;
  cursor: pointer;
}

.stat-label {
  font-size: 13px;
  color: #8c9aaf;
  text-align: center;
}

.stat-num {
  font-size: 26px;
  font-weight: 700;
}

.join-strip {
  margin-top: 20px;
  padding: 16px 24px;
  border-radius: 20px;
  background-color: #3060ed;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.card {
  position: relative;
  margin: 16px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 12px 36px rgba(25, 81, 230, 0.08);
  padding: 20px 24px;
}

.punch-card {
  cursor: pointer;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2b3d;
}

.arrow {
  color: #c5ccda;
}

.timeline {
  margin-top: 16px;
}

.tl-item {
  display: flex;
  gap: 12px;
}

.tl-item + .tl-item {
  margin-top: 12px;
}

.tl-left {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1d65f3;
  border: 4px solid #b4cdff;
  box-sizing: border-box;
}

.line {
  flex: 1;
  width: 2px;
  margin-top: 6px;
  border-left: 1px dashed #bbbbbb;
}

.tl-content {
  flex: 1;
}

.tl-title {
  font-size: 13px;
  color: #5f6b7a;
}

.tl-time {
  margin-top: 4px;
  font-size: 16px;
  color: #1f2b3d;
  font-weight: 500;
}

.timeline-empty {
  margin-top: 16px;
  font-size: 13px;
  color: #9aa2b1;
}

.func-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.func-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
}

.func-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #e4ebff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3060ed;
  font-size: 24px;
}

.func-icon__image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.func-text {
  font-size: 14px;
  color: #353638;
}

.mt12 {
  margin: 12px 16px 0;
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

.mr8 {
  margin-right: 0;
}

button {
  font: inherit;
  border: none;
  padding: 0;
}
</style>
