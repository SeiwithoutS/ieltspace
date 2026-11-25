import type { SpeakingEditorState } from "../lib/exams/exam-editor";

// Dữ liệu minh họa theo cấu trúc đề Speaking của editor. API đề cho Người học
// sẽ thay thế khi backend có. Part 2: `prep`, `speak` là số phút.
export const speakingTestSample: SpeakingEditorState = {
  title: "Practice Test 01",
  tot: "15",
  items: [
    {
      kind: "qs",
      topic: "Hometown",
      instr: "Trả lời tự nhiên, hai đến ba câu cho mỗi câu hỏi.",
      qs: [
        "Where is your hometown?",
        "What do you like most about living there?",
        "Has your hometown changed much in recent years?",
        "Would you like to live there in the future?",
      ],
    },
    {
      kind: "cue",
      topic: "Learning",
      prep: "1",
      speak: "2",
      text: [
        "Describe a skill you would like to learn.",
        "You should say:",
        "- what the skill is",
        "- why you want to learn it",
        "- how you would learn it",
        "and explain how it would help you in the future.",
      ].join("\n"),
    },
    {
      kind: "qs",
      topic: "Learning new skills",
      instr: "Trả lời đầy đủ hơn, giải thích và đưa ví dụ.",
      qs: [
        "Why do some people find it hard to learn new skills as adults?",
        "Do you think schools should teach practical skills as well as academic subjects?",
        "How has technology changed the way people learn?",
      ],
    },
  ],
};
