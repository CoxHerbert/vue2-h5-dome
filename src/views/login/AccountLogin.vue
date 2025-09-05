<!-- src/views/login/AccountLogin.vue -->
<template>
  <div class="form">
    <van-form @submit="onSubmit">
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
      <van-button round block type="primary" native-type="submit"> 登录 </van-button>
    </van-form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
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

async function onSubmit() {
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
    console.error(msg);
    showToast({ type: 'fail', message: msg });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.form {
  padding: 6px;
}
.actions {
  margin: 16px 0 6px;
}
</style>
