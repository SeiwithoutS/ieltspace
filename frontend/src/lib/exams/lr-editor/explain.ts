import type { LrGroupState, LrPassageState } from './types.ts';
import { cnt, formOf } from './pure.ts';

/** Một câu hỏi trong tab Giải thích (gom từ mọi nhóm của một passage/section). */
export type ExplainRow = {
  gIdx: number;
  k: number;
  n: number;
  label: string;
  answer: string;
  para: number | null;
  keys: string[];
  text: string;
};

function plain(s: string | null | undefined): string {
  return String(s ?? '').replace(/\s+/g, ' ').trim();
}

function ansText(g: LrGroupState, v: unknown): string {
  if (v == null || v === '') return '';
  if (typeof v === 'number') return g.opts?.[v] ?? String(v);
  return String(v);
}

/** Nhóm có hỏi giải thích theo từng câu (trừ nối tiêu đề và chọn nhiều đáp án). */
export function groupHasExplain(g: LrGroupState): boolean {
  const f = formOf(g);
  if (f === 'mcqN') return false;
  if (g.type === 'MATCH_HEADING') return false;
  return true;
}

export function explainRows(
  p: LrPassageState,
  starts: number[],
): ExplainRow[] {
  const out: ExplainRow[] = [];
  (p.groups || []).forEach((g, gIdx) => {
    if (!groupHasExplain(g)) return;
    const f = formOf(g);
    const start = starts[gIdx] ?? 1;
    const itemBased =
      f === 'gap' || f === 'judge' || f === 'mcq1' || f === 'match';
    if (itemBased) {
      (g.items || []).forEach((it, k) => {
        let answer = '';
        if (f === 'mcq1') {
          answer = typeof it.ans === 'number' ? (it.opts?.[it.ans] ?? '') : '';
        } else {
          answer = ansText(g, it.ans);
        }
        out.push({
          gIdx,
          k,
          n: start + k,
          label: plain(it.text || it.q) || `Câu ${start + k}`,
          answer,
          para: it.para ?? null,
          keys: it.keys || [],
          text: it.exp || '',
        });
      });
    } else {
      const c = cnt(g, p);
      for (let k = 0; k < c; k++) {
        const e = g.exp?.[k];
        out.push({
          gIdx,
          k,
          n: start + k,
          label: `Câu ${start + k}`,
          answer: ansText(g, g.ans?.[k]),
          para: e?.para ?? null,
          keys: e?.keys || [],
          text: e?.text || e?.note || '',
        });
      }
    }
  });
  return out;
}

export type ExplainPatch = {
  para?: number | null;
  keys?: string[];
  text?: string;
};

/** Ghi giải thích của câu k trong nhóm g (sửa trực tiếp trên bản nháp). */
export function applyExplain(
  g: LrGroupState,
  k: number,
  patch: ExplainPatch,
): void {
  const f = formOf(g);
  const itemBased =
    f === 'gap' || f === 'judge' || f === 'mcq1' || f === 'match';
  if (itemBased) {
    const it = g.items?.[k];
    if (!it) return;
    if ('para' in patch) it.para = patch.para ?? null;
    if (patch.keys) it.keys = patch.keys;
    if (patch.text !== undefined) it.exp = patch.text;
    return;
  }
  const list = (g.exp = g.exp || []);
  while (list.length <= k) list.push({ text: '', para: null, keys: [] });
  const e = list[k];
  if ('para' in patch) e.para = patch.para ?? null;
  if (patch.keys) e.keys = patch.keys;
  if (patch.text !== undefined) e.text = patch.text;
}

/** Số câu đã gán đoạn chứa đáp án / tổng số câu. */
export function explainProgress(rows: ExplainRow[]): {
  done: number;
  total: number;
  withKeys: number;
} {
  return {
    done: rows.filter((r) => r.para != null).length,
    total: rows.length,
    withKeys: rows.filter((r) => r.keys.length > 0).length,
  };
}
