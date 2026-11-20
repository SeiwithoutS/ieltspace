import React from "react";
import { useNotificationCount } from "../../lib/notifications/notifications";
export default function NotificationBadge(
  props: React.HTMLAttributes<HTMLSpanElement>,
) {
  const unread = useNotificationCount();
  return unread ? (
    <span {...props} aria-label={`${unread} thông báo chưa đọc`}>
      {unread}
    </span>
  ) : null;
}
