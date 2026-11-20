import StaffLayout from "../../../components/layout/StaffLayout";
import AdminNotifications from "../../../components/notifications/AdminNotifications";

export default function AdminNotificationsPage() {
  return (
    <StaffLayout active="notifications" crumb="Quản lý / Quản lý thông báo" contentClassName="p-4 sm:p-6 md:p-8">
      <h1 className="m-0 mb-5 font-serif text-[28px] leading-tight">Quản lý thông báo</h1>
      <AdminNotifications />
    </StaffLayout>
  );
}
