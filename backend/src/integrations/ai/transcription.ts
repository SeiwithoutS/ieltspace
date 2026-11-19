import { env } from '../../config.js';
import { HttpError } from '../../utils/http.js';

export interface TranscriptionSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionParagraph {
  label: string;
  startSec: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  durationSec: number;
  paragraphs: TranscriptionParagraph[];
}

export interface TranscriptionProvider {
  transcribe(audioBuffer: Buffer, filename: string): Promise<TranscriptionResult>;
}

export function formatTimeTag(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return `[${mm}:${ss}]`;
}

export function indexToLabel(index: number): string {
  let label = '';
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

/**
 * Gộp các segments từ Whisper thành các đoạn transcript:
 * - Cắt đoạn mới khi khoảng lặng giữa hai câu >= 1.5 giây hoặc đoạn đã dài quá 30 giây (cắt ở cuối câu).
 * - text = "[mm:ss] ..." với mm:ss là mốc bắt đầu của đoạn.
 * - Nhãn đoạn A, B, C...
 */
export function segmentsToParagraphs(segments: TranscriptionSegment[]): TranscriptionParagraph[] {
  if (!segments || segments.length === 0) return [];

  interface TempGroup {
    startSec: number;
    endSec: number;
    texts: string[];
  }

  const groups: TempGroup[] = [];
  let current: TempGroup | null = null;

  for (const seg of segments) {
    const text = seg.text.trim();
    if (!text) continue;

    if (!current) {
      current = {
        startSec: seg.start,
        endSec: seg.end,
        texts: [text],
      };
      continue;
    }

    const silence = seg.start - current.endSec;
    const duration = seg.end - current.startSec;

    if (silence >= 1.5 || duration > 30) {
      groups.push(current);
      current = {
        startSec: seg.start,
        endSec: seg.end,
        texts: [text],
      };
    } else {
      current.endSec = seg.end;
      current.texts.push(text);
    }
  }

  if (current && current.texts.length > 0) {
    groups.push(current);
  }

  return groups.map((g, idx) => {
    const startSec = Math.max(0, Math.floor(g.startSec));
    const timeTag = formatTimeTag(startSec);
    const body = g.texts.join(' ');
    return {
      label: indexToLabel(idx),
      startSec,
      text: `${timeTag} ${body}`,
    };
  });
}

export class GroqWhisperProvider implements TranscriptionProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.GROQ_API_KEY || '';
  }

  async transcribe(audioBuffer: Buffer, filename: string): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      throw new HttpError(
        503,
        'TRANSCRIBE_UNAVAILABLE',
        'Chưa cấu hình dịch vụ tạo transcript.'
      );
    }

    if (audioBuffer.length > 25 * 1024 * 1024) {
      throw new HttpError(
        413,
        'AUDIO_TOO_LARGE',
        'Ghi âm lớn hơn 25 MB, đổi sang MP3 để tạo transcript.'
      );
    }

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)]);
    formData.append('file', blob, filename || 'audio.mp3');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');
    formData.append('language', 'en');

    let response: Response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new HttpError(502, 'GROQ_API_ERROR', `Không thể kết nối đến dịch vụ Groq: ${msg}`);
    }

    if (!response.ok) {
      let errDetail = '';
      try {
        const errJson = (await response.json()) as { error?: { message?: string } };
        errDetail = errJson.error?.message || '';
      } catch {
        errDetail = await response.text();
      }
      throw new HttpError(
        response.status >= 500 ? 502 : response.status,
        'TRANSCRIBE_FAILED',
        `Tạo transcript thất bại: ${errDetail || response.statusText}`
      );
    }

    const data = (await response.json()) as {
      text?: string;
      duration?: number;
      segments?: Array<{ id?: number; start: number; end: number; text: string }>;
    };

    const segments: TranscriptionSegment[] = (data.segments || []).map((s) => ({
      id: s.id,
      start: typeof s.start === 'number' ? s.start : 0,
      end: typeof s.end === 'number' ? s.end : 0,
      text: typeof s.text === 'string' ? s.text : '',
    }));

    const paragraphs = segmentsToParagraphs(segments);

    return {
      text: data.text || '',
      durationSec: typeof data.duration === 'number' ? data.duration : 0,
      paragraphs,
    };
  }
}

let defaultProvider: TranscriptionProvider | null = null;

export function getTranscriptionProvider(): TranscriptionProvider {
  if (!defaultProvider) {
    defaultProvider = new GroqWhisperProvider();
  }
  return defaultProvider;
}

export function setTranscriptionProvider(provider: TranscriptionProvider | null): void {
  defaultProvider = provider;
}
