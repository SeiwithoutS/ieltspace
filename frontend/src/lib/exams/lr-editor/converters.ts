import { LET } from './constants.ts';
import { cnt, formOf, normTbl, parseAlt } from './pure.ts';
import type {
  LrAsset,
  LrContent,
  LrEditorState,
  LrGroup,
  LrGroupItem,
  LrGroupState,
  LrPassageImage,
  LrPassageState,
  LrQuestion,
  LrSection,
} from './types.ts';
import type { EditorSkill } from '../exam-editor.ts';

function formatTimestamp(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseTimestamp(text: string): { startSec: number | null; cleanText: string } {
  const match = text.match(/^\s*\[(\d{1,2}):(\d{2})\]\s*(.*)$/);
  if (match) {
    const mins = parseInt(match[1], 10);
    const secs = parseInt(match[2], 10);
    return {
      startSec: mins * 60 + secs,
      cleanText: match[3],
    };
  }
  return { startSec: null, cleanText: text };
}

export function toLrState(skill: EditorSkill): LrEditorState {
  const skillKind = skill.skill;
  const isReading = skillKind === 'READING';
  const content: LrContent | null = isReading ? skill.reading : skill.listening;

  const sectionCount = isReading ? 3 : 4;
  const passages: LrPassageState[] = [];

  for (let i = 1; i <= sectionCount; i++) {
    const sec = content?.sections?.find((s) => s.orderNo === i);
    if (!sec) {
      passages.push({
        orderNo: i,
        title: '',
        paras: isReading ? ['', '', ''] : [],
        audio: null,
        imgs: [],
        groups: [],
      });
      continue;
    }

    // Paragraphs
    let paras: string[] = [];
    if (isReading) {
      paras = (sec.paragraphs || []).map((p) => p.text);
      if (paras.length === 0) {
        paras = ['', '', ''];
      }
    } else {
      paras = (sec.paragraphs || []).map((p) => {
        if (p.startSec != null) {
          return `[${formatTimestamp(p.startSec)}] ${p.text}`;
        }
        return p.text;
      });
    }

    // Images
    const imgs: LrPassageImage[] = (sec.images || []).map((img, idx) => ({
      name: img.name,
      after: idx,
      caption: img.caption,
      path: img.path,
      url: img.url,
    }));

    // Groups
    const groups: LrGroupState[] = (sec.groups || []).map((g) => {
      const cfg = { ...(g.config || {}) };
      const cntObj = { ...(g.content || {}) };

      const grpState: LrGroupState = {
        id: g.id || undefined,
        type: g.type,
        instr: g.instruction || null,
        title: g.title || (typeof cntObj.title === 'string' ? cntObj.title : null),
        limit: typeof cfg.limit === 'number' ? cfg.limit : null,
        mode: cfg.mode === 'image' || cfg.mode === 'table' || cfg.mode === 'letters' ? cfg.mode : undefined,
        img: g.image || (typeof cfg.img === 'string' ? cfg.img : null),
        marks: Array.isArray(cfg.marks) ? (cfg.marks as LrGroupState['marks']) : undefined,
        texts: Array.isArray(cfg.texts) ? (cfg.texts as string[]) : undefined,
        rows: Array.isArray(cntObj.rows) ? (cntObj.rows as string[][]) : undefined,
        hd: Array.isArray(cfg.hd) ? (cfg.hd as boolean[][]) : undefined,
        sp: Array.isArray(cfg.sp) ? (cfg.sp as LrGroupState['sp']) : undefined,
        opts: Array.isArray(cfg.opts) ? (cfg.opts as string[]) : undefined,
        pick: typeof cfg.pick === 'number' ? cfg.pick : undefined,
        oneUse: typeof cfg.oneUse === 'boolean' ? cfg.oneUse : undefined,
        body: typeof cntObj.body === 'string' ? cntObj.body : undefined,
        q: typeof cntObj.q === 'string' ? cntObj.q : undefined,
        sel: Array.isArray(cfg.sel) ? (cfg.sel as number[]) : undefined,
        hans: Array.isArray(cfg.hans) ? (cfg.hans as number[]) : undefined,
      };

      const f = formOf(grpState);
      const questions = g.questions || [];

      if (f === 'gap' || f === 'judge' || f === 'mcq1' || (f === 'match' && g.type !== 'MATCH_HEADING')) {
        const items: LrGroupItem[] = questions.map((q) => {
          const qc = q.content || {};
          let ans: string | number | null = q.accepted?.[0] ?? null;
          if (f === 'mcq1') {
            const opts = q.options?.map((o) => o.text) || [];
            const idx = (q.options || []).findIndex((o) => o.label === ans || o.text === ans);
            ans = idx >= 0 ? idx : typeof ans === 'string' && /^\d+$/.test(ans) ? parseInt(ans, 10) : null;
            return {
              q: typeof qc.q === 'string' ? qc.q : (typeof qc.text === 'string' ? qc.text : ''),
              opts,
              ans,
              alt: q.accepted?.slice(1).join(', ') || null,
              exp: q.notes?.[0] || '',
              para: q.evidence?.[0]?.para ?? null,
              keys: q.evidence?.[0]?.keys || [],
            };
          }

          if (f === 'match') {
            if (typeof ans === 'string' && /^\d+$/.test(ans)) {
              ans = parseInt(ans, 10);
            } else if (typeof ans === 'string' && grpState.opts) {
              const idx = grpState.opts.indexOf(ans);
              if (idx >= 0) ans = idx;
            }
          }

          return {
            text: typeof qc.text === 'string' ? qc.text : (typeof qc.q === 'string' ? qc.q : ''),
            ans,
            alt: q.accepted?.slice(1).join(', ') || null,
            exp: q.notes?.[0] || '',
            para: q.evidence?.[0]?.para ?? null,
            keys: q.evidence?.[0]?.keys || [],
          };
        });
        grpState.items = items;
      } else if (f === 'text' || f === 'table' || f === 'diagram' || f === 'bank') {
        grpState.ans = questions.map((q) => {
          const first = q.accepted?.[0] ?? '';
          if (f === 'bank' && /^\d+$/.test(first)) {
            return parseInt(first, 10);
          }
          return first;
        });
        grpState.alt = questions.map((q) => q.accepted?.slice(1).join(', ') || null);
        grpState.exp = questions.map((q) => ({
          text: q.notes?.[0] || '',
          para: q.evidence?.[0]?.para ?? null,
          keys: q.evidence?.[0]?.keys || [],
        }));
      } else if (f === 'mcqN') {
        const q0 = questions[0];
        if (q0) {
          grpState.q = typeof q0.content?.text === 'string' ? q0.content.text : (typeof q0.content?.q === 'string' ? q0.content.q : grpState.q);
          if (q0.options && q0.options.length > 0) {
            grpState.opts = q0.options.map((o) => o.text);
          }
          grpState.ans = (q0.accepted || []).map((val) => {
            const idx = (q0.options || []).findIndex((o) => o.label === val || o.text === val);
            return idx >= 0 ? idx : /^\d+$/.test(val) ? parseInt(val, 10) : 0;
          });
        }
      } else if (g.type === 'MATCH_HEADING') {
        if (!grpState.hans || grpState.hans.length === 0) {
          grpState.hans = questions.map((q) => {
            const val = q.accepted?.[0];
            return typeof val === 'string' && /^\d+$/.test(val) ? parseInt(val, 10) : -1;
          });
        }
      }

      return grpState;
    });

    passages.push({
      id: sec.orderNo ? String(sec.orderNo) : undefined,
      orderNo: sec.orderNo,
      title: sec.title,
      paras,
      audio: sec.audio,
      imgs,
      groups,
    });
  }

  return {
    title: skill.exam.title,
    skill: skillKind === 'LISTENING' ? 'LISTENING' : 'READING',
    form: skill.form,
    passages,
  };
}

export function fromLrState(
  ex: LrEditorState,
  skill: 'READING' | 'LISTENING' | EditorSkill
): LrContent {
  const skillKind = typeof skill === 'string' ? skill : skill.skill;
  const isReading = skillKind === 'READING';
  const sectionCount = isReading ? 3 : 4;
  const sections: LrSection[] = [];

  let runningQNum = 1;

  for (let sIdx = 0; sIdx < sectionCount; sIdx++) {
    const p = ex.passages[sIdx] || {
      orderNo: sIdx + 1,
      title: '',
      paras: isReading ? ['', '', ''] : [],
      audio: null,
      imgs: [],
      groups: [],
    };

    // Paragraphs
    let paragraphs: { label: string; text: string; startSec: number | null }[] = [];
    if (isReading) {
      paragraphs = (p.paras || []).map((t, idx) => ({
        label: LET[idx] || String(idx + 1),
        text: t,
        startSec: null,
      }));
    } else {
      paragraphs = (p.paras || []).map((t, idx) => {
        const { startSec, cleanText } = parseTimestamp(t);
        return {
          label: String(idx + 1),
          text: cleanText,
          startSec,
        };
      });
    }

    // Images
    const images: (LrAsset & { caption: string })[] = (p.imgs || []).map((im) => ({
      path: im.path || '',
      url: im.url || null,
      name: im.name,
      caption: im.caption || im.cap || '',
    }));

    // Audio
    let audio: (LrAsset & { sizeBytes: number; durationSec: number }) | null = null;
    if (!isReading && p.audio) {
      audio = {
        path: p.audio.path || '',
        url: p.audio.url || null,
        name: p.audio.name || 'audio.mp3',
        sizeBytes: p.audio.sizeBytes || 0,
        durationSec: p.audio.durationSec || 0,
      };
    }

    // Groups
    const groups: LrGroup[] = (p.groups || []).map((g) => {
      const f = formOf(g);
      const c = cnt(g, p);
      const numFrom = runningQNum;
      const numTo = runningQNum + c - 1;
      // nhóm chưa có câu nào: CSDL chỉ chấp nhận null/null (group_numbers_valid)
      const rangeFrom: number | null = c > 0 ? numFrom : null;
      const rangeTo: number | null = c > 0 ? numTo : null;
      runningQNum = numTo + 1;

      // Ensure normalized structures
      if (f === 'table') {
        normTbl(g);
      }

      // Group image
      let grpImage: LrAsset | null = null;
      if (g.img) {
        if (typeof g.img === 'string') {
          grpImage = {
            path: g.img,
            url: null,
            name: g.img.split('/').pop() || 'image.png',
          };
        } else {
          grpImage = g.img;
        }
      }

      // Prepare config and content objects
      const config: Record<string, unknown> = {};
      const content: Record<string, unknown> = {};

      if (g.limit != null) config.limit = g.limit;
      if (g.mode) config.mode = g.mode;
      if (g.marks) config.marks = g.marks;
      if (g.texts) config.texts = g.texts;
      if (g.hd) config.hd = g.hd;
      if (g.sp) config.sp = g.sp;
      if (g.opts) config.opts = g.opts;
      // cnt() mặc định 2 khi chưa chọn; ghi rõ để backend kiểm tra số câu khớp
      if (f === 'mcqN') config.pick = g.pick || 2;
      else if (g.pick != null) config.pick = g.pick;
      if (g.oneUse != null) config.oneUse = g.oneUse;
      if (g.sel) config.sel = g.sel;
      if (g.hans) config.hans = g.hans;

      if (g.body) content.body = g.body;
      if (g.rows) content.rows = g.rows;
      if (g.q) content.q = g.q;
      if (g.title) content.title = g.title;

      // Build questions
      const questions: LrQuestion[] = [];

      if (f === 'gap' || f === 'judge' || f === 'mcq1' || (f === 'match' && g.type !== 'MATCH_HEADING')) {
        const items = g.items || [];
        items.forEach((it, idx) => {
          const qNum = numFrom + idx;
          const accepted: string[] = [];
          if (it.ans != null) {
            if (f === 'mcq1' && typeof it.ans === 'number' && it.opts && it.opts[it.ans]) {
              accepted.push(it.opts[it.ans]);
            } else if (f === 'match' && typeof it.ans === 'number' && g.opts && g.opts[it.ans]) {
              accepted.push(g.opts[it.ans]);
            } else {
              accepted.push(String(it.ans));
            }
          }
          if (it.alt) {
            parseAlt(it.alt).forEach((altVal) => {
              if (!accepted.includes(altVal)) accepted.push(altVal);
            });
          }

          const options = (it.opts || []).map((optText, oIdx) => ({
            label: LET[oIdx] || String(oIdx + 1),
            text: optText,
          }));

          const matchingKind = f === 'mcq1' ? 'CHOICE' : 'TEXT';
          const evidence =
            it.para != null || (it.keys && it.keys.length > 0)
              ? [{ para: it.para ?? null, label: null, keys: it.keys || [] }]
              : [];
          const notes = it.exp ? [it.exp] : [];

          questions.push({
            numberFrom: qNum,
            numberTo: qNum,
            content: { text: it.text || it.q || '' },
            options,
            accepted,
            matching: { kind: matchingKind, limit: g.limit },
            evidence,
            notes,
          });
        });
      } else if (f === 'mcqN') {
        const pick = g.pick || 2;
        const accepted: string[] = [];
        (g.ans || []).forEach((idx) => {
          const numIdx = Number(idx);
          if (g.opts && g.opts[numIdx]) {
            accepted.push(g.opts[numIdx]);
          } else {
            accepted.push(String(idx));
          }
        });

        const options = (g.opts || []).map((optText, oIdx) => ({
          label: LET[oIdx] || String(oIdx + 1),
          text: optText,
        }));

        questions.push({
          numberFrom: numFrom,
          numberTo: numTo,
          content: { text: g.q || '' },
          options,
          accepted,
          matching: { kind: 'MULTI', limit: pick },
          evidence: [],
          notes: [],
        });
      } else if (g.type === 'MATCH_HEADING') {
        const np = (p.paras || []).length;
        for (let idx = 0; idx < np; idx++) {
          const qNum = numFrom + idx;
          const hIdx = g.hans?.[idx] ?? -1;
          const accepted = hIdx >= 0 && g.opts?.[hIdx] ? [g.opts[hIdx]] : [];
          questions.push({
            numberFrom: qNum,
            numberTo: qNum,
            content: { text: `Paragraph ${LET[idx] || String(idx + 1)}` },
            options: (g.opts || []).map((o, oIdx) => ({
              label: LET[oIdx] || String(oIdx + 1),
              text: o,
            })),
            accepted,
            matching: { kind: 'CHOICE' },
            evidence: [{ para: idx, label: LET[idx] || null, keys: [] }],
            notes: [],
          });
        }
      } else {
        // text, table, diagram, bank
        const ansList = g.ans || [];
        const altList = g.alt || [];
        const expList = g.exp || [];

        for (let idx = 0; idx < c; idx++) {
          const qNum = numFrom + idx;
          const accepted: string[] = [];
          const a = ansList[idx];
          if (a != null) {
            if (f === 'bank' && typeof a === 'number' && g.opts && g.opts[a]) {
              accepted.push(g.opts[a]);
            } else {
              accepted.push(String(a));
            }
          }
          const altStr = altList[idx];
          if (altStr) {
            parseAlt(altStr).forEach((altVal) => {
              if (!accepted.includes(altVal)) accepted.push(altVal);
            });
          }

          const expItem = expList[idx];
          const evidence =
            expItem?.para != null || (expItem?.keys && expItem.keys.length > 0)
              ? [{ para: expItem?.para ?? null, label: null, keys: expItem?.keys || [] }]
              : [];
          const notes = expItem?.text || expItem?.note ? [expItem.text || expItem.note || ''] : [];

          const options = f === 'bank' && g.opts
            ? g.opts.map((optText, oIdx) => ({
                label: LET[oIdx] || String(oIdx + 1),
                text: optText,
              }))
            : [];

          questions.push({
            numberFrom: qNum,
            numberTo: qNum,
            content: { text: '' },
            options,
            accepted,
            matching: { kind: f === 'bank' ? 'CHOICE' : 'TEXT', limit: g.limit },
            evidence,
            notes,
          });
        }
      }

      return {
        id: g.id || null,
        type: g.type,
        instruction: g.instr || g.instruction || '',
        title: g.title || null,
        questionFrom: rangeFrom,
        questionTo: rangeTo,
        image: grpImage,
        config,
        content,
        questions,
      };
    });

    sections.push({
      orderNo: p.orderNo,
      title: p.title || '',
      paragraphs,
      images,
      audio,
      groups,
    });
  }

  return { sections };
}
