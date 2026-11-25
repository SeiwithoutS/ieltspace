export type AnnouncementDraft = { title: string; content: string; audience: 'ALL' | 'LEARNER' | 'TEACHER' };
type SavedDraft = AnnouncementDraft & { id: string; revision: number };
type Create = AnnouncementDraft & { requestId: string };
type Edit = { id: string; revision: number; draft: AnnouncementDraft };
export type PendingAnnouncementSave = { create?: Create; edit?: Edit };

export const matchesDraft = (draft: AnnouncementDraft, saved: AnnouncementDraft) =>
  draft.title.trim() === saved.title && draft.content.trim() === saved.content && draft.audience === saved.audience;

export async function saveAnnouncementDraft<T extends SavedDraft>(draft: AnnouncementDraft, editing: T | undefined,
  pending: PendingAnnouncementSave, api: { create: (input: Create) => Promise<T>; edit: (input: Edit) => Promise<T>; received: (value: T) => void }) {
  let current = editing;
  if (!current) {
    pending.create ??= { ...draft, requestId: crypto.randomUUID() };
    current = await api.create(pending.create);
    pending.create = undefined;
    api.received(current);
  }
  if (pending.edit) {
    current = await api.edit(pending.edit);
    pending.edit = undefined;
    api.received(current);
  }
  if (!matchesDraft(draft, current)) {
    pending.edit = { id: current.id, revision: current.revision, draft };
    const saved = await api.edit(pending.edit);
    pending.edit = undefined;
    api.received(saved);
  }
}
