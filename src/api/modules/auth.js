import request from '@/utils/http';

import website from '@/config/website';

export default {
  loginByUsername(tenantId, deptId, roleId, username, password, type, key, code) {
    return request({
      url: '/blade-auth/oauth/token',
      method: 'post',
      headers: {
        'Tenant-Id': tenantId,
        'Dept-Id': website.switchMode ? deptId : '',
        'Role-Id': website.switchMode ? roleId : '',
        'Captcha-Key': key,
        'Captcha-Code': code,
      },
      params: {
        tenantId,
        username,
        password,
        grant_type: website.captchaMode ? 'captcha' : 'password',
        scope: 'all',
        type,
      },
    });
  },
  // 刷新token
  refreshToken(refresh_token, tenantId, deptId, roleId) {
    return request({
      url: '/blade-auth/oauth/token',
      method: 'post',
      noErrorMsg: true,
      headers: {
        'Tenant-Id': tenantId,
        'Dept-Id': website.switchMode ? deptId : '',
        'Role-Id': website.switchMode ? roleId : '',
      },
      params: {
        tenantId,
        refresh_token,
        grant_type: 'refresh_token',
        scope: 'all',
      },
    });
  },
};
