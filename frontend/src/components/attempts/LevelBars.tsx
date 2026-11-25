/**
 * Sóng âm vẽ từ mức âm thật của micro (xem lib/attempts/use-mic-level.ts).
 * Dàn đều hết chiều ngang của khung chứa: mỗi cột co giãn theo width.
 */
export default function LevelBars({
  levels,
  height = 120,
  live = true,
}: {
  levels: number[];
  height?: number;
  /** false: mờ đi, dùng khi chưa ghi. */
  live?: boolean;
}) {
  const max = Math.max(4, height - 8);
  return (
    <div
      aria-hidden="true"
      className="flex items-center w-full box-border [gap:2px] [padding:0_8px] [border-radius:12px] [background:var(--attempt-bg-e8e4fa)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] overflow-hidden"
      style={{ height, opacity: live ? 1 : 0.55 }}
    >
      {levels.map((level, index) => (
        <span
          key={index}
          className="flex-1 [min-width:0] [max-width:6px] mx-auto rounded-full [background:var(--attempt-bg-5543b0)]"
          style={{ height: 3 + Math.round(level * (max - 3)) }}
        />
      ))}
    </div>
  );
}
