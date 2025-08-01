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
        async getOpenidAndUserinfo() {
            const data = {
                tenant_id: '000000',
                user_id: '1950727526101987329',
                dept_id: '1890319189283610625',
                post_id: '1879705758258434049',
                role_id: '1882624594008334338',
                oauth_id: '1950727518861729794',
                account: 'ohH6mvgDbR77aIivohuFOdYsB3fg',
                user_name: 'ohH6mvgDbR77aIivohuFOdYsB3fg',
                nick_name: 'zero',
                real_name: null,
                role_name: '劳务注册授权',
                avatar: 'https://bladex.cn/images/logo.png',
                access_token:
                    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJibGFkZXguY24iLCJhdWQiOlsiYmxhZGV4Il0sInRva2VuX3R5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJyaWRlciIsInRlbmFudF9pZCI6IjAwMDAwMCIsInVzZXJfaWQiOiIxOTUwNzI3NTI2MTAxOTg3MzI5IiwiZGVwdF9pZCI6IjE4OTAzMTkxODkyODM2MTA2MjUiLCJwb3N0X2lkIjoiMTg3OTcwNTc1ODI1ODQzNDA0OSIsInJvbGVfaWQiOiIxODgyNjI0NTk0MDA4MzM0MzM4Iiwib2F1dGhfaWQiOiIxOTUwNzI3NTE4ODYxNzI5Nzk0IiwiYWNjb3VudCI6Im9oSDZtdmdEYlI3N2FJaXZvaHVGT2RZc0IzZmciLCJ1c2VyX25hbWUiOiJvaEg2bXZnRGJSNzdhSWl2b2h1Rk9kWXNCM2ZnIiwibmlja19uYW1lIjoiemVybyIsInJvbGVfbmFtZSI6IuWKs-WKoeazqOWGjOaOiOadgyIsImRldGFpbCI6eyJ0eXBlIjoid2ViIn0sImV4cCI6MTc1NDAxNTk2NCwibmJmIjoxNzUzOTI5NTY0fQ.Ja2gZtVpTU2e32cgeU3zARMqGd1DwuIO0IZag-LYvMs',
                refresh_token:
                    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJibGFkZXguY24iLCJhdWQiOlsiYmxhZGV4Il0sInRva2VuX3R5cGUiOiJyZWZyZXNoX3Rva2VuIiwidXNlcl9pZCI6IjE5NTA3Mjc1MjYxMDE5ODczMjkiLCJkZXB0X2lkIjoiMTg5MDMxOTE4OTI4MzYxMDYyNSIsInJvbGVfaWQiOiIxODgyNjI0NTk0MDA4MzM0MzM4IiwiZXhwIjoxNzU0NTM0MzY0LCJuYmYiOjE3NTM5Mjk1NjR9.seRvLId2k3IElNqz6V9MDAMyGBw7WQE1sx-lRWxhNXs',
                token_type: 'bearer',
                expires_in: 86400,
                detail: { type: 'web' },
                license: 'powered by bladex',
            };
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
                        console.log('--------------------------', data);
                        // uni.navigateTo({ url: '/pages/home/404' });
                        return;
                    }
                    window.location.href = `${params.get('FRUrl')}&username=${data.real_name}`;
                } else {
                    window.location.href = callbackUrl;
                }
            }
            // this.$u.api.loginBySocial(data).then((res) => {
            //     const data = res;
            //     if (data.error_description) {
            //         this.$u.func.showToast({
            //             title: data.error_description,
            //         });
            //     } else {
            //         this.LOGIN_INFO(data);
            //         if (data.user_id == 'null' && isEnvironment() == 'wechat_open') {
            //             this.userCreateFn(data.oauth_id);
            //         } else {
            //             this.LOGIN_TOKEN(data.access_token);
            //             store.dispatch('getUserInfo');
            //             let callbackUrl = getCallbackUrl();
            //             console.log(callbackUrl);
            //             const url = new URL(callbackUrl);
            //             const params = new URLSearchParams(url.search);
            //             if (params.get('FRUrl')) {
            //                 if (!data.real_name) {
            //                     console.log('--------------------------', data);
            //                     // uni.navigateTo({ url: '/pages/home/404' });
            //                     return;
            //                 }
            //                 window.location.href = `${params.get('FRUrl')}&username=${data.real_name}`;
            //             } else {
            //                 window.location.href = callbackUrl;
            //             }
            //         }
            //     }
            // });
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
