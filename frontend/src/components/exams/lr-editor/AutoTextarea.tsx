import React, { useEffect, useRef } from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Ô nhập tự giãn theo nội dung, không có thanh cuộn. */
export default function AutoTextarea({ value, style, className, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      className={`${className ?? ''} resize-none overflow-hidden`}
      style={style}
      {...rest}
    />
  );
}
