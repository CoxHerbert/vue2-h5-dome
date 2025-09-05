<template>
  <div class="me-page">
    <van-nav-bar title="我的" fixed />

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
            {{ user.realName || user.name || user.username || '未命名用户' }}
            <van-tag v-if="user.deptName" plain type="primary" class="ml8">{{
              user.deptName
            }}</van-tag>
          </div>
          <div class="sub">
            <span v-if="user.account">账号：{{ user.account }}</span>
            <span v-if="user.phone" class="dot">·</span>
            <span v-if="user.phone">{{ user.phone }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 只展示：职位、角色、入职时间、邮箱 -->
    <van-cell-group inset class="mt12">
      <van-cell title="职位" :value="postText" />
      <van-cell title="角色" :value="roleText" />
      <van-cell title="入职时间" :value="joinedDateText" />
      <van-cell title="邮箱" :value="user.email || '-'" />
    </van-cell-group>

    <van-cell-group inset class="mt12">
      <van-cell title="修改密码" is-link @click="openPwdPopup" />
      <van-cell title="退出登录" is-link @click="confirmLogout" />
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
        <div class="sheet-title">修改密码</div>
        <van-form ref="pwdFormRef" @submit="submitChangePwd">
          <van-field
            v-model="pwd.oldPassword"
            type="password"
            label="旧密码"
            placeholder="请输入旧密码"
            :rules="[{ required: true, message: '请输入旧密码' }]"
            clearable
          />
          <van-field
            v-model="pwd.newPassword"
            type="password"
            label="新密码"
            placeholder="请输入新密码"
            :rules="[
              { required: true, message: '请输入新密码' },
              { validator: validateNewPwd, message: '密码至少6位' },
            ]"
            clearable
          />
          <van-field
            v-model="pwd.confirmPassword"
            type="password"
            label="确认密码"
            placeholder="请再次输入新密码"
            :rules="[{ validator: validateConfirmPwd, message: '两次输入不一致' }]"
            clearable
          />
          <div class="action">
            <van-button type="default" block class="mr8" @click="pwd.show = false">取消</van-button>
            <van-button type="primary" block native-type="submit" :loading="pwd.loading"
              >确定</van-button
            >
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import Api from '@/api';
import { encrypt } from '@/utils/sm2';

const router = useRouter();
const auth = useAuthStore();
const userStore = useUserStore();

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
const defaultAvatar = '/images/logo.png';
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
  if (!validateNewPwd(pwd.newPassword)) return showToast('密码至少6位');
  if (!validateConfirmPwd(pwd.confirmPassword)) return showToast('两次输入不一致');
  try {
    pwd.loading = true;
    await Api.user.changePassword({
      oldPassword: encrypt(pwd.oldPassword),
      newPassword: encrypt(pwd.newPassword),
    });
    showToast('修改成功，请使用新密码重新登录');
    pwd.show = false;
    await doLogout(true);
  } catch (err) {
    showToast(err?.message || '修改失败');
  } finally {
    pwd.loading = false;
  }
}

async function confirmLogout() {
  try {
    await showConfirmDialog({ title: '确认退出', message: '确定要退出登录吗？' });
    await doLogout();
  } catch {}
}
async function doLogout(force = false) {
  auth.logout();
  router.replace(force ? { path: '/login', query: { relogin: 1 } } : '/login');
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
