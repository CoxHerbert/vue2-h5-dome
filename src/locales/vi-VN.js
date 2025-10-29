export default {
  workReport: {
    navTitle: 'Báo cáo giờ làm',
    search: {
      placeholder: 'Vui lòng nhập SN để tra cứu',
      button: 'Tra cứu',
    },
    tabs: {
      detail: 'Chi tiết dự án',
      report: 'Báo cáo giờ',
    },
    empty: 'Chưa có dữ liệu',
    submit: 'Gửi',
    toast: {
      snRequired: 'Vui lòng nhập SN cần tra cứu',
      loading: 'Đang tải…',
      planMissing: 'Không tìm thấy dự án liên quan',
      searchFail: 'Tra cứu thất bại',
      noData: 'Không có dữ liệu để gửi',
      submitting: 'Đang gửi…',
      saveSuccess: 'Lưu thành công',
      submitFail: 'Gửi thất bại',
    },
    overview: {
      projectNumber: 'Mã dự án',
      materialName: 'Tên vật liệu',
      quantity: 'Số lượng',
      table: {
        stage: 'Giai đoạn',
        owner: 'Phụ trách',
        endTime: 'Thời gian kết thúc',
        status: 'Trạng thái',
        progress: 'Tiến độ',
        empty: 'Chưa có thông tin giai đoạn',
      },
      empty: 'Chưa có thông tin dự án',
    },
    routeCard: {
      title: 'Quy trình',
      complete: 'Đánh dấu hoàn thành',
      planNumber: 'Mã kế hoạch',
      hourStats: 'Thống kê giờ',
      quantityStats: 'Số lượng giờ',
      hour: 'Giờ',
      quantity: 'Số lượng',
      units: {
        hour: 'giờ',
        piece: 'cái',
      },
    },
    missingMaterial: {
      navTitle: 'Chi tiết thiếu liệu',
      columns: {
        index: 'STT',
        code: 'Mã vật liệu',
        name: 'Tên vật liệu',
        inventory: 'Tồn kho/Nhu cầu',
        date: 'Ngày giao dự kiến',
      },
      empty: 'Chưa có thông tin thiếu liệu',
      toast: {
        loadFail: 'Không lấy được thông tin thiếu liệu',
        fetchFail: 'Lấy thất bại',
        missingBillNumber: 'Thiếu thông tin mã đơn',
      },
    },
  },
};
