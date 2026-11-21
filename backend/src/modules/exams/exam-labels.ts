// Nhãn "dạng đề" của Writing (theo bộ lọc "Dạng đề bài" trên canvas thư viện đề).
// Chỉ là metadata gắn tuỳ chọn cho từng Task; đề cũ chưa gắn thì không có nhãn.

export const WRITING_ESSAY_TYPE_NAMES = {
  // Task 1 Academic
  LINE_GRAPH: 'Line graph',
  BAR_CHART: 'Bar chart',
  PIE_CHART: 'Pie chart',
  TABLE: 'Table',
  MAP: 'Map',
  PROCESS: 'Process',
  // Task 1 General (thư)
  LETTER_JOB_APPLICATION: 'Thư xin việc',
  LETTER_COMPLAINT: 'Thư khiếu nại',
  LETTER_INQUIRY: 'Thư hỏi thông tin',
  LETTER_ADVICE: 'Thư xin lời khuyên',
  LETTER_THANKS: 'Thư cảm ơn',
  // Task 2
  AGREE_DISAGREE: 'Agree & disagree',
  DISCUSS_BOTH_VIEWS: 'Discuss both views',
  ADVANTAGES_DISADVANTAGES: 'Advantages & Disadvantages',
  TWO_PART: 'Two-part questions',
  PROBLEMS_SOLUTIONS: 'Problems, causes, solutions',
} as const;

export type WritingEssayType = keyof typeof WRITING_ESSAY_TYPE_NAMES;

export const WRITING_ESSAY_TYPE_CODES = Object.keys(WRITING_ESSAY_TYPE_NAMES) as [
  WritingEssayType,
  ...WritingEssayType[],
];

// Dạng đề hợp lệ theo Task và form: Task 1 Academic (biểu đồ), Task 1 General (thư), Task 2 (luận).
export const TASK1_ACADEMIC_ESSAY_TYPES: WritingEssayType[] = ['LINE_GRAPH', 'BAR_CHART', 'PIE_CHART', 'TABLE', 'MAP', 'PROCESS'];
export const TASK1_GENERAL_ESSAY_TYPES: WritingEssayType[] = [
  'LETTER_JOB_APPLICATION', 'LETTER_COMPLAINT', 'LETTER_INQUIRY', 'LETTER_ADVICE', 'LETTER_THANKS',
];
export const TASK1_ESSAY_TYPES: WritingEssayType[] = [...TASK1_ACADEMIC_ESSAY_TYPES, ...TASK1_GENERAL_ESSAY_TYPES];
export const TASK2_ESSAY_TYPES: WritingEssayType[] = [
  'AGREE_DISAGREE', 'DISCUSS_BOTH_VIEWS', 'ADVANTAGES_DISADVANTAGES', 'TWO_PART', 'PROBLEMS_SOLUTIONS',
];

export function isWritingEssayType(value: unknown): value is WritingEssayType {
  return typeof value === 'string' && Object.hasOwn(WRITING_ESSAY_TYPE_NAMES, value);
}

export const TOPIC_MAX_LENGTH = 60;

export function cleanTopic(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t.length > 0 ? t.slice(0, TOPIC_MAX_LENGTH) : null;
}
