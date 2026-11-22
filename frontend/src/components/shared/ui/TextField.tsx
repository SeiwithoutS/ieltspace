import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

type Shared = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  // Ẩn nhãn nhưng vẫn gắn với ô (dùng khi hàng lọc đã có ngữ cảnh).
  hideLabel?: boolean;
  fieldClassName?: string;
  // Hiện bộ đếm "đã nhập/maxLength" cùng hàng với câu báo lỗi (như ô tên bộ đề).
  showCount?: boolean;
};

type InputProps = Shared & { as?: "input" } & InputHTMLAttributes<HTMLInputElement>;
type AreaProps = Shared & { as: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement>;
type SelectProps = Shared & { as: "select"; children?: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>;

export function controlClass(extra?: string): string {
  return ["ui-control", extra ?? ""].filter(Boolean).join(" ");
}

const HIDDEN = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

// Ô nhập theo DESIGN.md 12.2 (input, textarea, select): nhãn gắn với ô, lỗi có aria-invalid và role="alert".
// Báo lỗi thống nhất: viền đỏ (aria-invalid) + câu báo ngay dưới ô; ô bắt buộc có dấu * đỏ sau nhãn.
export default function TextField(props: InputProps | AreaProps | SelectProps) {
  const auto = useId();
  const { label, hint, error, hideLabel, fieldClassName, showCount } = props;
  const id = props.id ?? auto;
  const max = (props as { maxLength?: number }).maxLength;
  const describedBy = [hint ? id + "-hint" : "", error ? id + "-error" : ""].filter(Boolean).join(" ") || undefined;
  // aria-* của nơi gọi được giữ; aria-describedby được nối thêm với gợi ý/lỗi của ô.
  const callerDescribed = (props as { "aria-describedby"?: string })["aria-describedby"];
  const described = [callerDescribed, describedBy].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-invalid": error ? true : undefined } as const;

  let control: ReactNode;
  if (props.as === "textarea") {
    const { as: _a, label: _l, hint: _h, error: _e, hideLabel: _hl, fieldClassName: _f, showCount: _sc, className, ...rest } = props;
    control = <textarea {...common} {...rest} aria-describedby={described} className={controlClass(className)} />;
  } else if (props.as === "select") {
    const { as: _a, label: _l, hint: _h, error: _e, hideLabel: _hl, fieldClassName: _f, showCount: _sc, className, children, ...rest } = props;
    control = (
      <select {...common} {...rest} aria-describedby={described} className={controlClass(className)}>
        {children}
      </select>
    );
  } else {
    const { as: _a, label: _l, hint: _h, error: _e, hideLabel: _hl, fieldClassName: _f, showCount: _sc, className, ...rest } = props;
    control = <input {...common} {...rest} aria-describedby={described} className={controlClass(className)} />;
  }

  return (
    <div className={["ui-field", fieldClassName ?? ""].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={id} className="ui-label" style={hideLabel ? HIDDEN : undefined}>
          {label}
          {props.required ? (
            <span className="ui-req" aria-hidden="true">
              {" *"}
            </span>
          ) : null}
        </label>
      ) : null}
      {control}
      {hint ? (
        <span id={id + "-hint"} className="ui-hint">
          {hint}
        </span>
      ) : null}
      {showCount ? (
        <span className="ui-field__foot">
          <span id={id + "-error"} role="alert" className="ui-error">
            {error}
          </span>
          <span className="ui-field__count">
            {String(props.value ?? "").length +
              (max ? "/" + max : "")}
          </span>
        </span>
      ) : error ? (
        <span id={id + "-error"} role="alert" className="ui-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
