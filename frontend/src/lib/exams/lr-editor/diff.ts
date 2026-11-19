import type { EditorSkill } from '../exam-editor.ts';
import type {
  LrContent,
  LrEditorState,
  LrGroupMove,
  LrGroupUpsert,
  LrPatch,
  LrSectionPatch,
} from './types.ts';

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

export function diffLrContent(baseline: LrContent, current: LrContent): LrPatch {
  const patch: LrPatch = {};

  // 1. Check sections (metadata, paragraphs, images, audio)
  const sectionPatches: LrSectionPatch[] = [];
  (current.sections || []).forEach((curSec) => {
    const baseSec = (baseline.sections || []).find((s) => s.orderNo === curSec.orderNo);
    if (!baseSec) {
      sectionPatches.push({
        orderNo: curSec.orderNo,
        title: curSec.title,
        paragraphs: curSec.paragraphs,
        images: curSec.images,
        audio: curSec.audio,
      });
      return;
    }

    const titleChanged = curSec.title !== baseSec.title;
    const parasChanged = !deepEqual(curSec.paragraphs, baseSec.paragraphs);
    const imagesChanged = !deepEqual(curSec.images, baseSec.images);
    const audioChanged = !deepEqual(curSec.audio, baseSec.audio);

    if (titleChanged || parasChanged || imagesChanged || audioChanged) {
      sectionPatches.push({
        orderNo: curSec.orderNo,
        title: curSec.title,
        paragraphs: curSec.paragraphs,
        images: curSec.images,
        audio: curSec.audio,
      });
    }
  });

  if (sectionPatches.length > 0) {
    patch.sections = sectionPatches;
  }

  // 2. Identify deleted groups
  const currentGroupIds = new Set<string>();
  (current.sections || []).forEach((sec) => {
    (sec.groups || []).forEach((g) => {
      if (g.id) currentGroupIds.add(g.id);
    });
  });

  const deleteGroupIds: string[] = [];
  const baselineGroupMap = new Map<
    string,
    { group: (typeof baseline.sections)[0]['groups'][0]; sectionOrderNo: number; orderNo: number }
  >();

  (baseline.sections || []).forEach((sec) => {
    (sec.groups || []).forEach((g, gIdx) => {
      if (g.id) {
        baselineGroupMap.set(g.id, {
          group: g,
          sectionOrderNo: sec.orderNo,
          orderNo: gIdx + 1,
        });
        if (!currentGroupIds.has(g.id)) {
          deleteGroupIds.push(g.id);
        }
      }
    });
  });

  if (deleteGroupIds.length > 0) {
    patch.deleteGroupIds = deleteGroupIds;
  }

  // 3. Move and Upsert groups
  const moveGroups: LrGroupMove[] = [];
  const upsertGroups: LrGroupUpsert[] = [];

  (current.sections || []).forEach((sec) => {
    (sec.groups || []).forEach((g, gIdx) => {
      const orderNo = gIdx + 1;
      if (!g.id) {
        // Completely new group
        upsertGroups.push({
          ...g,
          sectionOrderNo: sec.orderNo,
          orderNo,
        });
        return;
      }

      const baseEntry = baselineGroupMap.get(g.id);
      if (!baseEntry) {
        // Has ID but not in baseline (e.g. newly created with client UUID)
        upsertGroups.push({
          ...g,
          sectionOrderNo: sec.orderNo,
          orderNo,
        });
        return;
      }

      const baseGroup = baseEntry.group;
      const contentChanged =
        g.type !== baseGroup.type ||
        g.instruction !== baseGroup.instruction ||
        g.title !== baseGroup.title ||
        !deepEqual(g.image, baseGroup.image) ||
        !deepEqual(g.config, baseGroup.config) ||
        !deepEqual(g.content, baseGroup.content) ||
        !deepEqual(g.questions, baseGroup.questions);

      const posChanged =
        sec.orderNo !== baseEntry.sectionOrderNo ||
        orderNo !== baseEntry.orderNo ||
        g.questionFrom !== baseGroup.questionFrom ||
        g.questionTo !== baseGroup.questionTo;

      if (contentChanged) {
        upsertGroups.push({
          ...g,
          sectionOrderNo: sec.orderNo,
          orderNo,
        });
      } else if (posChanged) {
        moveGroups.push({
          id: g.id,
          sectionOrderNo: sec.orderNo,
          orderNo,
          questionFrom: g.questionFrom,
          questionTo: g.questionTo,
        });
      }
    });
  });

  if (moveGroups.length > 0) {
    patch.moveGroups = moveGroups;
  }
  if (upsertGroups.length > 0) {
    patch.upsertGroups = upsertGroups;
  }

  return patch;
}

export function applySavedIds(ex: LrEditorState, saved: EditorSkill): LrEditorState {
  const isReading = saved.skill === 'READING';
  const savedContent = isReading ? saved.reading : saved.listening;
  if (!savedContent || !savedContent.sections) {
    return ex;
  }

  const newPassages = ex.passages.map((p, pIdx) => {
    const savedSec = savedContent.sections.find((s) => s.orderNo === p.orderNo) || savedContent.sections[pIdx];
    if (!savedSec || !savedSec.groups) {
      return p;
    }

    const newGroups = p.groups.map((g, gIdx) => {
      const savedGrp = savedSec.groups[gIdx];
      if (savedGrp && savedGrp.id) {
        return {
          ...g,
          id: savedGrp.id,
        };
      }
      return g;
    });

    return {
      ...p,
      groups: newGroups,
    };
  });

  return {
    ...ex,
    passages: newPassages,
  };
}
