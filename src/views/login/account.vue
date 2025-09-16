<!-- src/views/login/account.vue -->
<template>
  <div class="login-skin">
    <div class="panel">
      <!-- logo + 标语 -->
      <div class="brand">
        <img class="logo" :src="logoUrl" alt="logo" />
        <div class="slogan">
          <span class="bold">同心合力</span>
          <span class="gap"></span>
          <span class="bold">助力生产</span>
        </div>
      </div>

      <!-- 登录表单 -->
      <van-form ref="formRef" validate-first @submit="onSubmit">
        <van-cell-group inset class="group">
          <!-- 用户名 -->
          <van-field
            v-model="formData.username"
            name="username"
            placeholder="请输入手机号或工号"
            :rules="[{ required: true, message: '请输入用户名' }]"
            :border="false"
            class="field"
          >
            <template #left-icon>
              <div class="ico">
                <van-icon name="user-o" />
              </div>
            </template>
          </van-field>

          <!-- 密码 -->
          <van-field
            v-model="formData.password"
            :type="showPwd ? 'text' : 'password'"
            name="password"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
            :border="false"
            class="field"
          >
            <template #left-icon>
              <div class="ico">
                <van-icon name="shield-o" />
              </div>
            </template>
            <template #right-icon>
              <van-icon :name="showPwd ? 'eye-o' : 'closed-eye'" @click="showPwd = !showPwd" />
            </template>
          </van-field>
        </van-cell-group>

        <van-button
          class="login-btn"
          block
          round
          native-type="submit"
          :loading="loading"
          :disabled="loading"
          loading-text="登录中…"
        >
          登录
        </van-button>
      </van-form>
    </div>
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

/** 兼容二级目录的 logo 地址 */
const logoUrl = `${import.meta.env.BASE_URL}images/logo.png`;

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

/** 安全回跳：禁止回到 /login*，仅允许同源路径 */
function safeRedirect() {
  try {
    const raw = String(route.query?.redirect || '/');
    const u = new URL(raw, window.location.origin);
    if (u.pathname === '/login' || u.pathname.startsWith('/login/')) return '/';
    if (u.origin !== window.location.origin) return '/';
    return u.pathname + u.search + u.hash || '/';
  } catch {
    return '/';
  }
}

onMounted(() => {
  if (auth?.token) window.location.replace(safeRedirect());
});

async function onSubmit() {
  if (loading.value) return;
  try {
    loading.value = true;
    await formRef.value?.validate?.();

    await auth.loginByUsername({ ...formData });

    try {
      await user.fetchUserInfo();
    } catch (e) {
      console.warn('[account-login] fetchUserInfo failed:', e);
    }

    if (remember.value) localStorage.setItem('LAST_USERNAME', formData.username);
    else localStorage.removeItem('LAST_USERNAME');

    showToast('登录成功');
    window.location.replace(safeRedirect());
  } catch (err) {
    const msg = err?.message || '登录失败，请重试';
    console.error('[account-login] login error:', err);
    showFailToast(msg);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
/* 整体背景（淡蓝渐变 + 圆角容器阴影） */
.login-skin {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f5f7fb;
  padding: 16px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #e6efff 0%, #d8e8ff 52%, #d6e6ff 100%);
}

/* 中间蓝色渐变的大圆角面板，模拟你截图的视觉 */
.panel {
  margin-top: -70%;
  width: 96%;
}

/* logo 与标语 */
.brand {
  display: grid;
  place-items: center;
  margin: 8px 0 18px;
}
.logo {
  width: 84px;
  height: 84px;
  border-radius: 12px;
  background: #fff;
  object-fit: contain;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.08);
}
.slogan {
  margin-top: 12px;
  color: #1f2a44;
  display: flex;
  align-items: center;
  font-size: 18px;
  letter-spacing: 1px;
}
.slogan .bold {
  font-weight: 800;
}
.slogan .gap {
  display: inline-block;
  width: 10px;
}

/* 表单组：去掉 inset 的外侧留白，并控制间距 */
.group {
  margin: 0;
  padding: 0;
  background: #fff;
}

/* 单个输入的样式：圆角浅蓝背景、带左侧虚线图标框 */
.field {
  margin: 10px 0;
  :deep(.van-field__left-icon) {
    margin-right: 10px;
  }
  :deep(.van-field__control) {
    font-size: 14px;
  }
  :deep(.van-cell) {
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.55);
  }
}

/* 左侧图标的虚线框效果 */
.ico {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1.5px dashed #c5d7ff;
  border-radius: 8px;
  opacity: 0.9;
}

/* 登录按钮：与图一致的高亮蓝 */
.login-btn {
  margin-top: 16px;
  height: 46px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #fff;
  background: #2563ff;
  box-shadow: 0 10px 22px rgba(37, 99, 255, 0.35);
}
</style>
