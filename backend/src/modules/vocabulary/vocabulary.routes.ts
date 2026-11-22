import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import {
  requireAuth,
  requireRole,
} from "../../middleware/auth.js";

import {
  asyncHandler,
  HttpError,
} from "../../utils/http.js";
import { isVocabularyImage, lockVocabularyImages, publishedVocabularyImage, vocabularyImagePreviews } from "./image-assets.js";

const uuidSchema = z.string().uuid();

const webUrlSchema = z.union([
  z.literal(""),
  z.string().url().max(2048).refine(
    value => value.startsWith("https://"),
    "URL phải bắt đầu bằng https://.",
  ),
]);

const wordSchema = z.object({
  id: uuidSchema,

  word: z.string().trim().min(1).max(100),
  meaning: z.string().trim().min(1).max(2000),

  phonetic: z.string().trim().max(200).default(""),
  pos: z.string().trim().max(100).default(""),
  tag: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
  example: z.string().trim().max(4000).default(""),
  translation: z.string().trim().max(4000).default(""),

  image: z.union([webUrlSchema, z.string().refine(isVocabularyImage)]).default(""),
  audio: webUrlSchema.default(""),
  audioUs: webUrlSchema.optional(),
  audioUk: webUrlSchema.optional(),

  audioCandidates: z.array(
    z.object({
      url: z.string().url().max(2048).refine(
        value => value.startsWith("https://"),
      ),
      source: z.string().max(100),
      accent: z.enum(["US", "UK", "AU"]).optional(),
    }),
  ).max(30).optional(),

  imageCredit: z.object({
    source: z.string().max(100),
    name: z.string().max(200),
    url: z.string().url().max(2048).refine(
      value => value.startsWith("https://"),
    ),
  }).optional(),
});

export const createSetSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).default(""),
  cover: z.string().max(2048).refine(value => !value || isVocabularyImage(value) || value.startsWith("https://") ||
    value.startsWith("data:image/svg+xml,%3Csvg"), "Chọn ảnh đã tải lên, URL HTTPS hoặc bìa màu.").default(""),
});

export const saveDraftSchema = z.object({
  revision: z.number().int().nonnegative(),
  words: z.array(wordSchema).max(500),
}).superRefine((value, context) => {
  const ids = new Set<string>();

  value.words.forEach((word, index) => {
    if (ids.has(word.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["words", index, "id"],
        message: "ID từ bị trùng.",
      });
    }

    ids.add(word.id);
  });
});

type SetRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  revision: number;
  wordCount: number;
  cover: string;
};

type DraftRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  revision: number;
  content: {
    words: z.infer<typeof wordSchema>[];
    cover?: string;
  };
};

function parseId(value: unknown): string {
  const result = uuidSchema.safeParse(value);

  if (!result.success) {
    throw new HttpError(
      400,
      "INVALID_SET_ID",
      "ID bộ từ không hợp lệ.",
    );
  }

  return result.data;
}

export function createVocabularyAdminRouter(prisma: PrismaClient) {
  const router = Router();

  router.use(requireAuth, requireRole("ADMIN"));

  // Danh sách bộ từ dành cho quản lý.
  router.get("/", asyncHandler(async (_req, res) => {
    const sets = await prisma.$queryRaw<SetRow[]>`
      select
        s.id,
        s.name as title,
        s.description,
        s.status,
        coalesce(d.content ->> 'cover', '') as cover,
        coalesce(d.revision, 0) as revision,
        coalesce(
          jsonb_array_length(d.content -> 'words'),
          0
        ) as "wordCount"
      from public.vocabulary_sets s
      left join public.vocabulary_set_drafts d
        on d.set_id = s.id
      order by s.updated_at desc, s.id
    `;

    const previews = await vocabularyImagePreviews(prisma, sets.map(set => set.cover));
    res.set("Cache-Control", "private, no-store").json({
      sets: sets.map(set => ({
        ...set,
        description: set.description ?? "",
        coverPreview: previews.get(set.cover),
      })),
    });
  }));

  // Tạo bộ thật trong database.
  router.post("/", asyncHandler(async (req, res) => {
    const parsed = createSetSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(
        400,
        "INVALID_SET",
        "Tên bộ bắt buộc và tối đa 200 ký tự.",
      );
    }

    const { title, description, cover } = parsed.data;
    const userId = req.appUser!.id;

    const set = await prisma.$transaction(async tx => {
      await lockVocabularyImages(tx, [cover]);
      const rows = await tx.$queryRaw<{ id: string }[]>`
        insert into public.vocabulary_sets (
          name,
          description,
          status
        )
        values (
          ${title},
          ${description},
          'DRAFT'
        )
        returning id
      `;

      const id = rows[0]!.id;

      await tx.$executeRaw`
        insert into public.vocabulary_set_drafts (
          set_id,
          updated_by, content
        )
        values (
          ${id}::uuid,
          ${userId}::uuid, ${JSON.stringify({ words: [], cover })}::jsonb
        )
      `;

      return {
        id,
        title,
        description,
        cover,
        status: "DRAFT",
        revision: 0,
      };
    });

    const previews = await vocabularyImagePreviews(prisma, [cover]);
    res.set("Cache-Control", "private, no-store").status(201).json({ set: { ...set, coverPreview: previews.get(cover) } });
  }));

  // Đọc bản nháp khi mở bộ từ.
  router.get("/:id", asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);

    const rows = await prisma.$queryRaw<DraftRow[]>`
      select
        s.id,
        s.name as title,
        s.description,
        s.status,
        d.revision,
        d.content
      from public.vocabulary_sets s
      join public.vocabulary_set_drafts d
        on d.set_id = s.id
      where s.id = ${id}::uuid
    `;

    const row = rows[0];

    if (!row) {
      throw new HttpError(
        404,
        "DRAFT_NOT_FOUND",
        "Không tìm thấy bản nháp của bộ từ.",
      );
    }

    const cover = row.content.cover ?? "";
    const previews = await vocabularyImagePreviews(prisma, [cover, ...row.content.words.map(word => word.image ?? "")]);
    res.set("Cache-Control", "private, no-store").json({
      set: {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        cover,
        coverPreview: previews.get(cover),
        status: row.status,
      },
      revision: row.revision,
      words: row.content.words.map(word => ({ ...word, imagePreview: previews.get(word.image) })),
    });
  }));

  // Lưu toàn bộ nội dung nháp.
  router.put("/:id/draft", asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const parsed = saveDraftSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];

      throw new HttpError(
        400,
        "INVALID_DRAFT",
        firstError
          ? `${firstError.path.join(".")}: ${firstError.message}`
          : "Dữ liệu bản nháp không hợp lệ.",
      );
    }

    const { revision, words } = parsed.data;
    const userId = req.appUser!.id;
    const content = JSON.stringify({ words });

    const result = await prisma.$transaction(async tx => {
      await lockVocabularyImages(tx, words.map(word => word.image));
      const updated = await tx.$queryRaw<
        { revision: number; updatedAt: Date }[]
      >`
        update public.vocabulary_set_drafts
        set
          content = content || ${content}::jsonb,
          revision = revision + 1,
          updated_by = ${userId}::uuid,
          updated_at = now()
        where set_id = ${id}::uuid
          and revision = ${revision}
        returning
          revision,
          updated_at as "updatedAt"
      `;

      if (!updated[0]) {
        const existing = await tx.$queryRaw<{ set_id: string }[]>`
          select set_id
          from public.vocabulary_set_drafts
          where set_id = ${id}::uuid
        `;

        if (!existing.length) {
          throw new HttpError(
            404,
            "DRAFT_NOT_FOUND",
            "Không tìm thấy bản nháp.",
          );
        }

        throw new HttpError(
          409,
          "REVISION_CONFLICT",
          "Bản nháp đã thay đổi ở nơi khác. Giữ lại nội dung đang sửa trước khi tải lại.",
        );
      }

      await tx.$executeRaw`
        update public.vocabulary_sets
        set updated_at = now()
        where id = ${id}::uuid
      `;

      return updated[0];
    });

    res.json({
      ...result,
      wordCount: words.length,
    });
  }));

  router.patch("/:id", asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const data = createSetSchema.extend({ revision: z.number().int().nonnegative() }).safeParse(req.body);
    if (!data.success) throw new HttpError(400, "INVALID_SET", data.error.issues[0]!.message);
    await prisma.$transaction(async tx => {
      await lockVocabularyImages(tx, [data.data.cover]);
      const changed = await tx.$executeRaw`update public.vocabulary_set_drafts
        set content = content || ${JSON.stringify({ cover: data.data.cover })}::jsonb,
            revision = revision + 1, updated_by = ${req.appUser!.id}::uuid, updated_at = now()
        where set_id = ${id}::uuid and revision = ${data.data.revision}`;
      if (!changed) throw new HttpError(409, "REVISION_CONFLICT", "Bộ từ đã thay đổi. Tải lại danh sách trước khi sửa thông tin.");
      await tx.$executeRaw`update public.vocabulary_sets set name = ${data.data.title}, description = ${data.data.description}, updated_at = now() where id = ${id}::uuid`;
    });
    res.json({ revision: data.data.revision + 1 });
  }));
  router.post("/:id/publication", asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const input = z.object({ action: z.enum(["publish", "hide", "show"]), revision: z.number().int().nonnegative() }).safeParse(req.body);
    if (!input.success) throw new HttpError(400, "INVALID_ACTION", "Thao tác không hợp lệ.");
    const { action, revision } = input.data;
    const status = action === "hide" ? "HIDDEN" : "PUBLISHED";
    await prisma.$transaction(async tx => {
      const [draft] = await tx.$queryRaw<{content: {words: unknown; cover?: string}; revision: number}[]>`select content, revision from public.vocabulary_set_drafts where set_id=${id}::uuid for update`;
      if (!draft || draft.revision !== revision) throw new HttpError(409, "REVISION_CONFLICT", "Bản nháp đã thay đổi. Mở lại bộ từ.");
      const [set] = await tx.$queryRaw<{name:string; description:string|null; status:string}[]>`select name,description,status from public.vocabulary_sets where id=${id}::uuid for update`;
      if (action === "publish") {
        const parsed = saveDraftSchema.safeParse({ revision, words: draft.content.words });
        if (!parsed.success || !parsed.data.words.length) throw new HttpError(400, "EMPTY_SET", "Cần ít nhất một từ hợp lệ để công bố.");
        await lockVocabularyImages(tx, [draft.content.cover ?? "", ...parsed.data.words.map(word => word.image)]);
        const payload = JSON.stringify(parsed.data.words);
        const count = await tx.$executeRaw`insert into public.vocabularies (id,word,phonetic,definitions,audio_url,sources,status)
          select (w->>'id')::uuid,w->>'word',w->>'phonetic',jsonb_build_array(w),w->>'audio',jsonb_build_array(jsonb_build_object('setId',${id}::text)),'PUBLISHED'
          from jsonb_array_elements(${payload}::jsonb) as words(w)
          on conflict (id) do update set word=excluded.word, phonetic=excluded.phonetic, definitions=excluded.definitions,
          audio_url=excluded.audio_url, updated_at=now() where vocabularies.sources=excluded.sources`;
        if (count !== parsed.data.words.length) throw new HttpError(409,"WORD_CONFLICT","Một ID từ đã thuộc bộ khác.");
        await tx.$executeRaw`delete from public.vocabulary_set_items where set_id=${id}::uuid`;
        await tx.$executeRaw`insert into public.vocabulary_set_items(set_id,vocabulary_id,order_no)
          select ${id}::uuid,(w->>'id')::uuid,n::int from jsonb_array_elements(${payload}::jsonb) with ordinality as words(w,n)`;
        const metadata = JSON.stringify({title:set.name,description:set.description,cover:draft.content.cover ?? ""});
        await tx.$executeRaw`update public.vocabulary_set_drafts set content=jsonb_set(content,'{publishedSet}',${metadata}::jsonb) where set_id=${id}::uuid`;
      } else if ((action === "hide" && set.status !== "PUBLISHED") || (action === "show" && set.status !== "HIDDEN")) {
        throw new HttpError(409,"INVALID_STATUS","Trạng thái bộ đã thay đổi. Mở lại bộ từ.");
      }
      await tx.$executeRaw`update public.vocabulary_sets set status=${status},updated_at=now() where id=${id}::uuid`;
      await tx.$executeRaw`update public.vocabulary_set_drafts set revision=revision+1 where set_id=${id}::uuid`;
    });
    res.json({status,revision:revision+1});
  }));
  router.delete("/:id", asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.$transaction(async tx => {
      const rows = await tx.$queryRaw<{ status: string }[]>`select status from public.vocabulary_sets where id = ${id}::uuid for update`;
      if (!rows[0]) throw new HttpError(404, "SET_NOT_FOUND", "Không tìm thấy bộ từ.");
      const links = await tx.$queryRaw<{ count: bigint }[]>`select count(*) from public.vocabulary_set_items where set_id = ${id}::uuid`;
      if (rows[0].status !== "DRAFT" || Number(links[0]?.count) > 0) throw new HttpError(409, "SET_IN_USE", "Chỉ xóa bộ nháp chưa có từ công bố. Chức năng ẩn sẽ được nối ở bước công bố.");
      await tx.$executeRaw`delete from public.vocabulary_set_drafts where set_id = ${id}::uuid`;
      await tx.$executeRaw`delete from public.vocabulary_sets where id = ${id}::uuid`;
    });
    res.status(204).end();
  }));
  return router;
}

export function createVocabularyLibraryRouter(prisma: PrismaClient) {
  const router = Router();
  router.get("/images/:id", asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    res.set("Cache-Control", "no-store");
    const url = await publishedVocabularyImage(prisma, id);
    res.redirect(302, url);
  }));
  router.get("/me/personal", requireAuth, asyncHandler(async (req,res) => {
    const user = req.appUser!.id;
    const records = await prisma.$queryRaw`
      select coalesce(f.vocabulary_id,n.vocabulary_id) as id, f.vocabulary_id is not null as fav, coalesce(n.content,'') as note
      from (select vocabulary_id from public.favorite_vocabularies where user_id=${user}::uuid) f
      full join (select vocabulary_id,content from public.vocabulary_notes where user_id=${user}::uuid) n using(vocabulary_id)`;
    res.set("Cache-Control","private, no-store").json({records});
  }));
  router.patch("/me/personal/:id", requireAuth, asyncHandler(async (req,res) => {
    const id = parseId(req.params.id);
    const user = req.appUser!.id;
    const data = z.union([z.object({fav:z.boolean()}).strict(),z.object({note:z.string().trim().max(4000)}).strict()]).safeParse(req.body);
    if (!data.success) throw new HttpError(400,"INVALID_PERSONAL","Ghi chú tối đa 4000 ký tự hoặc chọn trạng thái yêu thích hợp lệ.");
    const patch = data.data;
    await prisma.$transaction(async tx => {
      const found = await tx.$queryRaw<{id:string}[]>`select i.id from public.vocabulary_set_items i join public.vocabulary_sets s on s.id=i.set_id where i.vocabulary_id=${id}::uuid and s.status='PUBLISHED' limit 1 for share of s`;
      if (!found.length) throw new HttpError(404,"UNKNOWN_WORD","Từ này chưa có trong thư viện công khai.");
      if ("fav" in patch) {
        if (patch.fav) await tx.$executeRaw`insert into public.favorite_vocabularies(user_id,vocabulary_id) values(${user}::uuid,${id}::uuid) on conflict(user_id,vocabulary_id) do nothing`;
        else await tx.$executeRaw`delete from public.favorite_vocabularies where user_id=${user}::uuid and vocabulary_id=${id}::uuid`;
      } else if (patch.note) {
        await tx.$executeRaw`insert into public.vocabulary_notes(user_id,vocabulary_id,content) values(${user}::uuid,${id}::uuid,${patch.note}) on conflict(user_id,vocabulary_id) do update set content=excluded.content,updated_at=now()`;
      } else await tx.$executeRaw`delete from public.vocabulary_notes where user_id=${user}::uuid and vocabulary_id=${id}::uuid`;
    });
    res.json(patch);
  }));
  router.get("/", asyncHandler(async (_req,res) => {
    const sets = await prisma.$queryRaw`select s.id, d.content->'publishedSet'->>'title' as title,
        d.content->'publishedSet'->>'cover' as cover, jsonb_agg(v.definitions->0 order by i.order_no) as words
      from public.vocabulary_sets s join public.vocabulary_set_drafts d on d.set_id=s.id
      join public.vocabulary_set_items i on i.set_id=s.id join public.vocabularies v on v.id=i.vocabulary_id
      where s.status='PUBLISHED' and d.content ? 'publishedSet'
      group by s.id,d.content->'publishedSet'->>'title',d.content->'publishedSet'->>'cover' order by title`;
    res.set("Cache-Control","no-store").json({sets});
  }));
  return router;
}
