import { apiFetch } from './api';
import type { ExamSetAdmin } from './exam-admin';
export { deleteSkill, publishSkill } from './exam-admin';

export type WritingTask = {
  prompt: string;
  imagePath: string | null;
  imageUrl: string | null;
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
  updatedAt: string; // ISO datetime, gửi lại làm baseUpdatedAt
  publishedAt: string | null;
  exam: {
    id: string;
    title: string;
    orderNo: number;
  };
  set: {
    id: string;
    name: string;
  };
  slot: {
    liveId: string | null;
    liveStatus: 'PUBLISHED' | 'HIDDEN' | null;
    draftId: string | null;
  };
  writing: WritingContent | null;
  speaking: SpeakingContent | null;
};

export type WritingEditorImage = {
  name: string;
  size: string;
  url: string;
  path?: string | null;
};

export type WritingEditorTask = {
  prompt: string;
  img: WritingEditorImage | null;
};

export type WritingEditorState = {
  title: string;
  items: [WritingEditorTask, WritingEditorTask];
};

export type SpeakingEditorState = {
  title: string;
  tot: string;
  items: [
    { instr: string; qs: string[] },
    { prep: string; speak: string; text: string },
    { instr: string; qs: string[] },
  ];
};

// API Functions
export async function getEditorSkill(skillId: string): Promise<EditorSkill> {
  return apiFetch<EditorSkill>(`/admin/exam-skills/${skillId}`);
}

export async function saveSkillContent(
  skillId: string,
  input: {
    baseUpdatedAt: string;
    writing?: WritingContent;
    speaking?: SpeakingContent;
  }
): Promise<EditorSkill> {
  return apiFetch<EditorSkill>(`/admin/exam-skills/${skillId}/content`, {
    method: 'PUT',
    json: input,
  });
}

export async function createRevisionDraft(skillId: string): Promise<EditorSkill> {
  return apiFetch<EditorSkill>(`/admin/exam-skills/${skillId}/draft`, {
    method: 'POST',
  });
}

export async function uploadSkillImage(
  skillId: string,
  file: File
): Promise<{ path: string; url: string }> {
  return apiFetch<{ path: string; url: string }>(
    `/admin/exam-skills/${skillId}/images`,
    {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    }
  );
}

// Converters
export function toWritingEditorState(skill: EditorSkill): WritingEditorState {
  const t1 = skill.writing?.tasks[0];
  const t2 = skill.writing?.tasks[1];

  let img1: WritingEditorImage | null = null;
  if (t1?.imagePath || t1?.imageUrl) {
    const filename = t1.imagePath ? t1.imagePath.split('/').pop() || 'image.png' : 'image.png';
    img1 = {
      name: filename,
      size: '',
      url: t1.imageUrl || '',
      path: t1.imagePath || null,
    };
  }

  return {
    title: skill.exam.title,
    items: [
      {
        prompt: t1?.prompt || '',
        img: img1,
      },
      {
        prompt: t2?.prompt || '',
        img: null,
      },
    ],
  };
}

export function fromWritingEditorState(state: WritingEditorState): WritingContent {
  const t1 = state.items[0];
  const t2 = state.items[1];

  return {
    tasks: [
      {
        prompt: t1?.prompt || '',
        imagePath: t1?.img?.path || (t1?.img?.url && t1.img.url.startsWith('exam-skills/') ? t1.img.url : null),
        imageUrl: t1?.img?.url || null,
      },
      {
        prompt: t2?.prompt || '',
        imagePath: null,
        imageUrl: null,
      },
    ],
  };
}

export function toSpeakingEditorState(skill: EditorSkill): SpeakingEditorState {
  const sp = skill.speaking;
  return {
    title: skill.exam.title,
    tot: sp?.p13Minutes != null ? String(sp.p13Minutes) : '12',
    items: [
      {
        instr: sp?.part1?.instruction ?? 'Two or three complex sentences for each answer.',
        qs: sp?.part1?.questions ? [...sp.part1.questions] : [],
      },
      {
        prep: sp?.part2?.prepMinutes != null ? String(sp.part2.prepMinutes) : '1',
        speak: sp?.part2?.speakMinutes != null ? String(sp.part2.speakMinutes) : '2',
        text: sp?.part2?.cueCard || '',
      },
      {
        instr: sp?.part3?.instruction ?? 'Four or five complex sentences for each answer.',
        qs: sp?.part3?.questions ? [...sp.part3.questions] : [],
      },
    ],
  };
}

export function fromSpeakingEditorState(state: SpeakingEditorState): SpeakingContent {
  const p13 = /^\d+$/.test(String(state.tot || '').trim())
    ? parseInt(state.tot, 10)
    : null;
  const p1 = state.items[0];
  const p2 = state.items[1];
  const p3 = state.items[2];

  const prep = /^\d+$/.test(String(p2?.prep || '').trim())
    ? parseInt(p2.prep, 10)
    : null;
  const speak = /^\d+$/.test(String(p2?.speak || '').trim())
    ? parseInt(p2.speak, 10)
    : null;

  return {
    p13Minutes: p13,
    part1: {
      instruction: p1?.instr || '',
      questions: p1?.qs ? [...p1.qs] : [],
    },
    part2: {
      prepMinutes: prep,
      speakMinutes: speak,
      cueCard: p2?.text || '',
    },
    part3: {
      instruction: p3?.instr || '',
      questions: p3?.qs ? [...p3.qs] : [],
    },
  };
}

