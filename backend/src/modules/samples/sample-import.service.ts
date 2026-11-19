import { createHash, randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import { HttpError } from "../../utils/http.js";
import { sampleDocumentSchema, type FieldIssue, type SampleDocument } from "./samples.schemas.js";
import { insertSampleDrafts, publicationIssues } from "./samples.service.js";

const headers = {
  Writing: ["sample_key", "title", "sample_type", "form", "topic", "band", "source", "writing_type", "prompt", "outline_intro", "outline", "essay", "translation"],
  Speaking: ["sample_key", "title", "sample_type", "topic", "band", "source", "outline_intro", "outline", "item_order", "question", "answer"],
} as const;
const MAX_ROWS = 500;
const MAX_SAMPLES = 100;
const grid = z.array(z.array(z.string().max(100_000)).max(26)).max(MAX_ROWS + 1);
export const sampleImportWorkbookSchema = z.object({
  schemaVersion: z.literal(1),
  fileName: z.string().min(1).max(255).regex(/^[^\u0000-\u001f\u007f\uD800-\uDFFF]+$/u),
  sheets: z.object({ Writing: grid, Speaking: grid }).strict(),
}).strict();
export const sampleImportConfirmSchema = z.object({
  requestKey: z.string().uuid(),
  workbook: sampleImportWorkbookSchema,
}).strict();

type Workbook = z.infer<typeof sampleImportWorkbookSchema>;
type Sheet = keyof Workbook["sheets"];
type Position = { sheet: Sheet; row: number };
type Source = Position & { values: Record<string, string> };
type Issue = Position & { column: string; field: string; severity: "ERROR" | "WARNING"; message: string };
type Entry = { sampleKey: string; document: SampleDocument };
type ImportResult = {
  requestKey: string;
  replayed: boolean;
  createdCount: number;
  samples: { sampleKey: string; id: string; skill: SampleDocument["skill"]; status: "DRAFT" }[];
};

const publicationFields: Record<string, string> = {
  sampleType: "sample_type", writingType: "writing_type", outlineIntro: "outline_intro", promptImage: "prompt",
};
const speakingParts = new Map([["SPEAKING_PART_1", 1], ["SPEAKING_PART_2", 2], ["SPEAKING_PART_3", 3]]);
const writingTypes = new Set<string>(["WRITING_TASK_1_ACADEMIC", "WRITING_TASK_1_GENERAL", "WRITING_TASK_2"]);
const sharedSpeakingFields = ["title", "sample_type", "topic", "band", "source", "outline_intro", "outline"];

function addIssue(issues: Issue[], source: Position, field: string, message: string, severity: Issue["severity"] = "ERROR", col?: number) {
  const index = col ?? (headers[source.sheet] as readonly string[]).indexOf(field);
  issues.push({ sheet: source.sheet, row: source.row, column: index < 0 ? "" : String.fromCharCode(65 + index), field, severity, message });
}

function readRows(sheet: Sheet, rows: string[][], issues: Issue[]): Source[] {
  const expected = headers[sheet];
  const header = rows[0] ?? [];
  const headerPosition = { sheet, row: 1 };
  let correctHeader = true;
  expected.forEach((name, index) => {
    if (header[index]?.trim() === name) return;
    addIssue(issues, headerPosition, name, `Tên cột phải là ${name}.`, "ERROR", index);
    correctHeader = false;
  });
  const extraHeader = header.findIndex((cell, col) => col >= expected.length && cell.trim());
  if (extraHeader >= 0) {
    addIssue(issues, headerPosition, "headers", "Có cột nằm ngoài mẫu Excel.", "ERROR", extraHeader);
    correctHeader = false;
  }
  if (!correctHeader) return [];

  const result: Source[] = [];
  for (const [index, cells] of rows.slice(1).entries()) {
    if (!cells.some(cell => cell.trim())) continue;
    const position = { sheet, row: index + 2 };
    const extra = cells.findIndex((cell, col) => col >= expected.length && cell.trim());
    if (extra >= 0) addIssue(issues, position, "row", "Có dữ liệu nằm ngoài mẫu Excel.", "ERROR", extra);
    const values = Object.fromEntries(expected.map((name, col) => [name, (cells[col] ?? "").replace(/\r\n?/g, "\n")]));
    result.push({ ...position, values });
  }
  return result;
}

function readKey(source: Source, issues: Issue[]): string | undefined {
  const key = source.values.sample_key!.trim();
  if (/^[a-z0-9][a-z0-9_-]{0,49}$/i.test(key)) return key;
  addIssue(issues, source, "sample_key", "Mã bài dài 1–50 ký tự. Dùng chữ không dấu, số, dấu gạch dưới hoặc gạch ngang.");
}

function commonDocument({ values }: Source) {
  const rawBand = values.band!.trim().replace(",", ".");
  return {
    schemaVersion: 1,
    title: values.title,
    topic: values.topic,
    band: /^\d+(\.\d+)?$/.test(rawBand) ? Number(rawBand) : null,
    source: values.source,
    cover: null,
    outlineIntro: values.outline_intro,
    outline: values.outline,
  };
}

function addDocumentIssue(issues: Issue[], sources: readonly Source[], issue: FieldIssue, severity: Issue["severity"]) {
  const [field, itemIndex, itemField] = issue.path;
  const isItem = field === "items" && typeof itemIndex === "number";
  const source = isItem ? sources[itemIndex] ?? sources[0]! : sources[0]!;
  const name = isItem ? String(itemField) : publicationFields[String(field)] ?? String(field);
  const message = name === "band" ? "Band phải là 7, 7.5, 8, 8.5 hoặc 9." : issue.message;
  addIssue(issues, source, name, message, severity);
}

function checkDocument(candidate: unknown, sources: readonly Source[], issues: Issue[]) {
  const result = sampleDocumentSchema.safeParse(candidate);
  if (!result.success) {
    result.error.issues.forEach(issue => addDocumentIssue(issues, sources, issue, "ERROR"));
    return;
  }
  for (const issue of publicationIssues(result.data)) {
    addDocumentIssue(issues, sources, { ...issue, path: issue.path.slice(1) }, "WARNING");
  }
  return result.data;
}

function readWriting(source: Source, issues: Issue[]) {
  const { values } = source;
  const sampleType = values.sample_type!.trim();
  if (!writingTypes.has(sampleType)) {
    addIssue(issues, source, "sample_type", "Loại bài Writing không hợp lệ.");
    return;
  }
  return checkDocument({
    ...commonDocument(source), skill: "WRITING", sampleType,
    task: sampleType === "WRITING_TASK_2" ? 2 : 1, form: values.form!.trim(),
    writingType: values.writing_type!.trim(), prompt: values.prompt, promptImage: null,
    essay: values.essay, translation: values.translation,
  }, [source], issues);
}

function readSpeaking(group: Source[], issues: Issue[]) {
  const first = group[0]!;
  const sampleType = first.values.sample_type!.trim();
  const part = speakingParts.get(sampleType);
  if (!part) {
    addIssue(issues, first, "sample_type", "Loại bài Speaking không hợp lệ.");
    return;
  }
  if (part === 2 && group.length !== 1) {
    addIssue(issues, group[1]!, "item_order", "Speaking Part 2 chỉ có một câu.");
    return;
  }
  const before = issues.length;
  const orders = new Map<number, Source>();
  for (const source of group) {
    for (const field of sharedSpeakingFields) {
      if (source.values[field] === first.values[field]) continue;
      addIssue(issues, source, field, `Giá trị phải giống dòng ${first.row} của cùng bài.`);
    }
    const value = source.values.item_order!.trim();
    const order = Number(value);
    if (!/^\d+$/.test(value) || order < 1 || order > 100) {
      addIssue(issues, source, "item_order", "Thứ tự câu phải là số nguyên từ 1 đến 100.");
    } else if (orders.has(order)) {
      addIssue(issues, source, "item_order", `Thứ tự ${order} trùng với dòng ${orders.get(order)!.row}.`);
    } else {
      orders.set(order, source);
    }
  }
  if (issues.length !== before) return;
  const ordered = [...orders.entries()].sort(([a], [b]) => a - b);
  const gap = ordered.find(([order], index) => order !== index + 1);
  if (gap) {
    addIssue(issues, gap[1], "item_order", "Thứ tự câu phải liên tiếp từ 1.");
    return;
  }
  const sources = ordered.map(([, source]) => source);
  return checkDocument({
    ...commonDocument(first), skill: "SPEAKING", sampleType, part,
    items: sources.map(({ values }) => ({ id: randomUUID(), question: values.question, answer: values.answer, audio: null })),
  }, sources, issues);
}

function inspectWorkbook(workbook: Workbook) {
  const issues: Issue[] = [];
  const entries: Entry[] = [];
  const writing = readRows("Writing", workbook.sheets.Writing, issues);
  const speaking = readRows("Speaking", workbook.sheets.Speaking, issues);
  const dataRows = writing.length + speaking.length;
  if (dataRows > MAX_ROWS) {
    throw new HttpError(400, "SAMPLE_IMPORT_LIMIT", `Mỗi lần nhập tối đa ${MAX_ROWS} dòng dữ liệu.`);
  }
  if (!dataRows && !issues.length) {
    addIssue(issues, { sheet: "Writing", row: 2 }, "sample_key", "Hai sheet chưa có dữ liệu bài mẫu.");
  }

  const writingKeys = new Set<string>();
  const speakingGroups = new Map<string, Source[]>();
  for (const source of writing) {
    const sampleKey = readKey(source, issues);
    if (!sampleKey) continue;
    if (writingKeys.has(sampleKey)) {
      addIssue(issues, source, "sample_key", "Mã bài Writing bị trùng.");
      continue;
    }
    writingKeys.add(sampleKey);
    const document = readWriting(source, issues);
    if (document) entries.push({ sampleKey, document });
  }
  for (const source of speaking) {
    const sampleKey = readKey(source, issues);
    if (!sampleKey) continue;
    if (writingKeys.has(sampleKey)) {
      addIssue(issues, source, "sample_key", "Mã bài đã có trong sheet Writing.");
      continue;
    }
    const group = speakingGroups.get(sampleKey);
    if (group) group.push(source);
    else speakingGroups.set(sampleKey, [source]);
  }
  if (writingKeys.size + speakingGroups.size > MAX_SAMPLES) {
    throw new HttpError(400, "SAMPLE_IMPORT_LIMIT", `Mỗi lần nhập tối đa ${MAX_SAMPLES} bài.`);
  }
  for (const [sampleKey, group] of speakingGroups) {
    const document = readSpeaking(group, issues);
    if (document) entries.push({ sampleKey, document });
  }
  return { entries, issues, dataRows, canConfirm: entries.length > 0 && !issues.some(issue => issue.severity === "ERROR") };
}

export function previewSampleImport(workbook: Workbook) {
  const { entries, ...preview } = inspectWorkbook(workbook);
  return {
    ...preview,
    samples: entries.map(({ sampleKey, document }) => ({
      sampleKey, title: document.title, sampleType: document.sampleType,
      itemCount: document.skill === "SPEAKING" ? document.items.length : 1,
    })),
  };
}

export async function confirmSampleImport(prisma: PrismaClient, userId: string, key: string, workbook: Workbook): Promise<ImportResult> {
  const requestKey = key.toLowerCase();
  // File name is display metadata. The sheets determine the payload identity.
  const payloadHash = createHash("sha256").update(JSON.stringify([workbook.schemaVersion, workbook.sheets.Writing, workbook.sheets.Speaking])).digest("hex");
  return prisma.$transaction(async tx => {
    // PostgreSQL releases this lock on commit or rollback, including between app instances.
    await tx.$queryRaw`select 1 as locked from pg_advisory_xact_lock(hashtextextended('sample-import:' || ${requestKey}::text, 0))`;
    const [receipt] = await tx.$queryRaw<{ createdBy: string; payloadHash: string; result: ImportResult }[]>`
      select created_by as "createdBy", payload_hash as "payloadHash", result
      from public.sample_import_receipts where request_key = ${requestKey}::uuid
    `;
    if (receipt) {
      if (receipt.createdBy !== userId || receipt.payloadHash !== payloadHash) {
        throw new HttpError(409, "SAMPLE_IMPORT_REQUEST_CONFLICT", "Mã yêu cầu đã được dùng cho một lần nhập khác.");
      }
      return { ...receipt.result, replayed: true };
    }

    const { entries, issues, canConfirm } = inspectWorkbook(workbook);
    if (!canConfirm) throw new HttpError(400, "SAMPLE_IMPORT_INVALID", "File có lỗi. Chưa có bài nào được tạo.", { issues });
    const ids = await insertSampleDrafts(tx, userId, entries.map(({ document }) => document));
    const result: ImportResult = {
      requestKey, replayed: false, createdCount: ids.length,
      samples: entries.map(({ sampleKey, document }, index) => ({ sampleKey, id: ids[index]!, skill: document.skill, status: "DRAFT" })),
    };
    await tx.$executeRaw`
      insert into public.sample_import_receipts (request_key, created_by, payload_hash, file_name, result)
      values (${requestKey}::uuid, ${userId}::uuid, ${payloadHash}, ${workbook.fileName}, ${JSON.stringify(result)}::jsonb)
    `;
    return result;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 30_000 });
}
