import { apiFetch } from "./api";

import type {
  VocabularySet,
  Word,
} from "../data/vocabulary";

export type DatabaseVocabularySet = VocabularySet & {
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
  revision?: number;
  wordCount?: number;
};

export type VocabularyDraft = {
  set: DatabaseVocabularySet;
  revision: number;
  words: Word[];
};

const base = "/admin/vocabulary/sets";

export async function listAdminVocabularySets() {
  return apiFetch<{
    sets: DatabaseVocabularySet[];
  }>(base);
}

export async function createVocabularySet(input: {
  title: string;
  description?: string;
  cover?: string;
}) {
  return apiFetch<{
    set: DatabaseVocabularySet;
  }>(base, {
    method: "POST",
    json: input,
  });
}

export async function updateVocabularySet(set: DatabaseVocabularySet) {
  return apiFetch<{ revision: number }>(`${base}/${encodeURIComponent(set.id)}`, { method: "PATCH", json: { ...set, revision: set.revision } });
}
export async function deleteVocabularySet(id: string) {
  return apiFetch(`${base}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getVocabularyDraft(id: string) {
  return apiFetch<VocabularyDraft>(
    `${base}/${encodeURIComponent(id)}`,
  );
}

export async function saveVocabularyDraft(
  id: string,
  revision: number,
  words: Word[],
) {
  // Loại bỏ state tạm của UI và preview ảnh khỏi payload.
  const payload = words.map(word => ({
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    phonetic: word.phonetic,
    pos: word.pos,
    example: word.example,
    translation: word.translation,
    image: word.image,
    audio: word.audio,
    audioUs: word.audioUs,
    audioUk: word.audioUk,
    audioCandidates: word.audioCandidates,
    imageCredit: word.imageCredit,
  }));
  if (new TextEncoder().encode(JSON.stringify({ revision, words: payload })).length > 1_000_000) {
    throw new Error("Nội dung vượt giới hạn request 1 MB. Chia thành bộ nhỏ hơn; không gửi ảnh base64 trong bản nháp.");
  }

  return apiFetch<{
    revision: number;
    wordCount: number;
    updatedAt: string;
  }>(
    `${base}/${encodeURIComponent(id)}/draft`,
    {
      method: "PUT",
      json: {
        revision,
        words: payload,
      },
    },
  );
}
