<!-- src/views/Login.vue -->
<template>
  <div class="auth-page">
    <div class="card">
      <div class="card-header">
        <div class="logo">
          <van-icon name="user-circle-o" size="48" />
        </div>
        <h1 class="title">欢迎登录</h1>
        <p class="subtitle">请输入账号和密码</p>
      </div>

      <van-form ref="formRef" @submit="doLogin">
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

        <div class="row between">
          <van-checkbox v-model="remember"> 记住我 </van-checkbox>
          <a class="link" @click="goForgot">忘记密码？</a>
        </div>

        <van-button
          v-anti-click
          type="primary"
          block
          class="submit"
          :loading="loading"
          :disabled="loading"
          native-type="submit"
        >
          登录
        </van-button>
      </van-form>

      <div class="card-footer">
        <span>© {{ year }} YourCompany</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const formRef = ref(null);
const loading = ref(false);
const showPwd = ref(false);
const remember = ref(true);
const year = computed(() => new Date().getFullYear());

const formData = reactive({
  tenantId: '000000',
  deptId: '',
  roleId: '',
  username: 'ew-6504',
  password: '123456',
  type: 'account',
  code: '',
  key: '',
});

// 已登录访问登录页：可按需放开自动跳转
// onMounted(() => {
//   if (auth.isLogin) {
//     const redirect = route.query.redirect || '/'
//     router.replace(String(redirect))
//   }
// })

function goForgot() {
  showToast('请联系管理员重置密码');
}

async function doLogin() {
  if (loading.value) return;
  try {
    loading.value = true;
    await formRef.value?.validate?.();

    await auth.loginByUsername({ ...formData });

    // 记住用户名（可选）
    if (remember.value) {
      localStorage.setItem('LAST_USERNAME', formData.username);
    } else {
      localStorage.removeItem('LAST_USERNAME');
    }

    showToast('登录成功');
    const redirect = route.query.redirect || '/';
    router.replace(String(redirect));
  } catch (err) {
    const msg = err?.message || '登录失败，请重试';
    console.log(msg);
    showToast({ type: 'fail', message: msg });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* 背景：柔和渐变 */
.auth-page {
  min-height: 100vh;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(1200px 600px at 10% 0%, #eef4ff 0%, #f7f9ff 40%, #ffffff 100%),
    linear-gradient(135deg, #eef2ff 0%, #fdf2f8 100%);
}

/* 卡片：毛玻璃 + 阴影 */
.card {
  width: 100%;
  max-width: 420px;
  padding: 22px 18px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.08),
    0 2px 8px rgba(15, 23, 42, 0.04);
  backdrop-filter: saturate(180%) blur(10px);
}

.card-header {
  text-align: center;
  padding: 6px 6px 2px;
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 6px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #5b8fff, #9aa8ff);
  color: #fff;
}

.title {
  margin: 6px 0 2px;
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.5px;
}

.subtitle {
  margin: 0 0 8px;
  color: #6b7280;
  font-size: 13px;
}

/* 行布局 */
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 10px 0;
}
.row.between {
  justify-content: space-between;
}

/* 链接样式 */
.link {
  color: #5b8fff;
  text-decoration: none;
  font-size: 13px;
}
.link:active {
  opacity: 0.7;
}

/* 提交按钮 */
.submit {
  margin: 14px 10px 0;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
}

/* 页脚 */
.card-footer {
  margin-top: 14px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

/* iOS Safari 防缩放：输入框字体 >= 16px */
:deep(.van-field__control) {
  font-size: 16px;
}

/* 优化 Vant inset 卡片的留白与圆角观感 */
:deep(.van-cell-group--inset) {
  margin: 12px 8px 6px;
  border-radius: 16px;
}
</style>
