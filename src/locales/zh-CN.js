export default {
  routes: {
    home: '首页',
    apps: '应用',
    me: '我的',
    recruit: {
      campusList: '校招岗位列表',
      campusApply: '校招投递表单',
      campusApplyDetail: '投递详情',
    },
  },
  me: {
    navTitle: '我的',
    language: {
      title: '语言',
      zhCN: '中文',
      enUS: '英文',
    },
    profile: {
      unnamed: '未命名用户',
      account: '账号',
    },
    cells: {
      position: '职位',
      role: '角色',
      joinedDate: '入职时间',
      email: '邮箱',
    },
    actions: {
      changePassword: '修改密码',
      logout: '退出登录',
    },
    form: {
      title: '修改密码',
      oldPassword: {
        label: '旧密码',
        placeholder: '请输入旧密码',
      },
      newPassword: {
        label: '新密码',
        placeholder: '请输入新密码',
      },
      confirmPassword: {
        label: '确认密码',
        placeholder: '请再次输入新密码',
      },
      cancel: '取消',
      confirm: '确定',
    },
    validation: {
      newPassword: '密码至少6位',
      confirmPassword: '两次输入不一致',
    },
    dialog: {
      logoutTitle: '确认退出',
      logoutMessage: '确定要退出登录吗？',
    },
    toast: {
      changePasswordSuccess: '修改成功',
      changePasswordFail: '修改失败',
    },
  },
};
