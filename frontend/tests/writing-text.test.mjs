import test from "node:test";
import assert from "node:assert/strict";
import {
  WRITING_DEFAULT_MIN_WORDS,
  countWords,
  minWordsWarning,
  taskKeyOf,
  taskNumberOf,
  wordsShort,
} from "../src/lib/attempts/writing-text.ts";

// Quy ước backend (attempts.service.ts countWords): trim rồi tách theo khoảng trắng.
const backendCountWords = (text) => {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
};

test("đếm từ giống backend: khoảng trắng, xuống dòng, tab, đầu cuối", () => {
  const samples = [
    "",
    "   ",
    "một",
    "  hai   từ  ",
    "a\n\nb\tc",
    "Hello, world! It's 2026.",
    "dấu-gạch-nối và 3.5 cũng là từ",
    " nbsp ở đầu",
    "dòng một\r\ndòng hai",
  ];
  for (const text of samples) assert.equal(countWords(text), backendCountWords(text), JSON.stringify(text));
  assert.equal(countWords(""), 0);
  assert.equal(countWords("  hai   từ  "), 2);
  assert.equal(countWords("a\n\nb\tc"), 3);
});

test("khóa Task và số Task chuyển qua lại", () => {
  assert.equal(taskKeyOf(1), "task1");
  assert.equal(taskKeyOf(2), "task2");
  assert.equal(taskNumberOf("task1"), 1);
  assert.equal(taskNumberOf("task2"), 2);
  assert.deepEqual(WRITING_DEFAULT_MIN_WORDS, { 1: 150, 2: 250 });
});

test("cảnh báo dưới số từ tối thiểu", () => {
  assert.equal(wordsShort(100, 150), 50);
  assert.equal(wordsShort(150, 150), 0);
  assert.equal(wordsShort(10, null), 0);
  assert.equal(minWordsWarning(0, 250), "", "chưa viết gì thì chưa cảnh báo");
  assert.equal(minWordsWarning(250, 250), "", "đủ số từ thì không cảnh báo");
  assert.equal(minWordsWarning(300, 250), "");
  assert.equal(minWordsWarning(5, null), "", "đề không đặt mức thì không cảnh báo");
  const text = minWordsWarning(200, 250);
  assert.match(text, /thiếu 50 từ/);
  assert.match(text, /250 từ/);
});
