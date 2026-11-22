import { userStatuses } from '../../../lib/admin-users/api';
import { styleOf } from '../../../lib/shared/styles';
import { buttonClass, controlClass } from '../../../components/shared/ui';

export const directoryMuted = 'text-[var(--attempt-text-706473,#706473)]';
export const loginMethodLabel = { PASSWORD: 'Email', GOOGLE: 'Google' };
// Nút và ô nhập theo DESIGN.md 12.1–12.2 (component dùng chung ở components/shared/ui).
export const directoryButton = buttonClass({ size: 'sm' });
export const closeButton = buttonClass({ icon: true, size: 'sm' });
export const directoryField = controlClass();
export const directoryCard = 'border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow: hidden';

const pill = 'display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border: 1.5px solid #D6D4D0; border-radius: 999px; box-sizing: border-box; font-size: 13px; font-weight: 600; white-space: nowrap';

export function badgeStyle(background: string, color: string) {
  return styleOf(pill + `; background: ${background}; color: ${color}`);
}

const roleColors = {
  LEARNER: ['#FFFFFF', '#352637'],
  TEACHER: ['#E3ECFD', '#352637'],
  ADMIN: ['#352637', '#FFFFFF'],
};

export function roleBadgeStyle(role: keyof typeof roleColors) {
  const [background, color] = roleColors[role];
  return badgeStyle(background, color);
}

export function userInitials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase('vi');
}

export function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>;
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });
const timeFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });

export function formatUserDate(value: string, time = false) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? (time ? timeFormatter : dateFormatter).format(timestamp) : 'Chưa ghi nhận';
}

const statusStyle = {
  ACTIVE: ['#DCEDE2', '#2E6A48'],
  LOCKED: ['#FBDCD3', '#C0412A'],
  DELETED: ['#F3F0EA', '#706473'],
  INVITED: ['#E8E4FA', '#5543B0'],
};

export function AccountStatus({ status }: { status: keyof typeof userStatuses }) {
  const [background, color] = statusStyle[status];
  return <span style={badgeStyle(background, color)}>{userStatuses[status]}</span>;
}
