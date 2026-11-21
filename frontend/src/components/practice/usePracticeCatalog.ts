import { useEffect, useState } from "react";
import {
  getPracticeCatalog,
  type EssayTypeFilterOption,
  type PracticeItem,
  type PracticeSkill,
  type QuestionTypeOption,
  type TopicOption,
} from "../../lib/exams/exam-catalog";

export type PracticeCatalogState = {
  items: PracticeItem[];
  questionTypes: QuestionTypeOption[];
  essayTypes: EssayTypeFilterOption[];
  topics: TopicOption[];
  loading: boolean;
  error: boolean;
};

// Tải danh sách section/passage/task/part đã đăng của một kỹ năng (chỉ metadata, không có đáp án).
export function usePracticeCatalog(skill: PracticeSkill): PracticeCatalogState {
  const [state, setState] = useState<PracticeCatalogState>({
    items: [],
    questionTypes: [],
    essayTypes: [],
    topics: [],
    loading: true,
    error: false,
  });
  useEffect(() => {
    let alive = true;
    getPracticeCatalog(skill)
      .then((c) => {
        if (!alive) return;
        setState({
          items: c.items,
          questionTypes: c.availableQuestionTypes,
          essayTypes: c.availableEssayTypes,
          topics: c.availableTopics,
          loading: false,
          error: false,
        });
      })
      .catch(() => {
        if (alive) setState((s) => ({ ...s, loading: false, error: true }));
      });
    return () => {
      alive = false;
    };
  }, [skill]);
  return state;
}
