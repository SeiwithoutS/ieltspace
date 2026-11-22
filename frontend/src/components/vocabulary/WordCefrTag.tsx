import type { CefrTag } from "../../lib/vocabulary/cefr";

export function WordCefrTag({ tag }: { tag?: CefrTag }) {
  if (!tag) return null;

  return <span className="word-cefr-tag"><span className="sr-only">Cấp độ CEFR </span>{tag}</span>;
}
