import assert from 'node:assert/strict';
import test from 'node:test';
import { saveAnnouncementDraft } from '../src/lib/notifications/announcement-draft.ts';

test('Khôi phục phản hồi POST/PATCH bị mất rồi lưu nội dung mới trên đúng bản nháp', async () => {
  const drafts = new Map();
  const pending = {};
  let editing;
  let dropCreate = true;
  let dropEdit = true;
  const api = {
    async create(input) {
      const { requestId, ...draft } = input;
      const existing = drafts.get(requestId);
      if (existing) {
        assert.equal(existing.title, draft.title);
        return existing;
      }
      drafts.set(requestId, { ...draft, id: requestId, revision: 0 });
      if (dropCreate) { dropCreate = false; throw new Error('Mất phản hồi tạo'); }
      return drafts.get(requestId);
    },
    async edit({ id, revision, draft }) {
      const existing = drafts.get(id);
      if (existing.revision === revision + 1) {
        assert.equal(existing.content, draft.content);
        return existing;
      }
      assert.equal(existing.revision, revision);
      drafts.set(id, { ...draft, id, revision: revision + 1 });
      if (dropEdit) { dropEdit = false; throw new Error('Mất phản hồi sửa'); }
      return drafts.get(id);
    },
    received: item => { editing = item; },
  };
  const original = { title: 'Tin ban đầu', content: 'Ban đầu', audience: 'ALL' };
  await assert.rejects(saveAnnouncementDraft(original, editing, pending, api), /Mất phản hồi tạo/);
  await assert.rejects(saveAnnouncementDraft({ ...original, title: 'Đổi tiêu đề', content: 'Bản sửa 1' }, editing, pending, api), /Mất phản hồi sửa/);
  await saveAnnouncementDraft({ ...original, title: 'Đổi tiêu đề', content: 'Bản sửa 2' }, editing, pending, api);
  assert.equal(drafts.size, 1);
  assert.equal(editing.revision, 2);
  assert.equal(editing.content, 'Bản sửa 2');
  assert.equal(pending.create, undefined);
  assert.equal(pending.edit, undefined);
});
