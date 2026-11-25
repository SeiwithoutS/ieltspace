/** Sóng âm vẽ từ mức âm thật của micro (xem lib/attempts/use-mic-level.ts). */
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
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center gap-1 [border-radius:16px] [background:var(--attempt-bg-e8e4fa)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] overflow-hidden"
      style={{ height, opacity: live ? 1 : 0.55 }}
    >
      {levels.map((level, index) => (
        <span
          key={index}
          className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)]"
          style={{ height: 6 + Math.round(level * (height - 28)) }}
        />
      ))}
    </div>
  );
}
