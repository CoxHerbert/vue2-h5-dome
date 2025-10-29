export default {
  common: {
    errors: {
      system: '系统错误',
      tokenExpired: '用户令牌过期，请重新登录',
      network: '网络异常',
    },
    validation: {
      id: {
        invalidFormat: '证件号码格式错误',
        invalidRegion: '地址编码错误',
        invalidChecksum: '证件号码校验位错误',
        invalidLength: '证件号码长度不为18位',
        required: '证件号码不能为空',
      },
      phone: {
        invalidFormat: '手机号码格式不正确',
        invalidLength: '手机号码长度不为11位',
        required: '手机号码不能为空',
      },
    },
    time: {
      unsupportedUnit: '不支持的时间单位: {from} 或 {to}',
    },
  },
  login: {
    brand: {
      slogan: '同心合力，助力生产',
    },
    language: {
      title: '语言',
      cancel: '取消',
    },
    form: {
      username: {
        placeholder: '请输入手机号或工号',
        required: '请输入用户名',
      },
      password: {
        placeholder: '请输入密码',
        required: '请输入密码',
      },
    },
    button: {
      submit: '登录',
      loading: '登录中…',
    },
    toast: {
      success: '登录成功',
      fail: '登录失败，请重试',
    },
    social: {
      title: '欢迎登录',
      subtitle: '为你提供统一、便捷、安全的登录体验',
      currentEntry: '当前入口：{type}',
      loading: '正在登录中…',
      typeLabels: {
        campusApplicant: '校园招聘',
        internalReferral: '内部内推',
        vendorHr: '供应商HR',
      },
      errors: {
        missingRedirect: '授权返回缺少跳转地址',
        missingToken: '登录失败：未获取到 access_token',
        initAccount: '初始化账号失败，请稍后重试',
      },
    },
    ticketTransfer: {
      title: '正在准备工作环境',
      subtitle: '解析跳转参数中…',
      status: {
        loading: '正在解析参数',
        success: '解析成功',
        error: '解析失败',
      },
      hints: {
        loading: '正在读取并解析 urlTicketId',
        success: '即将跳转到目标页面',
        error: '请返回重试或联系管理员',
      },
      errors: {
        missingTicket: '缺少 urlTicketId',
        server: '服务端返回失败',
        missingUrl: '未返回 h5Url',
        unknown: '未知错误',
      },
    },
    userInfoTransition: {
      title: '正在准备工作环境',
      subtitle: '获取并保存用户信息',
      status: {
        loading: '正在拉取资料',
        success: '获取成功',
        error: '获取失败',
      },
      hints: {
        loading: '包含头像、昵称、手机号、组织等字段',
        success: '已写入本地缓存',
        error: '请返回重试或联系管理员',
      },
      progress: {
        label: '进度',
      },
      steps: {
        readTicket: '读取路由 urlTicketId',
        fetchUser: '请求用户信息',
        persist: '本地存储',
        redirect: '跳转目标页',
      },
      stepTags: {
        done: '完成',
        doing: '进行中',
        error: '失败',
        pending: '待执行',
      },
      alerts: {
        success: '已就绪，正在进入系统…',
        error: '获取失败，请稍后重试',
      },
      footerNote: '该页面为过渡页，请勿操作',
      errors: {
        missingTicket: '路由缺少 {key}',
        server: '服务端返回失败',
        unknown: '未知错误',
      },
    },
  },
  protected: {
    title: '受保护页面',
    description: {
      before: '只有登录后并具有',
      after: '权限的用户可以访问。',
    },
    permission: 'demo:view',
    logout: '退出登录',
  },
  transferPage: {
    status: {
      initial: '正在为你跳转…',
      pending: '已发起跳转，请稍候…',
      error: '跳转失败',
    },
    hint: {
      prefix: '若未自动跳转，请',
      link: '点此继续',
    },
    errors: {
      generic: '跳转失败，请稍后重试',
    },
  },
  error: {
    notFound: {
      description: '页面走丢了 (404)',
      target: '目标地址：{path}',
      actions: {
        back: '返回上一页',
        home: '回到首页',
        retry: '刷新重试',
      },
      tip: '可能的原因：链接过期 / 地址拼写错误 / 页面已被移动',
      toast: {
        refreshing: '正在刷新…',
      },
    },
  },
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
      expandRoles: '展开更多({count})',
      collapseRoles: '收起',
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
    workTime: {
      title: '工时查询',
      dateLabel: '查询日期',
      punchDetailTitle: '打卡明细',
      punchTimeLabel: '打卡时间',
      groups: {
        attendance: '出勤数据',
        overtime: '加班数据',
        abnormal: '异常数据',
        correction: '修正考勤数据',
      },
      fields: {
        normalHours: '正常时数',
        travelNormalHours: '出差正常时数',
        paidLeaveHours: '有薪请假时数',
        unpaidLeaveHours: '无薪请假时数',
        restHours: '休息日休息时数',
        holidayHours: '节假日休息时数',
        paidStopHours: '有薪停工时数',
        unpaidStopHours: '无薪停工时数',
        cardOverHours: '刷卡加班时数',
        applyOverHours: '加班申请时数',
        normalOverHours: '平日加班时数',
        travelOverHours: '出差加班时数',
        restOverHours: '休息日加班时数',
        holidayOverHours: '节假日加班时数',
        overToLeaveHours: '加班转补休时数',
        leaveSettlementHours: '假期结算时数',
        lateMinutes: '迟到分钟',
        lateCount: '迟到次数',
        leaveEarlyMinutes: '早退分钟',
        leaveEarlyCount: '早退次数',
        absenteeismHours: '旷工时数',
        correctionNormalHours: '修正正班时数',
        correctionNormalOverHours: '修正平时加班时数',
        correctionWeekendOverHours: '修正周末加班时数',
        correctionHolidayOverHours: '修正节假日加班时数',
      },
      loadFail: '加载失败',
      emptyValue: '-',
    },
  },
};
