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
  skill: 'WRITING' | 'SPEAKING';
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
  image_path?: string | null;
  audio_path?: string | null;
  groups?: Array<{
    id?: string;
    order_no: number;
    question_type: string;
    questions?: Array<{
      id?: string;
      order_no: number;
      question_type?: string;
      content?: unknown;
      answer?: unknown;
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

