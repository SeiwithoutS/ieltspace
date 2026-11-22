import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "danger-solid" | "success";
export type ButtonSize = "md" | "sm" | "xs";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // Nút chỉ có icon: tròn, bắt buộc có aria-label.
  icon?: boolean;
  children?: ReactNode;
};

type AsButton = Common & { as?: "button" } & ButtonHTMLAttributes<HTMLButtonElement>;
type AsAnchor = Common & { as: "a" } & AnchorHTMLAttributes<HTMLAnchorElement>;

export function buttonClass({ variant = "secondary", size = "md", icon }: Common, extra?: string): string {
  return [
    "ui-btn",
    variant !== "secondary" ? `ui-btn--${variant}` : "",
    size !== "md" ? `ui-btn--${size}` : "",
    icon ? "ui-btn--icon" : "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

// Nút theo DESIGN.md 12.1: cao 38/34/26, bo 999, hover chỉ đổi nền, focus outline 2px.
export default function Button(props: AsButton | AsAnchor) {
  if (props.as === "a") {
    const { as: _as, variant, size, icon, className, children, ...rest } = props;
    return (
      <a {...rest} className={buttonClass({ variant, size, icon }, className)}>
        {children}
      </a>
    );
  }
  const { as: _as, variant, size, icon, className, children, type = "button", ...rest } = props;
  return (
    <button {...rest} type={type} className={buttonClass({ variant, size, icon }, className)}>
      {children}
    </button>
  );
}
