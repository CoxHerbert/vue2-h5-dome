<template>
  <div class="wrap">
    <div id="transfer-loader-wrapper" class="transfer-loader-wrapper">
      <div class="loader-box">
        <span>联</span><span>合</span><span>东</span><span>创</span> <span>B</span><span>I</span
        ><span>P</span><span>2</span><span>.</span><span>0</span>
      </div>
      <div class="card">
        <div class="sub">{{ statusText }}</div>
        <div class="hint">
          若未自动跳转，请
          <a :href="fallbackUrl[platform]" rel="noopener noreferrer nofollow">点此继续</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ensureAuthOnEnter } from '@/router/ensure-auth';
import { useRoute } from 'vue-router';
const route = useRoute();
const env = import.meta.env;
const fallbackUrl = {
  h5: env.VITE_WEB_OLD_H5_URL,
  pc: env.VITE_WEB_PC_URL,
  mobile: env.VITE_WEB_MOBILE_URL,
};

const sceneId = ref('');
const statusText = ref('正在为你跳转…');
const PLATFORM_RE = /(?:^|\/)(?:h5|mobile)(?=\/|$|\?|#)/i;
const PLATFORM_PREFIX_RE = /^\/(?:h5|mobile)(?=\/|$)/i;
const platform = getPlatform();

/** 返回 'pc' | 'mobile' */
function getPlatform() {
  const ua = String(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const isMobileUA = /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(ua);
  return isMobileUA ? 'mobile' : 'pc';
}

onMounted(async () => {
  // 进入页面第一行就做，避免还没鉴权就先发请求导致 401 抢跳
  const ok = await ensureAuthOnEnter({
    type: 'transfer', // 明确类型（也可以不传，自动按 path 匹配）
    mode: 'social', // 强制静默登录
  });

  if (!ok) return; // 已重定向去登录，后续不再执行

  sceneId.value = route.params.sceneId;
  statusText.value = '已发起跳转，请稍候…';
  getUlMatch(sceneId.value)
    .then((res) => {
      const { code, data } = res.data;
      if (code === 200) {
        const h5Url = data.h5Url;
        if (PLATFORM_RE.test(h5Url)) {
          window.location.href = fallbackUrl.h5 + h5Url;
        } else if (PLATFORM_PREFIX_RE.test(h5Url)) {
          window.location.href = fallbackUrl.mobile + h5Url;
        }
      }
    })
    .catch((err) => {
      console.error(err);
      statusText.value = err;
      alert(err);
    });
});

function getUlMatch(sceneId) {
  return Api.urlMatch.updateByCode({ code: sceneId });
}
</script>

<style scoped lang="scss">
$bg-page: #f7f8fa;
$bg-loader: #151a26;
$muted: #87888e;
$primary: #007aff;

.wrap {
  min-height: 100vh;
  background: $bg-page;
  position: relative;
  display: grid;
  place-items: center;
  text-align: center;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}

#transfer-loader-wrapper.transfer-loader-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: $bg-loader;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .loader-box {
    width: min(520px, 88vw);
    text-align: center;
    font-weight: bold;
    color: $muted;
    font-size: clamp(20px, 6vw, 35px);

    > span {
      opacity: 0.4;
      display: inline-block;
      animation: bouncingLoader 1s infinite alternate;

      &:nth-child(2) {
        animation-delay: 0.1s;
      }
      &:nth-child(3) {
        animation-delay: 0.2s;
      }
      &:nth-child(4) {
        animation-delay: 0.3s;
      }
      &:nth-child(5) {
        animation-delay: 0.4s;
      }
      &:nth-child(6) {
        animation-delay: 0.5s;
      }
      &:nth-child(7) {
        animation-delay: 0.6s;
      }
    }
  }

  .card {
    margin-top: 12px;
    padding: 18px 20px;
    width: min(92vw, 520px);
    background: transparent;
    box-shadow: none;
    color: $muted;
    .sub {
      font-size: clamp(12px, 3.4vw, 14px);
      opacity: 0.7;
      margin: 8px 0 12px;
      word-break: break-all;
    }
    .hint {
      font-size: clamp(12px, 3.4vw, 13px);
      color: $primary;

      a {
        color: inherit;
        text-decoration: underline;
      }
    }
  }
}

@keyframes bouncingLoader {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(25%);
  }
  100% {
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  #transfer-loader-wrapper .loader-box > span {
    animation: none !important;
  }
}
</style>
