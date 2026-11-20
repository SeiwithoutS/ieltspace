import { apiFetch, apiUrl } from "../shared/api";
import { useRef, useState } from "react";
import type { AudioCandidate, ImageCandidate, Word } from "../../data/vocabulary";
const managedPrefix = "vocab-image:";
export const isManagedVocabularyImage = (image: string) => image.startsWith(managedPrefix);
export function publishedVocabularyImageUrl(image: string) {
  return isManagedVocabularyImage(image)
    ? apiUrl("/vocabulary/sets/images/" + encodeURIComponent(image.slice(managedPrefix.length)))
    : image;
}
export function uploadVocabularyImage(file: File) {
  return apiFetch<{ image: string; imagePreview: string }>("/admin/vocabulary/media/upload", {
    method: "POST", body: file, headers: { "Content-Type": file.type },
  });
}
export function useVocabularyImagePreview(image: string, initial?: string) {
  const managed = isManagedVocabularyImage(image);
  const identity = image + "\n" + (initial ?? "");
  const latest = useRef(identity);
  latest.current = identity;
  const tried = useRef<string>();
  const [renewed, setRenewed] = useState<{ identity: string; url: string }>();

  async function renew() {
    if (!managed || tried.current === identity) return;
    tried.current = identity;
    try {
      const { url } = await apiFetch<{ url: string }>("/admin/vocabulary/media/preview?image=" + encodeURIComponent(image));
      if (latest.current === identity) setRenewed({ identity, url });
    } catch { /* The editor keeps the image reference so a reload can retry. */ }
  }
  const source = managed ? (renewed?.identity === identity ? renewed.url : initial) : image;
  return { source, renew };
}
// Pace imports and bulk refreshes instead of exhausting all providers at once.
let nextRequest = 0;
async function mediaRequest<T>(path: string, options?: Parameters<typeof apiFetch>[1]): Promise<T> {
  const start = Math.max(Date.now(), nextRequest);
  nextRequest = start + 750;
  await new Promise(resolve => setTimeout(resolve, start - Date.now()));
  return apiFetch<T>(path, options);
}
export async function selectVocabularyImage(id: string): Promise<Partial<Word>> {
  const selected = await mediaRequest<Pick<Word, "image" | "imageCredit" | "imagePreview">>(
    "/admin/vocabulary/media/image", { method: "POST", json: { id } },
  );
  return { ...selected, imagePreview: selected.imagePreview };
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
    if (candidate.source === "Pixabay") continue; // Only store an image that the editor explicitly chooses.
    try { image = await selectVocabularyImage(candidate.id); break; } catch { /* Try the next available source. */ }
  }
  return { ...image, imageCandidates: result.candidates,
    mediaMessage: result.candidates.some(item => item.source === "Pixabay")
      ? "Chọn ảnh Pixabay bên dưới để lưu vào kho ảnh."
      : result.warnings.join(" ") || (image.image ? "" : "Chưa lấy được ảnh. Bấm vào hình để tải ảnh từ máy.") };
}
