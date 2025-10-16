<!-- src/pages/login/social.vue -->
<template>
  <div class="login-page">
    <!-- 顶部品牌区 -->
    <div class="hero">
      <div class="brand">
        <img class="logo" :src="logoUrl" alt="logo" />
        <div class="meta">
          <h1>{{ t('login.social.title') }}</h1>
          <p class="sub">{{ t('login.social.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- 入口类型提示 -->
    <van-tag v-if="typeLabel" plain type="success" class="type-tip">
      {{ t('login.social.currentEntry', { type: typeLabel }) }}
    </van-tag>

    <!-- 内容卡片 -->
    <div class="card">
      <div class="body">
        <div class="wx-social-page">
          <div class="card loading-box">
            <van-loading size="20px" style="margin-right: 8px" />
            <span>{{ t('login.social.loading') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { getLoginEnv } from '@/utils/env.js';
import { getCallbackUrl } from '@/utils/callback-url';
import Api from '@/api';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const user = useUserStore();
const { t } = useI18n();
const _env = {
  WECHAT_MP: 'wechat_open',
  WECHAT_ENTERPRISE: 'wechat_enterprise',
};

const env = _env[getLoginEnv()] || null; // WECHAT_MP / WECHAT_ENTERPRISE / 其它

/** 视觉用：logo 路径（兼容二级目录） */
const logoUrl = `${import.meta.env.BASE_URL}images/logo.png`;

/** 入口类型标签映射（与 AccountLogin 保持一致） */
const typeLabelMap = computed(() => ({
  campus_applicant: t('login.social.typeLabels.campusApplicant'),
  internal_referral: t('login.social.typeLabels.internalReferral'),
  vendor_hr: t('login.social.typeLabels.vendorHr'),
}));
const DEFAULT_TYPE = 'campus_applicant';

const type = computed(() => {
  return (
    (route.query?.type && String(route.query.type)) ||
    (route.meta?.userType && String(route.meta.userType)) ||
    DEFAULT_TYPE
  );
});
const typeLabel = computed(() => typeLabelMap.value[type.value] || type.value);

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

  // 容错多种返回结构
  const payload = res?.data ?? res;
  const url = payload?.data || payload?.url || payload;

  if (typeof url === 'string') {
    window.location.href = url;
  } else {
    throw new Error(t('login.social.errors.missingRedirect'));
  }
}

/** 后端用 code/state 换 token，写入 Pinia，并按 callbackUrl 跳转 */
async function loginBySocial(data) {
  const res = await Api.auth.loginBySocial(data);
  const payload = res?.data ?? res;

  const accessToken =
    payload?.access_token || payload?.accessToken || payload?.token || payload?.data?.access_token;
  const refreshToken =
    payload?.refresh_token || payload?.refreshToken || payload?.data?.refresh_token;

  if (!accessToken) {
    const msg =
      payload?.error_description || payload?.msg || t('login.social.errors.missingToken');
    console.error('[social] loginBySocial error:', msg, payload);
    alert(msg);
    return;
  }

  // 1) 写入 Token（Pinia）
  auth.setTokenPair({ accessToken, refreshToken });

  // 2) 特例：若后端提示“未建档用户且微信开放平台”，按旧逻辑先建档再走回调
  const userId = String(payload?.user_id ?? '');
  const oauthId = payload?.oauth_id;

  if ((userId === 'null' || userId === '') && env === 'WECHAT_MP' && oauthId) {
    await createUserThenRedirect(oauthId);
    return;
  }

  // 3) 拉取用户信息（Pinia）
  try {
    await user.fetchUserInfo();
  } catch (e) {
    console.warn('[social] fetchUserInfo failed:', e);
  }

  // 4) 回跳逻辑：先外层 redirect，再 callbackUrl 内层 redirect，最后兜底 /home
  const OUTER = new URL(window.location.href);
  const outerRedirect = OUTER.searchParams.get('redirect') || ''; // 有些场景直接挂在外层
  const callbackUrlRaw = OUTER.searchParams.get('callbackUrl') || '';

  function sanitizeRedirect(p) {
    if (!p) return '';
    // 绝对 URL：只允许同源
    if (/^https?:\/\//i.test(p)) {
      try {
        const u = new URL(p);
        if (u.origin !== window.location.origin) return '';
        p = u.pathname + u.search + u.hash;
      } catch (err) {
        console.warn('[social] invalid absolute redirect:', p, err);
        return '';
      }
    }
    // 相对路径：必须是站内
    if (!p.startsWith('/')) return '';
    // 禁止回到登录页
    if (p === '/login' || p.startsWith('/login/')) return '';
    return p || '';
  }

  let redirect = sanitizeRedirect(outerRedirect);

  if (!redirect && callbackUrlRaw) {
    // callbackUrl 里再解析一层 redirect
    let decoded = callbackUrlRaw;
    try {
      decoded = decodeURIComponent(callbackUrlRaw); // 如果外层 encode 过，这里解一次
    } catch (err) {
      console.warn('[social] failed to decode callbackUrl:', callbackUrlRaw, err);
    }
    try {
      const innerURL = new URL(decoded, window.location.origin); // 注意：加 base
      const innerRedirect = innerURL.searchParams.get('redirect') || '';
      redirect = sanitizeRedirect(innerRedirect);
    } catch (e) {
      console.warn('[social] invalid callbackUrl:', callbackUrlRaw, e);
    }
  }

  if (redirect) {
    router.push({ path: redirect });
  } else {
    router.push({ path: '/home' });
  }
}

/** 未建档用户：用 oauthId 建档后再回跳 */
async function createUserThenRedirect(oauthId) {
  const res = await Api.user.talentRegister({ oauthId });
  const { code } = res.data;

  if (code !== 200) {
    console.error('[social] userCreate failed:', res);
    alert(t('login.social.errors.initAccount'));
    return;
  }

  try {
    const id = res?.data?.data?.id || res?.data?.id || res?.id;
    if (id) {
      const next = { ...(user.userInfo || {}), id };
      user.setUserInfo(next);
      // auth.logout();
      // location.reload();
    }
  } catch (err) {
    console.warn('[social] failed to persist user info after init:', err);
  }
}
</script>

<style scoped>
/* ===== 页面外壳（与 AccountLogin 保持一致） ===== */
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(1200px 500px at 90% -20%, rgba(64, 158, 255, 0.25), transparent 50%),
    radial-gradient(800px 400px at -10% 10%, rgba(64, 158, 255, 0.15), transparent 50%),
    linear-gradient(180deg, #f7fbff 0%, #f8fafc 20%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 14px;
  box-sizing: border-box;
}
.hero {
  width: min(960px, 92%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 8px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
.meta h1 {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}
.sub {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 13px;
}

.type-tip {
  margin-bottom: 12px;
  border-color: #16a34a;
  color: #16a34a;
}

.card {
  width: min(960px, 92%);
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.08);
  overflow: hidden;
}
.body {
  min-height: 200px;
}

/* ===== social 页面自身的内容区 ===== */
.wx-social-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: 20px 16px;
}
.loading-box {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  background: #fff;
  box-shadow: none;
  border-radius: 8px;
  padding: 6px 8px;
}
</style>
