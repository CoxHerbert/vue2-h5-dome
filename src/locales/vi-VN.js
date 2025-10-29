export default {
  common: {
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    expand: 'Mở rộng',
    collapse: 'Thu gọn',
    errors: {
      system: 'Đã xảy ra lỗi hệ thống',
      tokenExpired: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
      network: 'Lỗi mạng',
    },
    validation: {
      id: {
        invalidFormat: 'Định dạng số giấy tờ không hợp lệ',
        invalidRegion: 'Mã khu vực không hợp lệ',
        invalidChecksum: 'Chữ số kiểm tra của giấy tờ không chính xác',
        invalidLength: 'Số giấy tờ phải có 18 ký tự',
        required: 'Vui lòng nhập số giấy tờ',
      },
      phone: {
        invalidFormat: 'Định dạng số điện thoại không hợp lệ',
        invalidLength: 'Số điện thoại phải có 11 chữ số',
        required: 'Vui lòng nhập số điện thoại',
      },
    },
    time: {
      unsupportedUnit: 'Đơn vị thời gian không được hỗ trợ: {from} hoặc {to}',
    },
  },
  login: {
    brand: {
      slogan: 'Đồng lòng hợp lực, tiếp sức sản xuất',
    },
    language: {
      title: 'Ngôn ngữ',
      cancel: 'Hủy',
    },
    form: {
      username: {
        placeholder: 'Nhập số điện thoại hoặc mã nhân viên',
        required: 'Vui lòng nhập tên đăng nhập',
      },
      password: {
        placeholder: 'Nhập mật khẩu',
        required: 'Vui lòng nhập mật khẩu',
      },
    },
    button: {
      submit: 'Đăng nhập',
      loading: 'Đang đăng nhập…',
    },
    toast: {
      success: 'Đăng nhập thành công',
      fail: 'Đăng nhập thất bại, vui lòng thử lại',
    },
    social: {
      title: 'Chào mừng bạn trở lại',
      subtitle: 'Mang đến trải nghiệm đăng nhập thống nhất, tiện lợi và an toàn',
      currentEntry: 'Cổng hiện tại: {type}',
      loading: 'Đang đăng nhập…',
      typeLabels: {
        campusApplicant: 'Tuyển dụng sinh viên',
        internalReferral: 'Giới thiệu nội bộ',
        vendorHr: 'HR nhà cung cấp',
      },
      errors: {
        missingRedirect: 'Phản hồi ủy quyền thiếu địa chỉ chuyển hướng',
        missingToken: 'Đăng nhập thất bại: thiếu access_token',
        initAccount: 'Khởi tạo tài khoản thất bại, vui lòng thử lại sau',
      },
    },
    ticketTransfer: {
      title: 'Đang chuẩn bị môi trường làm việc',
      subtitle: 'Đang phân tích tham số chuyển hướng…',
      status: {
        loading: 'Đang phân tích tham số',
        success: 'Phân tích thành công',
        error: 'Phân tích thất bại',
      },
      hints: {
        loading: 'Đang đọc và phân tích urlTicketId',
        success: 'Sắp chuyển đến trang đích',
        error: 'Vui lòng quay lại thử lại hoặc liên hệ quản trị viên',
      },
      errors: {
        missingTicket: 'Thiếu urlTicketId',
        server: 'Máy chủ trả về lỗi',
        missingUrl: 'Thiếu h5Url',
        unknown: 'Lỗi không xác định',
      },
    },
    userInfoTransition: {
      title: 'Đang chuẩn bị môi trường làm việc',
      subtitle: 'Đang lấy và lưu thông tin người dùng',
      status: {
        loading: 'Đang lấy dữ liệu hồ sơ',
        success: 'Lấy thành công',
        error: 'Lấy thất bại',
      },
      hints: {
        loading: 'Bao gồm ảnh đại diện, biệt danh, số điện thoại, tổ chức…',
        success: 'Đã lưu vào bộ nhớ đệm cục bộ',
        error: 'Vui lòng quay lại thử lại hoặc liên hệ quản trị viên',
      },
      progress: {
        label: 'Tiến độ',
      },
      steps: {
        readTicket: 'Đọc urlTicketId từ tuyến đường',
        fetchUser: 'Yêu cầu thông tin người dùng',
        persist: 'Lưu trữ cục bộ',
        redirect: 'Chuyển đến trang đích',
      },
      stepTags: {
        done: 'Hoàn thành',
        doing: 'Đang xử lý',
        error: 'Thất bại',
        pending: 'Chờ xử lý',
      },
      alerts: {
        success: 'Đã sẵn sàng, đang vào hệ thống…',
        error: 'Lấy thông tin thất bại, vui lòng thử lại sau',
      },
      footerNote: 'Đây là trang chuyển tiếp, vui lòng không thao tác',
      errors: {
        missingTicket: 'Tuyến đường thiếu {key}',
        server: 'Máy chủ trả về lỗi',
        unknown: 'Lỗi không xác định',
      },
    },
  },
  protected: {
    title: 'Trang được bảo vệ',
    description: {
      before: 'Chỉ những người dùng đã đăng nhập và có',
      after: 'mới có thể truy cập.',
    },
    permission: 'demo:view',
    logout: 'Đăng xuất',
  },
  transferPage: {
    status: {
      initial: 'Đang chuyển hướng cho bạn…',
      pending: 'Đã gửi yêu cầu chuyển hướng, vui lòng chờ…',
      error: 'Chuyển hướng thất bại',
    },
    hint: {
      prefix: 'Nếu không tự động chuyển hướng, vui lòng',
      link: 'bấm vào đây để tiếp tục',
    },
    errors: {
      generic: 'Chuyển hướng thất bại, vui lòng thử lại sau',
    },
  },
  error: {
    notFound: {
      description: 'Trang không tồn tại (404)',
      target: 'Địa chỉ mục tiêu: {path}',
      actions: {
        back: 'Quay lại',
        home: 'Về trang chủ',
        retry: 'Tải lại',
      },
      tip: 'Nguyên nhân có thể: liên kết hết hạn / địa chỉ sai / trang đã được di chuyển',
      toast: {
        refreshing: 'Đang tải lại…',
      },
    },
  },
  routes: {
    home: 'Trang chủ',
    apps: 'Ứng dụng',
    me: 'Cá nhân',
    meChildren: {
      points: 'Điểm của tôi',
      leave: 'Số ngày nghỉ tháng này',
      travel: 'Số ngày công tác tháng này',
      overtime: 'Tăng ca tháng này',
      punch: 'Chấm công hôm nay',
      workTime: 'Tra cứu giờ làm',
      punchRecord: 'Lịch sử chấm công',
    },
    recruit: {
      campusList: 'Danh sách vị trí tuyển sinh',
      campusApply: 'Mẫu ứng tuyển sinh viên',
      campusApplyDetail: 'Chi tiết đơn ứng tuyển',
    },
  },
  me: {
    navTitle: 'Cá nhân',
    dashboard: {
      pointsLabel: 'Điểm của tôi',
      joinDays: 'Đồng hành cùng Đông Sáng {days} ngày',
      metrics: {
        leave: 'Số ngày nghỉ tháng này',
        travel: 'Số ngày công tác tháng này',
        overtime: 'Giờ tăng ca tháng này (h)',
      },
      todayPunch: {
        title: 'Chấm công hôm nay',
        timeLabel: 'Thời gian chấm công',
        empty: 'Hôm nay chưa có bản ghi chấm công',
      },
      functions: {
        title: 'Chức năng của tôi',
        items: {
          workTime: 'Tra cứu giờ làm',
          punchRecord: 'Lịch sử chấm công',
        },
      },
    },
    placeholder: {
      default: 'Chức năng đang phát triển, vui lòng đợi',
    },
    language: {
      title: 'Ngôn ngữ',
      zhCN: 'Tiếng Trung',
      enUS: 'Tiếng Anh',
    },
    profile: {
      unnamed: 'Người dùng chưa đặt tên',
      account: 'Tài khoản',
    },
    cells: {
      position: 'Chức vụ',
      role: 'Vai trò',
      joinedDate: 'Ngày vào làm',
      email: 'Email',
    },
    actions: {
      changePassword: 'Đổi mật khẩu',
      logout: 'Đăng xuất',
    },
    form: {
      title: 'Đổi mật khẩu',
      oldPassword: {
        label: 'Mật khẩu cũ',
        placeholder: 'Vui lòng nhập mật khẩu cũ',
      },
      newPassword: {
        label: 'Mật khẩu mới',
        placeholder: 'Vui lòng nhập mật khẩu mới',
      },
      confirmPassword: {
        label: 'Xác nhận mật khẩu',
        placeholder: 'Vui lòng nhập lại mật khẩu mới',
      },
      cancel: 'Hủy',
      confirm: 'Xác nhận',
    },
    validation: {
      newPassword: 'Mật khẩu phải có ít nhất 6 ký tự',
      confirmPassword: 'Hai lần nhập không trùng khớp',
    },
    dialog: {
      logoutTitle: 'Xác nhận đăng xuất',
      logoutMessage: 'Bạn có chắc muốn đăng xuất không?',
    },
    toast: {
      changePasswordSuccess: 'Đổi mật khẩu thành công',
      changePasswordFail: 'Đổi mật khẩu thất bại',
    },
    workTime: {
      title: 'Tra cứu giờ làm',
      dateLabel: 'Ngày tra cứu',
      punchDetailTitle: 'Chi tiết chấm công',
      punchTimeLabel: 'Thời gian chấm công',
      weekNames: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      monthLabel: 'Tháng {month}',
      yearLabel: 'Năm {year}',
      yearOption: 'Năm {year}',
      groups: {
        attendance: 'Dữ liệu chấm công',
        overtime: 'Dữ liệu tăng ca',
        abnormal: 'Dữ liệu bất thường',
        correction: 'Dữ liệu điều chỉnh chấm công',
      },
      fields: {
        normalHours: 'Giờ làm bình thường',
        travelNormalHours: 'Giờ làm bình thường khi công tác',
        paidLeaveHours: 'Giờ nghỉ phép có lương',
        unpaidLeaveHours: 'Giờ nghỉ phép không lương',
        restHours: 'Giờ nghỉ ngày nghỉ',
        holidayHours: 'Giờ nghỉ lễ tết',
        paidStopHours: 'Giờ ngừng việc có lương',
        unpaidStopHours: 'Giờ ngừng việc không lương',
        cardOverHours: 'Giờ tăng ca qua chấm thẻ',
        applyOverHours: 'Giờ tăng ca theo đơn',
        normalOverHours: 'Giờ tăng ca ngày thường',
        travelOverHours: 'Giờ tăng ca khi công tác',
        restOverHours: 'Giờ tăng ca ngày nghỉ',
        holidayOverHours: 'Giờ tăng ca ngày lễ',
        overToLeaveHours: 'Giờ tăng ca chuyển sang nghỉ bù',
        leaveSettlementHours: 'Giờ quyết toán ngày nghỉ',
        lateMinutes: 'Phút đi trễ',
        lateCount: 'Số lần đi trễ',
        leaveEarlyMinutes: 'Phút về sớm',
        leaveEarlyCount: 'Số lần về sớm',
        absenteeismHours: 'Giờ vắng mặt',
        correctionNormalHours: 'Giờ làm bình thường sau điều chỉnh',
        correctionNormalOverHours: 'Giờ tăng ca ngày thường sau điều chỉnh',
        correctionWeekendOverHours: 'Giờ tăng ca cuối tuần sau điều chỉnh',
        correctionHolidayOverHours: 'Giờ tăng ca ngày lễ sau điều chỉnh',
      },
      loadFail: 'Tải dữ liệu thất bại',
      emptyValue: '-',
    },
  },
};
