import React, { useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
  startNum: number;
  placeholder?: string;
};

type Seg = { t: string; b?: boolean; i?: boolean };

function inlineSegs(line: string): Seg[] {
  const out: Seg[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ t: line.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith('**')) out.push({ t: tok.slice(2, -2), b: true });
    else out.push({ t: tok.slice(1, -1), i: true });
    last = m.index + tok.length;
  }
  if (last < line.length) out.push({ t: line.slice(last) });
  return out;
}

/** Soạn nội dung dạng markdown nhẹ (**đậm**, *nghiêng*, ##, -, ___) kèm xem trước như người học thấy. */
export default function NoteBody({ value, onChange, readOnly = false, startNum, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // ô soạn ôm nội dung, không cuộn
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function setSel(next: string, selStart: number, selEnd: number) {
    onChange(next);
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    }, 0);
  }

  function wrap(mark: string, sample: string) {
    const el = ref.current;
    if (!el || readOnly) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const sel = el.value.slice(a, b) || sample;
    const next = el.value.slice(0, a) + mark + sel + mark + el.value.slice(b);
    setSel(next, a + mark.length, a + mark.length + sel.length);
  }

  function linePrefix(prefix: string) {
    const el = ref.current;
    if (!el || readOnly) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const text = el.value;
    const from = text.lastIndexOf('\n', a - 1) + 1;
    let to = text.indexOf('\n', b);
    if (to === -1) to = text.length;
    const block = text
      .slice(from, to)
      .split('\n')
      .map((l) => (l.startsWith(prefix) ? l.slice(prefix.length) : prefix + l))
      .join('\n');
    setSel(text.slice(0, from) + block + text.slice(to), from, from + block.length);
  }

  function insertBlank() {
    const el = ref.current;
    if (!el || readOnly) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const next = el.value.slice(0, a) + ' ___ ' + el.value.slice(b);
    setSel(next, a + 5, a + 5);
  }

  let n = startNum;
  const lines = value.split('\n').map((raw) => {
    let heading = false;
    let bullet = false;
    let text = raw;
    if (text.startsWith('## ')) {
      heading = true;
      text = text.slice(3);
    } else if (text.startsWith('- ')) {
      bullet = true;
      text = text.slice(2);
    }
    const parts = text.split('___').map((p) => inlineSegs(p));
    const nodes: React.ReactNode[] = [];
    parts.forEach((segs, pi) => {
      segs.forEach((s, si) => {
        nodes.push(
          <span
            key={`${pi}-${si}`}
            style={{ fontWeight: s.b ? 700 : undefined, fontStyle: s.i ? 'italic' : undefined }}
          >
            {s.t}
          </span>,
        );
      });
      if (pi < parts.length - 1) {
        nodes.push(
          <span key={`b${pi}`} className="inline-flex items-center gap-1 mx-1 align-baseline">
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-xl bg-[#E3ECFD] text-[#2963CC] text-[13px] font-bold">
              {n++}
            </span>
            <span className="inline-block w-24 h-6 rounded-md border border-solid border-[#D6D4D0] bg-white" />
          </span>,
        );
      }
    });
    return { heading, bullet, nodes, empty: raw.trim() === '' };
  });

  const btn =
    'h-8 min-w-8 px-2 inline-flex items-center justify-center rounded-lg border border-solid border-[#D6D4D0] bg-white text-[13px] font-semibold text-[#352637] hover:bg-[#F3F0EA]';

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="rounded-xl border border-solid border-[#D6D4D0] bg-white overflow-hidden">
          {!readOnly && (
            <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-2 border-b border-solid border-[#E5E0D8] bg-[#FAF9F5]">
              <button type="button" className={btn} onClick={() => wrap('**', 'chữ đậm')} title="In đậm">
                <b>B</b>
              </button>
              <button type="button" className={btn} onClick={() => wrap('*', 'chữ nghiêng')} title="In nghiêng">
                <i>I</i>
              </button>
              <button type="button" className={btn} onClick={() => linePrefix('## ')} title="Tiêu đề">
                H
              </button>
              <button type="button" className={btn} onClick={() => linePrefix('- ')} title="Gạch đầu dòng">
                •
              </button>
              <button type="button" className={`${btn} text-[#2963CC]`} onClick={insertBlank} title="Chèn chỗ trống">
                + Chỗ trống
              </button>
            </div>
          )}
          <textarea
            ref={ref}
            rows={3}
            value={value}
            disabled={readOnly}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="block w-full min-w-0 px-3 py-2.5 border-0 bg-transparent text-[#352637] text-[13px] leading-[1.7] resize-none overflow-hidden focus:outline-none"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          />
        </div>
        <span className="block text-[13px] text-[#706473]">
          **đậm**, *nghiêng*, dòng bắt đầu bằng ## là tiêu đề, - là gạch đầu dòng, ___ là chỗ trống (tự đánh số câu).
        </span>
      </div>

      <div className="space-y-1.5">
        <span className="block text-[13px] font-bold text-[#352637]">Xem trước như người học thấy</span>
        <div className="px-4 py-3.5 rounded-xl bg-[#FAF9F5] border-[1.5px] border-solid border-[#E6E4E0] flex flex-col gap-1 text-[14px] leading-[1.7] text-[#352637]">
          {lines.every((l) => l.empty) ? (
            <span className="text-[#A89CA8]">Chưa có nội dung.</span>
          ) : (
            lines.map((l, i) =>
              l.empty ? (
                <div key={i} className="h-2" />
              ) : (
                <div
                  key={i}
                  className={`flex gap-1 ${l.heading ? 'text-[16px] font-bold mt-1' : ''}`}
                >
                  {l.bullet && <span className="shrink-0 w-3.5">•</span>}
                  <span>{l.nodes}</span>
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}
