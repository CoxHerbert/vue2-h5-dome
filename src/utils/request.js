import axios from 'axios';
import { tansParams } from '@/utils/ruoyi';
import cache from '@/utils/cache';
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建axios实例
const service = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: process.env.VUE_APP_BASE_API,
    // 超时
    timeout: 20000,
});

// request拦截器
service.interceptors.request.use(
    (config) => {
        // 是否需要防止数据重复提交
        const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
        // get请求映射params参数
        if (config.method === 'get' && config.params) {
            let url = config.url + '?' + tansParams(config.params);
            url = url.slice(0, -1);
            config.params = {};
            config.url = url;
        }
        if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
            const requestObj = {
                url: config.url,
                data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
                time: new Date().getTime(),
            };
            const sessionObj = cache.session.getJSON('sessionObj');
            if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
                cache.session.setJSON('sessionObj', requestObj);
            } else {
                const s_url = sessionObj.url; // 请求地址
                const s_data = sessionObj.data; // 请求数据
                const s_time = sessionObj.time; // 请求时间
                const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
                if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
                    const message = '数据正在处理，请勿重复提交';
                    console.warn(`[${s_url}]: ` + message);
                    return Promise.reject(new Error(message));
                } else {
                    cache.session.setJSON('sessionObj', requestObj);
                }
            }
        }
        return config;
    },
    (error) => {
        console.log(error);
        Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (res) => {
        // 未设置状态码则默认成功状态
        // const code = res.data.code || 200;
        return res.data;
    },
    (error) => {
        console.log('err' + error);
    }
);

export default service;
