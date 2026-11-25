import { createZip } from '../shared/zip.ts';
import type { SavedWriting } from './skill-attempts-api';

const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const wordNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function xmlText(text: string) {
  return text.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function paragraph(text: string, bold = false) {
  const runs = text.split('\t').map(part => `<w:t xml:space="preserve">${xmlText(part)}</w:t>`);
  return `<w:p><w:r>${bold ? '<w:rPr><w:b/></w:rPr>' : ''}${runs.join('<w:tab/>')}</w:r></w:p>`;
}

export function createWritingDocx(title: string, tasks: SavedWriting['tasks']) {
  const encoder = new TextEncoder();
  const body = paragraph(title, true) + tasks.map(({ taskKey, text }) =>
    paragraph(taskKey === 'task1' ? 'Task 1' : 'Task 2', true) +
    text.split(/\r\n|\r|\n/).map(line => paragraph(line)).join('') + paragraph('')
  ).join('');
  const parts = {
    '[Content_Types].xml': `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    </Types>`,
    '_rels/.rels': `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>`,
    'word/document.xml': `<w:document xmlns:w="${wordNs}"><w:body>${body}</w:body></w:document>`,
  };
  return createZip(Object.entries(parts).map(([name, content]) => ({ name, data: encoder.encode(xml + content) })));
}
