import { apiFetch } from "./api";
import type { AudioCandidate, ImageCandidate, Word } from "../data/vocabulary";
// Pace imports and bulk refreshes instead of exhausting all providers at once.
let nextRequest = 0;
async function mediaRequest<T>(path: string, options?: Parameters<typeof apiFetch>[1]): Promise<T> {
  const start = Math.max(Date.now(), nextRequest);
  nextRequest = start + 750;
  await new Promise(resolve => setTimeout(resolve, start - Date.now()));
  return apiFetch<T>(path, options);
}
export async function selectVocabularyImage(id: string): Promise<Partial<Word>> {
  return mediaRequest("/admin/vocabulary/media/image", { method: "POST", json: { id } });
}
export async function findVocabularyMedia(word: string, type: "audio" | "image"): Promise<Partial<Word>> {
  const path = `/admin/vocabulary/media?word=${encodeURIComponent(word.trim())}&type=${type}`;
  if (type === "audio") {
    const result = await mediaRequest<{ candidates: AudioCandidate[]; warnings: string[] }>(path);
    const us = result.candidates.find(item => item.accent === "US");
    const uk = result.candidates.find(item => item.accent === "UK");
    return { ...(result.candidates[0] ? { audio: result.candidates[0].url } : {}), audioCandidates: result.candidates,
      ...(us ? { audioUs: us.url } : {}), ...(uk ? { audioUk: uk.url } : {}),
      mediaMessage: result.warnings.join(" ") || (result.candidates.length ? "" : "Không tìm thấy audio cho từ này.") };
  }
  const result = await mediaRequest<{ candidates: ImageCandidate[]; warnings: string[] }>(path);
  let image: Partial<Word> = {};
  for (const candidate of result.candidates) {
    try { image = await selectVocabularyImage(candidate.id); break; } catch { /* Try the next available source. */ }
  }
  return { ...image, imageCandidates: result.candidates,
    mediaMessage: result.warnings.join(" ") || (image.image ? "" : "Chưa lấy được ảnh. Bấm vào hình để tải ảnh từ máy.") };
}
