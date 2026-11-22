import type { Word } from "../../data/vocabulary";
import { cefrTags, isCefrTag } from "./cefr";

const columnNames = {
  word: ["từ"],
  meaning_vi: ["nghĩa"],
  part_of_speech: ["loại từ"],
  phonetic: ["phiên âm"],
  example_en: ["ví dụ"],
  example_vi: ["dịch ví dụ"],
  tag: ["cefr", "cấp độ", "cấp độ cefr"],
} as const;

type Column = keyof typeof columnNames;
const aliases = new Map<string, Column>();
for (const column of Object.keys(columnNames) as Column[]) {
  for (const name of [column, ...columnNames[column]]) aliases.set(name, column);
}

function resolveColumn(value: string): Column | undefined {
  return aliases.get(value.trim().toLowerCase().normalize("NFC"));
}

function csvRows(text: string, delimiter: "," | ";", headerOnly = false) {
  const rows: string[][] = [];
  let row: string[] = [],
    value = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && quoted && text[i + 1] === '"') {
      value += '"';
      i++;
    } else if (c === '"' && (quoted || !value.trim())) {
      quoted = !quoted;
    } else if (c === delimiter && !quoted) {
      row.push(value);
      value = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(value);
      rows.push(row);
      if (headerOnly) return rows;
      row = [];
      value = "";
    } else value += c;
  }
  if (quoted) throw Error("Dấu ngoặc kép trong CSV chưa đóng.");
  return [...rows, [...row, value]];
}

function readCsv(text: string) {
  function matches(delimiter: "," | ";") {
    try {
      return csvRows(text, delimiter, true)[0].filter(value => resolveColumn(value)).length;
    } catch {
      return -1;
    }
  }
  return csvRows(text, matches(";") > matches(",") ? ";" : ",");
}

export async function importWords(file: File): Promise<Word[]> {
  if (file.size > 5 * 1024 * 1024) throw Error("Chọn file nhỏ hơn 5 MB.");
  let rows: string[][];
  if (/\.xlsx$/i.test(file.name)) {
    const { default: read } = await import("read-excel-file");
    rows = (await read(file)).map((row) =>
      row.map((v) => String(v ?? "").trim()),
    );
  } else if (/\.csv$/i.test(file.name)) {
    rows = readCsv((await file.text()).replace(/^\uFEFF/, ""));
  } else throw Error("Chọn file Excel (.xlsx) hoặc CSV.");

  const headers = rows.shift() ?? [];
  const columns = new Map<Column, number>();
  headers.forEach((header, index) => {
    const column = resolveColumn(header);
    if (!column) return;
    if (columns.has(column)) throw Error(`Tiêu đề có nhiều cột tương ứng với ${column}.`);
    columns.set(column, index);
  });
  if (!columns.has("word") || !columns.has("meaning_vi"))
    throw Error("Cần có cột word (từ) và meaning_vi (nghĩa).");

  const words = rows.flatMap((row, i) => {
    if (!row.some((v) => v.trim())) return [];
    if (row.slice(headers.length).some(value => value.trim()))
      throw Error(`Dòng ${i + 2} có dữ liệu ngoài các cột tiêu đề. Kiểm tra dấu phân cách và dấu ngoặc kép.`);
    const get = (column: Column) => row[columns.get(column) ?? -1]?.trim() ?? "";
    if (!get("word") || !get("meaning_vi"))
      throw Error("Dòng " + (i + 2) + " thiếu từ hoặc nghĩa tiếng Việt.");
    const level = get("tag").toUpperCase();
    const tag = isCefrTag(level) ? level : undefined;
    if (level && !tag)
      throw Error(`Dòng ${i + 2}: cấp độ CEFR phải là ${cefrTags.join(", ")}.`);
    return [
      {
        id: crypto.randomUUID(),
        word: get("word"),
        meaning: get("meaning_vi"),
        pos: get("part_of_speech"),
        tag,
        phonetic: get("phonetic"),
        example: get("example_en"),
        translation: get("example_vi"),
        image: "",
        audio: "",
      },
    ];
  });
  if (!words.length || words.length > 500)
    throw Error("Mỗi file cần từ 1 đến 500 mục từ.");
  return words;
}
