export type Crumb = {
  label: string;
  page?: string;
  params?: Record<string, string>;
};

export const CRUMB_PAGES: Record<string, string> = {
  'Quản lý': 'AdminHome',
  'Tổng quan': 'AdminHome',
  'Bộ đề và đề thi': 'AdminExams',
  'Thông tin bộ đề': 'AdminExamSet',
  'Người dùng': 'AdminUsers',
  'Chấm bài': 'AdminGrading',
  'Chấm bài (admin)': 'AdminGrading',
  'Bài mẫu': 'AdminSamples',
  'Báo cáo & phản hồi': 'AdminReports',
  'Giáo viên': 'TeacherHome',
  'Hàng chờ chấm': 'TeacherQueue',
  'Lịch sử chấm': 'TeacherHistory',
  'Thông báo': 'Notifications',
  'Hồ sơ cá nhân': 'StaffProfile',
};

/**
 * Tự tách chuỗi crumb (dạng "Quản lý / Bộ đề và đề thi / ...") và tra bảng CRUMB_PAGES để gắn page.
 */
export function parseCrumbString(crumbStr: string): Crumb[] {
  if (!crumbStr) return [];
  const parts = crumbStr.split(' / ').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return [];

  const isTeacher = parts[0] === 'Giáo viên';

  return parts.map((part, index) => {
    // Mục cuối là trang hiện tại, không có page
    if (index === parts.length - 1) {
      return { label: part };
    }
    if (part === 'Tổng quan') {
      return { label: part, page: isTeacher ? 'TeacherHome' : 'AdminHome' };
    }
    const page = CRUMB_PAGES[part];
    return { label: part, page };
  });
}
