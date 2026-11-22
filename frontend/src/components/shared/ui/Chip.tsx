import type { ReactNode } from "react";

export type ChipTone =
  | "skill-L"
  | "skill-R"
  | "skill-W"
  | "skill-S"
  | "form-A"
  | "form-G"
  | "published"
  | "draft"
  | "hidden"
  | "neutral";

// Nhãn dạng viên thuốc (pill). Màu theo token --ui-chip-* trong styles/admin-ui.css (có biến thể tối).
// size "sm" cao 22px; mặc định 26px. `dashed`: nền trơn, viền nét đứt (ví dụ "Chưa có").
export default function Chip({
  tone = "neutral",
  size = "md",
  dashed,
  className,
  children,
}: {
  tone?: ChipTone;
  size?: "md" | "sm";
  dashed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        "ui-chip",
        `ui-chip--${tone}`,
        size === "sm" ? "ui-chip--sm" : "",
        dashed ? "ui-chip--dashed" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
