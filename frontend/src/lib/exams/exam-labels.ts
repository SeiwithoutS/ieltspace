// Nhãn "dạng đề" Writing để admin gắn cho từng Task. Phải khớp backend (exam-labels.ts).

export type EssayTypeOption = { code: string; name: string };

const T1_ACADEMIC: EssayTypeOption[] = [
  { code: 'LINE_GRAPH', name: 'Line graph' },
  { code: 'BAR_CHART', name: 'Bar chart' },
  { code: 'PIE_CHART', name: 'Pie chart' },
  { code: 'TABLE', name: 'Table' },
  { code: 'MAP', name: 'Map' },
  { code: 'PROCESS', name: 'Process' },
];

const T1_GENERAL: EssayTypeOption[] = [
  { code: 'LETTER_JOB_APPLICATION', name: 'Thư xin việc' },
  { code: 'LETTER_COMPLAINT', name: 'Thư khiếu nại' },
  { code: 'LETTER_INQUIRY', name: 'Thư hỏi thông tin' },
  { code: 'LETTER_ADVICE', name: 'Thư xin lời khuyên' },
  { code: 'LETTER_THANKS', name: 'Thư cảm ơn' },
];

const T2: EssayTypeOption[] = [
  { code: 'AGREE_DISAGREE', name: 'Agree & disagree' },
  { code: 'DISCUSS_BOTH_VIEWS', name: 'Discuss both views' },
  { code: 'ADVANTAGES_DISADVANTAGES', name: 'Advantages & Disadvantages' },
  { code: 'TWO_PART', name: 'Two-part questions' },
  { code: 'PROBLEMS_SOLUTIONS', name: 'Problems, causes, solutions' },
];

export const TOPIC_MAX_LENGTH = 60;

export function essayTypeOptions(task: 1 | 2, general: boolean): EssayTypeOption[] {
  return task === 2 ? T2 : general ? T1_GENERAL : T1_ACADEMIC;
}
