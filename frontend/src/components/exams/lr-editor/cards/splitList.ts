/** Tách chuỗi nhập nhanh "a, b, c" thành danh sách (bỏ rỗng, bỏ trùng). */
export function splitList(raw: string, existing: string[] = []): string[] {
  const seen = new Set(existing.map((s) => s.trim().toLowerCase()));
  const out: string[] = [];
  for (const part of raw.split(/[,;\n]/)) {
    const t = part.trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
  }
  return out;
}
