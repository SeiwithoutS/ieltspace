import { apiFetch } from '../shared/api';
import { getAuthUser, navigate } from '../auth/auth';
import { canTakeTest } from '../shared/device';

// Lớp lấy dữ liệu cho các trang thư viện đề công khai (FullTests, PracticeHub, PracticeListening/Reading/Writing/Speaking).
// Chỉ có metadata, không có đáp án.

export type CatalogForm = 'ACADEMIC' | 'GENERAL';

export type CatalogSet = {
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

// Một item = một Section (Listening), Passage (Reading), Task (Writing) hoặc Part (Speaking).
export type PracticeItem = {
  key: string;
  examSkillId: string;
  examId: string;
  examTitle: string;
  setName: string;
  coverUrl: string | null;
  skill: PracticeSkill;
  form: CatalogForm | null;
  attemptCount: number;
  publishedAt: string | null;
  orderNo: number;
  label: string;
  title: string | null;
  essayType: string | null;
  topicLabel: string | null;
  minutes: number | null;
  minWords: number | null;
  questionCount: number | null;
  questionTypes: string[];
};

export type QuestionTypeOption = { code: string; name: string; count: number };
export type EssayTypeFilterOption = { code: string; name: string; count: number };
export type TopicOption = { name: string; count: number };

export async function getCatalogSets(): Promise<CatalogSet[]> {
  const res = await apiFetch<{ items: CatalogSet[] }>('/exam-sets', { auth: false });
  return res.items;
}

export async function getPracticeCatalog(
  skill: PracticeSkill
): Promise<{
  items: PracticeItem[];
  availableQuestionTypes: QuestionTypeOption[];
  availableEssayTypes: EssayTypeFilterOption[];
  availableTopics: TopicOption[];
}> {
  return apiFetch(`/exam-sets/practice-items?skill=${skill}`, { auth: false });
}

export async function getPracticeItems(skill: PracticeSkill): Promise<PracticeItem[]> {
  return (await getPracticeCatalog(skill)).items;
}

const COVER_FALLBACKS = ['#BFD8F7', '#C5CEF5', '#F7C4B6', '#C5DECE'];

// Bìa: ảnh tải lên thì dùng ảnh; bìa preset hoặc chưa có thì dùng màu nền của thẻ.
export function coverStyle(coverUrl: string | null, index: number): string {
  if (coverUrl && !coverUrl.startsWith('preset:')) {
    const safe = coverUrl.replace(/['()\s;]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
    return `url('${safe}') center / contain no-repeat, #E9E4DA`;
  }
  const preset = coverUrl ? parseInt(coverUrl.slice(7), 10) : NaN;
  const i = Number.isNaN(preset) ? index : preset;
  return COVER_FALLBACKS[Math.abs(i) % COVER_FALLBACKS.length];
}

// 12480 -> "12K", 9800 -> "9,8K"; dưới 1000 giữ nguyên số.
export function fmtCount(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  const s = k >= 10 ? String(Math.round(k)) : String(Math.round(k * 10) / 10).replace('.', ',');
  return s + 'K';
}

// Giống ExamDetail: chưa đăng nhập thì sang Đăng nhập, màn hình nhỏ thì chặn.
// Trả về false nếu không đủ điều kiện làm bài (để trang hiện hộp thoại).
export function startExam(
  page: 'ListeningTest' | 'ReadingTest' | 'WritingTest' | 'SpeakingTest',
  examId: string,
  section?: number
): boolean {
  if (!getAuthUser()) {
    navigate('Login');
    return true;
  }
  if (!canTakeTest()) return false;
  navigate(`${page}?examId=${examId}${section ? `&section=${section}` : ''}`);
  return true;
}

// Reading/Writing có hai bản Academic và General nên cần nhãn để phân biệt.
export function formLabel(form: CatalogForm | null): string {
  return form === 'ACADEMIC' ? 'Academic' : form === 'GENERAL' ? 'General Training' : '';
}

// Tiêu đề thẻ = chủ đề của section/passage/task/part. Admin chưa nhập thì dùng nhãn thay thế "<Nhãn> · <bộ đề> <Test>".
export function itemTitle(it: PracticeItem): string {
  return it.title || `${it.label} · ${it.setName} ${it.examTitle}`;
}

// Hai thẻ trùng tiêu đề thì thêm hậu tố phân biệt: loại đề (Academic/General Training), nếu vẫn trùng
// thì thêm "<bộ đề> <Test>", cuối cùng thêm nhãn Section/Passage/Task/Part.
export function titleMap(items: PracticeItem[]): Map<string, string> {
  const cur = new Map<string, string>(items.map((it) => [it.key, itemTitle(it)] as const));
  const dups = () => {
    const count = new Map<string, number>();
    for (const t of cur.values()) count.set(t.toLowerCase(), (count.get(t.toLowerCase()) ?? 0) + 1);
    return (it: PracticeItem) => (count.get((cur.get(it.key) ?? '').toLowerCase()) ?? 0) > 1;
  };
  const steps: Array<(it: PracticeItem, t: string) => string> = [
    (it, t) => (formLabel(it.form) ? `${t} - ${formLabel(it.form)}` : t),
    (it, t) => (it.title ? `${t} · ${it.setName} ${it.examTitle}` : t),
    (it, t) => (it.title ? `${t} · ${it.label}` : t),
  ];
  for (const step of steps) {
    const isDup = dups();
    for (const it of items) {
      if (isDup(it)) cur.set(it.key, step(it, cur.get(it.key) ?? ''));
    }
  }
  return cur;
}

const SKILL_NAME: Record<PracticeSkill, string> = {
  LISTENING: 'Listening',
  READING: 'Reading',
  WRITING: 'Writing',
  SPEAKING: 'Speaking',
};

export type LatestTest = {
  key: string;
  examId: string;
  examSkillId: string;
  skill: PracticeSkill;
  title: string;
  attemptCount: number;
  questionCount: number;
  publishedAt: string;
};

// Tiêu đề bài test cả kỹ năng: "<tên bộ đề> <tên Test> - <Kỹ năng>"; Reading/Writing thêm loại đề để phân biệt.
export function testTitle(
  it: { setName: string; examTitle: string; skill: PracticeSkill; form: CatalogForm | null }
): string {
  const f = (it.skill === 'READING' || it.skill === 'WRITING') && it.form ? ` - ${formLabel(it.form)}` : '';
  return `${it.setName} ${it.examTitle} - ${SKILL_NAME[it.skill]}${f}`;
}

// Bài test mới nhất (Listening/Reading cả bài), số câu cộng từ các section; bỏ những bài trong `exclude`.
export function latestTests(items: PracticeItem[], limit = 6, exclude: Set<string> = new Set()): LatestTest[] {
  const bySkill = new Map<string, LatestTest>();
  for (const it of items) {
    if (it.skill !== 'LISTENING' && it.skill !== 'READING') continue;
    if (exclude.has(it.examSkillId)) continue;
    const cur = bySkill.get(it.examSkillId);
    if (cur) {
      cur.questionCount += it.questionCount ?? 0;
    } else {
      bySkill.set(it.examSkillId, {
        key: it.examSkillId,
        examId: it.examId,
        examSkillId: it.examSkillId,
        skill: it.skill,
        title: testTitle(it),
        attemptCount: it.attemptCount,
        questionCount: it.questionCount ?? 0,
        publishedAt: it.publishedAt ?? '',
      });
    }
  }
  return [...bySkill.values()].sort((x, y) => y.publishedAt.localeCompare(x.publishedAt)).slice(0, limit);
}

export type InProgressAttempt = {
  skillAttemptId: string;
  examId: string;
  examSkillId: string;
  skill: 'LISTENING' | 'READING';
  form: CatalogForm | null;
  examTitle: string;
  setName: string;
  sectionOrderNo: number | null;
  answered: number;
  total: number;
  startedAt: string;
};

// Bài đang làm dở của chính người học (cần đăng nhập). Chỉ số câu đã trả lời, không có đáp án.
export async function getInProgress(): Promise<InProgressAttempt[]> {
  const res = await apiFetch<{ items: InProgressAttempt[] }>('/learner/in-progress');
  return res.items;
}

export function skillPage(skill: PracticeSkill): 'ListeningTest' | 'ReadingTest' | 'WritingTest' | 'SpeakingTest' {
  return skill === 'LISTENING'
    ? 'ListeningTest'
    : skill === 'READING'
      ? 'ReadingTest'
      : skill === 'WRITING'
        ? 'WritingTest'
        : 'SpeakingTest';
}
