import crypto from 'node:crypto';

export type LrQuestionType =
  | 'SENTENCE_COMP'
  | 'SHORT_ANSWER'
  | 'SUMMARY_COMP'
  | 'NOTE_COMP'
  | 'SUMMARY_BOX'
  | 'TABLE_COMP'
  | 'DIAGRAM_COMP'
  | 'MATCH_HEADING'
  | 'MATCH_INFO'
  | 'MATCH_ENDING'
  | 'MATCH_FEATURE'
  | 'MCQ_SINGLE'
  | 'MCQ_MULTI'
  | 'YNNG'
  | 'TFNG';

export const LR_QUESTION_TYPE_NAMES: Record<LrQuestionType, string> = {
  SENTENCE_COMP: 'Sentence Completion',
  SHORT_ANSWER: 'Short Answer',
  SUMMARY_COMP: 'Summary Completion',
  NOTE_COMP: 'Note Completion',
  SUMMARY_BOX: 'Summary Completion (Box)',
  TABLE_COMP: 'Table Completion',
  DIAGRAM_COMP: 'Diagram / Map / Flow-chart Completion',
  MATCH_HEADING: 'Matching Headings',
  MATCH_INFO: 'Matching Information',
  MATCH_ENDING: 'Matching Sentence Endings',
  MATCH_FEATURE: 'Matching Features',
  MCQ_SINGLE: 'MCQ - Single Answer',
  MCQ_MULTI: 'MCQ - Multiple Answers',
  YNNG: 'Yes/No/Not Given',
  TFNG: 'True/False/Not Given',
};

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export type LrAsset = {
  path: string;
  url: string | null;
  name: string;
};

export type LrQuestion = {
  numberFrom: number;
  numberTo: number;
  content: Record<string, any>;
  options: { label: string; text: string }[];
  accepted: string[];
  matching: { kind: 'TEXT' | 'CHOICE' | 'MULTI'; limit?: number | null };
  evidence: { para: number | null; label: string | null; keys: string[] }[];
  notes: string[];
};

export type LrGroup = {
  id: string | null;
  type: LrQuestionType;
  instruction: string;
  title: string | null;
  questionFrom: number | null;
  questionTo: number | null;
  image: LrAsset | null;
  config: Record<string, any>;
  content: Record<string, any>;
  questions: LrQuestion[];
};

export type LrSection = {
  orderNo: number;
  title: string;
  paragraphs: { label: string; text: string; startSec: number | null }[];
  images: (LrAsset & { caption: string })[];
  audio: (LrAsset & { sizeBytes: number; durationSec: number }) | null;
  groups: LrGroup[];
};

export type LrContent = {
  sections: LrSection[];
};

export type WritingTask = {
  prompt: string;
  imagePath: string | null;
  imageUrl?: string | null;
};

export type WritingContent = {
  tasks: WritingTask[];
};

export type SpeakingContent = {
  p13Minutes: number | null;
  part1: {
    instruction: string;
    questions: string[];
  };
  part2: {
    prepMinutes: number | null;
    speakMinutes: number | null;
    cueCard: string;
  };
  part3: {
    instruction: string;
    questions: string[];
  };
};

export type EditorSkill = {
  id: string;
  skill: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
  form: 'ACADEMIC' | 'GENERAL' | null;
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';
  versionNumber: number;
  durationMinutes: number;
  updatedAt: string;
  publishedAt: string | null;
  exam: { id: string; title: string; orderNo: number };
  set: { id: string; name: string };
  slot: {
    liveId: string | null;
    liveStatus: 'PUBLISHED' | 'HIDDEN' | null;
    draftId: string | null;
  };
  writing: WritingContent | null;
  speaking: SpeakingContent | null;
  reading: LrContent | null;
  listening: LrContent | null;
};

export const DEFAULT_WRITING_EMPTY: WritingContent = {
  tasks: [
    { prompt: '', imagePath: null, imageUrl: null },
    { prompt: '', imagePath: null, imageUrl: null },
  ],
};

export const DEFAULT_SPEAKING_EMPTY: SpeakingContent = {
  p13Minutes: 12,
  part1: {
    instruction: 'Two or three complex sentences for each answer.',
    questions: [],
  },
  part2: {
    prepMinutes: 1,
    speakMinutes: 2,
    cueCard: '',
  },
  part3: {
    instruction: 'Four or five complex sentences for each answer.',
    questions: [],
  },
};

export type RawSection = {
  id?: string;
  order_no: number;
  title: string | null;
  section_type: string;
  instruction?: string | null;
  content?: unknown;
  config?: unknown;
  transcript?: unknown;
  image_path?: string | null;
  audio_path?: string | null;
  groups?: Array<{
    id?: string;
    order_no: number;
    question_type: string;
    title?: string | null;
    question_from?: number | null;
    question_to?: number | null;
    instruction?: string | null;
    image_path?: string | null;
    config?: unknown;
    content?: unknown;
    questions?: Array<{
      id?: string;
      order_no: number;
      question_type?: string;
      number_from?: number | null;
      number_to?: number | null;
      answer_count?: number;
      max_score?: number | unknown;
      content?: unknown;
      explanation?: unknown;
      options?: Array<{
        id?: string;
        order_no: number;
        label: string;
        content: string;
      }>;
      answer?: {
        id?: string;
        accepted_answers?: unknown;
        matching_rule?: unknown;
        evidence?: unknown;
      } | null;
    }>;
  }>;
};

export function sectionsToWriting(
  sections: RawSection[],
  getPublicUrl?: (path: string) => string | null
): WritingContent {
  if (!sections || sections.length === 0) {
    return {
      tasks: [
        { prompt: '', imagePath: null, imageUrl: null },
        { prompt: '', imagePath: null, imageUrl: null },
      ],
    };
  }

  const s1 = sections.find((s) => s.order_no === 1);
  const s2 = sections.find((s) => s.order_no === 2);

  const p1 = s1?.content && typeof s1.content === 'object' && 'prompt' in s1.content
    ? String((s1.content as { prompt?: unknown }).prompt || '')
    : '';
  const imgPath1 = s1?.image_path || null;
  const imgUrl1 = imgPath1 && getPublicUrl ? getPublicUrl(imgPath1) : null;

  const p2 = s2?.content && typeof s2.content === 'object' && 'prompt' in s2.content
    ? String((s2.content as { prompt?: unknown }).prompt || '')
    : '';

  return {
    tasks: [
      { prompt: p1, imagePath: imgPath1, imageUrl: imgUrl1 },
      { prompt: p2, imagePath: null, imageUrl: null },
    ],
  };
}

export function writingToRows(content: WritingContent): Array<{
  order_no: number;
  title: string;
  section_type: string;
  content: { prompt: string };
  config: { minutes: number; minWords: number };
  image_path: string | null;
  instruction: null;
}> {
  const t1 = content.tasks[0] || { prompt: '', imagePath: null };
  const t2 = content.tasks[1] || { prompt: '', imagePath: null };

  return [
    {
      order_no: 1,
      title: 'Task 1',
      section_type: 'TASK',
      content: { prompt: t1.prompt || '' },
      config: { minutes: 20, minWords: 150 },
      image_path: t1.imagePath || null,
      instruction: null,
    },
    {
      order_no: 2,
      title: 'Task 2',
      section_type: 'TASK',
      content: { prompt: t2.prompt || '' },
      config: { minutes: 40, minWords: 250 },
      image_path: null,
      instruction: null,
    },
  ];
}

export function sectionsToSpeaking(sections: RawSection[]): SpeakingContent {
  if (!sections || sections.length === 0) {
    return {
      p13Minutes: DEFAULT_SPEAKING_EMPTY.p13Minutes,
      part1: { ...DEFAULT_SPEAKING_EMPTY.part1, questions: [] },
      part2: { ...DEFAULT_SPEAKING_EMPTY.part2 },
      part3: { ...DEFAULT_SPEAKING_EMPTY.part3, questions: [] },
    };
  }

  const s1 = sections.find((s) => s.order_no === 1);
  const s2 = sections.find((s) => s.order_no === 2);
  const s3 = sections.find((s) => s.order_no === 3);

  // Part 1
  let p13 = DEFAULT_SPEAKING_EMPTY.p13Minutes;
  if (s1?.config && typeof s1.config === 'object' && 'p13Minutes' in s1.config) {
    const rawP13 = (s1.config as { p13Minutes?: unknown }).p13Minutes;
    p13 = typeof rawP13 === 'number' ? rawP13 : null;
  }

  const p1Instruction = s1?.instruction != null ? s1.instruction : DEFAULT_SPEAKING_EMPTY.part1.instruction;
  const p1Questions: string[] = [];
  if (s1?.groups && s1.groups.length > 0) {
    const g1 = s1.groups[0];
    const qs = [...(g1.questions || [])].sort((a, b) => a.order_no - b.order_no);
    for (const q of qs) {
      if (q.content && typeof q.content === 'object' && 'text' in q.content) {
        p1Questions.push(String((q.content as { text?: unknown }).text ?? ''));
      } else {
        p1Questions.push('');
      }
    }
  }

  // Part 2
  let prep = DEFAULT_SPEAKING_EMPTY.part2.prepMinutes;
  let speak = DEFAULT_SPEAKING_EMPTY.part2.speakMinutes;
  let cueCard = '';
  if (s2?.config && typeof s2.config === 'object') {
    const cfg = s2.config as { prepMinutes?: unknown; speakMinutes?: unknown };
    if ('prepMinutes' in cfg) prep = typeof cfg.prepMinutes === 'number' ? cfg.prepMinutes : null;
    if ('speakMinutes' in cfg) speak = typeof cfg.speakMinutes === 'number' ? cfg.speakMinutes : null;
  }
  if (s2?.content && typeof s2.content === 'object' && 'cueCard' in s2.content) {
    cueCard = String((s2.content as { cueCard?: unknown }).cueCard ?? '');
  }

  // Part 3
  const p3Instruction = s3?.instruction != null ? s3.instruction : DEFAULT_SPEAKING_EMPTY.part3.instruction;
  const p3Questions: string[] = [];
  if (s3?.groups && s3.groups.length > 0) {
    const g3 = s3.groups[0];
    const qs = [...(g3.questions || [])].sort((a, b) => a.order_no - b.order_no);
    for (const q of qs) {
      if (q.content && typeof q.content === 'object' && 'text' in q.content) {
        p3Questions.push(String((q.content as { text?: unknown }).text ?? ''));
      } else {
        p3Questions.push('');
      }
    }
  }

  return {
    p13Minutes: p13,
    part1: {
      instruction: p1Instruction,
      questions: p1Questions,
    },
    part2: {
      prepMinutes: prep,
      speakMinutes: speak,
      cueCard,
    },
    part3: {
      instruction: p3Instruction,
      questions: p3Questions,
    },
  };
}

export function speakingToRows(content: SpeakingContent): Array<{
  order_no: number;
  title: string;
  section_type: string;
  instruction: string | null;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
  groups: Array<{
    order_no: number;
    question_type: string;
    questions: Array<{
      order_no: number;
      question_type: string;
      content: { text: string };
    }>;
  }>;
}> {
  return [
    {
      order_no: 1,
      title: 'Part 1',
      section_type: 'PART',
      instruction: content.part1.instruction ?? null,
      content: {},
      config: { p13Minutes: content.p13Minutes },
      groups: [
        {
          order_no: 1,
          question_type: 'SPEAKING_QUESTION',
          questions: (content.part1.questions || []).map((text, idx) => ({
            order_no: idx + 1,
            question_type: 'SPEAKING_QUESTION',
            content: { text },
          })),
        },
      ],
    },
    {
      order_no: 2,
      title: 'Part 2',
      section_type: 'PART',
      instruction: null,
      content: { cueCard: content.part2.cueCard || '' },
      config: {
        prepMinutes: content.part2.prepMinutes,
        speakMinutes: content.part2.speakMinutes,
      },
      groups: [],
    },
    {
      order_no: 3,
      title: 'Part 3',
      section_type: 'PART',
      instruction: content.part3.instruction ?? null,
      content: {},
      config: {},
      groups: [
        {
          order_no: 1,
          question_type: 'SPEAKING_QUESTION',
          questions: (content.part3.questions || []).map((text, idx) => ({
            order_no: idx + 1,
            question_type: 'SPEAKING_QUESTION',
            content: { text },
          })),
        },
      ],
    },
  ];
}

export function emptyLrContent(skill: 'READING' | 'LISTENING'): LrContent {
  if (skill === 'READING') {
    return {
      sections: [1, 2, 3].map((orderNo) => ({
        orderNo,
        title: '',
        paragraphs: [
          { label: 'A', text: '', startSec: null },
          { label: 'B', text: '', startSec: null },
          { label: 'C', text: '', startSec: null },
        ],
        images: [],
        audio: null,
        groups: [],
      })),
    };
  }

  return {
    sections: [1, 2, 3, 4].map((orderNo) => ({
      orderNo,
      title: '',
      paragraphs: [],
      images: [],
      audio: null,
      groups: [],
    })),
  };
}

export function sectionsToLr(
  sections: RawSection[],
  skill: 'READING' | 'LISTENING',
  getPublicUrl?: (path: string) => string | null
): LrContent {
  const sectionCount = skill === 'READING' ? 3 : 4;
  const resultSections: LrSection[] = [];

  for (let i = 1; i <= sectionCount; i++) {
    const raw = sections.find((s) => s.order_no === i);
    if (!raw) {
      if (skill === 'READING') {
        resultSections.push({
          orderNo: i,
          title: '',
          paragraphs: [
            { label: 'A', text: '', startSec: null },
            { label: 'B', text: '', startSec: null },
            { label: 'C', text: '', startSec: null },
          ],
          images: [],
          audio: null,
          groups: [],
        });
      } else {
        resultSections.push({
          orderNo: i,
          title: '',
          paragraphs: [],
          images: [],
          audio: null,
          groups: [],
        });
      }
      continue;
    }

    // Title
    const title = raw.title || '';

    // Paragraphs
    let paragraphs: { label: string; text: string; startSec: number | null }[] = [];
    if (skill === 'READING') {
      const contentObj = raw.content && typeof raw.content === 'object' ? (raw.content as Record<string, any>) : {};
      if (Array.isArray(contentObj.paragraphs)) {
        paragraphs = contentObj.paragraphs.map((p: any) => ({
          label: String(p.label || ''),
          text: String(p.text || ''),
          startSec: null,
        }));
      } else {
        paragraphs = [
          { label: 'A', text: '', startSec: null },
          { label: 'B', text: '', startSec: null },
          { label: 'C', text: '', startSec: null },
        ];
      }
    } else {
      // LISTENING: transcript is array of { label, text, startSec }
      if (Array.isArray(raw.transcript)) {
        paragraphs = (raw.transcript as any[]).map((t: any) => {
          const text = String(t.text || '');
          let startSec = typeof t.startSec === 'number' ? t.startSec : null;
          if (startSec === null) {
            const m = text.match(/^\s*\[(\d{1,2}):(\d{2})\]/);
            if (m) {
              startSec = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
            }
          }
          return {
            label: String(t.label || ''),
            text,
            startSec,
          };
        });
      }
    }

    // Images
    const contentObj = raw.content && typeof raw.content === 'object' ? (raw.content as Record<string, any>) : {};
    let images: (LrAsset & { caption: string })[] = [];
    if (Array.isArray(contentObj.images)) {
      images = contentObj.images.map((img: any) => {
        const path = String(img.path || '');
        return {
          path,
          name: String(img.name || ''),
          caption: String(img.caption || ''),
          url: getPublicUrl && path ? getPublicUrl(path) : null,
        };
      });
    }

    // Audio (Listening only)
    let audio: (LrAsset & { sizeBytes: number; durationSec: number }) | null = null;
    if (skill === 'LISTENING' && raw.audio_path) {
      const configObj = raw.config && typeof raw.config === 'object' ? (raw.config as Record<string, any>) : {};
      const audioCfg = configObj.audio && typeof configObj.audio === 'object' ? configObj.audio : {};
      audio = {
        path: raw.audio_path,
        name: String(audioCfg.name || 'audio.mp3'),
        sizeBytes: Number(audioCfg.sizeBytes) || 0,
        durationSec: Number(audioCfg.durationSec) || 0,
        url: getPublicUrl ? getPublicUrl(raw.audio_path) : null,
      };
    }

    // Groups
    const rawGroups = (raw.groups || []).slice().sort((a, b) => a.order_no - b.order_no);
    const groups: LrGroup[] = rawGroups.map((g) => {
      const grpConfig = g.config && typeof g.config === 'object' ? { ...(g.config as Record<string, any>) } : {};
      const grpContent = g.content && typeof g.content === 'object' ? (g.content as Record<string, any>) : {};
      let image: LrAsset | null = null;
      if (g.image_path) {
        image = {
          path: g.image_path,
          name: String(grpConfig.imageName || 'image.png'),
          url: getPublicUrl ? getPublicUrl(g.image_path) : null,
        };
        delete grpConfig.imageName;
      }

      const rawQuestions = (g.questions || []).slice().sort((a, b) => a.order_no - b.order_no);
      const questions: LrQuestion[] = rawQuestions.map((q) => {
        const qContent = q.content && typeof q.content === 'object' ? (q.content as Record<string, any>) : {};
        const opts = (q.options || []).slice().sort((a, b) => a.order_no - b.order_no).map((o) => ({
          label: o.label,
          text: o.content,
        }));

        let accepted: string[] = [];
        let matching: { kind: 'TEXT' | 'CHOICE' | 'MULTI'; limit?: number | null } = { kind: 'TEXT' };
        let evidence: { para: number | null; label: string | null; keys: string[] }[] = [];

        if (q.answer && typeof q.answer === 'object') {
          const ansObj = q.answer as any;
          if (Array.isArray(ansObj.accepted_answers)) {
            accepted = ansObj.accepted_answers.map((x: any) => String(x ?? ''));
          }
          if (ansObj.matching_rule && typeof ansObj.matching_rule === 'object') {
            matching = ansObj.matching_rule;
          }
          if (ansObj.evidence && typeof ansObj.evidence === 'object' && Array.isArray(ansObj.evidence.items)) {
            evidence = ansObj.evidence.items.map((ev: any) => ({
              para: typeof ev.para === 'number' ? ev.para : null,
              label: ev.label != null ? String(ev.label) : null,
              keys: Array.isArray(ev.keys) ? ev.keys.map(String) : [],
            }));
          }
        }

        let notes: string[] = [];
        if (q.explanation && typeof q.explanation === 'object') {
          const expObj = q.explanation as any;
          if (Array.isArray(expObj.items)) {
            notes = expObj.items.map((it: any) => String(it.note || '')).filter(Boolean);
          }
        }

        return {
          numberFrom: q.number_from ?? 0,
          numberTo: q.number_to ?? q.number_from ?? 0,
          content: qContent,
          options: opts,
          accepted,
          matching,
          evidence,
          notes,
        };
      });

      return {
        id: g.id || null,
        type: g.question_type as LrQuestionType,
        instruction: g.instruction || '',
        title: g.title ?? null,
        questionFrom: g.question_from ?? null,
        questionTo: g.question_to ?? null,
        image,
        config: grpConfig,
        content: grpContent,
        questions,
      };
    });

    resultSections.push({
      orderNo: i,
      title,
      paragraphs,
      images,
      audio,
      groups,
    });
  }

  return { sections: resultSections };
}

export type LrDbRows = {
  sections: Array<{
    id: string;
    exam_skill_id: string;
    order_no: number;
    title: string;
    section_type: string;
    instruction: null;
    content: Record<string, unknown>;
    transcript: unknown;
    config: Record<string, unknown>;
    image_path: string | null;
    audio_path: string | null;
  }>;
  groups: Array<{
    id: string;
    section_id: string;
    order_no: number;
    question_type: string;
    question_from: number | null;
    question_to: number | null;
    instruction: string | null;
    title: string | null;
    image_path: string | null;
    config: Record<string, unknown>;
    content: Record<string, unknown>;
  }>;
  questions: Array<{
    id: string;
    question_group_id: string;
    order_no: number;
    question_type: string;
    number_from: number;
    number_to: number;
    answer_count: number;
    max_score: number;
    content: Record<string, unknown>;
    explanation: Record<string, unknown>;
  }>;
  options: Array<{
    id: string;
    question_id: string;
    order_no: number;
    label: string;
    content: string;
  }>;
  answers: Array<{
    id: string;
    question_id: string;
    accepted_answers: string[];
    matching_rule: Record<string, unknown>;
    evidence: Record<string, unknown>;
  }>;
};

export function lrToRows(
  content: LrContent,
  skill: 'READING' | 'LISTENING',
  skillId: string
): LrDbRows {
  const sections: LrDbRows['sections'] = [];
  const groups: LrDbRows['groups'] = [];
  const questions: LrDbRows['questions'] = [];
  const options: LrDbRows['options'] = [];
  const answers: LrDbRows['answers'] = [];

  const inputSections = (content.sections || []).slice().sort((a, b) => a.orderNo - b.orderNo);

  for (const sec of inputSections) {
    const secId = crypto.randomUUID();
    const sectionType = skill === 'READING' ? 'PASSAGE' : 'SECTION';

    let secContent: Record<string, unknown> = {};
    let transcript: unknown = [];
    let audioPath: string | null = null;
    let secConfig: Record<string, unknown> = {};

    if (skill === 'READING') {
      secContent = {
        paragraphs: (sec.paragraphs || []).map((p) => ({ label: p.label, text: p.text })),
        images: (sec.images || []).map((img) => ({ path: img.path, caption: img.caption, name: img.name })),
      };
      transcript = [];
      audioPath = null;
      secConfig = {};
    } else {
      secContent = {
        images: (sec.images || []).map((img) => ({ path: img.path, caption: img.caption, name: img.name })),
      };
      transcript = (sec.paragraphs || []).map((p) => ({
        label: p.label,
        text: p.text,
        startSec: p.startSec,
      }));
      audioPath = sec.audio?.path || null;
      secConfig = sec.audio
        ? {
            audio: {
              name: sec.audio.name,
              sizeBytes: sec.audio.sizeBytes,
              durationSec: sec.audio.durationSec,
            },
          }
        : {};
    }

    sections.push({
      id: secId,
      exam_skill_id: skillId,
      order_no: sec.orderNo,
      title: sec.title || '',
      section_type: sectionType,
      instruction: null,
      content: secContent,
      transcript,
      config: secConfig,
      image_path: null,
      audio_path: audioPath,
    });

    const secGroups = (sec.groups || []).slice().sort((a, b) => (a.questionFrom ?? 0) - (b.questionFrom ?? 0));
    for (let gIdx = 0; gIdx < secGroups.length; gIdx++) {
      const g = secGroups[gIdx];
      const grpId = g.id || crypto.randomUUID();
      const grpConfig = {
        ...g.config,
        ...(g.image?.name ? { imageName: g.image.name } : {}),
      };

      groups.push({
        id: grpId,
        section_id: secId,
        order_no: gIdx + 1,
        question_type: g.type,
        question_from: g.questionFrom,
        question_to: g.questionTo,
        instruction: g.instruction || null,
        title: g.title ?? null,
        image_path: g.image?.path || null,
        config: grpConfig,
        content: g.content || {},
      });

      const grpQuestions = (g.questions || []).slice().sort((a, b) => a.numberFrom - b.numberFrom);
      for (let qIdx = 0; qIdx < grpQuestions.length; qIdx++) {
        const q = grpQuestions[qIdx];
        const qId = crypto.randomUUID();
        const numCount = Math.max(1, q.numberTo - q.numberFrom + 1);

        questions.push({
          id: qId,
          question_group_id: grpId,
          order_no: qIdx + 1,
          question_type: g.type,
          number_from: q.numberFrom,
          number_to: q.numberTo,
          answer_count: numCount,
          max_score: numCount,
          content: q.content || {},
          explanation: {
            items: (q.notes || []).map((note) => ({ note })),
          },
        });

        // Options
        const qOpts = q.options || [];
        for (let optIdx = 0; optIdx < qOpts.length; optIdx++) {
          const opt = qOpts[optIdx];
          options.push({
            id: crypto.randomUUID(),
            question_id: qId,
            order_no: optIdx + 1,
            label: opt.label,
            content: opt.text,
          });
        }

        // Answer
        answers.push({
          id: crypto.randomUUID(),
          question_id: qId,
          accepted_answers: q.accepted || [],
          matching_rule: q.matching || { kind: 'TEXT' },
          evidence: {
            items: (q.evidence || []).map((ev) => ({
              para: ev.para,
              label: ev.label,
              keys: ev.keys || [],
            })),
          },
        });
      }
    }
  }

  return { sections, groups, questions, options, answers };
}

