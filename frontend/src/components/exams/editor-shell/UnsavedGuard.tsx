import { useEffect } from 'react';

export type UnsavedGuardProps = {
  dirty: boolean;
  onPromptLeave: (proceed: () => void) => void;
};

export default function UnsavedGuard({ dirty, onPromptLeave }: UnsavedGuardProps) {
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    }

    function handleClickCapture(e: MouseEvent) {
      if (!dirty) return;

      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      e.preventDefault();
      e.stopPropagation();

      onPromptLeave(() => {
        if (target.target === '_blank') {
          window.open(href, '_blank');
        } else {
          window.location.href = href;
        }
      });
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClickCapture, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClickCapture, true);
    };
  }, [dirty, onPromptLeave]);

  return null;
}
