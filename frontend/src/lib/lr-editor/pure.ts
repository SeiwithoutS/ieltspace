import {
  TYPE_MAP,
  LIM,
  LIMMAX,
  LIMNUM,
  NUMW,
  LET,
} from './constants.ts';
import type {
  LrEditorState,
  LrPassageState,
  LrGroupState,
  LrFlowNode,
  LrFlowFrame,
  LrQuestionType,
} from './types.ts';

export function blanks(t: string | null | undefined): number {
  return (String(t || '').match(/_{3,}/g) || []).length;
}

export function cutBlank(s: string | null | undefined, k: number): string {
  let i = -1;
  return String(s || '')
    .replace(/ ?_{3,}/g, (m) => {
      i++;
      return i === k ? '' : m;
    })
    .replace(/ {2,}/g, ' ');
}

export function parseAlt(v: string | null | undefined): string[] {
  return v == null
    ? []
    : String(v)
        .split(/(?<![0-9]),|,(?![0-9])/)
        .map((x) => x.trim())
        .filter(Boolean);
}

export function limOf(g: { limit?: number | null; type: LrQuestionType }): number {
  return g.limit == null ? TYPE_MAP[g.type]?.lim ?? -1 : g.limit;
}

export function isNum(x: string): boolean {
  return /^[0-9][0-9.,:\/]*(%|°c|°|km|m|kg)?$/i.test(x);
}

export function overLimit(
  v: string | number | null | undefined,
  li: number | null | undefined
): boolean {
  const w = String(v == null ? '' : v)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!w.length || li == null || li < 0) {
    return false;
  }
  if (li === 6) {
    return !(w.length === 1 && isNum(w[0]));
  }
  const nums = w.filter(isNum).length;
  return w.length - (LIMNUM[li] ? Math.min(nums, 1) : 0) > (LIMMAX[li] ?? 0);
}

export function formOf(g: { type: LrQuestionType; mode?: string }): string {
  const f = TYPE_MAP[g.type]?.form ?? 'gap';
  // Map/Plan có sẵn chữ cái: nối chữ cái với câu như Matching Features
  if (g.type === 'DIAGRAM_COMP' && g.mode === 'letters') return 'match';
  return f === 'flow' && g.mode === 'image' ? 'diagram' : f;
}

export function flowOf(g: {
  nodes?: LrFlowNode[];
  edges?: Array<[string, string]>;
  frames?: LrFlowFrame[];
  steps?: string[];
}): {
  nodes: LrFlowNode[];
  edges: Array<[string, string]>;
  frames: LrFlowFrame[];
} {
  if (g.nodes && g.nodes.length > 0) {
    return {
      nodes: g.nodes,
      edges: g.edges || [],
      frames: g.frames || [],
    };
  }
  const st = g.steps || [];
  const nodes: LrFlowNode[] = st.map((t, i) => ({
    id: 'n' + (i + 1),
    row: i,
    text: t,
  }));
  const edges: Array<[string, string]> = [];
  for (let i = 1; i < nodes.length; i++) {
    edges.push([nodes[i - 1].id, nodes[i].id]);
  }
  return { nodes, edges, frames: [] };
}

export function tblOf(g: {
  rows?: string[][];
  hd?: boolean[][];
  sp?: Array<Array<[number, number] | 0>>;
  kinds?: string[];
}): {
  rows: string[][];
  hd: boolean[][];
  sp: Array<Array<[number, number] | 0>>;
  cov: boolean[][];
  nr: number;
  nc: number;
} {
  const rows = g.rows && g.rows.length ? g.rows : [['']];
  const nr = rows.length;
  const nc = (rows[0] || ['']).length;
  const hd: boolean[][] = [];
  const sp: Array<Array<[number, number] | 0>> = [];
  const cov: boolean[][] = [];
  const k = g.kinds;

  for (let r = 0; r < nr; r++) {
    hd.push([]);
    sp.push([]);
    cov.push([]);
    for (let c = 0; c < nc; c++) {
      hd[r].push(
        g.hd
          ? !!(g.hd[r] && g.hd[r][c])
          : k
            ? k[r] === 'h' || (k[r] === 'sub' && c === 0)
            : r === 0
      );
      const q = g.sp
        ? (g.sp[r] && g.sp[r][c]) || 0
        : k && k[r] === 'sub' && c === 0 && nc > 1
          ? [1, nc]
          : 0;
      sp[r].push(
        q && (q[0] > 1 || q[1] > 1)
          ? [Math.min(q[0], nr - r), Math.min(q[1], nc - c)]
          : 0
      );
      cov[r].push(false);
    }
  }

  for (let r = 0; r < nr; r++) {
    for (let c = 0; c < nc; c++) {
      const z = sp[r][c];
      if (z && !cov[r][c]) {
        for (let i = r; i < r + z[0]; i++) {
          for (let j = c; j < c + z[1]; j++) {
            if (i !== r || j !== c) {
              cov[i][j] = true;
              sp[i][j] = 0;
            }
          }
        }
      }
    }
  }

  return { rows, hd, sp, cov, nr, nc };
}

export function normTbl(g: LrGroupState): {
  rows: string[][];
  hd: boolean[][];
  sp: Array<Array<[number, number] | 0>>;
  cov: boolean[][];
  nr: number;
  nc: number;
} {
  const t = tblOf(g);
  g.rows = t.rows;
  g.hd = t.hd;
  g.sp = t.sp;
  return t;
}

export function tblCells(g: {
  rows?: string[][];
  hd?: boolean[][];
  sp?: Array<Array<[number, number] | 0>>;
  kinds?: string[];
}): string[] {
  const t = tblOf(g);
  const out: string[] = [];
  t.rows.forEach((row, r) => {
    row.forEach((v, c) => {
      if (!t.cov[r][c]) {
        out.push(v);
      }
    });
  });
  return out;
}

export function normFlow(g: LrGroupState): LrGroupState {
  const fl = flowOf(g);
  g.nodes = fl.nodes;
  g.edges = fl.edges;
  g.frames = fl.frames;
  delete g.steps;
  return g;
}

export function flowRows(fl: { nodes: LrFlowNode[] }): number {
  return fl.nodes.reduce((m, n) => Math.max(m, n.row + 1), 0);
}

export function flowSeq(fl: {
  nodes: LrFlowNode[];
  frames: LrFlowFrame[];
}): Array<{ node?: LrFlowNode; frame?: LrFlowFrame; t: string }> {
  const out: Array<{ node?: LrFlowNode; frame?: LrFlowFrame; t: string }> = [];
  const R = flowRows(fl);
  for (let r = 0; r < R; r++) {
    fl.nodes.forEach((n) => {
      if (n.row === r && !n.side) {
        out.push({ node: n, t: n.text });
      }
    });
    fl.nodes.forEach((n) => {
      if (n.row === r && n.side) {
        out.push({ node: n, t: n.text });
      }
    });
    fl.frames.forEach((fr) => {
      if (fr.row === r) {
        out.push({ frame: fr, t: fr.caption });
      }
    });
  }
  return out;
}

export function cnt(g: LrGroupState, p?: LrPassageState): number {
  const f = formOf(g);
  if (g.type === 'MATCH_HEADING') {
    return (p?.paras || []).length;
  }
  if (f === 'text' || f === 'bank') {
    return blanks(g.body);
  }
  if (f === 'table') {
    return tblCells(g).reduce((a, c) => a + blanks(c), 0);
  }
  if (f === 'flow') {
    return flowSeq(flowOf(g)).reduce((a, x) => a + blanks(x.t), 0);
  }
  if (f === 'diagram') {
    return (g.marks || []).length;
  }
  if (f === 'mcqN') {
    return g.pick || 2;
  }
  return (g.items || []).length;
}

export function rngLetters(n: number): string {
  return n > 1 ? 'A-' + LET[Math.min(n - 1, LET.length - 1)] : 'A';
}

export function autoInstr(g: LrGroupState, p: LrPassageState, pidx: number): string {
  const t = TYPE_MAP[g.type];
  if (!t) return '';
  const li = limOf(g);
  const np = (p.paras || []).length;
  const nOpt =
    g.type === 'MATCH_INFO' || g.type === 'MATCH_HEADING'
      ? np
      : (g.opts || []).length;
  const reuse =
    (g.type === 'MATCH_INFO' || g.type === 'MATCH_FEATURE') && !g.oneUse;

  if (g.type === 'DIAGRAM_COMP' && g.mode === 'letters') {
    return `Label the map below. Choose the correct letter, ${rngLetters(nOpt)}, for each question.`;
  }

  return t.tpl
    .replace('{L}', li >= 0 ? LIM[li] || '' : '')
    .replace('{R}', rngLetters(nOpt))
    .replace('{P}', String(pidx + 1))
    .replace('{K}', (NUMW[np] || String(np)).toLowerCase())
    .replace('{W}', NUMW[g.pick || 2] || String(g.pick))
    .replace(
      '{NB}',
      reuse ? ' NB You may use any letter more than once.' : ''
    );
}

export function numberQuestions(ex: LrEditorState): {
  starts: number[][];
  total: number;
  pStart: number[];
} {
  const starts: number[][] = [];
  const pStart: number[] = [];
  let total = 0;

  (ex.passages || []).forEach((p) => {
    pStart.push(total + 1);
    const gStarts: number[] = [];
    (p.groups || []).forEach((g) => {
      const st = total + 1;
      total += cnt(g, p);
      gStarts.push(st);
    });
    starts.push(gStarts);
  });

  return { starts, total, pStart };
}

export function formatQuestionRange(a: number, b: number): string {
  if (b < a) return '—';
  if (a === b) return 'Câu ' + a;
  return 'Câu ' + a + '-' + b;
}

export function groupIssues(
  g: LrGroupState,
  p: LrPassageState,
  _secLabel?: string,
  _secIdx?: number
): string[] {
  const f = formOf(g);
  const out: string[] = [];
  const c = cnt(g, p);
  const li = limOf(g);

  if (!c) {
    out.push('chưa có câu hỏi');
  }

  if (
    f === 'gap' &&
    (g.items || []).some((it) => !String(it.ans ?? '').trim())
  ) {
    out.push('còn câu chưa có đáp án');
  }

  if (
    f === 'gap' &&
    (g.items || []).some(
      (it) =>
        overLimit(it.ans, li) ||
        parseAlt(it.alt).some((x) => overLimit(x, li))
    )
  ) {
    out.push('có đáp án vượt giới hạn ' + (LIM[li] || ''));
  }

  if (
    (f === 'text' || f === 'table' || f === 'flow' || f === 'diagram') &&
    ((g.ans || []).slice(0, c).some((x) => overLimit(x, li)) ||
      (g.alt || []).slice(0, c).some((a) =>
        parseAlt(a).some((x) => overLimit(x, li))
      ))
  ) {
    out.push('có đáp án vượt giới hạn ' + (LIM[li] || ''));
  }

  if ((f === 'diagram' || g.type === 'DIAGRAM_COMP') && !g.img) {
    out.push('chưa tải hình sơ đồ');
  }

  if (
    (f === 'text' || f === 'table' || f === 'flow' || f === 'diagram') &&
    (g.ans || []).slice(0, c).some((x) => !String(x ?? '').trim())
  ) {
    out.push('còn chỗ trống chưa có đáp án');
  }

  if (
    (f === 'text' || f === 'table' || f === 'flow' || f === 'diagram') &&
    (g.ans || []).length < c
  ) {
    out.push('còn chỗ trống chưa có đáp án');
  }

  if (
    f === 'bank' &&
    (g.sel || []).some((j) => {
      const answers = (g.ans || []).map(Number);
      return !answers.includes(j);
    })
  ) {
    out.push('có từ đã đánh dấu nhưng chưa gán câu');
  }

  if (f === 'bank') {
    if ((g.opts || []).length <= c) {
      out.push('khung từ phải nhiều hơn số chỗ trống');
    }
    if (
      (g.ans || []).slice(0, c).length < c ||
      (g.ans || []).slice(0, c).some((x) => x == null || Number(x) < 0)
    ) {
      out.push('còn chỗ trống chưa chọn đáp án');
    }
  }

  if (f === 'match') {
    const isHd = g.type === 'MATCH_HEADING';
    const np = (p.paras || []).length;
    let av: Array<number | null | undefined> = [];

    if (isHd) {
      for (let i = 0; i < np; i++) {
        const hv = (g.hans || [])[i];
        av.push(hv == null ? -1 : hv);
      }
    } else {
      av = (g.items || []).map((it) => (typeof it.ans === 'number' ? it.ans : null));
    }

    if (
      g.type !== 'MATCH_INFO' &&
      g.type !== 'MATCH_FEATURE' &&
      g.type !== 'DIAGRAM_COMP' &&
      (g.opts || []).length <= c
    ) {
      out.push(
        isHd
          ? 'danh sách tiêu đề phải nhiều hơn số đoạn'
          : 'danh sách lựa chọn phải nhiều hơn số câu'
      );
    }

    if (av.some((v) => v == null || v < 0)) {
      out.push(isHd ? 'còn đoạn chưa chọn tiêu đề' : 'còn câu chưa chọn đáp án');
    }

    const one = isHd
      ? true
      : g.oneUse == null
        ? g.type === 'MATCH_ENDING'
        : g.oneUse;

    if (one) {
      const seen: Record<number, boolean> = {};
      let dup = false;
      av.forEach((v) => {
        if (v != null && v >= 0) {
          if (seen[v]) {
            dup = true;
          }
          seen[v] = true;
        }
      });
      if (dup) {
        out.push('một lựa chọn bị dùng hai lần');
      }
    }

    if (
      g.type === 'MATCH_INFO' &&
      (g.items || []).some((it) => (typeof it.ans === 'number' ? it.ans >= np : false))
    ) {
      out.push('trỏ tới đoạn không còn trong bài');
    }

    if (
      isHd &&
      av.some((v) => (v != null && v >= 0 ? v >= (g.opts || []).length : false))
    ) {
      out.push('trỏ tới tiêu đề đã bị xóa');
    }
  }

  if (
    f === 'mcq1' &&
    (g.items || []).some(
      (it) => it.ans == null || Number(it.ans) < 0 || !String(it.q ?? '').trim()
    )
  ) {
    out.push('còn câu thiếu nội dung hoặc đáp án');
  }

  if (f === 'mcqN' && (g.pick ?? 2) < 2) {
    out.push('số đáp án cần chọn phải từ 2 trở lên');
  }

  if (f === 'mcqN') {
    const pick = g.pick ?? 2;
    if ((g.ans || []).length !== pick) {
      out.push('cần đánh dấu đúng ' + pick + ' đáp án');
    }
    if ((g.opts || []).length <= pick) {
      out.push('số lựa chọn phải nhiều hơn số đáp án đúng');
    }
  }

  if (
    f === 'judge' &&
    (g.items || []).some((it) => !it.ans || String(it.ans).trim() === '')
  ) {
    out.push('còn nhận định chưa chọn đáp án');
  }

  return out.filter((x, i, arr) => arr.indexOf(x) === i);
}

export function allIssues(
  ex: LrEditorState,
  secLabel: string,
  expectedSections: number
): Array<{ text: string; p: number; g: number }> {
  const out: Array<{ text: string; p: number; g: number }> = [];
  const { starts, total } = numberQuestions(ex);
  const np = ex.passages.length;

  if (total !== 40) {
    out.push({
      text: `Đề đang có ${total} câu, cần đúng 40 câu.`,
      p: 0,
      g: -1,
    });
  }

  for (let z = np; z < expectedSections; z++) {
    out.push({
      text: `${secLabel} ${z + 1} chưa được tạo.`,
      p: z,
      g: -1,
    });
  }

  ex.passages.forEach((p, a) => {
    const hasText = (p.paras || []).some((x) => String(x || '').trim().length > 0);
    if (!hasText) {
      out.push({
        text: ex.skill === 'READING'
          ? `${secLabel} ${a + 1} chưa có bài đọc.`
          : `${secLabel} ${a + 1} chưa có transcript.`,
        p: a,
        g: -1,
      });
    }

    if (ex.skill === 'LISTENING') {
      const hasAudio = !!(p.audio && (('path' in p.audio && p.audio.path) || p.audio.name));
      if (!hasAudio) {
        out.push({
          text: `${secLabel} ${a + 1} chưa có ghi âm.`,
          p: a,
          g: -1,
        });
      }
    }

    if (!p.groups || p.groups.length === 0) {
      out.push({
        text: `${secLabel} ${a + 1} chưa có nhóm câu hỏi.`,
        p: a,
        g: -1,
      });
    }

    (p.groups || []).forEach((g, k) => {
      const issues = groupIssues(g, p, secLabel, a);
      const c = cnt(g, p);
      const st = starts[a]?.[k] ?? 1;
      const typeLabel = TYPE_MAP[g.type]?.label || g.type;

      issues.forEach((m) => {
        out.push({
          text: `${secLabel} ${a + 1} · ${c ? formatQuestionRange(st, st + c - 1) : `nhóm ${k + 1}`} · ${typeLabel}: ${m}.`,
          p: a,
          g: k,
        });
      });
    });
  });

  return out;
}

/**
 * Kiểm tra xem một nhóm câu hỏi đã có dữ liệu do người dùng nhập hay chưa.
 * Dùng để cảnh báo xác nhận khi đổi dạng câu hỏi.
 */
export function groupHasData(g: LrGroupState): boolean {
  if (!g) return false;

  if (g.body && g.body.trim().length > 0) return true;

  if (
    g.items &&
    g.items.length > 0 &&
    g.items.some(
      (item) =>
        (item.q && item.q.trim().length > 0) ||
        (item.text && item.text.trim().length > 0) ||
        (item.ans !== undefined &&
          item.ans !== null &&
          String(item.ans).trim().length > 0 &&
          String(item.ans) !== '-1') ||
        (item.opts && item.opts.length > 0 && item.opts.some((o) => o && o.trim().length > 0))
    )
  ) {
    return true;
  }

  if (g.opts && g.opts.length > 0 && g.opts.some((o) => o && o.trim().length > 0)) {
    return true;
  }

  if (g.marks && g.marks.length > 0) return true;

  if (g.nodes && g.nodes.length > 0 && g.nodes.some((n) => n.text && n.text.trim().length > 0)) {
    return true;
  }

  if (
    g.rows &&
    g.rows.length > 0 &&
    g.rows.some((row) => row.some((cell) => cell && cell.trim().length > 0))
  ) {
    return true;
  }

  if (g.texts && g.texts.length > 0 && g.texts.some((t) => t && t.trim().length > 0)) {
    return true;
  }

  if (
    g.ans &&
    g.ans.length > 0 &&
    g.ans.some(
      (a) => a !== undefined && a !== null && String(a).trim().length > 0 && String(a) !== '-1'
    )
  ) {
    return true;
  }

  if (g.steps && g.steps.length > 0 && g.steps.some((s) => s && s.trim().length > 0)) {
    return true;
  }

  return false;
}

