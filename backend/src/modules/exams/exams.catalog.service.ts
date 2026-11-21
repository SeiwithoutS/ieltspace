import { prisma } from '../../lib/prisma.js';
import { publicUrl } from '../../integrations/storage/supabase-storage.js';
import { LR_QUESTION_TYPE_NAMES, type LrQuestionType } from './exam-content.mapper.js';
import { WRITING_ESSAY_TYPE_NAMES, cleanTopic, isWritingEssayType, type WritingEssayType } from './exam-labels.js';

// Danh sách công khai cho Landing và thư viện đề: chỉ metadata, không có đáp án hay bằng chứng (BR-ATTEMPT-002).

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export type CatalogForm = 'ACADEMIC' | 'GENERAL';

export type CatalogSetDto = {
  id: string;
  name: string;
  coverUrl: string | null;
  category: { id: string; name: string; orderNo: number };
  publishedAt: string;
  isNew: boolean;
  testCount: number;
  attemptCount: number;
  forms: CatalogForm[];
};

export type PracticeSkill = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

export type PracticeItemDto = {
  key: string;
  examSkillId: string;
  examId: string;
  examTitle: string;
  setName: string;
  // Ảnh của thẻ: ảnh riêng của Passage/Section (nếu có), nếu không thì bìa bộ đề; null thì frontend dùng màu nền.
  coverUrl: string | null;
  skill: PracticeSkill;
  form: CatalogForm | null;
  // Lượt làm tính theo Test (bảng attempts chưa tách theo kỹ năng/section).
  attemptCount: number;
  publishedAt: string | null;
  // Một item = một Section (Listening), Passage (Reading), Task (Writing) hoặc Part (Speaking).
  orderNo: number;
  label: string;
  // Chủ đề dùng làm tiêu đề thẻ (do admin nhập); null thì frontend dùng nhãn thay thế.
  title: string | null;
  // Nhãn do admin gắn (tuỳ chọn): dạng đề Writing và chủ đề Writing/Speaking.
  essayType: WritingEssayType | null;
  topicLabel: string | null;
  minutes: number | null;
  minWords: number | null;
  // Số câu của riêng section/passage; chỉ mã loại câu hỏi, không có nội dung hay đáp án.
  questionCount: number | null;
  questionTypes: LrQuestionType[];
};

async function completedAttemptsByExam(): Promise<Map<string, number>> {
  const rows = await prisma.attempts.groupBy({
    by: ['exam_id'],
    where: { status: 'COMPLETED' },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.exam_id, r._count._all]));
}

function toForm(value: string | null): CatalogForm | null {
  return value === 'ACADEMIC' || value === 'GENERAL' ? value : null;
}

export async function listPublicSets(now: Date = new Date()): Promise<CatalogSetDto[]> {
  const [sets, attempts] = await Promise.all([
    prisma.exam_sets.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ published_at: 'desc' }, { name: 'asc' }],
      include: {
        category: true,
        exams: {
          select: {
            id: true,
            skills: {
              where: { status: 'PUBLISHED' },
              select: { skill: true, form: true },
            },
          },
        },
      },
    }),
    completedAttemptsByExam(),
  ]);

  const items: CatalogSetDto[] = [];
  for (const set of sets) {
    // BR-EXAM-004: bộ công khai phải có ít nhất một Test có kỹ năng PUBLISHED.
    const tests = set.exams.filter((e) => e.skills.length > 0);
    if (tests.length === 0 || !set.published_at) continue;

    const forms = new Set<CatalogForm>();
    let attemptCount = 0;
    for (const t of tests) {
      attemptCount += attempts.get(t.id) ?? 0;
      for (const s of t.skills) {
        const f = toForm(s.form);
        if ((s.skill === 'READING' || s.skill === 'WRITING') && f) forms.add(f);
      }
    }
    // Chỉ có Listening/Speaking (không phân Academic/General) thì thuộc cả hai tab.
    const formList: CatalogForm[] = forms.size > 0 ? [...forms] : ['ACADEMIC', 'GENERAL'];

    items.push({
      id: set.id,
      name: set.name,
      coverUrl: set.cover_url,
      category: { id: set.category.id, name: set.category.name, orderNo: set.category.order_no },
      publishedAt: set.published_at.toISOString(),
      isNew: now.getTime() - set.published_at.getTime() <= NEW_WINDOW_MS,
      testCount: tests.length,
      attemptCount,
      forms: formList,
    });
  }
  return items;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export type EssayTypeOption = { code: WritingEssayType; name: string; count: number };
export type TopicOption = { name: string; count: number };
export type PracticeFilters = { questionType?: LrQuestionType; essayType?: WritingEssayType; topic?: string };

export type QuestionTypeOption = { code: LrQuestionType; name: string; count: number };

export const QUESTION_TYPE_CODES = Object.keys(LR_QUESTION_TYPE_NAMES) as [LrQuestionType, ...LrQuestionType[]];

// Các chủ đề đã gắn cho Writing/Speaking (mọi trạng thái), để admin chọn lại trong editor. Chỉ đọc.
export async function listTopicLabels(): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ topic: string }>>`
    select distinct t.topic
    from (
      select s.content ->> 'topic' as topic
      from public.exam_sections s
      join public.exam_skills k on k.id = s.exam_skill_id
      where k.skill = 'WRITING' and k.status <> 'ARCHIVED'
      union
      select s.config ->> 'topic' as topic
      from public.exam_sections s
      join public.exam_skills k on k.id = s.exam_skill_id
      where k.skill = 'SPEAKING' and k.status <> 'ARCHIVED'
    ) t
    where t.topic is not null and btrim(t.topic) <> ''
  `;
  return rows
    .map((r) => cleanTopic(r.topic))
    .filter((t): t is string => t !== null)
    .sort((a, b) => a.localeCompare(b, 'vi'));
}

export async function listPracticeItems(
  skill: PracticeSkill,
  filters: PracticeFilters = {}
): Promise<{
  items: PracticeItemDto[];
  availableQuestionTypes: QuestionTypeOption[];
  availableEssayTypes: EssayTypeOption[];
  availableTopics: TopicOption[];
}> {
  const { questionType, essayType, topic: topicFilter } = filters;
  const isLr = skill === 'LISTENING' || skill === 'READING';
  const [rows, attempts] = await Promise.all([
    prisma.exam_skills.findMany({
      where: {
        skill,
        status: 'PUBLISHED',
        exam: { exam_set: { status: 'PUBLISHED' } },
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            order_no: true,
            exam_set: { select: { id: true, name: true, cover_url: true, published_at: true } },
          },
        },
        sections: {
          orderBy: { order_no: 'asc' },
          select: {
            title: true,
            order_no: true,
            config: true,
            // Chỉ lấy nội dung đề bài của Writing/Speaking; Listening/Reading không đọc content.
            content: !isLr,
            groups: { select: { question_type: true, _count: { select: { questions: true } } } },
          },
        },
      },
    }),
    completedAttemptsByExam(),
  ]);

  // Ảnh riêng của từng Passage/Section: hình đầu tiên trong "Tiêu đề và hình" của editor (content.images[0]).
  // Writing Task 1 có image_path là ảnh biểu đồ thuộc đề bài, nên không dùng làm bìa công khai.
  const sectionImages = new Map<string, string>();
  if (isLr) {
    const imgRows = await prisma.$queryRaw<Array<{ exam_skill_id: string; order_no: number; path: string | null }>>`
      select s.exam_skill_id, s.order_no, s.content -> 'images' -> 0 ->> 'path' as path
      from public.exam_sections s
      join public.exam_skills k on k.id = s.exam_skill_id
      join public.exams e on e.id = k.exam_id
      join public.exam_sets es on es.id = e.exam_set_id
      where k.skill = ${skill} and k.status = 'PUBLISHED' and es.status = 'PUBLISHED'
        and jsonb_typeof(s.content -> 'images') = 'array'
    `;
    for (const r of imgRows) {
      const url = r.path ? publicUrl(r.path) : '';
      if (url) sectionImages.set(`${r.exam_skill_id}:${r.order_no}`, url);
    }
  }

  // Mỗi Section (Listening), Passage (Reading), Task (Writing) hoặc Part (Speaking) là một item.
  const items: PracticeItemDto[] = [];
  for (const row of rows) {
    const form = toForm(row.form);
    for (const sec of row.sections) {
      const cfg = (sec.config && typeof sec.config === 'object' ? sec.config : {}) as Record<string, unknown>;
      const content = (
        'content' in sec && sec.content && typeof sec.content === 'object' ? sec.content : {}
      ) as Record<string, unknown>;

      let label = sec.title;
      let title: string | null = null;
      let essayTypeLabel: WritingEssayType | null = null;
      let topicLabel: string | null = null;
      let minutes: number | null = null;
      let minWords: number | null = null;
      let questionCount: number | null = null;
      const typeSet = new Set<LrQuestionType>();

      if (skill === 'LISTENING' || skill === 'READING') {
        label = `${skill === 'LISTENING' ? 'Section' : 'Passage'} ${sec.order_no}`;
        // Tiêu đề section/passage do admin nhập trong editor; để trống thì frontend dùng nhãn thay thế.
        title = cleanTopic(sec.title);
        questionCount = sec.groups.reduce((sum, g) => sum + g._count.questions, 0);
        for (const g of sec.groups) {
          if (Object.hasOwn(LR_QUESTION_TYPE_NAMES, g.question_type)) typeSet.add(g.question_type as LrQuestionType);
        }
      } else if (skill === 'WRITING') {
        if (sec.order_no === 1 && form) label = `Task 1 ${form === 'ACADEMIC' ? 'Academic' : 'General'}`;
        essayTypeLabel = isWritingEssayType(content.essayType) ? content.essayType : null;
        topicLabel = cleanTopic(content.topic);
        title = topicLabel;
        minutes = numberOrNull(cfg.minutes);
        minWords = numberOrNull(cfg.minWords);
      } else {
        topicLabel = cleanTopic(cfg.topic);
        title = topicLabel;
        minutes = numberOrNull(cfg.speakMinutes);
      }

      items.push({
        key: `${row.id}:${sec.order_no}`,
        examSkillId: row.id,
        examId: row.exam.id,
        examTitle: row.exam.title,
        setName: row.exam.exam_set.name,
        coverUrl: sectionImages.get(`${row.id}:${sec.order_no}`) ?? row.exam.exam_set.cover_url,
        skill,
        form,
        attemptCount: attempts.get(row.exam.id) ?? 0,
        publishedAt: (row.published_at ?? row.exam.exam_set.published_at)?.toISOString() ?? null,
        orderNo: sec.order_no,
        label,
        title,
        essayType: essayTypeLabel,
        topicLabel,
        minutes,
        minWords,
        questionCount,
        questionTypes: QUESTION_TYPE_CODES.filter((c) => typeSet.has(c)),
      });
    }
  }

  const order = new Map(rows.map((r) => [r.exam.id, r.exam.order_no] as const));
  items.sort((a, b) => {
    const t = (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
    return (
      t !== 0
        ? t
        : a.setName.localeCompare(b.setName) || (order.get(a.examId) ?? 0) - (order.get(b.examId) ?? 0) || a.orderNo - b.orderNo
    );
  });

  // Giá trị bộ lọc chỉ gồm những gì có thật trên các item đã đăng.
  const typeCounts = new Map<LrQuestionType, number>();
  const essayCounts = new Map<WritingEssayType, number>();
  const topicCounts = new Map<string, number>();
  for (const it of items) {
    for (const t of it.questionTypes) typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
    if (it.essayType) essayCounts.set(it.essayType, (essayCounts.get(it.essayType) ?? 0) + 1);
    if (it.topicLabel) topicCounts.set(it.topicLabel, (topicCounts.get(it.topicLabel) ?? 0) + 1);
  }
  const availableQuestionTypes: QuestionTypeOption[] = QUESTION_TYPE_CODES.filter((c) => typeCounts.has(c)).map(
    (c) => ({ code: c, name: LR_QUESTION_TYPE_NAMES[c], count: typeCounts.get(c) ?? 0 })
  );
  const availableEssayTypes: EssayTypeOption[] = (Object.keys(WRITING_ESSAY_TYPE_NAMES) as WritingEssayType[])
    .filter((c) => essayCounts.has(c))
    .map((c) => ({ code: c, name: WRITING_ESSAY_TYPE_NAMES[c], count: essayCounts.get(c) ?? 0 }));
  const availableTopics: TopicOption[] = [...topicCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const result = items.filter(
    (it) =>
      (!questionType || it.questionTypes.includes(questionType)) &&
      (!essayType || it.essayType === essayType) &&
      (!topicFilter || it.topicLabel === topicFilter)
  );

  return { items: result, availableQuestionTypes, availableEssayTypes, availableTopics };
}
