import type { StudyResult } from '../lib/learner/study-overview';

type ExampleOutcome = 'published' | 'assigned' | 'waiting' | 'cancelled' | 'saved' | 'expired';
export type WritingSpeakingAction = 'Xem kết quả' | 'Tải .docx' | 'Nghe lại' | 'Tải ghi âm' | 'Gửi lại yêu cầu' | 'Gửi yêu cầu chấm';

export type WritingSpeakingExample = Pick<StudyResult, 'id' | 'title' | 'completedAt' | 'band'> & {
  skill: 'WRITING' | 'SPEAKING';
  outcome: ExampleOutcome;
  status: string;
  retention: string;
  unread?: boolean;
  actions?: readonly WritingSpeakingAction[];
};

export const listeningReadingExamples = [
  {
    id: 'sample-lr-01', title: 'Cambridge IELTS 19 · Test 2', completedAt: '2026-11-21T15:20:00+07:00',
    skill: 'LISTENING', form: null, scope: 'FULL_SKILL', band: 8, accuracy: null, correct: 35, total: 40,
  },
  {
    id: 'sample-lr-02', title: 'Cambridge IELTS 18 · Test 3', completedAt: '2026-11-20T20:10:00+07:00',
    skill: 'READING', form: 'ACADEMIC', scope: 'FULL_EXAM', band: 7.5, accuracy: null, correct: 33, total: 40,
  },
  {
    id: 'sample-lr-03', title: 'Map Labelling · Library Tour', completedAt: '2026-11-19T08:10:00+07:00',
    skill: 'LISTENING', form: null, scope: 'QUESTION_GROUP', band: null, accuracy: 80, correct: 8, total: 10,
  },
  {
    id: 'sample-lr-04', title: 'Reading Passage 2 · The history of tea', completedAt: '2026-11-18T19:05:00+07:00',
    skill: 'READING', form: 'GENERAL', scope: 'SECTION', band: null, accuracy: 75, correct: 9, total: 12,
  },
] satisfies StudyResult[];

export const writingSpeakingExamples = [
  {
    id: 'sample-ws-01', title: 'Writing Task 2 · Public transport', completedAt: '2026-11-20T10:05:00+07:00',
    skill: 'WRITING', band: null, outcome: 'published', status: 'Đã có kết quả · 6.5',
    retention: 'Giữ đến 05/12', unread: true, actions: ['Xem kết quả', 'Tải .docx'],
  },
  {
    id: 'sample-ws-02', title: 'Speaking Part 2 · A skill worth learning', completedAt: '2026-11-19T20:30:00+07:00',
    skill: 'SPEAKING', band: null, outcome: 'assigned', status: 'Chờ chấm · phân công 19/11 20:40',
    retention: 'Tạm giữ', actions: ['Nghe lại', 'Tải ghi âm'],
  },
  {
    id: 'sample-ws-03', title: 'Writing Task 1 Academic · Energy use', completedAt: '2026-11-18T08:55:00+07:00',
    skill: 'WRITING', band: null, outcome: 'waiting', status: 'Chờ phân công · còn 21 giờ',
    retention: 'Tạm giữ', actions: ['Tải .docx'],
  },
  {
    id: 'sample-ws-04', title: 'Speaking Part 3 · Technology', completedAt: '2026-11-17T19:40:00+07:00',
    skill: 'SPEAKING', band: null, outcome: 'cancelled', status: 'Đã hủy · đã hoàn 1 bonus',
    retention: 'Hạn ban đầu 01/12', unread: true, actions: ['Gửi lại yêu cầu', 'Tải ghi âm'],
  },
  {
    id: 'sample-ws-05', title: 'Writing Task 2 · Online education', completedAt: '2026-11-16T21:15:00+07:00',
    skill: 'WRITING', band: null, outcome: 'saved', status: 'Đã lưu · chưa gửi chấm',
    retention: 'Giữ đến 30/11', actions: ['Gửi yêu cầu chấm', 'Tải .docx'],
  },
  {
    id: 'sample-ws-06', title: 'Writing Task 1 General · Complaint letter', completedAt: '2026-10-28T09:30:00+07:00',
    skill: 'WRITING', band: null, outcome: 'expired', status: 'Chưa có điểm',
    retention: 'Nội dung đã hết hạn 11/11',
  },
  {
    id: 'sample-ws-07', title: 'Speaking Part 1 · Hometown', completedAt: '2026-11-22T09:20:00+07:00',
    skill: 'SPEAKING', band: null, outcome: 'saved', status: 'Đã lưu · chưa gửi chấm',
    retention: 'Giữ đến 06/12', actions: ['Gửi yêu cầu chấm', 'Nghe lại', 'Tải ghi âm'],
  },
  {
    id: 'sample-ws-08', title: 'Speaking Part 2 · A memorable trip', completedAt: '2026-11-21T21:05:00+07:00',
    skill: 'SPEAKING', band: null, outcome: 'waiting', status: 'Chờ phân công · còn 40 giờ',
    retention: 'Tạm giữ', actions: ['Nghe lại', 'Tải ghi âm'],
  },
  {
    id: 'sample-ws-09', title: 'Speaking Full test · Cambridge 19 Test 1', completedAt: '2026-11-15T18:45:00+07:00',
    skill: 'SPEAKING', band: null, outcome: 'published', status: 'Đã có kết quả · 7.0',
    retention: 'Giữ đến 03/12', actions: ['Xem kết quả', 'Nghe lại', 'Tải ghi âm'],
  },
  {
    id: 'sample-ws-10', title: 'Speaking Part 3 · Education', completedAt: '2026-10-25T20:00:00+07:00',
    skill: 'SPEAKING', band: null, outcome: 'expired', status: 'Nội dung đã hết hạn',
    retention: 'Nội dung đã hết hạn 08/11', actions: ['Nghe lại', 'Tải ghi âm'],
  },
] satisfies WritingSpeakingExample[];

export const gradingCreditExamples = {
  free: { count: 1, expires: 'Hết hạn 00:00 thứ Hai 23/11' },
  bonus: { count: 1, expires: 'Hết hạn hết Chủ nhật 29/11' },
};
