import { defineStore } from 'pinia';
import Api from '@/api';
import { secureStorage } from '@/utils/secure-storage';
import { KEYS } from '@/constants/keys';

const transformBtnAuths = (data = {}) => {
  const result = {};
  Object.keys(data).forEach((key) => {
    const item = data[key] || {};
    result[key] = {
      name: item.name,
      btnType: item.btnType,
      dataPromissionType: item.dataPromissionType,
      dataPromissionDeptType: item.dataPromissionDeptType,
    };
  });
  return result;
};

const flattenPermissionCodes = (list = [], result = []) => {
  list.forEach((item) => {
    if (typeof item !== 'object' || item === null) return;
    const children = item.children;
    const code = item.code;
    if (Array.isArray(children) && children.length > 0) {
      flattenPermissionCodes(children, result);
    } else if (code) {
      result.push(code);
    }
  });
  return result;
};

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permission: secureStorage.get(KEYS.PERMISSION, {}),
    btnPermission: {},
    deptInfo: secureStorage.get(KEYS.DEPT_INFO, null),
  }),

  actions: {
    setBtnPermission(permission) {
      this.btnPermission = permission || {};
    },

    setPermission(permission) {
      const codes = flattenPermissionCodes(permission || []);
      const map = {};
      codes.forEach((code) => {
        map[code] = true;
      });
      this.permission = map;
      secureStorage.set(KEYS.PERMISSION, this.permission);
    },

    setDeptInfo(deptInfo) {
      this.deptInfo = deptInfo || null;
      if (this.deptInfo) {
        secureStorage.set(KEYS.DEPT_INFO, this.deptInfo);
      } else {
        secureStorage.remove(KEYS.DEPT_INFO);
      }
    },

    async fetchBtnPermissions() {
      try {
        const res = await Api.user.getDataPermissionButtons();
        if (res.data?.code === 200) {
          this.setBtnPermission(transformBtnAuths(res.data?.data?.menu || {}));
        }
      } catch (error) {
        console.error('获取数据级，按钮权限 数据失败', error);
      }
    },

    async fetchButtons() {
      const res = await Api.user.getButtons();
      const data = res.data?.data || [];
      this.setPermission(data);
    },

    reset() {
      this.permission = {};
      this.btnPermission = {};
      this.deptInfo = null;
      secureStorage.remove(KEYS.PERMISSION);
      secureStorage.remove(KEYS.DEPT_INFO);
    },
  },
});
