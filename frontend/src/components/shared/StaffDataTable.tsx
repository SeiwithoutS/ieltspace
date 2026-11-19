import type { ReactNode } from "react";
import "./staff-data-table.css";

export function StaffDataTable({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`staff-data-table ${className}`} role="region" aria-label={label} tabIndex={0}>
      <table>{children}</table>
    </div>
  );
}
