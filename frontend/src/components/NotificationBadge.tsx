import React from 'react';
import {useNotifications} from '../lib/notifications';
export default function NotificationBadge(props:React.HTMLAttributes<HTMLSpanElement>){const {unread}=useNotifications();return unread ? <span {...props} aria-label={`${unread} thông báo chưa đọc`}>{unread}</span> : null;}
