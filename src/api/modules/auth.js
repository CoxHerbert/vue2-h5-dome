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
};
