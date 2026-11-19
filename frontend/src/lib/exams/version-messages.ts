/**
 * Chuỗi thông báo và hộp xác nhận chuẩn hóa cho phiên bản kỹ năng (D4).
 * Dùng chung cho 4 editor: Listening, Reading, Writing, Speaking.
 */
export const versionMessages = {
  // Nhãn chế độ
  modeEditing: (v: number) => `Đang chỉnh sửa phiên bản ${v} (bản nháp)`,
  modeViewing: 'Chỉ xem',

  // Dải thông báo trên cùng
  bannerDraftWithLive: (
    v: number,
    from: number,
    liveVer: number,
    liveStatus: 'PUBLISHED' | 'HIDDEN'
  ) =>
    `Đây là phiên bản ${v}, bản nháp tạo từ phiên bản ${from}. Người học vẫn thấy phiên bản ${liveVer} (${
      liveStatus === 'PUBLISHED' ? 'đang đăng' : 'đang ẩn'
    }) cho tới khi bạn đăng.`,

  bannerDraftFirst: (v: number) => `Phiên bản ${v} chưa từng đăng.`,

  bannerHidden: (v: number) => `Phiên bản ${v} đang ẩn khỏi người học.`,

  bannerArchived: (v: number, dateStr: string) =>
    `Bạn đang xem phiên bản ${v} (đã lưu trữ ngày ${dateStr}). Đây không phải bản người học đang thấy.`,

  // Hộp xác nhận và thông báo tạo bản sửa
  confirmCreateDraft: (nextVer: number, currentVer: number) => ({
    title: `Tạo phiên bản ${nextVer} để chỉnh sửa?`,
    text: `Phiên bản ${currentVer} giữ nguyên cho người học tới khi bạn đăng bản mới.`,
    goText: 'Tạo bản sửa',
  }),

  noticeReopenDraft: (v: number) => `Mở lại phiên bản nháp ${v} đang soạn dở.`,

  noticeCreatedDraft: (nextVer: number, currentVer: number) =>
    `Đã tạo phiên bản ${nextVer} từ phiên bản ${currentVer}. Mọi thay đổi chỉ lưu vào phiên bản ${nextVer}.`,

  // Thông báo lưu bản nháp
  noticeSavedDraft: (v: number, hasLive: boolean) =>
    hasLive
      ? `Đã lưu phiên bản ${v} (bản nháp). Người học chưa thấy thay đổi này.`
      : `Đã lưu phiên bản ${v} (bản nháp).`,

  // Hộp xác nhận và thông báo đăng
  confirmPublish: (v: number, oldVer?: number | null) => ({
    title: `Đăng phiên bản ${v}?`,
    text: oldVer
      ? `Phiên bản ${oldVer} sẽ chuyển sang lưu trữ.`
      : 'Đề thi sẽ hiển thị công khai cho người học.',
    goText: 'Đăng ngay',
  }),

  noticePublished: (v: number, oldVer?: number | null) =>
    oldVer
      ? `Đã đăng phiên bản ${v}. Phiên bản ${oldVer} đã chuyển sang lưu trữ.`
      : `Đã đăng phiên bản ${v}.`,

  // Hộp xác nhận xóa bản nháp
  confirmDiscardDraft: (v: number, liveVer?: number | null) => ({
    title: `Xóa phiên bản nháp ${v}?`,
    text: liveVer
      ? `Phiên bản ${liveVer} vẫn giữ nguyên.`
      : 'Kỹ năng đang soạn, chưa đăng lần nào. Nội dung đã soạn sẽ bị xóa vĩnh viễn, ô trở về trống để tạo lại.',
    goText: liveVer ? 'Bỏ bản sửa' : 'Xóa kỹ năng',
  }),

  // Tiêu đề tab trình duyệt
  tabTitle: (skillName: string, v: number) => `Soạn đề ${skillName} · phiên bản ${v}`,
};
