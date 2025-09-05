<!-- src/views/login/PhoneLogin.vue -->
<template>
  <div class="form">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.mobile"
          name="mobile"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          clearable
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field name="code" label="验证码" :rules="[{ required: true, message: '请输入验证码' }]">
          <template #input>
            <van-field v-model="form.code" placeholder="短信验证码" />
          </template>
          <template #button>
            <van-button size="small" type="primary" :disabled="counting" @click="sendCode">
              {{ counting ? `重新获取(${left}s)` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>
      <div class="actions">
        <van-button round block type="primary" native-type="submit">登录</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const form = reactive({ mobile: '', code: '' });
const counting = ref(false);
const left = ref(60);
let timer = null;

function sendCode() {
  if (counting.value) return;
  // TODO: Api.auth.sendSms(form.mobile)
  counting.value = true;
  left.value = 60;
  timer && clearInterval(timer);
  timer = setInterval(() => {
    left.value -= 1;
    if (left.value <= 0) {
      clearInterval(timer);
      counting.value = false;
    }
  }, 1000);
}

function onSubmit() {
  // TODO: Api.auth.loginBySms(form)
  console.log('submit phone login', form);
}
</script>

<style scoped>
.form { padding: 6px; }
.actions { margin: 16px 0 6px; }
</style>
