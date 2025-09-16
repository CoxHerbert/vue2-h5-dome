<!-- src/pages/login/social.vue -->
<template>
  <div class="wx-social-page">
    <div class="card">
      <p>正在登录中…</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { getLoginEnv } from '@/utils/env.js';
import { getCallbackUrl } from '@/utils/callback-url';
import Api from '@/api';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const user = useUserStore();

const env = getLoginEnv(); // wechat_open / wechat_enterprise / 其它

onMounted(async () => {
  try {
    // 读取 code / state
    const sp = new URLSearchParams(window.location.search || '');
    const code = sp.get('code');
    const state = sp.get('state');

    if (code && state) {
      // 已回跳，携带 code/state，直接走登录
      await loginBySocial({
        tenantId: '000000',
        source: env,
        code,
        state,
        callbackUrl: readCallbackFromUrl() || getCallbackUrl({ route }) || '/',
      });
    } else {
      // 未授权，先去授权
      await authorize();
    }
  } catch (err) {
    console.error('[social] onMounted error:', err);
    // 兜底回首页（也可改成错误页）
    router.replace('/');
  }
});

/** 从当前地址 query 中取 callbackUrl（优先原始 query，次之工具函数） */
function readCallbackFromUrl() {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get('callbackUrl');
  } catch {
    return null;
  }
}

/** 去后端换取第三方授权地址并跳转 */
async function authorize() {
  const origin = window.location.origin;
  const href = window.location.href;

  // 授权回跳地址：当前页 + callbackUrl=当前完整地址
  const redirectUrl = `${origin}${import.meta.env.BASE_URL}login/social?callbackUrl=${encodeURIComponent(href)}`;

  const res = await Api.auth.authorize({
    redirectUrl,
    type: env,
  });

  // 按常见返回结构容错（可能是 { data: { code, data } } / { code, data } / 直接是 URL）
  const payload = res?.data ?? res;
  const url = payload?.data || payload?.url || payload;

  if (typeof url === 'string') {
    window.location.href = url;
  } else {
    throw new Error('Authorize response missing redirect url');
  }
}

/** 后端用 code/state 换 token，写入 Pinia，并按 callbackUrl 跳转 */
async function loginBySocial(data) {
  const res = await Api.auth.loginBySocial(data);
  // 兼容多种返回：{ data } / 直接 payload
  const payload = res?.data ?? res;

  // 常见字段：access_token / refresh_token / user_id / real_name / oauth_id
  const accessToken =
    payload?.access_token || payload?.accessToken || payload?.token || payload?.data?.access_token;
  const refreshToken =
    payload?.refresh_token || payload?.refreshToken || payload?.data?.refresh_token;

  if (!accessToken) {
    const msg = payload?.error_description || payload?.msg || '登录失败：未获取到 access_token';
    console.error('[social] loginBySocial error:', msg, payload);
    // 这里可替换为全局消息提示组件
    alert(msg);
    return;
  }

  // 1) 写入 Token（Pinia）
  auth.setTokenPair({ accessToken, refreshToken }); // :contentReference[oaicite:0]{index=0}

  // 2) 特例：若后端提示“未建档用户且微信开放平台”，按旧逻辑先建档再走回调
  const userId = String(payload?.user_id ?? '');
  const oauthId = payload?.oauth_id;

  if ((userId === 'null' || userId === '') && env === 'wechat_open' && oauthId) {
    await createUserThenRedirect(oauthId);
    return;
  }
  // 3) 拉取用户信息（Pinia）
  try {
    await user.fetchUserInfo(); // 标准化写入 userInfo 里  :contentReference[oaicite:1]{index=1}
  } catch (e) {
    console.warn('[social] fetchUserInfo failed:', e);
  }
  // 4) 普通回跳
  const url = window.location.href;
  // 解析 URL
  const params = new URL(url).searchParams;

  // 获取并解码 callbackUrl
  const callbackUrl = params.get('callbackUrl');
  const decoded = decodeURIComponent(callbackUrl);
  // 解析 URL
  const params2 = new URL(decoded).searchParams;
  const redirect = params2.get('redirect');
  if (redirect) {
    router.push({
      path: redirect,
    });
  } else {
    router.push({
      path: '/home',
    });
  }
}

/** 未建档用户：用 oauthId 建档后再回跳 */
async function createUserThenRedirect(oauthId) {
  const res = await Api.user.talentRegister({ oauthId });
  const { code } = res.data;

  if (code !== 200) {
    console.error('[social] userCreate failed:', res);
    alert('初始化账号失败，请稍后重试');
    return;
  }

  // 可把返回的 id 合并进 userInfo（可选）
  try {
    const id = res?.data?.data?.id || res?.data?.id || res?.id;
    if (id) {
      const next = { ...(user.userInfo || {}), id };
      // 你的 user store 暴露了 setUserInfo，可直接写入
      user.setUserInfo(next);
      await auth.refresh();
    }
  } catch {}
}
</script>

<style scoped>
.wx-social-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.card {
  font-size: 14px;
  color: #333;
}
</style>
