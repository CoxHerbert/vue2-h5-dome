<script>
import { getUrlCode, isEnvironment } from '@/utils/utils.js';
import store from '@/store/';

export default {
    data() {
        return {
            refreshLock: false,
        };
    },

    created() {
        const savedStore = sessionStorage.getItem('store');
        if (savedStore) {
            this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(savedStore)));
        }

        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('store', JSON.stringify(this.$store.state));
        });
    },

    onLaunch() {
        console.log('App Launch');
        this.initAuthFlow();
    },

    methods: {
        /**
         * 初始化权限流程：
         * 1. 白名单页面直接跳过校验
         * 2. 未登录：根据环境跳转对应登录方式
         * 3. 已登录：拉取用户信息 + 回调 FRUrl
         */
        initAuthFlow() {
            const token = uni.getStorageSync('accessToken');
            const loginInfo = uni.getStorageSync('loginInfo');
            const href = window.location.href;

            if (this.isWhitePage(href)) {
                console.log('白名单页面，跳过鉴权');
                return;
            }

            if (!token) {
                this.redirectToLogin(href);
                return;
            }

            store.dispatch('getUserInfo');

            const realName = loginInfo?.real_name;
            const FRUrl = this.getUrlParam('FRUrl');
            if (realName && FRUrl) {
                window.location.href = `${FRUrl}&username=${realName}`;
            }
        },

        // 判断是否在白名单中
        isWhitePage(href) {
            const whiteList = ['/pages/index/index', '/pages/login/social', '/pages/notice/list', '/pages/home/404'];
            return whiteList.some((path) => href.includes(path));
        },

        // 未登录：根据环境跳转对应登录方式
        redirectToLogin(currentUrl) {
            const env = isEnvironment();
            const encodedUrl = encodeURIComponent(currentUrl);

            if (env === 'wechat_enterprise' || env === 'wechat_open') {
                this.redirectToAuthorize(currentUrl);
            } else {
                // 普通浏览器：跳账号密码登录页，附带回跳地址
                uni.reLaunch({
                    url: `/pages/login/login-account?callbackUrl=${encodedUrl}`,
                });
            }
        },

        // 发起微信/企业微信授权登录
        redirectToAuthorize(currentUrl) {
            const origin = window.location.origin;
            const isTest = origin.includes('h5') || origin.includes('test');
            const redirect = isTest
                ? `${origin}/pages/login/social?callbackUrl=${encodeURIComponent(currentUrl)}`
                : `${origin}/h5/pages/login/social?callbackUrl=${encodeURIComponent(currentUrl)}`;

            this.$u.api
                .authorize({
                    redirectUrl: redirect,
                    type: isEnvironment(),
                })
                .then((res) => {
                    if (res.code === 200) {
                        window.location.href = res.data;
                    }
                });
        },

        // 获取 URL 参数
        getUrlParam(key) {
            const params = new URLSearchParams(window.location.search);
            return params.get(key);
        },

        // 定时刷新 token（可选）
        refreshToken() {
            const userInfo = uni.getStorageSync('loginInfo');
            if (userInfo) {
                store.dispatch('refreshTokenFn', userInfo);
            }
        },
    },
};
</script>

<style lang="scss">
@import 'uview-ui/index.scss';
@import 'static/style/app.scss';

checkbox.curdCheck .wx-checkbox-input,
checkbox.curdCheck .uni-checkbox-input {
    border-radius: 50% !important;
    border-color: #c8c9cc !important;
    color: #f78431 !important;
}

checkbox.curdCheck .wx-checkbox-input-checked,
checkbox.curdCheck .uni-checkbox-input-checked {
    color: #f78431 !important;
    border-color: #f78431 !important;
}

.uni-picker-container,
.wx-picker-container {
    z-index: 10074;
}

uni-modal {
    z-index: 19999 !important;
}

.uni-modal {
    padding: 24rpx 34rpx 54rpx;
    box-sizing: border-box;

    .uni-modal__title {
        font-weight: bold;
    }

    .uni-modal__bd {
        padding: 1em 0.67em 1.5em;
        font-size: 28rpx;
        margin-bottom: 20rpx;
    }

    .uni-modal__btn {
        flex: none;
        width: 120px;
        height: 64rpx;
        line-height: 64rpx;
        background: #f78431;
        border-radius: 4px;

        &:first-child {
            background: #f5f5f5;
        }
    }

    .uni-modal__ft {
        justify-content: space-around;

        &::after {
            display: none;
        }

        &:first-child {
            background: #f5f5f5;
        }
    }
}
</style>

<style>
page {
    background: #f7f7f7;
}

.container,
.navbar-wapper {
    position: relative;
    min-width: 600rpx;
    max-width: 900rpx;
    margin: 0px auto;
    background: linear-gradient(180deg, #d2dff7 0%, rgba(255, 255, 255, 0) 100%) !important;
}
</style>
