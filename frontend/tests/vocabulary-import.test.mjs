import test from "node:test";
import assert from "node:assert/strict";
import { importWords } from "../src/lib/vocabulary/vocabulary-import.ts";

const csv = text => new File([text], "words.csv", { type: "text/csv" });

test("imports the English template and keeps the CEFR level optional", async () => {
  const [word] = await importWords(csv("word,meaning_vi,part_of_speech\r\nforest,khu rừng,danh từ"));
  assert.equal(word.word, "forest");
  assert.equal(word.meaning, "khu rừng");
  assert.equal(word.pos, "danh từ");
  assert.equal(word.tag, undefined);
});

test("imports Vietnamese headers, a UTF-8 BOM and quoted semicolon CSV", async () => {
  const [word] = await importWords(csv('\uFEFF"nghĩa";"từ";"loại từ";"phiên âm";"ví dụ";"dịch ví dụ";"cấp độ CEFR"\r\n' +
    '"Hạn hán; khô hạn";drought;"danh từ";/draʊt/;"She said ""drought"", then paused.";"Cô ấy nói về hạn hán.\r\nRồi ngừng lại.";b2'));
  assert.equal(word.word, "drought");
  assert.equal(word.meaning, "Hạn hán; khô hạn");
  assert.equal(word.phonetic, "/draʊt/");
  assert.equal(word.example, 'She said "drought", then paused.');
  assert.equal(word.translation, "Cô ấy nói về hạn hán.\r\nRồi ngừng lại.");
  assert.equal(word.tag, "B2");
});

test("detects the delimiter when an optional quoted header spans lines", async () => {
  for (const separator of [",", ";"]) {
    const header = ["word", '"Optional\r\ndescription"', "meaning_vi", "tag"].join(separator);
    const row = ["forest", "placeholder", "khu rừng", "B1"].join(separator);
    const [word] = await importWords(csv(`${header}\r\n${row}`));
    assert.equal(word.word, "forest");
    assert.equal(word.meaning, "khu rừng");
    assert.equal(word.tag, "B1");
  }
});

test("rejects ambiguous headers, malformed rows and invalid CEFR levels", async () => {
  await assert.rejects(importWords(csv("word,từ,nghĩa\nforest,forest,khu rừng")), /nhiều cột.*word/);
  await assert.rejects(importWords(csv("từ,nghĩa\nforest,khu rừng,thừa")), /Dòng 2.*dấu phân cách/);
  await assert.rejects(importWords(csv('từ,nghĩa\nforest,"khu rừng')), /ngoặc kép.*chưa đóng/);
  await assert.rejects(importWords(csv("từ,nghĩa\nforest,")), /Dòng 2.*thiếu/);
  await assert.rejects(importWords(csv("word,meaning_vi,tag\nforest,khu rừng,B3")), /Dòng 2.*CEFR/);
});
