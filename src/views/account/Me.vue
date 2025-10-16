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
    </div>

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
import { computed, reactive, ref, onMounted, getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import Api from '@/api';
import { encrypt } from '@/utils/sm2';
import { changeLocale } from '@/locales';

const { proxy } = getCurrentInstance();
const router = useRouter();
const auth = useAuthStore();
const userStore = useUserStore();
const { t, locale } = useI18n();

const selectedLocale = computed({
  get: () => locale.value,
  set: (val) => {
    if (val && val !== locale.value) {
      changeLocale(val);
    }
  },
});

// 页面取用户信息：来自 user 仓库
const user = computed(() => userStore.userInfo || {});

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
