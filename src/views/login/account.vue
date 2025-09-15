<!-- src/views/login/AccountLogin.vue -->
<template>
  <div class="form">
    <van-form ref="formRef" validate-first @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="formData.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          clearable
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <van-field
          v-model="formData.password"
          :type="showPwd ? 'text' : 'password'"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <template #right-icon>
            <van-icon :name="showPwd ? 'eye-o' : 'closed-eye'" @click="showPwd = !showPwd" />
          </template>
        </van-field>
      </van-cell-group>

      <!-- 修改点：加 class 和渐变色 -->
      <van-button
        class="mt12 login-btn"
        round
        block
        type="primary"
        native-type="submit"
        :loading="loading"
        :disabled="loading"
        loading-text="登录中…"
        color="linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)"
        text-color="#fff"
      >
        登录
      </van-button>
    </van-form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { showToast, showFailToast } from 'vant';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const user = useUserStore();

const formRef = ref(null);
const loading = ref(false);
const showPwd = ref(false);
const remember = ref(true);

const formData = reactive({
  tenantId: '000000',
  deptId: '',
  roleId: '',
  username: localStorage.getItem('LAST_USERNAME') || '',
  password: '',
  type: 'account',
  code: '',
  key: '',
});

/** 安全回跳：禁止返回 /login*；仅允许同源的绝对/相对站内地址 */
function safeRedirect() {
  try {
    const raw = String(route.query?.redirect || '/');
    const u = new URL(raw, window.location.origin);
    const isLogin = u.pathname === '/login' || u.pathname.startsWith('/login/');
    if (isLogin) return '/';
    // 仅返回站内路径+查询+hash，避免跨域
    if (u.origin !== window.location.origin) return '/';
    return u.pathname + u.search + u.hash || '/';
  } catch {
    return '/';
  }
}

onMounted(() => {
  // 如果已经登录，直接回跳，避免在账号页停留
  if (auth?.token) {
    window.location.replace(safeRedirect());
  }
});

async function onSubmit() {
  if (loading.value) return;
  try {
    loading.value = true;

    // 主动触发一次校验（配合 ref）
    await formRef.value?.validate?.();

    // 执行账号密码登录
    await auth.loginByUsername({ ...formData });

    // 登录后拉取用户信息（与静默登录保持一致）
    try {
      await user.fetchUserInfo();
    } catch (e) {
      // 拉取失败不阻断回跳，但打日志
      console.warn('[account-login] fetchUserInfo failed:', e);
    }

    // 记住用户名（可选）
    if (remember.value) {
      localStorage.setItem('LAST_USERNAME', formData.username);
    } else {
      localStorage.removeItem('LAST_USERNAME');
    }

    showToast('登录成功');

    // 使用 replace 避免历史里留下登录页
    const target = safeRedirect();
    window.location.replace(target);
  } catch (err) {
    const msg = err?.message || '登录失败，请重试';
    console.error('[account-login] login error:', err);
    showFailToast(msg);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.form {
  padding: 6px;
  :deep(.van-cell-group) {
    margin: 0;
  }
}
.mt12 {
  margin-top: 12px;
}

/* 修改点：按钮细节美化 */
:deep(.login-btn.van-button) {
  height: 46px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 22px rgba(22, 119, 255, 0.25);
  transition:
    transform 0.06s ease,
    box-shadow 0.12s ease,
    opacity 0.12s ease;
}

/* 悬停/聚焦态（桌面端更明显） */
:deep(.login-btn.van-button:hover),
:deep(.login-btn.van-button:focus-visible) {
  box-shadow: 0 12px 26px rgba(22, 119, 255, 0.33);
  outline: none;
}

/* 按压态 */
:deep(.login-btn.van-button:active) {
  transform: translateY(1px);
  box-shadow: 0 6px 14px rgba(22, 119, 255, 0.28);
}

/* 加载/禁用态 */
:deep(.login-btn.van-button--disabled),
:deep(.login-btn.van-button[disabled]) {
  opacity: 0.8;
  box-shadow: none;
  cursor: not-allowed;
  filter: saturate(0.9);
}

/* 深色模式（可选） */
@media (prefers-color-scheme: dark) {
  :deep(.login-btn.van-button) {
    box-shadow: 0 10px 22px rgba(22, 119, 255, 0.22);
  }
}
</style>
