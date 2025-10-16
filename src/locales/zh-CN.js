export default {
  routes: {
    home: '首页',
    apps: '应用',
    me: '我的',
    meChildren: {
      points: '我的积分',
      leave: '本月请假天数',
      travel: '本月出差天数',
      overtime: '本月加班',
      punch: '今日打卡',
      workTime: '工时查询',
      punchRecord: '打卡记录',
    },
    recruit: {
      campusList: '校招岗位列表',
      campusApply: '校招投递表单',
      campusApplyDetail: '投递详情',
    },
  },
  me: {
    navTitle: '我的',
    dashboard: {
      pointsLabel: '我的积分',
      joinDays: '加入东创{days}天',
      metrics: {
        leave: '本月请假天数',
        travel: '本月出差天数',
        overtime: '本月加班（h）',
      },
      todayPunch: {
        title: '今日打卡',
        timeLabel: '打卡时间',
        empty: '今日暂无打卡记录',
      },
      functions: {
        title: '我的功能',
        items: {
          workTime: '工时查询',
          punchRecord: '打卡记录',
        },
      },
    },
    placeholder: {
      default: '功能开发中，敬请期待',
    },
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
