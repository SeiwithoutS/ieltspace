import type { Word } from "../data/vocabulary";
export const csvHeader =
  "word,meaning_vi,part_of_speech,phonetic,example_en,example_vi";
function csvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    value = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else value += c;
  }
  if (quoted) throw Error("Dấu ngoặc kép trong CSV chưa đóng.");
  return [...rows, [...row, value]];
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
    rows = csvRows(await file.text());
  } else throw Error("Chọn file Excel (.xlsx) hoặc CSV.");
  const headers =
    rows.shift()?.map((x) =>
      x
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase(),
    ) ?? [];
  if (!headers.includes("word") || !headers.includes("meaning_vi"))
    throw Error("Thiếu cột word hoặc meaning_vi.");
  const words = rows.flatMap((row, i) => {
    if (!row.some((v) => v.trim())) return [];
    const get = (k: string) => row[headers.indexOf(k)]?.trim() ?? "";
    if (!get("word") || !get("meaning_vi"))
      throw Error("Dòng " + (i + 2) + " thiếu từ hoặc nghĩa tiếng Việt.");
    return [
      {
        id: crypto.randomUUID(),
        word: get("word"),
        meaning: get("meaning_vi"),
        pos: get("part_of_speech"),
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
