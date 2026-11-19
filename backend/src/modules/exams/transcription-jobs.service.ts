import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config.js';
import { HttpError } from '../../utils/http.js';
import { downloadObject } from '../../integrations/storage/supabase-storage.js';
import {
  getTranscriptionProvider,
  type TranscriptionParagraph,
} from '../../integrations/ai/transcription.js';

export interface TranscriptionJob {
  id: string;
  actorId: string;
  skillId: string;
  orderNo: number;
  status: 'processing' | 'done' | 'error';
  createdAt: number;
  paragraphs?: TranscriptionParagraph[];
  error?: string;
}

const jobsMap = new Map<string, TranscriptionJob>();

function cleanupOldJobs(): void {
  const oneHourAgo = Date.now() - 3600 * 1000;
  for (const [id, job] of jobsMap.entries()) {
    if (job.createdAt < oneHourAgo) {
      jobsMap.delete(id);
    }
  }
}

export async function startTranscriptionJob(params: {
  actorId: string;
  skillId: string;
  orderNo: number;
  audioPath: string;
}): Promise<{ jobId: string }> {
  cleanupOldJobs();

  if (!env.GROQ_API_KEY) {
    throw new HttpError(
      503,
      'TRANSCRIBE_UNAVAILABLE',
      'Chưa cấu hình dịch vụ tạo transcript.'
    );
  }

  const skill = await prisma.exam_skills.findUnique({
    where: { id: params.skillId },
    select: {
      id: true,
      skill: true,
      status: true,
    },
  });

  if (!skill) {
    throw new HttpError(404, 'SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
  }

  if (skill.skill !== 'LISTENING') {
    throw new HttpError(
      400,
      'SKILL_NOT_SUPPORTED',
      'Chức năng tạo transcript chỉ hỗ trợ kỹ năng Listening.'
    );
  }

  if (skill.status !== 'DRAFT') {
    throw new HttpError(
      409,
      'SKILL_NOT_DRAFT',
      'Chỉ tạo transcript cho bản đang soạn (DRAFT).'
    );
  }

  // LR-05: Kiểm tra đường dẫn tệp âm thanh thuộc về skill này
  // Bản nháp tạo từ phiên bản đã đăng có thể còn trỏ tới tệp ghi âm của kỹ năng cũ:
  // chấp nhận khi đường dẫn đúng là tệp đã lưu trong chính section này.
  const expectedPrefix = `exam-skills/${params.skillId}/audio/`;
  if (!params.audioPath.startsWith(expectedPrefix)) {
    const saved = await prisma.exam_sections.findFirst({
      where: {
        exam_skill_id: params.skillId,
        order_no: params.orderNo,
        audio_path: params.audioPath,
      },
      select: { id: true },
    });
    if (!saved) {
      throw new HttpError(
        400,
        'INVALID_AUDIO_PATH',
        'Đường dẫn ghi âm không thuộc kỹ năng này.'
      );
    }
  }

  const jobId = crypto.randomUUID();
  const newJob: TranscriptionJob = {
    id: jobId,
    actorId: params.actorId,
    skillId: params.skillId,
    orderNo: params.orderNo,
    status: 'processing',
    createdAt: Date.now(),
  };
  jobsMap.set(jobId, newJob);

  // Xử lý không đồng bộ trong nền
  (async () => {
    try {
      const audioBuffer = await downloadObject(params.audioPath);
      const filename = params.audioPath.split('/').pop() || 'audio.mp3';
      const provider = getTranscriptionProvider();
      const result = await provider.transcribe(audioBuffer, filename);

      const currentJob = jobsMap.get(jobId);
      if (currentJob) {
        currentJob.status = 'done';
        currentJob.paragraphs = result.paragraphs;
      }
    } catch (err: unknown) {
      console.error('Transcription job error:', err);
      const currentJob = jobsMap.get(jobId);
      if (currentJob) {
        currentJob.status = 'error';
        currentJob.error =
          err instanceof HttpError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Tạo transcript thất bại.';
      }
    }
  })();

  return { jobId };
}

export function getTranscriptionJob(
  jobId: string,
  actorId: string
): {
  status: 'processing' | 'done' | 'error';
  paragraphs?: TranscriptionParagraph[];
  message?: string;
} {
  cleanupOldJobs();

  const job = jobsMap.get(jobId);
  if (!job) {
    throw new HttpError(
      404,
      'JOB_NOT_FOUND',
      'Không tìm thấy tác vụ tạo transcript hoặc tác vụ đã hết hạn.'
    );
  }

  if (job.actorId !== actorId) {
    throw new HttpError(
      403,
      'FORBIDDEN',
      'Bạn không có quyền xem tác vụ này.'
    );
  }

  return {
    status: job.status,
    paragraphs: job.paragraphs,
    message: job.error,
  };
}
