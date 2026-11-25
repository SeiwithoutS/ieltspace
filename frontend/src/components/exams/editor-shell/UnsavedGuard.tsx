import { useEffect } from 'react';
import { registerNavigationGuard } from '../../../lib/shared/navigation-guard';

export type UnsavedGuardProps = {
  dirty: boolean;
  /** Nếu có, đọc trạng thái chưa lưu từ ref (cập nhật đồng bộ ngay sau khi lưu) thay cho `dirty`. */
  dirtyRef?: { current: boolean };
  /**
   * Hộp thoại xác nhận trong app của trang chủ. Nhận `proceed` (bấm "Rời đi") và `cancel` (đóng hộp thoại);
   * guard trả Promise<boolean> để App điều hướng tiếp tới đích sau khi xác nhận. Không có thì dùng window.confirm.
   */
  onPromptLeave?: (proceed: () => void, cancel: () => void) => void;
};

export default function UnsavedGuard({ dirty: dirtyProp, dirtyRef, onPromptLeave }: UnsavedGuardProps) {
  useEffect(() => {
    const isDirty = () => (dirtyRef ? dirtyRef.current : dirtyProp);

    const unregister = registerNavigationGuard(() => {
      if (!isDirty()) return true;
      if (!onPromptLeave) {
        return window.confirm('Có thay đổi chưa lưu. Rời trang sẽ bỏ các thay đổi này. Bạn có muốn rời đi?');
      }
      return new Promise<boolean>(resolve => {
        onPromptLeave(
          () => {
            if (dirtyRef) dirtyRef.current = false;
            resolve(true);
          },
          () => resolve(false)
        );
      });
    });

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = '';
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unregister();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dirtyProp, dirtyRef, onPromptLeave]);

  return null;
}
