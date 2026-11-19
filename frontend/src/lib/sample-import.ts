import type { SampleSkill, SampleType } from "./sample-types";

const dataSheets = ["Writing", "Speaking"] as const;
type Sheet = typeof dataSheets[number];

export interface SampleImportWorkbook {
  schemaVersion: 1;
  fileName: string;
  sheets: Record<Sheet, string[][]>;
}

export interface SampleImportIssue {
  sheet: Sheet;
  row: number;
  column: string;
  field: string;
  severity: "ERROR" | "WARNING";
  message: string;
}

export interface SampleImportPreview {
  canConfirm: boolean;
  dataRows: number;
  issues: SampleImportIssue[];
  samples: { sampleKey: string; title: string; sampleType: SampleType; itemCount: number }[];
}

export interface SampleImportResult {
  requestKey: string;
  replayed: boolean;
  createdCount: number;
  samples: { sampleKey: string; id: string; skill: SampleSkill; status: "DRAFT" }[];
}

function parseXml(files: Record<string, Uint8Array>, path: string) {
  const bytes = files[path];
  if (!bytes) throw new Error("Cấu trúc tệp Excel không đầy đủ.");
  const xml = new DOMParser().parseFromString(new TextDecoder().decode(bytes), "application/xml");
  if (xml.getElementsByTagNameNS("*", "parsererror").length) throw new Error("Tệp Excel có dữ liệu XML không hợp lệ.");
  return xml;
}

/** The value reader otherwise drops formulas and trusts worksheet dimensions. */
async function checkWorkbook(buffer: ArrayBuffer) {
  const { unzipSync } = await import("fflate");
  let expandedBytes = 0;
  let entryCount = 0;
  const files = unzipSync(new Uint8Array(buffer), { filter: file => {
    expandedBytes += file.originalSize;
    if (++entryCount > 250 || expandedBytes > 24 * 1024 ** 2) {
      throw new Error("Tệp Excel có quá nhiều dữ liệu sau khi giải nén.");
    }
    return file.name.endsWith(".xml") || file.name.endsWith(".rels");
  } });

  const workbook = parseXml(files, "xl/workbook.xml");
  const relationships = parseXml(files, "xl/_rels/workbook.xml.rels");
  const sheets = Array.from(workbook.getElementsByTagNameNS("*", "sheet"));
  const refs = Array.from(relationships.getElementsByTagNameNS("*", "Relationship"));
  const insideSheet = (address: string) => /^[A-Z][1-9]\d{0,2}$/.test(address) && Number(address.slice(1)) <= 501;
  const relationshipsNamespace = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  for (const name of dataSheets) {
    const sheet = sheets.find(entry => entry.getAttribute("name") === name);
    if (!sheet) throw new Error(`Thiếu sheet ${name}. Hãy dùng tệp mẫu.`);
    const relationshipId = sheet.getAttributeNS(relationshipsNamespace, "id");
    const target = refs.find(ref => relationshipId && ref.getAttribute("Id") === relationshipId)?.getAttribute("Target");
    if (!target) throw new Error(`Không đọc được sheet ${name}.`);
    const page = parseXml(files, target.startsWith("/") ? target.slice(1) : `xl/${target}`);
    const dimension = page.getElementsByTagNameNS("*", "dimension")[0]?.getAttribute("ref");
    if (dimension && !dimension.split(":").every(insideSheet)) {
      throw new Error(`Sheet ${name} vượt vùng A1:Z501. Hãy xóa hàng hoặc cột thừa.`);
    }
    const merge = page.getElementsByTagNameNS("*", "mergeCell")[0];
    if (merge) throw new Error(`Sheet ${name}, vùng ${merge.getAttribute("ref")} có ô gộp.`);
    for (const cell of page.getElementsByTagNameNS("*", "c")) {
      const address = cell.getAttribute("r") ?? "";
      if (!insideSheet(address)) throw new Error(`Sheet ${name}, ô ${address} nằm ngoài vùng A1:Z501.`);
      if (cell.getElementsByTagNameNS("*", "f").length) throw new Error(`Sheet ${name}, ô ${address} có công thức. Hãy dán dưới dạng giá trị.`);
      if (cell.getAttribute("t") === "e") throw new Error(`Sheet ${name}, ô ${address} có giá trị lỗi.`);
    }
  }
}

export async function readSampleWorkbook(file: File): Promise<SampleImportWorkbook> {
  if (!/\.xlsx$/i.test(file.name)) throw new Error("Chỉ nhận tệp Excel .xlsx.");
  if (file.size === 0 || file.size > 5 * 1024 ** 2) throw new Error("Chọn tệp Excel có dữ liệu và dung lượng tối đa 5 MiB.");

  const buffer = await file.arrayBuffer();
  await checkWorkbook(buffer);
  const { default: read } = await import("read-excel-file");
  async function readSheet(name: Sheet) {
    const rows = await read(buffer, { sheet: name, trim: false });
    return rows.map((row, index) => row.map((value, col) => {
      if (value === null) return "";
      if (typeof value === "string" || typeof value === "number") return String(value);
      throw new Error(`Sheet ${name}, ô ${String.fromCharCode(65 + col)}${index + 1} chỉ nhận văn bản hoặc số.`);
    }));
  }
  const Writing = await readSheet("Writing");
  const Speaking = await readSheet("Speaking");
  const workbook: SampleImportWorkbook = { schemaVersion: 1, fileName: file.name, sheets: { Writing, Speaking } };
  if (new Blob([JSON.stringify(workbook)]).size > 1024 ** 2 - 100) {
    throw new Error("Dữ liệu vượt quá 1 MiB. Hãy chia thành các tệp nhỏ hơn.");
  }
  return workbook;
}
