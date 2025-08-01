import user from '@/api/user';
import { isEnvironment } from '@/utils/utils.js';
const state = {
    userInfo: null,
    accessToken: uni.getStorageSync('accessToken'),
    loginInfo: null,
    lang: uni.getStorageSync('dcLang') || 'cn', // vn || cn
};

const mutations = {
    SET_LANG(state, data) {
        state.lang=data.lang;
        uni.setStorageSync('dcLang', data.lang);
    },
    LOGIN_USERINFO(state, data) {
        data.nick_name = data.name;
        data.dept_name = data.deptName;
        state.userInfo = data;
        uni.setStorageSync('userInfo', data);
        console.log(state.userInfo);
    },
    LOGIN_INFO(state, data) {
        state.loginInfo = data;
        uni.setStorageSync('loginInfo', data);
    },
    LOGIN_TOKEN(state, data) {
        state.accessToken = data;
        uni.setStorageSync('accessToken', data);
    },
    LOGOUT(state) {
        state.userInfo = null;
        state.accessToken = null;
        state.loginInfo = null;
        uni.removeStorageSync('userInfo');
        uni.removeStorageSync('loginInfo');
        uni.removeStorageSync('accessToken');
        let { href } = window.location;
        console.log(window.location);
        if (isEnvironment() == 'wechat_open' || isEnvironment() == 'wechat_enterprise') {
            window.location.href = href;
        } else if (href.includes('www.eastwinbip.com')) {
            window.location.href = `https://www.eastwinbip.com/h5/pages/login/login-account`;
        } else {
            uni.redirectTo({
                url: '/pages/login/login-account',
            });
        }
    },
};

const actions = {
    //刷新token
    refreshTokenFn({ state, commit }, userInfo) {
        return new Promise((resolve, reject) => {
            user.refreshToken(userInfo.refresh_token, userInfo.tenant_id)
                .then((res) => {
                    commit('LOGIN_TOKEN', res.access_token);
                    commit('LOGIN_INFO', res);
                    resolve(res.access_token);
                })
                .catch((error) => {
                    localStorage.removeItem('accessToken');
                    reject(error);
                });
        });
    },
    getUserInfo({ commit, state }) {
        return new Promise((resolve, reject) => {
            user.userInfo()
                .then((res) => {
                    const data = res.data;
                    commit('LOGIN_USERINFO', data);
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
};

export default {
    state,
    mutations,
    actions,
};
