import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminSidebar from '../../navigation/AdminSidebar';
import './lr-editor.css';
import AdminTopbar, { Crumb } from '../../navigation/AdminTopbar.tsx';
import EditorTopbar from '../editor-shell/EditorTopbar.tsx';
import VersionBanner from '../editor-shell/VersionBanner.tsx';
import ConfirmDialog from '../editor-shell/ConfirmDialog.tsx';
import LeaveDialog from '../editor-shell/LeaveDialog.tsx';
import UnsavedGuard from '../editor-shell/UnsavedGuard.tsx';
import SkillHistoryDrawer from '../SkillHistoryDrawer.tsx';

import PassagePanel from './PassagePanel.tsx';
import AudioPanel from './AudioPanel.tsx';
import TranscriptPanel from './TranscriptPanel.tsx';
import ExplainPanel from './ExplainPanel.tsx';
import PublishIssues from './PublishIssues.tsx';
import TypePicker from './TypePicker.tsx';
import TranscribeModal from './TranscribeModal.tsx';
import GroupTypeSwitcher from './GroupTypeSwitcher.tsx';
import { LR_CONFIG } from './config.ts';

import GapCard from './cards/GapCard.tsx';
import BlankTextCard from './cards/BlankTextCard.tsx';
import WordBankCard from './cards/WordBankCard.tsx';
import TableCard from './cards/TableCard.tsx';
import FlowCard from './cards/FlowCard.tsx';
import DiagramCard from './cards/DiagramCard.tsx';
import MatchCard from './cards/MatchCard.tsx';
import McqCard from './cards/McqCard.tsx';
import JudgeCard from './cards/JudgeCard.tsx';

import {
  toLrState,
  fromLrState,
} from '../../../lib/lr-editor/converters.ts';
import {
  diffLrContent,
  applySavedIds,
} from '../../../lib/lr-editor/diff.ts';
import {
  explainRows,
  applyExplain,
  explainProgress,
  type ExplainPatch,
  type ExplainRow,
} from '../../../lib/lr-editor/explain.ts';
import {
  allIssues,
  autoInstr,
  cnt,
  groupIssues,
  numberQuestions,
  formatQuestionRange,
  groupHasData,
} from '../../../lib/lr-editor/pure.ts';
import { typeName, COMBO_TYPE_LABELS } from '../../../lib/lr-editor/constants.ts';
import type {
  LrContent,
  LrEditorState,
  LrGroupState,
  LrPassageState,
  LrQuestionType,
} from '../../../lib/lr-editor/types.ts';

import {
  getEditorSkill,
  saveSkillContent,
  createRevisionDraft,
  discardUploads,
  type EditorSkill,
} from '../../../lib/exam-editor.ts';
import { deleteSkill, publishSkill } from '../../../lib/exam-admin.ts';
import { navigate } from '../../../lib/auth.ts';
import { TOAST_MS } from '../../../lib/toast';

export type LrEditorProps = {
  skill: 'READING' | 'LISTENING';
  initialSkillId?: string;
};

export default function LrEditor({ skill: expectedSkill, initialSkillId }: LrEditorProps) {
  const isReading = expectedSkill === 'READING';
  const cfg = LR_CONFIG[expectedSkill];

  // State
  const [skillId, setSkillId] = useState<string | null>(initialSkillId || null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [skill, setSkill] = useState<EditorSkill | null>(null);

  const [ex, setEx] = useState<LrEditorState>({
    title: 'Đề thi mới',
    skill: expectedSkill,
    form: isReading ? 'ACADEMIC' : null,
    passages: [],
  });
  const [baseline, setBaseline] = useState<LrContent>({ sections: [] });
  const [history, setHistory] = useState<LrEditorState[]>([]);

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [activePassage, setActivePassage] = useState(0);
  const [activeGroup, setActiveGroup] = useState(0);
  const [rightTab, setRightTab] = useState<'q' | 'e'>('q');
  const [eq, setEq] = useState(-1);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [creatingDraft, setCreatingDraft] = useState(false);

  // Dialogs & drawers
  const [showIssues, setShowIssues] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<number | null>(null);
  const [confirmChangeType, setConfirmChangeType] = useState<{
    groupIndex: number;
    nextType: LrQuestionType;
    keep?: { body?: string; limit?: number | null };
  } | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmDeleteSkill, setConfirmDeleteSkill] = useState(false);
  const [leavePendingGo, setLeavePendingGo] = useState<(() => void) | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  // Audio seek state for Listening
  const [seekAudioSec, setSeekAudioSec] = useState<number | null>(null);

  // Speech-to-text transcribe modal
  const [transcribeModal, setTranscribeModal] = useState(false);

  // Calculate dirty status: deep compare baseline with current content
  const currentContent = useMemo(() => fromLrState(ex, expectedSkill), [ex, expectedSkill]);
  const patch = useMemo(() => {
    if (!baseline || !baseline.sections || baseline.sections.length === 0) return {};
    return diffLrContent(baseline, currentContent);
  }, [baseline, currentContent]);

  const isDirty = useMemo(() => {
    return (
      (patch.sections && patch.sections.length > 0) ||
      (patch.upsertGroups && patch.upsertGroups.length > 0) ||
      (patch.moveGroups && patch.moveGroups.length > 0) ||
      (patch.deleteGroupIds && patch.deleteGroupIds.length > 0)
    );
  }, [patch]);

  // Numbering and Issues
  const { starts, total } = useMemo(() => numberQuestions(ex), [ex]);
  const issues = useMemo(
    () => allIssues(ex, cfg.sectionName, cfg.sectionCount),
    [ex, cfg]
  );

  // Load skill on mount or hash change
  const loadSkill = useCallback(
    async (id: string) => {
      setLoading(true);
      setNotFound(false);
      try {
        const fetchedSkill = await getEditorSkill(id);
        if (fetchedSkill.skill !== expectedSkill) {
          navigate(
            fetchedSkill.skill === 'READING'
              ? `AdminReadingEditor?skillId=${id}`
              : `AdminListeningEditor?skillId=${id}`
          );
          return;
        }

        const editorState = toLrState(fetchedSkill);
        const base = fromLrState(editorState, expectedSkill);

        setSkill(fetchedSkill);
        setEx(editorState);
        setBaseline(base);
        setHistory([]);
        setMode(fetchedSkill.status === 'DRAFT' ? 'edit' : 'view');
        setLoading(false);
      } catch {
        setLoading(false);
        setNotFound(true);
      }
    },
    [expectedSkill]
  );

  useEffect(() => {
    function parseSkillIdFromUrl(): string | null {
      const hash = window.location.hash || '';
      const qIdx = hash.indexOf('?');
      const paramStr = qIdx !== -1 ? hash.slice(qIdx + 1) : '';
      const urlParams = new URLSearchParams(paramStr || window.location.search);
      return urlParams.get('skillId');
    }

    const idFromUrl = parseSkillIdFromUrl();
    if (idFromUrl) {
      setSkillId(idFromUrl);
      loadSkill(idFromUrl);
    } else {
      setLoading(false);
      setNotFound(true);
    }

    function onHashChange() {
      const newId = parseSkillIdFromUrl();
      if (newId && newId !== skillId) {
        setSkillId(newId);
        loadSkill(newId);
      }
    }

    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [loadSkill, skillId]);

  // Keyboard shortcut Ctrl+Z for Undo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        (e.key === 'z' || e.key === 'Z') &&
        tag !== 'INPUT' &&
        tag !== 'TEXTAREA'
      ) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  // State mutator with history tracking
  const updateState = useCallback(
    (updater: (draft: LrEditorState) => void) => {
      setEx((prev) => {
        // Save to undo history (up to 50 steps)
        setHistory((h) => [...h.slice(-49), prev]);
        const draft = JSON.parse(JSON.stringify(prev)) as LrEditorState;
        updater(draft);
        return draft;
      });
    },
    []
  );

  function handleUndo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setEx(prev);
  }

  // Save changes via minimal diff patch
  async function handleSave() {
    if (!skill || !skillId || saving) return;
    setSaving(true);
    try {
      const input = {
        baseUpdatedAt: skill.updatedAt,
        ...(isReading ? { reading: patch } : { listening: patch }),
      };

      const updatedSkill = await saveSkillContent(skillId, input);
      setSkill(updatedSkill);

      // Apply assigned IDs to newly created groups
      const updatedEx = applySavedIds(ex, updatedSkill);
      const newBase = fromLrState(updatedEx, expectedSkill);

      setEx(updatedEx);
      setBaseline(newBase);
      setToast('Đã lưu thay đổi thành công.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lưu thay đổi thất bại.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  // Publish
  async function handlePublish() {
    if (!skill || !skillId || publishing) return;
    setPublishing(true);
    try {
      const res = await publishSkill(skillId);
      setConfirmPublish(false);
      setToast('Đề thi đã được đăng thành công.');
      await loadSkill(skillId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng đề thất bại.';
      alert(msg);
    } finally {
      setPublishing(false);
    }
  }

  // Create Revision Draft (for published skill)
  async function handleCreateRevision() {
    if (!skill || !skillId || creatingDraft) return;
    setCreatingDraft(true);
    try {
      const newDraft = await createRevisionDraft(skillId);
      navigate(
        isReading
          ? `AdminReadingEditor?skillId=${newDraft.id}`
          : `AdminListeningEditor?skillId=${newDraft.id}`
      );
      setSkillId(newDraft.id);
      await loadSkill(newDraft.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo bản nháp mới thất bại.';
      alert(msg);
    } finally {
      setCreatingDraft(false);
    }
  }

  // Delete / Discard Skill
  async function handleDeleteSkill() {
    if (!skill || !skillId) return;
    try {
      await deleteSkill(skillId);
      navigate(`AdminExamSet?id=${skill.set.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa kỹ năng thất bại.';
      alert(msg);
    }
  }

  // Group Management
  function handleAddGroup(type: LrQuestionType) {
    updateState((draft) => {
      const p = draft.passages[activePassage];
      if (!p) return;
      const newGrp: LrGroupState = {
        type,
        instr: null,
        title: null,
        limit: null,
        items: [],
      };
      // Set auto-instruction
      newGrp.instr = autoInstr(newGrp, p, activePassage);

      p.groups.push(newGrp);
      setActiveGroup(p.groups.length - 1);
    });
  }

  function handleDeleteGroup(grpIdx: number) {
    updateState((draft) => {
      const p = draft.passages[activePassage];
      if (!p) return;
      p.groups.splice(grpIdx, 1);
      setActiveGroup(Math.max(0, grpIdx - 1));
    });
    setConfirmDeleteGroup(null);
  }

  // Đổi dạng câu hỏi trong cùng nhóm (GQ-02)
  function handleChangeType(
    gIdx: number,
    nextType: LrQuestionType,
    keep?: { body?: string; limit?: number | null }
  ) {
    const p = ex.passages[activePassage];
    if (!p || !p.groups || !p.groups[gIdx]) return;
    const curr = p.groups[gIdx];

    if (curr.type === nextType) return;
    // GQ-06: nhóm đang là MATCH_ENDING mà chọn MATCH_FEATURE (mục gộp) thì không làm gì
    if (curr.type === 'MATCH_ENDING' && nextType === 'MATCH_FEATURE') return;

    // Kiểm tra xem nhóm có dữ liệu không
    let hasData = false;
    if (keep?.body !== undefined) {
      // Đổi Summary COMP <-> BOX: giữ body, chỉ cảnh báo nếu có đáp án/từ vựng khác ngoài body
      if (curr.type === 'SUMMARY_BOX') {
        hasData = Boolean(
          (curr.opts && curr.opts.length > 0) ||
          (curr.ans && curr.ans.length > 0 && curr.ans.some((a) => a !== undefined && a !== null && String(a) !== '-1'))
        );
      } else {
        hasData = Boolean(
          (curr.ans && curr.ans.length > 0 && curr.ans.some((a) => a && String(a).trim().length > 0)) ||
          (curr.alt && curr.alt.length > 0 && curr.alt.some((a) => a && a.trim().length > 0))
        );
      }
    } else {
      hasData = groupHasData(curr);
    }

    if (hasData) {
      setConfirmChangeType({ groupIndex: gIdx, nextType, keep });
    } else {
      applyChangeType(gIdx, nextType, keep);
    }
  }

  function applyChangeType(
    gIdx: number,
    nextType: LrQuestionType,
    keep?: { body?: string; limit?: number | null }
  ) {
    updateState((draft) => {
      const p = draft.passages[activePassage];
      if (!p || !p.groups || !p.groups[gIdx]) return;
      const curr = p.groups[gIdx];

      const newGroup: LrGroupState = {
        id: curr.id,
        orderNo: curr.orderNo,
        type: nextType,
        instr: null,
        title: null,
        limit: keep?.limit !== undefined ? keep.limit : null,
        items: [],
        body: keep?.body !== undefined ? keep.body : undefined,
      };

      if (nextType === 'SUMMARY_BOX') {
        newGroup.opts = [];
        newGroup.sel = [];
        newGroup.ans = [];
        newGroup.limit = -1;
      } else if (nextType === 'SUMMARY_COMP') {
        if (newGroup.limit == null || newGroup.limit < 0) {
          newGroup.limit = 2;
        }
      } else if (nextType === 'MCQ_SINGLE') {
        newGroup.items = [{ q: '', opts: ['', '', '', ''], ans: null }];
      } else if (nextType === 'MCQ_MULTI') {
        newGroup.pick = 2;
        newGroup.opts = ['', '', '', '', ''];
        newGroup.ans = [];
      } else if (nextType === 'TFNG' || nextType === 'YNNG') {
        newGroup.items = [{ q: '', ans: null }];
      }

      newGroup.instr = autoInstr(newGroup, p, activePassage);
      p.groups[gIdx] = newGroup;
    });

    setConfirmChangeType(null);
    setActiveGroup(gIdx);
  }


  // Speech-to-text application (LRE-07c)
  function handleApplyTranscription(
    newParas: Array<{ label: string; text: string; startSec: number }>
  ) {
    updateState((draft) => {
      const p = draft.passages[activePassage];
      if (!p) return;
      p.paras = newParas.map((item) => item.text);

      // Section paragraphs changed: clear explanation para index reference
      for (const group of p.groups || []) {
        if (group.exp) {
          for (const e of group.exp) {
            e.para = null;
          }
        }
        if (group.items) {
          for (const item of group.items) {
            item.para = null;
          }
        }
      }
    });

    setToast('Đã áp dụng transcript. Vui lòng kiểm tra lại các giải thích đoạn nếu có.');
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#FAF9F7] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#706473]">
          <svg className="animate-spin w-8 h-8 text-[#2963CC]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-[14px] font-medium">Đang tải đề thi...</span>
        </div>
      </div>
    );
  }

  if (notFound || !skill) {
    return (
      <div className="flex h-screen bg-[#FAF9F7] items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-[#E5E0D8] shadow-lg max-w-md space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FDF3F0] text-[#C0412A] flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-[18px] font-bold text-[#352637]">Không tìm thấy đề thi</h2>
          <p className="text-[14px] text-[#706473]">
            Kỹ năng không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <button
            type="button"
            onClick={() => navigate('AdminExams')}
            className="px-4 py-2 bg-[#2963CC] text-white font-semibold text-[13px] rounded-xl hover:bg-[#2050A8]"
          >
            Quay lại kho đề
          </button>
        </div>
      </div>
    );
  }

  const currentPassage = ex.passages[activePassage] || {
    orderNo: activePassage + 1,
    title: '',
    paras: [],
    audio: null,
    imgs: [],
    groups: [],
  };
  const groups = currentPassage.groups || [];
  const currentGroup = groups[activeGroup] || null;
  const currentGroupStartNum = starts[activePassage]?.[activeGroup] ?? 1;

  // Hướng dẫn tự cập nhật theo giới hạn từ/số lựa chọn, trừ khi người dùng đã sửa tay
  const applyGroupUpdate = (
    g: LrGroupState,
    updater: (draft: LrGroupState) => void,
    p: LrPassageState,
    pIdx: number,
  ) => {
    const before = autoInstr(g, p, pIdx);
    const followAuto = !g.instr || g.instr === before;
    updater(g);
    if (followAuto) g.instr = autoInstr(g, p, pIdx);
  };

  const moveGroup = (gIdx: number, delta: number) => {
    const target = gIdx + delta;
    if (target < 0 || target >= groups.length) return;
    updateState((draft) => {
      const arr = draft.passages[activePassage]?.groups;
      if (!arr) return;
      const tmp = arr[gIdx];
      arr[gIdx] = arr[target];
      arr[target] = tmp;
    });
    if (activeGroup === gIdx) setActiveGroup(target);
    else if (activeGroup === target) setActiveGroup(gIdx);
  };

  const leftTitle = isReading ? 'Bài đọc' : 'Ghi âm và transcript';
  const passageTabs = ex.passages.map((p, i) => {
    let from = 1;
    for (let j = 0; j < i; j++) {
      from += (ex.passages[j].groups || []).reduce((a, g) => a + cnt(g, ex.passages[j]), 0);
    }
    const c = (p.groups || []).reduce((a, g) => a + cnt(g, p), 0);
    return {
      label: `${cfg.sectionName} ${i + 1}`,
      range: c > 0 ? `${from}-${from + c - 1}` : '—',
    };
  });
  const passageCount = (currentPassage.groups || []).reduce((a, g) => a + cnt(g, currentPassage), 0);
  const activeGroupSafe = activeGroup;
  const expRows: ExplainRow[] = explainRows(currentPassage, starts[activePassage] || []);
  const expProg = explainProgress(expRows);
  const selectedRow: ExplainRow | null = rightTab === 'e' && eq >= 0 ? (expRows[eq] ?? null) : null;

  const applyExplainRow = (row: ExplainRow, patch: ExplainPatch) => {
    updateState((draft) => {
      const g = draft.passages[activePassage]?.groups[row.gIdx];
      if (g) applyExplain(g, row.k, patch);
    });
  };

  const explainCtx =
    rightTab === 'e'
      ? {
        rows: expRows,
        selected: selectedRow,
        onSelectPara: (pi: number) => {
          if (selectedRow) applyExplainRow(selectedRow, { para: pi });
        },
        onAddKey: (t: string) => {
          if (selectedRow && !selectedRow.keys.includes(t)) {
            applyExplainRow(selectedRow, { keys: [...selectedRow.keys, t] });
          }
        },
        onSelectQuestion: (idx: number) => setEq(idx),
      }
      : undefined;

  const crumbs: Crumb[] = [
    { label: 'Quản lý', page: 'AdminHome' },
    { label: 'Bộ đề và đề thi', page: 'AdminExams' },
    { label: skill.set.name, page: 'AdminExamSet', params: { id: skill.set.id } },
    { label: `${isReading ? 'Reading' : 'Listening'} · v${skill.versionNumber}` },
  ];

  return (
    <div className="lr-editor-root flex h-screen overflow-hidden bg-[#FAF9F5] font-sans antialiased">
      <AdminSidebar active="exams" />
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#2E7D4F] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar: Breadcrumbs + Navigation */}
        <AdminTopbar crumbs={crumbs} onNavigate={(go) => setLeavePendingGo(() => go)} />

        {/* Editor Shell Topbar */}
        <EditorTopbar
          examTitle={skill.exam.title}
          examSetTitle={skill.set.name}
          mode={mode}
          onToggleMode={(newMode) => {
            if (newMode === 'view' && isDirty) {
              setLeavePendingGo(() => () => setMode('view'));
            } else {
              setMode(newMode);
            }
          }}
          dirty={!!isDirty}
          saving={saving}
          onSave={handleSave}
          onCancel={() => {
            if (isDirty) {
              setLeavePendingGo(() => () => {
                setEx(toLrState(skill));
                setMode('view');
              });
            } else {
              setMode('view');
            }
          }}
          onPublish={() => setConfirmPublish(true)}
          hasIssues={issues.length > 0}
          issuesCount={issues.length}
          onOpenIssues={() => setShowIssues(true)}
          onOpenHistory={() => setShowHistoryDrawer(true)}
          onDeleteOrDiscard={() => setConfirmDeleteSkill(true)}
          isDraft={skill.status === 'DRAFT'}
          canEdit={skill.status === 'DRAFT'}
          skillLabel={isReading ? 'Reading' : 'Listening'}
          formLabel={isReading ? (skill.form === 'GENERAL' ? 'General Training' : 'Academic') : null}
          totalQuestions={total}
          targetQuestions={40}
          tabs={passageTabs}
          activeTab={activePassage}
          onSelectTab={(idx) => {
            setActivePassage(idx);
            setActiveGroup(0);
            setEq(-1);
          }}
        />

        {/* Version Banner */}
        <VersionBanner
          status={skill.status}
          versionNumber={skill.versionNumber}
          basedOnVersion={skill.versionNumber > 1 ? skill.versionNumber - 1 : null}
          onCreateRevision={handleCreateRevision}
          creatingRevision={creatingDraft}
        />

        {/* Two-Column Editor Layout */}
        <div className="flex-1 flex overflow-hidden border-t border-solid border-[#E5E0D8]">
          {/* Left: passage / transcript */}
          {leftCollapsed ? (
            <div className="w-[60px] shrink-0 flex flex-col items-center gap-4 py-4 border-r border-solid border-[#E5E0D8] bg-[#FAF9F5]">
              <button
                type="button"
                onClick={() => setLeftCollapsed(false)}
                title="Mở rộng"
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-solid border-[#D6D4D0] bg-white text-[#352637] hover:bg-[#F3F0EA]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2} />
                  <path strokeWidth={2} d="M9 4v16" />
                </svg>
              </button>
              <div
                className="text-[12px] font-bold uppercase tracking-wide text-[#706473] whitespace-nowrap"
                style={{ writingMode: 'vertical-rl' }}
              >
                {leftTitle} · {cfg.sectionName} {activePassage + 1}
                {currentPassage.title ? ` · ${currentPassage.title}` : ''}
              </div>
            </div>
          ) : (
            <div className="w-5/12 min-w-[320px] shrink-0 flex flex-col overflow-hidden border-r border-solid border-[#E5E0D8] bg-[#FAF9F5]">
              <div className="flex items-center justify-between px-5 h-[58px] shrink-0 border-b border-solid border-[#E5E0D8]">
                <span className="text-[13px] font-bold uppercase tracking-wide text-[#352637]">
                  {leftTitle} · {cfg.sectionName} {activePassage + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setLeftCollapsed(true)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4B3D4D] hover:text-[#2963CC]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2} />
                    <path strokeWidth={2} d="M9 4v16" />
                  </svg>
                  Thu gọn
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {isReading ? (
                  <PassagePanel
                    ex={ex}
                    activePassageIndex={activePassage}
                    readOnly={mode === 'view'}
                    skillId={skillId || undefined}
                    onChangePassage={(updater) => {
                      updateState((draft) => {
                        const p = draft.passages[activePassage];
                        if (p) updater(p);
                      });
                    }}
                    explain={explainCtx}
                  />
                ) : (
                  <TranscriptPanel
                    ex={ex}
                    activePassageIndex={activePassage}
                    readOnly={mode === 'view'}
                    onSeekAudio={(sec) => setSeekAudioSec(sec)}
                    onChangePassage={(updater) => {
                      updateState((draft) => {
                        const p = draft.passages[activePassage];
                        if (p) updater(p);
                      });
                    }}
                    onOpenTranscribeModal={() => {
                      if (!currentPassage.audio) {
                        alert('Vui lòng tải tệp ghi âm lên trước khi tạo transcript.');
                        return;
                      }
                      setTranscribeModal(true);
                    }}
                    explain={explainCtx}
                    audioSlot={
                      <AudioPanel
                        passage={currentPassage}
                        skillId={skillId || undefined}
                        readOnly={mode === 'view'}
                        seekSec={seekAudioSec}
                        onChangeAudio={(audio) => {
                          updateState((draft) => {
                            const p = draft.passages[activePassage];
                            if (p) p.audio = audio;
                          });
                        }}
                      />
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Right: questions / explanations */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#FAF9F5]">
            <div className="flex items-center gap-4 px-5 h-[58px] shrink-0 border-b border-solid border-[#E5E0D8] bg-white">
              <span className="text-[14px] font-semibold text-[#352637]">
                {cfg.sectionName} {activePassage + 1}
              </span>
              <div className="inline-flex items-center gap-1 p-[3px] rounded-xl bg-[#F3F0EA]">
                <button
                  type="button"
                  onClick={() => setRightTab('q')}
                  className={`px-3 py-1 rounded-[9px] text-[13px] font-semibold border border-solid ${rightTab === 'q'
                      ? 'bg-white border-[#D6D4D0] shadow-sm text-[#352637]'
                      : 'border-transparent text-[#706473]'
                    }`}
                >
                  Câu hỏi{' '}
                  <span className="font-normal text-[#706473]">
                    {passageTabs[activePassage]?.range !== '—'
                      ? `Câu ${passageTabs[activePassage]?.range}`
                      : ''}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRightTab('e')}
                  className={`px-3 py-1 rounded-[9px] text-[13px] font-semibold border border-solid ${rightTab === 'e'
                      ? 'bg-white border-[#D6D4D0] shadow-sm text-[#352637]'
                      : 'border-transparent text-[#706473]'
                    }`}
                >
                  Giải thích{' '}
                  <span className="ml-1 text-[12px] px-2 py-0.5 rounded-full bg-[#FBEBB0] text-[#5A4300]">
                    {expProg.done}/{expProg.total}
                  </span>
                </button>
              </div>
              <span className="ml-auto text-[13px] text-[#706473]">{passageCount} câu</span>
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-solid text-[13px] font-semibold ${history.length > 0
                      ? 'border-[#D6D4D0] bg-white text-[#352637] hover:bg-[#F3F0EA]'
                      : 'border-[#E5E0D8] text-[#A89CA8] cursor-not-allowed'
                    }`}
                >
                  ← Hoàn tác
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {rightTab === 'e' ? (
                <ExplainPanel
                  isReading={isReading}
                  passage={currentPassage}
                  rows={expRows}
                  eq={eq}
                  onSelect={setEq}
                  readOnly={mode === 'view'}
                  onApply={applyExplainRow}
                />
              ) : (
                <div className="px-5 py-4 space-y-3">
                  {groups.map((g, gIdx) => {
                    const currentGroup = g;
                    const activeGroup = gIdx;
                    const currentGroupStartNum = starts[activePassage]?.[gIdx] ?? 1;
                    const open = gIdx === activeGroupSafe;
                    const c = cnt(g, currentPassage);
                    const gIss = groupIssues(g, currentPassage, cfg.sectionName, activePassage);
                    return (
                      <div
                        key={gIdx}
                        className={`rounded-2xl bg-white border border-solid ${open ? 'border-[#2963CC] border-2' : 'border-[#E5E0D8]'
                          }`}
                      >
                        <div className="flex items-center gap-3 px-4 py-3">
                          {mode === 'edit' && (
                            <div className="flex flex-col shrink-0">
                              <button
                                type="button"
                                onClick={() => moveGroup(gIdx, -1)}
                                disabled={gIdx === 0}
                                className="p-0.5 text-[#706473] hover:text-[#352637] disabled:opacity-30"
                                title="Di chuyển nhóm lên"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => moveGroup(gIdx, 1)}
                                disabled={gIdx === groups.length - 1}
                                className="p-0.5 text-[#706473] hover:text-[#352637] disabled:opacity-30"
                                title="Di chuyển nhóm xuống"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          )}
                              <div className="flex-1 min-w-0 flex items-center gap-3 text-left">
                                <span
                                  onClick={() => setActiveGroup(open ? -1 : gIdx)}
                                  className="text-[14px] font-semibold text-[#352637] shrink-0 cursor-pointer hover:text-[#2963CC]"
                                >
                                  {c > 0
                                    ? formatQuestionRange(currentGroupStartNum, currentGroupStartNum + c - 1)
                                    : `Nhóm ${gIdx + 1}`}
                                </span>
                                <GroupTypeSwitcher
                                  currentType={g.type}
                                  allowedTypes={cfg.allowedTypes}
                                  readOnly={mode === 'view'}
                                  isReading={isReading}
                                  onSelectType={(nextType) => handleChangeType(gIdx, nextType)}
                                />
                                {gIss.length > 0 && (
                                  <span
                                    onClick={() => setActiveGroup(open ? -1 : gIdx)}
                                    className="w-2 h-2 rounded-full bg-[#C0412A] shrink-0 cursor-pointer"
                                    title={`${gIss.length} vấn đề cần sửa`}
                                  />
                                )}
                            </div>
                            {mode === 'edit' && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteGroup(gIdx)}
                                className="p-1.5 text-[#C0412A] hover:bg-[#FDF3F0] rounded-lg"
                                title="Xóa nhóm này"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setActiveGroup(open ? -1 : gIdx)}
                              className="p-1.5 text-[#706473] hover:bg-[#F3F0EA] rounded-lg"
                              title={open ? 'Thu gọn' : 'Mở rộng'}
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${open ? '' : 'rotate-180'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                        </div>
                        {open && (
                          <div className="px-5 pb-5 space-y-4">

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-bold text-[#706473] uppercase tracking-wider">
                                  Lời hướng dẫn (Instruction)
                                </label>
                                {mode === 'edit' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateState((draft) => {
                                        const g = draft.passages[activePassage]?.groups[activeGroup];
                                        if (g) {
                                          g.instr = autoInstr(g, draft.passages[activePassage], activePassage);
                                        }
                                      });
                                    }}
                                    className="text-[11px] font-semibold text-[#2963CC] hover:underline"
                                  >
                                    Tự động điền theo chuẩn Cambridge
                                  </button>
                                )}
                              </div>
                              <textarea
                                rows={2}
                                value={currentGroup.instr || ''}
                                disabled={mode === 'view'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateState((draft) => {
                                    const g = draft.passages[activePassage]?.groups[activeGroup];
                                    if (g) g.instr = val;
                                  });
                                }}
                                placeholder="Nhập lời hướng dẫn cho thí sinh..."
                                className="w-full text-[13px] border border-[#D6D4D0] rounded-xl p-2.5 text-[#352637] placeholder-[#A89CA8] focus:outline-hidden focus:border-[#2963CC] resize-none"
                              />
                            </div>

                            {/* Specific Question Card by Type */}
                            <div className="pt-1">
                              {(currentGroup.type === 'SENTENCE_COMP' ||
                                currentGroup.type === 'SHORT_ANSWER') && (
                                  <GapCard
                                    group={currentGroup}
                                    passage={currentPassage}
                                    passageIndex={activePassage}
                                    groupStartNum={currentGroupStartNum}
                                    readOnly={mode === 'view'}
                                    onChange={(updater) => {
                                      updateState((draft) => {
                                        const g = draft.passages[activePassage]?.groups[activeGroup];
                                        if (g) applyGroupUpdate(g, updater, draft.passages[activePassage], activePassage);
                                      });
                                    }}
                                  />
                                )}

                              {(currentGroup.type === 'SUMMARY_COMP' ||
                                currentGroup.type === 'NOTE_COMP') && (
                                  <BlankTextCard
                                    group={currentGroup}
                                    passage={currentPassage}
                                    passageIndex={activePassage}
                                    groupStartNum={currentGroupStartNum}
                                    readOnly={mode === 'view'}
                                    onChange={(updater) => {
                                      updateState((draft) => {
                                        const g = draft.passages[activePassage]?.groups[activeGroup];
                                        if (g) applyGroupUpdate(g, updater, draft.passages[activePassage], activePassage);
                                      });
                                    }}
                                    onChangeType={(nextType) =>
                                      handleChangeType(gIdx, nextType, {
                                        body: currentGroup.body,
                                        limit: currentGroup.limit,
                                      })
                                    }
                                  />
                                )}

                              {currentGroup.type === 'SUMMARY_BOX' && (
                                <WordBankCard
                                  group={currentGroup}
                                  passage={currentPassage}
                                  passageIndex={activePassage}
                                  groupStartNum={currentGroupStartNum}
                                  readOnly={mode === 'view'}
                                  onChange={(updater) => {
                                    updateState((draft) => {
                                      const g = draft.passages[activePassage]?.groups[activeGroup];
                                      if (g) applyGroupUpdate(g, updater, draft.passages[activePassage], activePassage);
                                    });
                                  }}
                                  onChangeType={(nextType) =>
                                    handleChangeType(gIdx, nextType, {
                                      body: currentGroup.body,
                                      limit: currentGroup.limit,
                                    })
                                  }
                                />
                              )}

                              {currentGroup.type === 'TABLE_COMP' && (
                                <TableCard
                                  group={currentGroup}
                                  passage={currentPassage}
                                  passageIndex={activePassage}
                                  groupStartNum={currentGroupStartNum}
                                  readOnly={mode === 'view'}
                                  onChange={(updater) => {
                                    updateState((draft) => {
                                      const g = draft.passages[activePassage]?.groups[activeGroup];
                                      if (g) applyGroupUpdate(g, updater, draft.passages[activePassage], activePassage);
                                    });
                                  }}
                                />
                              )}

                              {currentGroup.type === 'FLOW_COMP' && (
                                <FlowCard
                                  group={currentGroup}
                                  passage={currentPassage}
                                  passageIndex={activePassage}
                                  groupStartNum={currentGroupStartNum}
                                  readOnly={mode === 'view'}
                                  skillId={skillId || undefined}
                                  onChange={(updater) => {
                                    updateState((draft) => {
                                      const g = draft.passages[activePassage]?.groups[activeGroup];
                                      if (g) applyGroupUpdate(g, updater, draft.passages[activePassage], activePassage);
                                    });
                                  }}
                                />
                              )}

                              {currentGroup.type === 'DIAGRAM_COMP' && (
                                <DiagramCard
                                  group={currentGroup}
                                  passage={currentPassage}
                                  passageIndex={activePassage}
                                  groupStartNum={currentGroupStartNum}
                                  readOnly={mode === 'view'}
                                  skillId={skillId || undefined}
                                  onChange={(updater) => {
                                    updateState((draft) => {
                                      const g = draft.passages[activePassage]?.groups[activeGroup];
                                      if (g) applyGroupUpdate(g, updater, draft.passages[activePassage], activePassage);
                                    });
                                  }}
                                />
                              )}

                              {(currentGroup.type === 'MATCH_HEADING' ||
                                currentGroup.type === 'MATCH_INFO' ||
                                currentGroup.type === 'MATCH_ENDING' ||
                                currentGroup.type === 'MATCH_FEATURE') && (
                                  <MatchCard
                                    group={currentGroup}
                                    passage={currentPassage}
                                    passageIndex={activePassage}
                                    groupStartNum={currentGroupStartNum}
                                    readOnly={mode === 'view'}
                                    onChange={(updater) => {
                                      updateState((draft) => {
                                        const g = draft.passages[activePassage]?.groups[activeGroup];
                                        if (g) applyGroupUpdate(g, updater, draft.passages[activePassage], activePassage);
                                      });
                                    }}
                                  />
                                )}

                              {(currentGroup.type === 'MCQ_SINGLE' ||
                                currentGroup.type === 'MCQ_MULTI') && (
                                  <McqCard
                                    group={currentGroup}
                                    passage={currentPassage}
                                    passageIndex={activePassage}
                                    groupStartNum={currentGroupStartNum}
                                    readOnly={mode === 'view'}
                                    onChange={(updater) => {
                                      updateState((draft) => {
                                        const g = draft.passages[activePassage]?.groups[activeGroup];
                                        if (g) applyGroupUpdate(g, updater, draft.passages[activePassage], activePassage);
                                      });
                                    }}
                                  />
                                )}

                              {(currentGroup.type === 'YNNG' ||
                                currentGroup.type === 'TFNG') && (
                                  <JudgeCard
                                    group={currentGroup}
                                    passage={currentPassage}
                                    passageIndex={activePassage}
                                    groupStartNum={currentGroupStartNum}
                                    readOnly={mode === 'view'}
                                    onChange={(updater) => {
                                      updateState((draft) => {
                                        const g = draft.passages[activePassage]?.groups[activeGroup];
                                        if (g) applyGroupUpdate(g, updater, draft.passages[activePassage], activePassage);
                                      });
                                    }}
                                  />
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {groups.length === 0 && (
                    <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#B9B2A8] rounded-2xl bg-white space-y-2">
                      <h3 className="text-[15px] font-bold text-[#352637]">
                        Chưa có nhóm câu hỏi nào trong {cfg.sectionName} {activePassage + 1}
                      </h3>
                      <p className="text-[12px] text-[#706473]">
                        Bấm nút bên dưới để chọn và tạo nhóm câu hỏi đầu tiên.
                      </p>
                    </div>
                  )}

                  {mode === 'edit' && (
                    <button
                      type="button"
                      onClick={() => setShowTypePicker(true)}
                      className="w-full py-3 border border-dashed border-[#B9B2A8] text-[#352637] hover:bg-[#F3F0EA] text-[13px] font-semibold rounded-2xl transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Thêm nhóm câu hỏi
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs & Drawers */}
      <PublishIssues
        isOpen={showIssues}
        issues={issues}
        onClose={() => setShowIssues(false)}
        onSelectIssue={(p, g) => {
          setActivePassage(p);
          if (g >= 0) setActiveGroup(g);
        }}
      />

      <TypePicker
        isOpen={showTypePicker}
        onClose={() => setShowTypePicker(false)}
        onSelectType={handleAddGroup}
        allowedTypes={cfg.allowedTypes}
        isReading={isReading}
      />

      <SkillHistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        skillId={skillId}
        onSelectVersion={(vId) => {
          navigate(
            isReading
              ? `AdminReadingEditor?skillId=${vId}`
              : `AdminListeningEditor?skillId=${vId}`
          );
          setSkillId(vId);
          loadSkill(vId);
        }}
      />

      <ConfirmDialog
        isOpen={confirmChangeType !== null}
        title={`Đổi sang ${confirmChangeType
            ? COMBO_TYPE_LABELS[confirmChangeType.nextType] || confirmChangeType.nextType
            : ''
          }?`}
        message="Dữ liệu của dạng hiện tại trong thẻ sẽ bị xóa và thay bằng thẻ của dạng đã chọn. Bạn vẫn có thể hoàn tác sau đó."
        isDanger={true}
        confirmText="Đổi dạng"
        cancelText="Hủy bỏ"
        onConfirm={() => {
          if (confirmChangeType) {
            applyChangeType(
              confirmChangeType.groupIndex,
              confirmChangeType.nextType,
              confirmChangeType.keep
            );
          }
        }}
        onCancel={() => setConfirmChangeType(null)}
      />

      <ConfirmDialog
        isOpen={confirmDeleteGroup !== null}
        title="Xác nhận xóa nhóm câu hỏi"
        message="Toàn bộ câu hỏi, đáp án và giải thích trong nhóm này sẽ bị xóa. Bạn có chắc chắn muốn xóa không?"
        isDanger={true}
        confirmText="Xóa nhóm"
        cancelText="Hủy bỏ"
        onConfirm={() => {
          if (confirmDeleteGroup !== null) handleDeleteGroup(confirmDeleteGroup);
        }}
        onCancel={() => setConfirmDeleteGroup(null)}
      />

      <ConfirmDialog
        isOpen={confirmPublish}
        title="Xác nhận đăng đề thi"
        message={`Đề thi "${skill.exam.title}" đã đủ 40 câu và vượt qua toàn bộ các bước kiểm tra. Sau khi đăng, học viên sẽ có thể làm bài trong thư viện.`}
        confirmText="Đăng đề ngay"
        cancelText="Kiểm tra lại"
        onConfirm={handlePublish}
        onCancel={() => setConfirmPublish(false)}
      />

      <ConfirmDialog
        isOpen={confirmDeleteSkill}
        title="Xác nhận xóa kỹ năng"
        message="Hành động này sẽ xóa vĩnh viễn kỹ năng và mọi dữ liệu bài đọc, âm thanh, câu hỏi liên quan. Bạn có chắc chắn muốn xóa không?"
        isDanger={true}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        onConfirm={handleDeleteSkill}
        onCancel={() => setConfirmDeleteSkill(false)}
      />

      <LeaveDialog
        isOpen={leavePendingGo !== null}
        saving={saving}
        onSave={async () => {
          await handleSave();
          if (leavePendingGo) leavePendingGo();
          setLeavePendingGo(null);
        }}
        onDiscard={() => {
          if (leavePendingGo) leavePendingGo();
          setLeavePendingGo(null);
        }}
        onKeepEditing={() => setLeavePendingGo(null)}
      />

      <UnsavedGuard
        dirty={Boolean(isDirty)}
        onPromptLeave={(proceed) => setLeavePendingGo(() => proceed)}
      />

      {/* Transcription Preview Modal (LRE-07c) */}
      <TranscribeModal
        isOpen={transcribeModal}
        onClose={() => setTranscribeModal(false)}
        skillId={skillId || ''}
        orderNo={activePassage + 1}
        audioPath={currentPassage.audio?.path || null}
        hasExistingTranscript={(currentPassage.paras || []).some((x) => String(x || '').trim().length > 0)}
        onApply={handleApplyTranscription}
      />
    </div>
  );
}
