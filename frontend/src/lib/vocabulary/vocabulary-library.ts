import { useEffect, useState } from "react";
import type { VocabularySet, Word } from "../../data/vocabulary";
import { apiFetch } from "../shared/api";

export type PublishedVocabularySet = VocabularySet & { words: Word[] };
export type PersonalVocabulary = { id: string; fav: boolean; note: string };

export function getPersonalVocabulary() {
  return apiFetch<{ records: PersonalVocabulary[] }>("/vocabulary/sets/me/personal");
}

export function usePublishedVocabulary() {
  const [sets, setSets] = useState<PublishedVocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    apiFetch<{ sets: PublishedVocabularySet[] }>("/vocabulary/sets", { auth: false })
      .then((result) => { if (active) setSets(result.sets); })
      .catch((failure: unknown) => {
        if (active) setError(failure instanceof Error ? failure.message : "Không tải được thư viện.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);

  return { sets, loading, error, retry: () => setRevision((value) => value + 1) };
}
