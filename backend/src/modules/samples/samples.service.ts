import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { HttpError } from "../../utils/http.js";
import { assertSampleMedia, sampleMediaEntries } from "./sample-assets.service.js";
import {
  parseInput,
  sampleDocumentSchema,
  type FieldIssue,
  type ListInput,
  type SampleDocument,
  type SamplePublicationAction,
  type SampleStatus,
} from "./samples.schemas.js";

type AdminRow = {
  id: string;
  status: SampleStatus;
  revision: number;
  publishedRevision: number | null;
  publishedAt: Date | null;
  draftUpdatedAt: Date;
  hasUnpublishedChanges: boolean;
  document: SampleDocument;
  publishedPayload: SampleDocument | null;
};

type CardRow = {
  id: string;
  title: string;
  skill: "WRITING" | "SPEAKING";
  sampleType: SampleDocument["sampleType"];
  topic: string;
  band: number;
  cover: SampleDocument["cover"];
  publishedAt: Date | null;
  status?: SampleStatus;
  revision?: number;
  draftUpdatedAt?: Date;
  hasUnpublishedChanges?: boolean;
};

type Database = Pick<Prisma.TransactionClient, "$queryRaw">;

const adminSelect = Prisma.sql`
  select
    s.id,
    s.status,
    d.revision,
    s.published_revision as "publishedRevision",
    s.published_at as "publishedAt",
    d.updated_at as "draftUpdatedAt",
    d.payload is distinct from s.published_payload
      as "hasUnpublishedChanges",
    d.payload as document,
    s.published_payload as "publishedPayload"
  from public.sample_answers s
  join public.sample_answer_drafts d
    on d.sample_id = s.id
`;

function notFound(): never {
  throw new HttpError(
    404,
    "SAMPLE_NOT_FOUND",
    "Không tìm thấy bài mẫu.",
  );
}

function adminDetail(row: AdminRow) {
  return {
    id: row.id,
    status: row.status,
    revision: row.revision,
    publishedRevision: row.publishedRevision,
    publishedAt: row.publishedAt,
    draftUpdatedAt: row.draftUpdatedAt,
    hasUnpublishedChanges: row.hasUnpublishedChanges,
    document: row.document,
  };
}

async function readAdmin(
  db: Database,
  id: string,
  lock = false,
): Promise<AdminRow> {
  const rows = await db.$queryRaw<AdminRow[]>(Prisma.sql`
    ${adminSelect}
    where s.id = ${id}::uuid
    ${lock ? Prisma.sql`for update of s, d` : Prisma.empty}
  `);

  if (!rows[0]) notFound();

  return rows[0];
}

function assertRevision(row: AdminRow, expected: number): void {
  if (row.revision !== expected) {
    throw new HttpError(
      409,
      "SAMPLE_REVISION_CONFLICT",
      "Bài mẫu đã thay đổi. Giữ lại nội dung đang sửa trước khi tải lại.",
      {
        expectedRevision: expected,
        currentRevision: row.revision,
      },
    );
  }
}

function invalidTransition(): never {
  throw new HttpError(
    409,
    "SAMPLE_INVALID_TRANSITION",
    "Không thể thực hiện thao tác ở trạng thái hiện tại.",
  );
}

/**
 * Chỉ kiểm tra điều kiện công bố.
 * Lưu nháp vẫn được phép để trống các trường này.
 */
export function publicationIssues(
  document: SampleDocument,
): FieldIssue[] {
  const issues: FieldIssue[] = [];

  function required(
    value: string,
    path: Array<string | number>,
    message: string,
  ) {
    if (!value.trim()) {
      issues.push({ path: ["document", ...path], message });
    }
  }

  required(document.topic, ["topic"], "Cần có chủ đề để công bố.");

  if (document.skill === "WRITING") {
    required(
      document.writingType,
      ["writingType"],
      "Cần chọn dạng bài để công bố.",
    );

    required(
      document.prompt,
      ["prompt"],
      "Cần có đề bài để công bố.",
    );

    required(
      document.essay,
      ["essay"],
      "Cần có bài mẫu để công bố.",
    );

    if (
      document.sampleType === "WRITING_TASK_1_ACADEMIC"
      && !document.promptImage
    ) {
      issues.push({
        path: ["document", "promptImage"],
        message: "Task 1 Academic cần ảnh đề đã được xác nhận.",
      });
    }
  } else {
    document.items.forEach((item, index) => {
      required(
        item.question,
        ["items", index, "question"],
        "Cần có câu hỏi để công bố.",
      );

      required(
        item.answer,
        ["items", index, "answer"],
        "Cần có câu trả lời để công bố.",
      );
    });
  }

  return issues;
}

/**
 * Giữ tương thích cột scalar cũ.
 * Với Speaking, mảng items trong JSON vẫn là nguồn dữ liệu chuẩn.
 */
function scalarContent(document: SampleDocument) {
  if (document.skill === "WRITING") {
    return {
      prompt: document.prompt,
      content: document.essay,
    };
  }

  return {
    prompt: document.items.map(item => item.question).join("\n\n"),
    content: document.items.map(item => item.answer).join("\n\n"),
  };
}

function escapeLike(value: string): string {
  // Dùng ! làm ký tự escape để không phụ thuộc cấu hình backslash SQL.
  return value.replace(/[!%_]/g, "!$&");
}

function listWhere(
  input: ListInput,
  admin: boolean,
): Prisma.Sql {
  const payload = admin
    ? Prisma.sql`d.payload`
    : Prisma.sql`s.published_payload`;

  const conditions: Prisma.Sql[] = [
    admin ? Prisma.sql`true` : Prisma.sql`s.status = 'PUBLISHED'`,
  ];

  if (admin && input.status) {
    conditions.push(Prisma.sql`s.status = ${input.status}`);
  }

  if (input.skill) {
    conditions.push(
      admin ? Prisma.sql`d.payload->>'skill' = ${input.skill}` : Prisma.sql`s.skill = ${input.skill}`,
    );
  }

  if (input.sampleType) {
    conditions.push(
      admin ? Prisma.sql`d.payload->>'sampleType' = ${input.sampleType}` : Prisma.sql`s.sample_type = ${input.sampleType}`,
    );
  }

  if (input.topic) {
    conditions.push(
      Prisma.sql`${payload}->>'topic' = ${input.topic}`,
    );
  }

  if (input.q) {
    const pattern = `%${escapeLike(input.q)}%`;

    conditions.push(Prisma.sql`
      (
        ${payload}->>'title' ilike ${pattern} escape '!'
        or ${payload}->>'topic' ilike ${pattern} escape '!'
      )
    `);
  }

  return Prisma.join(conditions, " and ");
}

export async function listSamples(
  prisma: PrismaClient,
  input: ListInput,
  admin: boolean,
) {
  const payload = admin
    ? Prisma.sql`d.payload`
    : Prisma.sql`s.published_payload`;

  const from = admin
    ? Prisma.sql`
        from public.sample_answers s
        join public.sample_answer_drafts d on d.sample_id = s.id
      `
    : Prisma.sql`from public.sample_answers s`;

  const where = listWhere(input, admin);
  const offset = (input.page - 1) * input.pageSize;

  const adminFields = admin
    ? Prisma.sql`,
        s.status,
        d.revision,
        d.updated_at as "draftUpdatedAt",
        d.payload is distinct from s.published_payload
          as "hasUnpublishedChanges"
      `
    : Prisma.empty;

  const ordering = admin
    ? Prisma.sql`d.updated_at desc, s.id desc`
    : Prisma.sql`s.published_at desc, s.id desc`;

  // COUNT và danh sách nhìn cùng một snapshot đọc.
  return prisma.$transaction(async tx => {
    const counts = await tx.$queryRaw<{ total: number }[]>(Prisma.sql`
      select count(*)::integer as total
      ${from}
      where ${where}
    `);

    const samples = await tx.$queryRaw<CardRow[]>(Prisma.sql`
      select
        s.id,
        ${payload}->>'title' as title,
        ${payload}->>'skill' as skill,
        ${payload}->>'sampleType' as "sampleType",
        ${payload}->>'topic' as topic,
        (${payload}->>'band')::double precision as band,
        ${payload}->'cover' as cover,
        s.published_at as "publishedAt"
        ${adminFields}
      ${from}
      where ${where}
      order by ${ordering}
      limit ${input.pageSize}
      offset ${offset}
    `);

    const total = counts[0]?.total ?? 0;

    return {
      samples,
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.ceil(total / input.pageSize),
      },
    };
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
  });
}

/** Call in a transaction so parent rows and their drafts commit together. */
export async function insertSampleDrafts(
  tx: Prisma.TransactionClient,
  userId: string,
  documents: readonly SampleDocument[],
) {
  const drafts = documents.map(document => {
    if (sampleMediaEntries(document).length) {
      throw new HttpError(400, "SAMPLE_ASSET_REQUIRES_SAVED_SAMPLE", "Lưu bài nháp trước khi tải tệp đính kèm.");
    }
    return { id: randomUUID(), document, scalar: scalarContent(document) };
  });
  const parents = drafts.map(({ id, document, scalar }) => Prisma.sql`(
    ${id}::uuid, ${document.title}, ${document.skill}, ${document.sampleType},
    ${document.topic}, ${scalar.prompt}, ${scalar.content}, 'DRAFT', ${userId}::uuid
  )`);
  await tx.$executeRaw`
    insert into public.sample_answers (id, title, skill, sample_type, topic, prompt, content, status, created_by)
    values ${Prisma.join(parents)}
  `;
  const children = drafts.map(({ id, document }) => Prisma.sql`(
    ${id}::uuid, 1, ${JSON.stringify(document)}::jsonb, ${userId}::uuid, now()
  )`);
  await tx.$executeRaw`
    insert into public.sample_answer_drafts (sample_id, revision, payload, updated_by, updated_at)
    values ${Prisma.join(children)}
  `;
  return drafts.map(({ id }) => id);
}

export async function createSample(prisma: PrismaClient, userId: string, document: SampleDocument) {
  return prisma.$transaction(async tx => {
    const [id] = await insertSampleDrafts(tx, userId, [document]);
    return adminDetail(await readAdmin(tx, id!));
  });
}

export async function saveSampleDraft(
  prisma: PrismaClient,
  id: string,
  userId: string,
  revision: number,
  document: SampleDocument,
) {
  return prisma.$transaction(async tx => {
    const row = await readAdmin(tx, id, true);
    assertRevision(row, revision);
    await assertSampleMedia(tx, id, document);

    await tx.$executeRaw`
      update public.sample_answer_drafts
      set
        payload = ${JSON.stringify(document)}::jsonb,
        revision = revision + 1,
        updated_by = ${userId}::uuid,
        updated_at = now()
      where sample_id = ${id}::uuid
    `;

    /*
     * Chỉ đồng bộ scalar khi bài chưa từng công bố.
     * Bài đã có snapshot phải giữ scalar khớp snapshot
     * theo constraint sample_answers_snapshot_v1_ck.
     */
    if (row.status === "DRAFT") {
      const scalar = scalarContent(document);

      await tx.$executeRaw`
        update public.sample_answers
        set
          title = ${document.title},
          skill = ${document.skill},
          sample_type = ${document.sampleType},
          topic = ${document.topic},
          prompt = ${scalar.prompt},
          content = ${scalar.content},
          updated_at = now()
        where id = ${id}::uuid
      `;
    } else {
      await tx.$executeRaw`
        update public.sample_answers
        set updated_at = now()
        where id = ${id}::uuid
      `;
    }

    return adminDetail(await readAdmin(tx, id));
  });
}

export async function updateSamplePublication(
  prisma: PrismaClient,
  id: string,
  userId: string,
  revision: number,
  action: SamplePublicationAction,
) {
  return prisma.$transaction(async tx => {
    const row = await readAdmin(tx, id, true);
    assertRevision(row, revision);

    if (action === "PUBLISH") {
      // Kiểm tra lại payload lưu trong DB trước khi công bố.
      const document = parseInput(
        sampleDocumentSchema,
        row.document,
      );

      const issues = publicationIssues(document);

      if (issues.length) {
        throw new HttpError(
          400,
          "SAMPLE_PUBLICATION_INVALID",
          "Bài mẫu chưa đủ điều kiện công bố.",
          { issues },
        );
      }
      await assertSampleMedia(tx, id, document);

      const scalar = scalarContent(document);

      await tx.$executeRaw`
        update public.sample_answers
        set
          title = ${document.title},
          skill = ${document.skill},
          sample_type = ${document.sampleType},
          topic = ${document.topic},
          prompt = ${scalar.prompt},
          content = ${scalar.content},
          status = 'PUBLISHED',
          published_payload = ${JSON.stringify(document)}::jsonb,
          published_revision = ${revision + 1},
          published_at = now(),
          updated_at = now()
        where id = ${id}::uuid
      `;
    } else if (action === "HIDE") {
      if (row.status !== "PUBLISHED") {
        invalidTransition();
      }

      await tx.$executeRaw`
        update public.sample_answers
        set status = 'HIDDEN', updated_at = now()
        where id = ${id}::uuid
      `;
    } else {
      if (row.status !== "HIDDEN" || !row.publishedPayload) {
        invalidTransition();
      }
      await assertSampleMedia(tx, id, row.publishedPayload);

      await tx.$executeRaw`
        update public.sample_answers
        set status = 'PUBLISHED', updated_at = now()
        where id = ${id}::uuid
      `;
    }

    await tx.$executeRaw`
      update public.sample_answer_drafts
      set
        revision = revision + 1,
        updated_by = ${userId}::uuid,
        updated_at = now()
      where sample_id = ${id}::uuid
    `;

    return adminDetail(await readAdmin(tx, id));
  });
}

export async function getAdminSample(prisma: PrismaClient, id: string) {
  return adminDetail(await readAdmin(prisma, id));
}

export async function getPublicSample(prisma: PrismaClient, id: string) {
  const rows = await prisma.$queryRaw<{
    id: string;
    publishedRevision: number;
    publishedAt: Date;
    document: SampleDocument;
  }[]>`
    select
      id,
      published_revision as "publishedRevision",
      published_at as "publishedAt",
      published_payload as document
    from public.sample_answers
    where id = ${id}::uuid
      and status = 'PUBLISHED'
  `;

  if (!rows[0]) notFound();

  return rows[0];
}
