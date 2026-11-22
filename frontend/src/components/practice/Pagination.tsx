import React from "react";
import { styleOf } from "../../lib/shared/styles";

const ON =
  "min-width: 38px; height: 38px; padding: 0 8px; box-sizing: border-box; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font: inherit; font-weight: 600; font-size: 14px; background: #352637; color: #FFFFFF; border: 1.5px solid #352637; cursor: pointer";
const OFF =
  "min-width: 38px; height: 38px; padding: 0 8px; box-sizing: border-box; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font: inherit; font-weight: 600; font-size: 14px; background: #FFFFFF; border: 1.5px solid #DDDBD7; color: #352637; cursor: pointer";

// Phân trang dùng chung cho các trang luyện đề (nút thật, trang hiện tại có aria-current).
export default function Pagination({
  pages,
  current,
  onPick,
}: {
  pages: number;
  current: number;
  onPick: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav
      aria-label="Phân trang"
      style={styleOf("display: flex; gap: 6px; justify-content: center; margin-top: 16px")}
    >
      {Array.from({ length: pages }, (_, n) => n + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-label={"Trang " + n}
          aria-current={n === current ? "page" : undefined}
          onClick={() => onPick(n)}
          style={styleOf(n === current ? ON : OFF)}
        >
          {String(n)}
        </button>
      ))}
    </nav>
  );
}
