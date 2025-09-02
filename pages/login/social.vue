<!-- 注册页面 -->
<template>
    <view class="bottom-side-otherLogin" @click="getWeChatCode" v-if="isWeixin"> </view>
</template>
<script>
import { getTopUrl, getCallbackUrl, isEnvironment } from '@/utils/utils.js';
import { mapMutations } from 'vuex';
import store from '@/store/';

export default {
    data() {
        return {
            isWeixin: false,
            domain: getTopUrl(),
        };
    },
    created() {
        this.isWeixin = isEnvironment() == 'wechat_open' || isEnvironment() == 'wechat_enterprise';
        if (this.isWeixin) {
            uni.showLoading({
                title: '登录中...',
            });
            this.checkWeChatCode(); //通过微信官方接口获取code之后，会重新刷新设置的回调地址【redirect_uri】
        }
    },

    methods: {
        ...mapMutations(['LOGIN_USERINFO', 'LOGIN_TOKEN', 'LOGIN_INFO']),
        //检查浏览器地址栏中微信接口返回的code
        checkWeChatCode() {
            let source = isEnvironment();
            const url = new URL(window.location.href);
            const params = new URLSearchParams(url.search);
            const list = url.search.split('?');
            let data = {
                tenantId: '000000',
                source: source,
                code: params.get('code'),
                state: params.get('state'),
                callbackUrl: list[1].split('=')[1],
            };
            if (data.code) {
                this.getOpenidAndUserinfo(data);
            }
        },

        //把code传递给后台接口，静默登录
        async getOpenidAndUserinfo(data) {
            this.$u.api.loginBySocial(data).then((res) => {
                const data = res;
                if (data.error_description) {
                    this.$u.func.showToast({
                        title: data.error_description,
                    });
                } else {
                    this.LOGIN_INFO(data);
                    if (data.user_id == 'null' && isEnvironment() == 'wechat_open') {
                        this.userCreateFn(data.oauth_id);
                    } else {
                        this.LOGIN_TOKEN(data.access_token);
                        store.dispatch('getUserInfo');
                        let callbackUrl = getCallbackUrl();
                        const url = new URL(callbackUrl);
                        const params = new URLSearchParams(url.search);
                        if (params.get('FRUrl')) {
                            if (!data.real_name) {
                                console.log('--------------------------', data)
                                // uni.navigateTo({ url: '/pages/home/404' });
                                return;
                            }
                            window.location.href = `${params.get('FRUrl')}&username=${data.real_name}`;
                        } else {
                            window.location.href = callbackUrl;
                        }
                    }
                }
            });
        },

        // 暂存用户id
        userCreateFn(oauth_id) {
            this.$u.api
                .userCreate({
                    oauthId: oauth_id,
                })
                .then((res) => {
                    if (res.code == 200) {
                        let obj = Object.assign(uni.getStorageSync('loginInfo'), {
                            user_id: res.data.id,
                        });
                        this.LOGIN_USERINFO(obj);
                        let callbackUrl = getCallbackUrl();
                        window.location.href = callbackUrl;
                    }
                });
        },
    },
};
</script>
