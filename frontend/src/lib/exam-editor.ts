import { apiFetch, ApiError } from './api';
import { getAccessToken } from './auth';
import type { ExamSetAdmin } from './exam-admin';
import type { LrContent, LrPatch } from './lr-editor/types';

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
  skill: 'WRITING' | 'SPEAKING' | 'READING' | 'LISTENING';
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
    liveVersion: number | null;
    draftId: string | null;
    draftVersion: number | null;
  };
  writing: WritingContent | null;
  speaking: SpeakingContent | null;
  reading: LrContent | null;
  listening: LrContent | null;
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

export type SpeakingPartQs = {
  kind: 'qs';
  instr: string;
  qs: string[];
};

export type SpeakingPartCue = {
  kind: 'cue';
  prep: string;
  speak: string;
  text: string;
  cue?: string;
};

export type SpeakingPart = SpeakingPartQs | SpeakingPartCue;

export type SpeakingEditorState = {
  title: string;
  tot: string;
  items: [SpeakingPartQs, SpeakingPartCue, SpeakingPartQs];
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
    reading?: LrPatch;
    listening?: LrPatch;
  }
): Promise<EditorSkill> {
  return apiFetch<EditorSkill>(`/admin/exam-skills/${skillId}/content`, {
    method: 'PUT',
    json: input,
  });
}

export function uploadSkillAudio(
  skillId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ path: string; url: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const cleanPath = `/admin/exam-skills/${skillId}/audio`;
    const envObj = (import.meta as { env?: Record<string, string> }).env;
    const base = (envObj?.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
    xhr.open('PUT', `${base}${cleanPath}`);
    xhr.setRequestHeader('Content-Type', file.type || 'audio/mpeg');

    const token = getAccessToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          onProgress(pct);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { path: string; url: string; sizeBytes: number };
          resolve(data);
        } catch {
          reject(new ApiError(xhr.status, 'PARSE_ERROR', 'Phản hồi không hợp lệ từ máy chủ.'));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText) as { code?: string; message?: string; details?: unknown };
          reject(new ApiError(xhr.status, data.code || 'API_ERROR', data.message || 'Lỗi tải tệp âm thanh.', data.details));
        } catch {
          reject(new ApiError(xhr.status, 'API_ERROR', `Lỗi tải tệp âm thanh (${xhr.status}).`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new ApiError(0, 'NETWORK_ERROR', 'Không thể kết nối. Vui lòng thử lại.'));
    };

    xhr.send(file);
  });
}

export async function discardUploads(
  skillId: string,
  paths: string[]
): Promise<{ removed: number }> {
  return apiFetch<{ removed: number }>(`/admin/exam-skills/${skillId}/uploads/discard`, {
    method: 'POST',
    json: { paths },
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
        kind: 'qs',
        instr: sp?.part1?.instruction ?? 'Two or three complex sentences for each answer.',
        qs: sp?.part1?.questions ? [...sp.part1.questions] : [],
      },
      {
        kind: 'cue',
        prep: sp?.part2?.prepMinutes != null ? String(sp.part2.prepMinutes) : '1',
        speak: sp?.part2?.speakMinutes != null ? String(sp.part2.speakMinutes) : '2',
        text: sp?.part2?.cueCard || '',
        cue: sp?.part2?.cueCard || '',
      },
      {
        kind: 'qs',
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

export type SkillHistoryVersion = {
  id: string;
  versionNumber: number;
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';
  createdAt: string;
  createdBy: { id: string; name: string } | null;
  publishedAt: string | null;
  updatedAt: string;
  basedOnVersion: number | null;
  isCurrent: boolean;
};

export type SkillHistoryEvent = {
  at: string;
  action: string;
  version: number | null;
  actor: { name: string } | null;
  summary: string;
};

export type SkillHistoryDto = {
  slot: {
    examId: string;
    skill: string;
    form: string | null;
  };
  versions: SkillHistoryVersion[];
  events: SkillHistoryEvent[];
};

export async function getSkillHistory(skillId: string): Promise<SkillHistoryDto> {
  return apiFetch<SkillHistoryDto>(`/admin/exam-skills/${skillId}/history`);
}

export type TranscriptionJobResult = {
  status: 'processing' | 'done' | 'error';
  paragraphs?: Array<{ label: string; startSec: number; text: string }>;
  message?: string;
};

export async function startTranscription(
  skillId: string,
  orderNo: number,
  audioPath: string
): Promise<{ jobId: string }> {
  return apiFetch<{ jobId: string }>(
    `/admin/exam-skills/${skillId}/sections/${orderNo}/transcribe`,
    {
      method: 'POST',
      json: { audioPath },
    }
  );
}

export async function getTranscriptionJob(
  jobId: string
): Promise<TranscriptionJobResult> {
  return apiFetch<TranscriptionJobResult>(`/admin/transcriptions/${jobId}`);
}



