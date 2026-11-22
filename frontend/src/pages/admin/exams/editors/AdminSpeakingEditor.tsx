import React from "react";
import { TOAST_MS } from "../../../../lib/shared/toast";
import { styleOf, cssText } from "../../../../lib/shared/styles";
import { TOPIC_MAX_LENGTH } from "../../../../lib/exams/exam-labels";
import TopicCombobox from "../../../../components/exams/TopicCombobox";
import { listTopics } from "../../../../lib/exams/exam-editor";
import AdminSidebar from "../../../../components/navigation/AdminSidebar";
import AdminTopbar, { Crumb } from "../../../../components/navigation/AdminTopbar";
import { navigate } from "../../../../lib/auth/auth";
import { errorInfo, fmtDate, deleteSkill, publishSkill } from "../../../../lib/exams/exam-admin";
import { ApiError } from "../../../../lib/shared/api";
import {
  getEditorSkill,
  saveSkillContent,
  createRevisionDraft,
  toSpeakingEditorState,
  fromSpeakingEditorState,
  type EditorSkill,
  type SpeakingEditorState,
  type SpeakingPart,
} from "../../../../lib/exams/exam-editor";
import SkillHistoryDrawer from "../../../../components/exams/SkillHistoryDrawer";
import { versionMessages } from "../../../../lib/exams/version-messages";

type Ev = React.SyntheticEvent | null | undefined;

type ConfirmData = {
  title: string;
  sub: string;
  goText?: string;
  run?: (() => Promise<void> | void) | null;
};

type ImportFileItem = [string, number, string, (string | null)?];

type State = {
  topicOptions: string[];
  skillId: string | null;
  loading: boolean;
  notFound: boolean;
  skill: EditorSkill | null;
  ex: SpeakingEditorState;
  base: SpeakingEditorState | null;
  editing: boolean;
  saving: boolean;
  t: number;
  hist: SpeakingEditorState[];
  lastTag: string | null;
  issues: Array<{ t?: number; text: string }> | null;
  pubAsk: boolean;
  leave: boolean;
  confirm: ConfirmData | null;
  confirmRun?: (() => Promise<void> | void) | null;
  imgErr: string;
  snack: string | null;
  toast: string;
  imp: string | null;
  impSet: string | null;
  historyOpen: boolean;
  impF?: ImportFileItem[];
  impP?: number;
  impN?: number;
  impSaw?: boolean;
  impDrag?: boolean;
  impErr?: string;
};

type SpeakingQuestionItem = {
  n: number;
  lab: string;
  delLab: string;
  v: string;
  set: (e: React.ChangeEvent<HTMLInputElement>) => void;
  del: (e?: Ev) => void;
};

type SpeakingFormItem = {
  name: string;
  empty: boolean;
  clear: (e?: Ev) => void;
  emptyText: string;
  noContent: boolean;
  edId?: string;
  text?: string;
  setText?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  fmtB?: (e?: Ev) => void;
  fmtI?: (e?: Ev) => void;
  fmtH?: (e?: Ev) => void;
  fmtL?: (e?: Ev) => void;
  isCue: boolean;
  isQ: boolean;
  hasInstr: boolean;
  qCount: number;
  tot: string;
  setTot: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totSt: string;
  qlist: SpeakingQuestionItem[];
  addQ: (e?: Ev) => void;
  pq: Array<{ n: number; v: string }>;
  instr: string;
  setInstr: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  topic: string;
  setTopicValue: (value: string) => void;
  canEdit: boolean;
  prep: string;
  speak: string;
  setPrep: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSpeak: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prepSt: string;
  speakSt: string;
  edLabel: string;
  edHint: string;
  ph: string;
  headLine: string;
  pv: MdLine[];
  countNote: string;
};

type MdLine = { li: boolean; segs: Array<{ t: string; st: string }>; st: string };

type ImportCheckItem = {
  text: string;
  color: string;
  cls: string;
  icon: string;
  iconSt: string;
};

type ImportStatItem = {
  n: string;
  label: string;
};

type ImportPreviewItem = {
  title: string;
  sub: string;
  groups: string[];
};

type ImportFileDisplay = {
  name: string;
  size: string;
  icon: string;
  iconSt: string;
  rm: (e?: Ev) => void;
};

type SpeakingTabItem = {
  name: string;
  range: string;
  on: boolean;
  sub: string;
  pick: (e?: Ev) => void;
  st: string;
};

type SpeakingIssueItem = {
  text: string;
  go?: (e?: Ev) => void;
};

interface SpeakingView {
  crumbs: Crumb[];
  onNavigate: (go: () => void) => void;
  examTitle: string;
  examPath: string;
  typeText: string;
  typeTitle: string;
  typeSt: string;
  modeText: string;
  modeSt: string;
  counter: string;
  counterSt: string;
  viewing: boolean;
  editing: boolean;
  modeCls: string;
  tabs: SpeakingTabItem[];
  F: SpeakingFormItem;
  dirtyText: string;
  dirtyColor: string;
  undo: (e?: Ev) => void;
  undoSt: string;

  canEdit: boolean | null;
  canPublish: boolean | null;
  canDelete: boolean | null;
  deleteLabel: string;
  confirmGoText: string;
  deleteSkillAction: (e?: Ev) => void;
  startEdit: (e?: Ev) => Promise<void>;
  saveEdit: (e?: Ev) => Promise<void>;
  cancelEdit: (e?: Ev) => void;
  leaveOpen: boolean;
  leaveSub: string;
  stayEdit: (e?: Ev) => void;
  discardEdit: (e?: Ev) => void;
  publish: (e?: Ev) => Promise<void>;
  pubOpen: boolean;
  pubTitle: string;
  pubSub: string;
  pubCancel: (e?: Ev) => void;
  pubOk: (e?: Ev) => Promise<void>;

  hasIssues: boolean;
  issueHead: string;
  closeIssues: () => void;
  issues: SpeakingIssueItem[];

  confirmOpen: boolean;
  confirmTitle: string;
  confirmSub: string;
  confirmCancel: (e?: Ev) => void;
  confirmOk: (e?: Ev) => void;
  snackOpen: boolean;
  snack: string;
  hideSnack: (e?: Ev) => void;
  toast: boolean;
  toastText: string;
  hideToast: (e?: Ev) => void;
  preview: (e?: Ev) => void;

  impOn: boolean;
  impPick: boolean;
  impRun: boolean;
  impBroken: boolean;
  impBad: boolean;
  impOk: boolean;
  impSub: string;
  impOpen: (e?: Ev) => void;
  impClose: (e?: Ev) => void;
  impKeep: (e?: Ev) => void;
  impDl: () => void;
  impDropSt: string;
  impDragOver: (e?: Ev) => void;
  impDragLeave: () => void;
  impDrop: (e: React.DragEvent<HTMLElement>) => void;
  impPickFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  impFiles: ImportFileDisplay[];
  impErr: boolean;
  impErrText: string;
  impReplace: boolean;
  impReplaceText: string;
  impSampleText: string;
  impSample: (e?: Ev) => void;
  impNoX: boolean;
  impCheckSt: string;
  impCheck: (e?: Ev) => void;
  impX: string;
  impChecks: ImportCheckItem[];
  impBack: (e?: Ev) => void;
  impErrN: string;
  impRows: Array<{ sheet: string; row: number; col: number; text: string }>;
  impTitle: string;
  impForm: string;
  impStats: ImportStatItem[];
  impPrev: ImportPreviewItem[];
  impWarns: string[];
  impReplaceNote: string;
  impApply: (e?: Ev) => void;

  skill: EditorSkill | null;
  dirty: boolean;
  ask: (title: string, sub: string, run: () => Promise<void> | void, goText?: string) => void;
  historyOpen: boolean;
  openHistory: () => void;
  closeHistory: () => void;
}


class AdminSpeakingEditor extends React.Component<Record<string, unknown>, State> {
  _key?: (e: KeyboardEvent) => void;
  _undo?: (e?: Ev) => void;
  _it?: Array<ReturnType<typeof setTimeout>>;
  _mounted = false;
  _impFile?: File | Blob | null;
  _edId?: string;

  state: State = {
    topicOptions: [],
    skillId: null,
    loading: true,
    notFound: false,
    skill: null,
    ex: {
      title: "Practice Test",
      tot: "15",
      items: [
        { kind: "qs", instr: "", qs: [] },
        { kind: "cue", prep: "1", speak: "2", text: "" },
        { kind: "qs", instr: "", qs: [] },
      ],
    },
    base: null,
    editing: false,
    saving: false,
    t: 0,
    hist: [],
    lastTag: null,
    issues: null,
    pubAsk: false,
    leave: false,
    confirm: null,
    confirmRun: null,
    imgErr: "",
    snack: null,
    toast: "",
    imp: null,
    impSet: null,
    historyOpen: false,
  };

  componentDidMount() {
    this._mounted = true;
    listTopics()
      .then((t) => this._mounted && this.setState({ topicOptions: t }))
      .catch(() => undefined);
    const self = this;
    this._key = function (e: KeyboardEvent) {
      const tag = (e.target && (e.target as HTMLElement).tagName) || "";
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        (e.key === "z" || e.key === "Z") &&
        tag !== "INPUT" &&
        tag !== "TEXTAREA"
      ) {
        e.preventDefault();
        if (self._undo) {
          self._undo();
        }
      }
      if (e.key === "Escape") {
        const st = self.state;
        if (st.imp) {
          self.setState({ imp: null });
        } else if (st.leave) {
          self.setState({ leave: false });
        } else if (st.pubAsk) {
          self.setState({ pubAsk: false });
        } else if (st.confirm) {
          self.setState({ confirm: null });
        }
      }
    };
    document.addEventListener("keydown", this._key);
    window.addEventListener("hashchange", this.onHashChange);
    this.initFromUrl();
  }

  _toastT: ReturnType<typeof setTimeout> | undefined;

  componentDidUpdate(_p: unknown, prev: { toast: string }) {
    if (this.state.toast && this.state.toast !== prev.toast) {
      clearTimeout(this._toastT);
      this._toastT = setTimeout(() => {
        if (this._mounted) this.setState({ toast: "" });
      }, TOAST_MS);
    }
  }

  componentWillUnmount() {
    clearTimeout(this._toastT);
    this._mounted = false;
    if (this._key) {
      document.removeEventListener("keydown", this._key);
    }
    window.removeEventListener("hashchange", this.onHashChange);
    (this._it || []).forEach(clearTimeout);
  }

  onHashChange = () => {
    const hash = window.location.hash || "";
    const qIdx = hash.indexOf("?");
    const paramStr = qIdx !== -1 ? hash.slice(qIdx + 1) : "";
    const urlParams = new URLSearchParams(paramStr);
    const skillId = urlParams.get("skillId");
    if (skillId && skillId !== this.state.skillId) {
      this.initFromUrl();
    }
  };

  initFromUrl = async () => {
    const hash = window.location.hash || "";
    const qIdx = hash.indexOf("?");
    const paramStr = qIdx !== -1 ? hash.slice(qIdx + 1) : "";
    const urlParams = new URLSearchParams(paramStr);
    const skillId = urlParams.get("skillId");

    if (!skillId) {
      this.setState({ loading: false, notFound: true });
      return;
    }

    this.setState({ loading: true, notFound: false });
    try {
      const skill = await getEditorSkill(skillId);
      if (skill.skill !== "SPEAKING") {
        navigate(`AdminWritingEditor?skillId=${skillId}`);
        return;
      }
      const ex = toSpeakingEditorState(skill);
      if (!this._mounted) return;
      this.setState({
        skillId,
        skill,
        ex,
        base: JSON.parse(JSON.stringify(ex)),
        loading: false,
        notFound: false,
        editing: false,
        t: 0,
        hist: [],
      });
      if (skill) {
        document.title = versionMessages.tabTitle("Speaking", skill.versionNumber);
      }
    } catch {
      if (this._mounted) {
        this.setState({ loading: false, notFound: true });
      }
    }
  };
renderVals(): SpeakingView {
    var me = this,
      s = me.state,
      self = me,
      UNIT = "Part",
      NAME = "Speaking";
    var skill = s.skill;
    var FULL: SpeakingEditorState = {
      title: "Practice Test 01",
      tot: "15",
      items: [
        {
          kind: "qs",
          instr: "Two or three complex sentences for each answer.",
          qs: [
            "Do you like to travel?",
            "What kind of places have you visited?",
            "What is the best place you have ever visited?",
            "Which place would you really like to visit?",
            "How do you feel about shopping?",
            "Do you like shopping on the internet?",
            "What don't you like about shopping?",
            "Which is the most popular place to shop where you live?",
            "Can you describe your hometown?",
            "What are the most interesting things in your hometown?",
            "What would be the best way for me to travel around your hometown?",
            "Should I go there at any special time of year?",
          ],
        },
        {
          kind: "cue",
          prep: "1",
          speak: "2",
          text: "## Describe your exercise routine.\nYou should say:\n- What exercise you do.\n- How often you do exercise.\n- How you feel after exercise.\nAnd explain why exercise is or isn't important to you.",
        },
        {
          kind: "qs",
          instr: "Four or five complex sentences for each answer.",
          qs: [
            "Do you think young people live healthier lives now than in the past?",
            "What can be done to overcome increasing global obesity?",
            "What can governments do to help individuals become healthier?",
            "Are people in your country health conscious?",
            "Should restaurants be forced to label how healthy their food is?",
            "Should diet and exercise classes be taught in schools?",
          ],
        },
      ],
    };

    var ex = s.ex;
    var NI = ex.items.length,
      ti = Math.min(s.t == null ? 0 : s.t, NI - 1);
    var editing = !!s.editing;
    var base = s.base || ex,
      dirty = editing && JSON.stringify(base) !== JSON.stringify(ex),
      nChange = (s.hist || []).length;
    function stop(e?: Ev) {
      if (e && (e as React.SyntheticEvent).preventDefault) {
        (e as React.SyntheticEvent).preventDefault();
      }
    }
    function clone<T>(o: T): T {
      return JSON.parse(JSON.stringify(o));
    }
    function upd(
      fn: (it: SpeakingPart, n: SpeakingEditorState) => void,
      extra?: Partial<State> | null,
      tag?: string,
    ) {
      if (!editing) {
        return;
      }
      var n: SpeakingEditorState = clone(ex);
      fn(n.items[ti], n);
      var hist = s.hist || [];
      if (!(tag && s.lastTag === tag)) {
        hist = hist.concat([ex]).slice(-50);
      }
      var st: Partial<State> = {
        ex: n,
        issues: null,
        hist: hist,
        lastTag: tag || null,
        snack: null,
      };
      if (extra) {
        for (var k in extra) {
          (st as Record<string, unknown>)[k] = (extra as Record<string, unknown>)[k];
        }
      }
      self.setState(st as State);
    }
    function setter(fn: (it: SpeakingPart, v: string) => void) {
      return function (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        var v = e.target.value;
        upd(
          function (it) {
            fn(it, v);
          },
          null,
          "type",
        );
      };
    }
    function ask(title: string, sub: string, run: () => Promise<void> | void, goText = "Xóa") {
      self.setState({
        confirm: { title: title, sub: sub, goText: goText, run: run },
        confirmRun: run,
        snack: null,
      });
    }
    function undo(e?: Ev) {
      stop(e);
      var h = s.hist || [];
      if (!h.length) {
        return;
      }
      self.setState({
        ex: h[h.length - 1],
        hist: h.slice(0, -1),
        lastTag: null,
        snack: null,
        issues: null,
        confirm: null,
      });
    }
    me._undo = undo;
    var CHIP =
      "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; font-size: 13px; font-weight: 600";
    var num = function (v: unknown): number {
      return /^\d+$/.test(String(v || "").trim()) ? parseInt(String(v), 10) : 0;
    };
    var inp = function (bad?: boolean): string {
      return (
        "box-sizing: border-box; width: 100%; min-width: 0; height: 38px; padding: 0 12px; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font: inherit; font-size: 14px; outline-color: #2963CC" +
        (bad ? "; border-color: #C0412A; background: #FDF3F0" : "")
      );
    };
    function plural(n: number, w: string): string {
      return n + " " + w + (n === 1 ? "" : "s");
    }
    function lines(t?: string): string[] {
      return String(t || "").split("\n");
    }
    function isEmptyItem(it: SpeakingPart): boolean {
      if (it.kind === "qs") {
        return !it.qs.some(function (q) {
          return String(q).trim();
        });
      } else {
        return !String(it.text || "").trim();
      }
    }
    function segsOf(l: string): Array<{ t: string; st: string }> {
      var segs: Array<{ t: string; st: string }> = [];
      String(l)
        .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
        .forEach(function (t) {
          if (!t) {
            return;
          }
          if (/^\*\*[^*]+\*\*$/.test(t)) {
            segs.push({ t: t.slice(2, -2), st: "font-weight: 700" });
          } else if (/^\*[^*]+\*$/.test(t)) {
            segs.push({ t: t.slice(1, -1), st: "font-style: italic" });
          } else {
            segs.push({ t: t, st: "" });
          }
        });
      return segs;
    }
    function mdLines(text: string): MdLine[] {
      return lines(text).map(function (raw) {
        var l = raw.trim(),
          kind = "p";
        if (!l) {
          return { li: false, segs: [], st: "height: 8px" };
        }
        if (/^#{1,3} /.test(l)) {
          kind = "h";
          l = l.replace(/^#{1,3} /, "");
        } else if (/^[-•] /.test(l)) {
          kind = "li";
          l = l.slice(2);
        }
        return {
          li: kind === "li",
          segs: segsOf(l),
          st:
            "display: flex; gap: 4px; " +
            (kind === "h"
              ? "font-weight: 700; font-size: 15px"
              : kind === "li"
                ? "padding-left: 4px"
                : ""),
        };
      });
    }
    var it = ex.items[ti];
    function allIssues(): Array<{ t?: number; text: string }> {
      var out: Array<{ t?: number; text: string }> = [];
      ex.items.forEach(function (x, i) {
        var nm = UNIT + " " + (i + 1);
        if (x.kind === "qs") {
          if (!x.qs.some(function (q) { return String(q).trim(); })) {
            out.push({ t: i, text: nm + " chưa có câu hỏi." });
          } else if (x.qs.some(function (q) { return !String(q).trim(); })) {
            out.push({
              t: i,
              text: nm + " có câu hỏi để trống, hãy nhập hoặc xóa.",
            });
          }
          if (i === 0 && (!num(ex.tot) || num(ex.tot) > 60)) {
            out.push({
              t: i,
              text: "Thời gian tổng Part 1 và Part 3 cần là số phút từ 1 đến 60.",
            });
          }
        } else {
          if (!String(x.text || "").trim()) {
            out.push({ t: i, text: nm + " chưa có nội dung thẻ đề." });
          }
          if (!num(x.prep) || !num(x.speak)) {
            out.push({
              t: i,
              text:
                nm +
                " cần số phút chờ chuẩn bị và số phút nói (số nguyên từ 1).",
            });
          }
        }
      });
      return out;
    }
    var tabs: SpeakingTabItem[] = ex.items.map(function (x, i) {
      var on = i === ti;
      var sub = isEmptyItem(x)
        ? "chưa nhập"
        : x.kind === "cue"
          ? num(x.prep) + " + " + num(x.speak) + " phút"
          : x.qs.length + " câu";
      return {
        name: UNIT + " " + (i + 1),
        range: sub,
        on: on,
        sub: on ? "#706473" : "#706473",
        pick: function (e?: Ev) {
          stop(e);
          self.setState({ t: i });
        },
        st:
          "display: flex; flex-direction: column; align-items: flex-start; padding: 6px 14px; border-radius: 10px; text-decoration: none; line-height: 1.3; color: #352637; cursor: pointer; " +
          (on
            ? "background: #FFFFFF; box-shadow: 0 1px 3px rgba(53, 38, 55, 0.12)"
            : ""),
      };
    });
    var done = ex.items.filter(function (x) {
      return !isEmptyItem(x);
    }).length;

    var edId =
      me._edId ||
      (me._edId = "soan-" + Math.random().toString(36).slice(2, 8));
    var cuePart = it.kind === "cue" ? it : null;
    var qsPart = it.kind === "qs" ? it : null;
    var currentText = cuePart ? cuePart.text : "";
    var currentQs = qsPart ? qsPart.qs : [];

    var edit = function (fn: (v: string, a: number, b: number) => string) {
      return function (e?: Ev) {
        stop(e);
        var el = document.getElementById(edId) as HTMLTextAreaElement | null,
          v = (it.kind === "cue" ? it.text : "") || "",
          a = v.length,
          b = v.length;
        if (el) {
          v = el.value;
          a = el.selectionStart ?? v.length;
          b = el.selectionEnd ?? v.length;
        }
        var r = fn(v, a, b);
        upd(function (x) {
          if (x.kind === "cue") {
            x.text = r;
          }
        });
      };
    };
    var wrap = function (m: string, ph: string) {
      return edit(function (v, a, b) {
        return v.slice(0, a) + m + (v.slice(a, b) || ph) + m + v.slice(b);
      });
    };
    var pre = function (p: string) {
      return edit(function (v, a, b) {
        var st = v.lastIndexOf("\n", a - 1) + 1,
          en = v.indexOf("\n", b);
        if (en < 0) {
          en = v.length;
        }
        var blk = v.slice(st, en).split("\n"),
          all = blk.every(function (l) {
            return l.indexOf(p) === 0;
          });
        blk = blk.map(function (l) {
          var c = l.replace(/^(#{1,3} |- |• )/, "");
          return all ? c : p + c;
        });
        return v.slice(0, st) + blk.join("\n") + v.slice(en);
      });
    };

    var F: SpeakingFormItem = {
      name: UNIT + " " + (ti + 1),
      empty: isEmptyItem(it) && !editing,
      clear: function (e?: Ev) {
        stop(e);
        if (isEmptyItem(it)) {
          return;
        }
        ask(
          "Xóa nội dung " + UNIT + " " + (ti + 1) + "?",
          "Toàn bộ nội dung đã nhập trong " +
          UNIT +
          " này sẽ bị xóa. Có thể hoàn tác ngay sau khi xóa.",
          function () {
            upd(
              function (x) {
                if (x.kind === "qs") {
                  x.qs = [];
                } else {
                  x.text = "";
                }
              },
              {
                confirm: null,
                snack: "Đã xóa nội dung " + UNIT + " " + (ti + 1) + ".",
              },
            );
          },
        );
      },
      emptyText: isEmptyItem(it)
        ? editing
          ? UNIT + " này chưa có nội dung, nhập bên dưới."
          : UNIT + " này chưa có nội dung. Bấm Soạn ngay để bắt đầu."
        : "",
      noContent: isEmptyItem(it),
      edId: edId,
      text: currentText,
      setText: setter(function (x, v) {
        if (x.kind === "cue") {
          x.text = v;
        }
      }),
      fmtB: wrap("**", "chữ đậm"),
      fmtI: wrap("*", "chữ nghiêng"),
      fmtH: pre("## "),
      fmtL: pre("- "),
      isCue: ti === 1,
      isQ: ti !== 1,
      hasInstr: ti !== 1,
      qCount: currentQs.length,
      tot: ex.tot || "",
      setTot: function (e: React.ChangeEvent<HTMLInputElement>) {
        var v = e.target.value;
        upd(
          function (x, n) {
            n.tot = v;
          },
          null,
          "tot",
        );
      },
      totSt: inp(!num(ex.tot) || num(ex.tot) > 60),
      qlist: currentQs.map(function (q, i): SpeakingQuestionItem {
        return {
          n: i + 1,
          lab: "Câu hỏi " + (i + 1),
          delLab: "Xóa câu " + (i + 1),
          v: q,
          set: function (e: React.ChangeEvent<HTMLInputElement>) {
            var v = e.target.value;
            upd(
              function (x) {
                if (x.kind === "qs") {
                  x.qs[i] = v;
                }
              },
              null,
              "q" + i,
            );
          },
          del: function (e?: Ev) {
            stop(e);
            upd(
              function (x) {
                if (x.kind === "qs") {
                  x.qs.splice(i, 1);
                }
              },
              { snack: "Đã xóa câu " + (i + 1) + "." },
            );
          },
        };
      }),
      addQ: function (e?: Ev) {
        stop(e);
        upd(function (x) {
          if (x.kind === "qs") {
            x.qs.push("");
          }
        });
      },
      pq: currentQs
        .filter(function (q) {
          return String(q).trim();
        })
        .map(function (q, i) {
          return { n: i + 1, v: q };
        }),
      topic: it ? it.topic || "" : "",
      setTopicValue: function (value: string) {
        upd(
          function (x) {
            x.topic = value;
          },
          null,
          "type",
        );
      },
      canEdit: editing,
      instr: qsPart ? qsPart.instr : "",
      setInstr: setter(function (x, v) {
        if (x.kind === "qs") {
          x.instr = v;
        }
      }),
      prep: cuePart ? cuePart.prep : "",
      speak: cuePart ? cuePart.speak : "",
      setPrep: setter(function (x, v) {
        if (x.kind === "cue") {
          x.prep = v;
        }
      }),
      setSpeak: setter(function (x, v) {
        if (x.kind === "cue") {
          x.speak = v;
        }
      }),
      prepSt: inp(cuePart ? String(cuePart.prep || "").trim() !== "" && !num(cuePart.prep) : false),
      speakSt: inp(cuePart ? String(cuePart.speak || "").trim() !== "" && !num(cuePart.speak) : false),
      edLabel:
        ti === 1
          ? "Thẻ đề (nội dung người học đọc để chuẩn bị)"
          : ti === 0
            ? "Câu hỏi Part 1"
            : "Câu hỏi Part 3",
      edHint:
        ti === 1
          ? "## tiêu đề là dòng đề chính; - là gạch đầu dòng; **đậm**, *nghiêng*."
          : "Mỗi dòng một câu hỏi. Dòng trống để tách thành nhóm chủ đề. ## đặt tên cho nhóm (không tính là câu).",
      ph:
        ti === 1
          ? "## Describe ...\nYou should say:\n- ..."
          : "Do you like to travel?\nWhat kind of places have you visited?",
      headLine: (function () {
        var head =
          ti === 1 && cuePart
            ? "Prepare for " +
            plural(num(cuePart.prep) || 1, "minute") +
            " then speak for " +
            plural(num(cuePart.speak) || 2, "minute") +
            "."
            : String(qsPart?.instr || "").trim() || "...";
        return "PART " + (ti + 1) + " – " + head;
      })(),
      pv: ti === 1 ? mdLines(currentText) : [],
      countNote:
        ti === 1 && cuePart
          ? "Thẻ đề: người học có " +
          (num(cuePart.prep) || 1) +
          " phút chuẩn bị rồi nói " +
          (num(cuePart.speak) || 2) +
          " phút."
          : currentQs.length +
          " câu hỏi. Người học xem từng câu một và ghi âm trả lời; tổng thời gian Part 1 và 3 là " +
          (num(ex.tot) || "…") +
          " phút.",
    };

    var iss = s.issues || [];
    var CHIP_OK = CHIP + "; background: #DCEDE2; color: #2E6A48",
      CHIP_WARN = CHIP + "; background: #FBEDBF; color: #7A5A0E";

    // ---- Nhập từ xlsx
    var impF = s.impF || [],
      impX = impF.filter(function (f) {
        return f[2] === "xlsx";
      })[0];
    var IMP_SAMPLE: ImportFileItem[] = [["practice_test_01.xlsx", 9216, "xlsx"]];
    var IMP_FIXED_ITEM: ImportFileItem = ["practice_test_01_da_sua.xlsx", 9216, "xlsx"];
    var IMP_FIXED: ImportFileItem[] = [IMP_FIXED_ITEM].concat(IMP_SAMPLE.slice(1));
    var IMP_ERR: Array<[string, string, string, string]> = [
      [
        "Part1",
        "6",
        "question",
        "Dòng 6 trống giữa danh sách câu hỏi. Điền câu hỏi hoặc xóa dòng.",
      ],
      [
        "Part2",
        "2",
        "prep_minutes",
        'Cần là số nguyên từ 1, tệp ghi "một phút".',
      ],
      [
        "De_thi",
        "2",
        "part13_minutes",
        "Cần là số phút từ 1 đến 60, tệp ghi 0.",
      ],
    ];
    var IMP_CHECKS: string[] = [
      "Đọc tệp và 4 sheet theo mẫu",
      "Trường bắt buộc và kiểu dữ liệu",
      "Câu hỏi Part 1 và Part 3 không trống",
      "Thời gian chờ, nói và tổng là số phút hợp lệ",
      "Thẻ đề Part 2 có nội dung",
    ];
    function kbs(n: number): string {
      return n >= 1048576
        ? (n / 1048576).toFixed(1).replace(".", ",") + " MB"
        : Math.max(1, Math.round(n / 1024)) + " KB";
    }
    function impAdd(list: FileList | File[]) {
      var nf = impF.slice(),
        bad: string[] = [];
      for (var i = 0; i < list.length; i++) {
        var f = list[i],
          e = (f.name.split(".").pop() || "").toLowerCase(),
          k = e === "xlsx" ? "xlsx" : "";
        if (!k) {
          bad.push(f.name);
          continue;
        }
        if (k === "xlsx") {
          nf = nf.filter(function (x) {
            return x[2] !== "xlsx";
          });
          me._impFile = f;
        }
        nf.push([f.name, f.size, k, "real"]);
      }
      self.setState({
        impF: nf,
        impDrag: false,
        impErr: bad.length
          ? "Không nhận " + bad.join(", ") + ": chỉ nhận .xlsx."
          : "",
      });
    }
    function impRun(broken: boolean) {
      (me._it || []).forEach(clearTimeout);
      me._it = [];
      var na = (s.impN || 0) + 1,
        stopAt = broken ? 1 : IMP_CHECKS.length;
      self.setState({ imp: "run", impP: 0, impN: na });
      for (var i = 1; i <= stopAt; i++) {
        (function (i) {
          me._it.push(
            setTimeout(function () {
              me.setState({ impP: i });
            }, 320 * i),
          );
        })(i);
      }
      me._it.push(
        setTimeout(
          function () {
            var bad =
              !broken &&
              impX &&
              impX[3] !== "real" &&
              impX[0] === "practice_test_01.xlsx" &&
              !s.impSaw;
            me.setState({
              imp: broken ? "broken" : bad ? "bad" : "ok",
              impSaw: bad || !!(me.state || {}).impSaw,
            });
          },
          320 * stopAt + 300,
        ),
      );
    }
    var impHas = ex.items.some(function (x) {
      return !isEmptyItem(x);
    }),
      impP = s.impP || 0;
    var impVals = {
      impOn: !!s.imp,
      impPick: s.imp === "pick",
      impRun: s.imp === "run",
      impBroken: s.imp === "broken",
      impBad: s.imp === "bad",
      impOk: s.imp === "ok",
      impSub:
        (s.impSet ? s.impSet + " · " : "") +
        ex.title +
        " · 1 tệp chứa cả đề " +
        NAME,
      impOpen: function (e?: Ev) {
        stop(e);
        self.setState({
          imp: "pick",
          impF: [],
          impErr: "",
          impN: 0,
          impSaw: false,
          confirm: null,
        });
      },
      impClose: function (e?: Ev) {
        stop(e);
        (me._it || []).forEach(clearTimeout);
        self.setState({ imp: null });
      },
      impKeep: function (e?: Ev) {
        if (e && (e as React.SyntheticEvent).stopPropagation) {
          (e as React.SyntheticEvent).stopPropagation();
        }
      },
      impDl: function () {
        self.setState({
          toast:
            "Đã tải tệp mẫu ielts-" + NAME.toLowerCase() + "-template.xlsx.",
        });
      },
      impDropSt:
        "position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 120px; padding: 14px; text-align: center; border-radius: 16px; cursor: pointer; transition: all .2s ease; " +
        (s.impDrag
          ? "border: 2px dashed #2963CC; background: #EEF3FD"
          : "border: 1.5px dashed #C9C2C6; background: #FAF9F5"),
      impDragOver: function (e?: Ev) {
        stop(e);
        if (!s.impDrag) {
          self.setState({ impDrag: true });
        }
      },
      impDragLeave: function () {
        self.setState({ impDrag: false });
      },
      impDrop: function (e: React.DragEvent<HTMLElement>) {
        stop(e);
        impAdd((e.dataTransfer && e.dataTransfer.files) || []);
      },
      impPickFile: function (e: React.ChangeEvent<HTMLInputElement>) {
        impAdd(e.target.files || []);
        try {
          e.target.value = "";
        } catch (err) { }
      },
      impFiles: impF.map(function (f, i): ImportFileDisplay {
        return {
          name: f[0],
          size: kbs(f[1]),
          icon: f[2] === "xlsx" ? "XLSX" : "IMG",
          iconSt:
            "display: flex; align-items: center; justify-content: center; flex: none; width: 40px; height: 26px; border-radius: 8px; font-size: 11px; font-weight: 700; " +
            (f[2] === "xlsx"
              ? "background: #DCEDE2; color: #2E6A48"
              : "background: #FBEDBF; color: #7A5A0E"),
          rm: function (e?: Ev) {
            stop(e);
            var nf = impF.slice();
            nf.splice(i, 1);
            self.setState({ impF: nf, impErr: "" });
          },
        };
      }),
      impErr: !!s.impErr,
      impErrText: s.impErr || "",
      impReplace: impHas,
      impReplaceText:
        "Đề đang có nội dung. Nhập sẽ thay toàn bộ 3 Part; có thể hoàn tác ngay sau khi nhập.",
      impSampleText: s.impSaw ? "Dùng tệp ví dụ đã sửa lỗi" : "Dùng tệp ví dụ",
      impSample: function (e?: Ev) {
        stop(e);
        self.setState({ impF: s.impSaw ? IMP_FIXED : IMP_SAMPLE, impErr: "" });
      },
      impNoX: !impX,
      impCheckSt: impX
        ? "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF"
        : "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF; background: #F3F0EA; border-color: #E6E4E0; color: #706473; cursor: not-allowed",
      impCheck: function (e?: Ev) {
        stop(e);
        if (!impX) {
          self.setState({ impErr: "Cần đúng 1 tệp .xlsx theo mẫu." });
          return;
        }
        if (impX[3] === "real" && me._impFile && window.FileReader) {
          var r = new FileReader();
          r.onload = function () {
            if (r.result instanceof ArrayBuffer) {
              var b = new Uint8Array(r.result);
              impRun(!(b[0] === 0x50 && b[1] === 0x4b));
            }
          };
          r.onerror = function () {
            impRun(true);
          };
          r.readAsArrayBuffer(me._impFile.slice(0, 4));
        } else {
          impRun(false);
        }
      },
      impX: impX ? impX[0] : "",
      impChecks: IMP_CHECKS.map(function (c, i): ImportCheckItem {
        var dn = i < impP,
          on = i === impP;
        return {
          text: c,
          color: dn || on ? "#352637" : "#706473",
          cls: on ? "im-spin" : "",
          icon: dn ? "✓" : "",
          iconSt:
            "display: flex; align-items: center; justify-content: center; flex: none; width: 22px; height: 22px; border-radius: 50%; box-sizing: border-box; font-size: 13px; font-weight: 700; " +
            (dn
              ? "background: #2E7D4F; color: #FFFFFF"
              : on
                ? "border: 2.5px solid #D6D4D0; border-top-color: #2963CC"
                : "border: 1.5px solid #E6E4E0"),
        };
      }),
      impBack: function (e?: Ev) {
        stop(e);
        self.setState({ imp: "pick", impF: [], impErr: "" });
      },
      impErrN: IMP_ERR.length + " lỗi",
      impRows: IMP_ERR.map(function (r) {
        return { sheet: r[0], row: parseInt(r[1], 10) || 0, col: parseInt(r[2], 10) || 0, text: r[3] };
      }),
      impTitle: FULL.title,
      impForm: FULL.tot + " phút cho Part 1 và 3",
      impStats: [
        { n: "3", label: "part" },
        { n: String(FULL.items[0].qs.length), label: "câu Part 1" },
        { n: String(FULL.items[2].qs.length), label: "câu Part 3" },
        {
          n: FULL.items[1].prep + " + " + FULL.items[1].speak,
          label: "phút Part 2",
        },
      ],
      impPrev: [
        {
          title: "Part 1",
          sub: FULL.items[0].qs.length + " câu hỏi",
          groups: FULL.items[0].qs.slice(0, 3).map(function (q) {
            return q.length > 28 ? q.slice(0, 26) + "…" : q;
          }),
        },
        {
          title: "Part 2",
          sub: "thẻ đề",
          groups: [FULL.items[1].prep + " phút chờ", FULL.items[1].speak + " phút nói"],
        },
        {
          title: "Part 3",
          sub: FULL.items[2].qs.length + " câu hỏi",
          groups: FULL.items[2].qs.slice(0, 3).map(function (q) {
            return q.length > 28 ? q.slice(0, 26) + "…" : q;
          }),
        },
      ],
      impWarns: [
        "Part 2: xem lại thẻ đề ở bản xem trước, kiểm tra các gạch đầu dòng.",
      ],
      impReplaceNote:
        (impHas ? "Nội dung hiện tại sẽ được thay. " : "") +
        "Đề chuyển sang chế độ Chỉnh sửa, chưa lưu: xem lại rồi bấm Lưu, hoặc Hoàn tác.",
      impApply: function (e?: Ev) {
        stop(e);
        var n: SpeakingEditorState = {
          title: ex.title,
          tot: FULL.tot,
          items: [
            clone(FULL.items[0]),
            clone(FULL.items[1]),
            clone(FULL.items[2]),
          ],
        };
        self.setState({
          ex: n,
          t: 0,
          editing: true,
          base: editing ? base : ex,
          hist: (editing ? s.hist || [] : []).concat([ex]).slice(-50),
          lastTag: null,
          issues: null,
          imp: null,
          toast: "",
          snack: "Đã nhập 3 Part từ tệp mẫu.",
        });
      },
    };

    var crumbs: Crumb[] = [
      { label: "Quản lý", page: "AdminHome" },
      { label: "Bộ đề và đề thi", page: "AdminExams" },
      {
        label: skill?.exam?.title || ex.title,
        page: skill ? "AdminExamSet?id=" + skill.set.id : "AdminExams",
      },
      { label: NAME },
    ];
    var onNavigate = function (go: () => void) {
      if (dirty) {
        ask(
          "Rời trang khi chưa lưu?",
          "Nội dung đang soạn sẽ bị mất nếu bạn rời đi bây giờ.",
          go,
          "Rời đi",
        );
      } else {
        go();
      }
    };
    var R0: SpeakingView = {
      ...impVals,
      crumbs: crumbs,
      onNavigate: onNavigate,
      examTitle: skill?.exam?.title || ex.title,
      examPath: skill ? skill.set.name + " · Speaking" : "Mock Test 2026 Vol 4 · Speaking",
      typeText: "Dùng chung Academic và General Training",
      typeTitle: "Speaking dùng chung cho Academic và General Training",
      typeSt: CHIP + "; background: #DFF1F4; color: #1F6A78",
      modeText: editing ? versionMessages.modeEditing(skill?.versionNumber || 1) : versionMessages.modeViewing,
      modeSt:
        CHIP +
        "; " +
        (editing
          ? "background: #E3ECFD; color: #2257B8"
          : "background: #F3F0EA; color: #706473"),
      counter: done + "/" + NI + " " + UNIT.toLowerCase(),
      counterSt: done === NI ? CHIP_OK : CHIP_WARN,
      viewing: !editing,
      editing: editing,
      modeCls: editing ? "" : "ro",
      tabs: tabs,
      F: F,
      dirtyText: dirty
        ? "Chưa lưu · " + Math.max(nChange, 1) + " thay đổi"
        : "Chưa có thay đổi",
      dirtyColor: dirty ? "#7A5A0E" : "#706473",
      undo: undo,
      undoSt:
        "display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; " +
        ((s.hist || []).length
          ? "color: #352637; cursor: pointer"
          : "color: #B5ADB7; cursor: default; pointer-events: none"),
      canEdit: !editing && skill && skill.status !== "ARCHIVED",
      canPublish: !editing && skill && skill.status === "DRAFT",
      canDelete: !editing && skill && skill.status === "DRAFT",
      deleteLabel: skill?.slot?.liveId ? "Bỏ bản sửa" : "Xóa kỹ năng",
      confirmGoText: s.confirm?.goText || "Xóa",
      deleteSkillAction: function (e?: Ev) {
        stop(e);
        if (!skill) return;
        var currentSkill = skill;
        var hadLive = Boolean(currentSkill.slot.liveId);
        var conf = versionMessages.confirmDiscardDraft(currentSkill.versionNumber, currentSkill.slot?.liveVersion);
        ask(
          conf.title,
          conf.text,
          async function () {
            try {
              await deleteSkill(currentSkill.id);
              if (hadLive && currentSkill.slot.liveId) {
                navigate("AdminSpeakingEditor?skillId=" + currentSkill.slot.liveId);
              } else {
                navigate("AdminExamSet?id=" + currentSkill.set.id);
              }
            } catch (err) {
              self.setState({ toast: errorInfo(err).message || "Không thể xóa kỹ năng." });
            }
          },
          conf.goText
        );
      },
      startEdit: async function (e?: Ev) {
        stop(e);
        if (!skill) return;
        var currentSkill = skill;
        if (currentSkill.status === "ARCHIVED") return;
        if (currentSkill.status !== "DRAFT") {
          var conf = versionMessages.confirmCreateDraft(
            (currentSkill.versionNumber || 1) + 1,
            currentSkill.versionNumber || 1
          );
          ask(
            conf.title,
            conf.text,
            async function () {
              try {
                var rev = await createRevisionDraft(currentSkill.id);
                window.history.replaceState(null, "", "#AdminSpeakingEditor?skillId=" + rev.id);
                var newEx = toSpeakingEditorState(rev);
                self.setState({
                  skillId: rev.id,
                  skill: rev,
                  ex: newEx,
                  base: JSON.parse(JSON.stringify(newEx)),
                  editing: true,
                  hist: [],
                  lastTag: null,
                  issues: null,
                  snack: rev.id === currentSkill.slot?.draftId
                    ? versionMessages.noticeReopenDraft(rev.versionNumber)
                    : versionMessages.noticeCreatedDraft(rev.versionNumber, currentSkill.versionNumber),
                });
              } catch (err) {
                self.setState({ toast: errorInfo(err).message || "Không thể tạo bản sửa." });
              }
            },
            conf.goText
          );
        } else {
          self.setState({
            editing: true,
            base: JSON.parse(JSON.stringify(ex)),
            hist: [],
            lastTag: null,
            issues: null,
            toast: "",
          });
        }
      },
      saveEdit: async function (e?: Ev) {
        stop(e);
        if (!skill || self.state.saving) return;
        var currentSkill = skill;
        self.setState({ saving: true });
        try {
          var content = fromSpeakingEditorState(ex);
          var saved = await saveSkillContent(currentSkill.id, {
            baseUpdatedAt: currentSkill.updatedAt,
            speaking: content,
          });
          self.setState({
            skill: saved,
            saving: false,
            editing: false,
            base: JSON.parse(JSON.stringify(ex)),
            hist: [],
            lastTag: null,
            leave: false,
            snack: null,
            toast: versionMessages.noticeSavedDraft(saved.versionNumber, Boolean(saved.slot?.liveId)),
          });
        } catch (err) {
          self.setState({
            saving: false,
            toast: errorInfo(err).message || "Không thể lưu đề.",
          });
        }
      },
      cancelEdit: function (e?: Ev) {
        stop(e);
        if (dirty) {
          self.setState({ leave: true });
        } else {
          self.setState({ editing: false, base: null, hist: [], snack: null });
        }
      },
      leaveOpen: !!s.leave,
      leaveSub:
        "Bạn có " +
        Math.max(nChange, 1) +
        " thay đổi chưa lưu trong đề này. Chọn Không lưu thì đề quay về bản đã lưu gần nhất.",
      stayEdit: function (e?: Ev) {
        stop(e);
        self.setState({ leave: false });
      },
      discardEdit: function (e?: Ev) {
        stop(e);
        self.setState({
          ex: base || ex,
          editing: false,
          base: null,
          hist: [],
          lastTag: null,
          leave: false,
          snack: null,
          imgErr: "",
          toast: "Đã bỏ các thay đổi chưa lưu.",
        });
      },
      publish: async function (e?: Ev) {
        stop(e);
        var li = allIssues();
        if (li.length) {
          self.setState({ issues: li, toast: "" });
          return;
        }
        if (editing && dirty) {
          if (!skill || self.state.saving) return;
          var currentSkill = skill;
          self.setState({ saving: true });
          try {
            var content = fromSpeakingEditorState(ex);
            var saved = await saveSkillContent(currentSkill.id, {
              baseUpdatedAt: currentSkill.updatedAt,
              speaking: content,
            });
            self.setState({
              skill: saved,
              saving: false,
              base: JSON.parse(JSON.stringify(ex)),
              hist: [],
              issues: null,
              toast: "",
              pubAsk: true,
            });
          } catch (err) {
            self.setState({
              saving: false,
              toast: errorInfo(err).message || "Không thể lưu đề trước khi đăng.",
            });
          }
        } else {
          self.setState({ issues: null, toast: "", pubAsk: true });
        }
      },
      pubOpen: !!s.pubAsk,
      pubTitle: versionMessages.confirmPublish(skill?.versionNumber || 1, skill?.slot?.liveVersion).title,
      pubSub: versionMessages.confirmPublish(skill?.versionNumber || 1, skill?.slot?.liveVersion).text,
      pubCancel: function (e?: Ev) {
        stop(e);
        self.setState({ pubAsk: false });
      },
      pubOk: async function (e?: Ev) {
        stop(e);
        if (!skill) return;
        var currentSkill = skill;
        self.setState({ pubAsk: false });
        try {
          await publishSkill(currentSkill.id);
          var refreshed = await getEditorSkill(currentSkill.id);
          var newEx = toSpeakingEditorState(refreshed);
          self.setState({
            skill: refreshed,
            ex: newEx,
            base: JSON.parse(JSON.stringify(newEx)),
            editing: false,
            hist: [],
            toast: versionMessages.noticePublished(currentSkill.versionNumber, currentSkill.slot?.liveVersion),
          });
        } catch (err) {
          var info = errorInfo(err);
          if (err instanceof ApiError && err.status === 422 && Array.isArray(err.details)) {
            self.setState({
              issues: (err.details as string[]).map(function (text) {
                return { text: text };
              }),
            });
          } else {
            self.setState({ toast: info.message || "Không thể đăng đề." });
          }
        }
      },
      hasIssues: !!iss.length,
      issueHead: "Chưa thể đăng đề: còn " + iss.length + " điểm cần sửa",
      closeIssues: function () {
        self.setState({ issues: null });
      },
      issues: iss.map(function (i) {
        return {
          text: i.text,
          go: function (e?: Ev) {
            stop(e);
            self.setState({ t: i.t ?? 0 });
          },
        };
      }),
      confirmOpen: !!s.confirm,
      confirmTitle: s.confirm ? s.confirm.title : "",
      confirmSub: s.confirm ? s.confirm.sub : "",
      confirmCancel: function (e?: Ev) {
        stop(e);
        self.setState({ confirm: null });
      },
      confirmOk: function (e?: Ev) {
        stop(e);
        if (s.confirmRun) {
          s.confirmRun();
        }
      },
      snackOpen: !!s.snack,
      snack: s.snack || "",
      hideSnack: function (e?: Ev) {
        stop(e);
        self.setState({ snack: null });
      },
      toast: !!s.toast,
      toastText: s.toast || "",
      hideToast: function (e?: Ev) {
        stop(e);
        self.setState({ toast: "" });
      },
      preview: function (e?: Ev) {
        stop(e);
        self.setState({
          toast:
            "Bản xem trước mở đề trên màn làm bài " +
            NAME +
            " của người học (bản mẫu chưa nối màn này).",
        });
      },
      skill: s.skill,
      dirty: dirty,
      ask: ask,
      historyOpen: s.historyOpen,
      openHistory: function () {
        self.setState({ historyOpen: true });
      },
      closeHistory: function () {
        self.setState({ historyOpen: false });
      },
    };
    return R0;
  }

  static defaultProps = { trangThai: "Đủ 3 part" };
  render() {
    if (this.state.loading) {
      return (
        <div className="flex h-screen bg-[var(--attempt-bg-f6f4ef,#F6F4EF)]">
          <AdminSidebar active="AdminExams" />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminTopbar
              crumbs={[
                { label: "Quản lý", page: "AdminHome" },
                { label: "Bộ đề và đề thi", page: "AdminExams" },
                { label: "Soạn đề Speaking" },
              ]}
            />
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[var(--attempt-text-706473,#706473)] text-base font-medium">Đang tải đề…</p>
            </div>
          </div>
        </div>
      );
    }

    if (this.state.notFound || !this.state.skill) {
      return (
        <div className="flex h-screen bg-[var(--attempt-bg-f6f4ef,#F6F4EF)]">
          <AdminSidebar active="AdminExams" />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminTopbar
              crumbs={[
                { label: "Quản lý", page: "AdminHome" },
                { label: "Bộ đề và đề thi", page: "AdminExams" },
                { label: "Soạn đề Speaking" },
              ]}
            />
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <p className="text-[var(--attempt-text-352637,#352637)] text-lg font-semibold">Không tìm thấy kỹ năng</p>
              <p className="text-[var(--attempt-text-706473,#706473)] text-sm">Kỹ năng không tồn tại hoặc đã bị xóa.</p>
              <button
                type="button"
                onClick={() => navigate("AdminExams")}
                className="px-5 py-2.5 rounded-full bg-[#2963CC] text-white text-sm font-semibold hover:bg-[#2257B8] transition-colors"
              >
                Về danh sách bộ đề
              </button>
            </div>
          </div>
        </div>
      );
    }

    const v = this.renderVals();
    return (
      <>
        {"\n"}
        {"\n"}
        <style>
          {cssText(
            "\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\ninput::placeholder,textarea::placeholder{color:#706473}.ro input:not([type=file]):not([type=checkbox]):not([type=radio]),.ro textarea,.ro select{border-color:transparent !important;background: #F6F4EF !important;box-shadow:none !important;resize:none !important;cursor:default !important;-webkit-appearance:none;appearance:none}.ro input::placeholder,.ro textarea::placeholder{color: #706473 !important}.ro [contenteditable]{cursor:default}.ro .eo{display:none !important}.ro .lk,.ro a[role=combobox],.ro input,.ro textarea{pointer-events:none}.ro input,.ro textarea{caret-color:transparent}@keyframes imFade{from{opacity:0}to{opacity:1}}@keyframes imPop{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}@keyframes imRise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes imSpin{to{transform:rotate(360deg)}}.im-fade{animation:imFade .2s ease-out both}.im-pop{animation:imPop .28s cubic-bezier(.2,.8,.2,1) both}.im-rise{animation:imRise .3s cubic-bezier(.2,.8,.2,1) both}.im-spin{animation:imSpin .8s linear infinite}@media (prefers-reduced-motion: reduce){.im-fade,.im-pop,.im-rise,.im-spin{animation:none}}\n",
          )}
        </style>
        {"\n"}
        {"\n"}
        <div
          className="app-shell-ancestor"
          style={styleOf(
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; font-size: 15px; line-height: 1.6; background: #FCFBF7",
          )}
        >
          {"\n"}
          <div
            className="app-shell"
            style={styleOf(
              "display: flex; flex-wrap: wrap; align-items: stretch; min-height: 1000px",
            )}
          >
            <div
              className="app-sidebar-slot"
              style={styleOf("display: flex; flex: none; align-self: stretch")}
            >
              <AdminSidebar active={"exams"}></AdminSidebar>
            </div>
            <div
              className="app-content"
              style={styleOf(
                "flex: 1 1 560px; min-width: 0; display: flex; flex-direction: column",
              )}
            >
              <AdminTopbar
                crumbs={v.crumbs}
                onNavigate={v.onNavigate}
              ></AdminTopbar>
              <main
                className={v.modeCls}
                style={styleOf(
                  "flex: 1; display: flex; flex-direction: column; background: #FAF9F5; min-width: 0",
                )}
              >
                {v.skill && (
                  <div
                    style={styleOf(
                      v.skill.status === "ARCHIVED"
                        ? "background: #F4F1EA; border-bottom: 1.5px solid #E5E0D8; color: #5B4E5F; padding: 10px 24px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap"
                        : v.skill.status === "HIDDEN"
                          ? "background: #F4F1EA; border-bottom: 1.5px solid #E5E0D8; color: #5B4E5F; padding: 10px 24px; font-size: 13px; display: flex; align-items: center; gap: 8px"
                          : v.skill.status === "DRAFT"
                            ? "background: #EFF6FF; border-bottom: 1.5px solid #BFDBFE; color: #1E40AF; padding: 10px 24px; font-size: 13px; display: flex; align-items: center; gap: 8px"
                            : "display: none"
                    )}
                  >
                    {v.skill.status === "ARCHIVED" ? (
                      <>
                        <div style={styleOf("display: flex; align-items: center; gap: 8px")}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
                          </svg>
                          <span>
                            {versionMessages.bannerArchived(
                              v.skill.versionNumber,
                              fmtDate(v.skill.publishedAt || v.skill.updatedAt)
                            )}
                          </span>
                        </div>
                        {(v.skill?.slot?.draftId || v.skill?.slot?.liveId) && (
                          <a
                            href="#"
                            onClick={function (e) {
                              e.preventDefault();
                              navigate(
                                "AdminSpeakingEditor?skillId=" +
                                (v.skill?.slot?.draftId || v.skill?.slot?.liveId)
                              );
                            }}
                            style={styleOf(
                              "font-weight: 600; color: #1E40AF; text-decoration: underline; cursor: pointer; white-space: nowrap"
                            )}
                          >
                            Mở bản hiện tại →
                          </a>
                        )}
                      </>
                    ) : v.skill.status === "HIDDEN" ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                        </svg>
                        <span>{versionMessages.bannerHidden(v.skill.versionNumber)}</span>
                      </>
                    ) : v.skill.status === "DRAFT" ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>
                          {v.skill.slot.liveId
                            ? versionMessages.bannerDraftWithLive(
                              v.skill.versionNumber,
                              v.skill.slot.liveVersion || (v.skill.versionNumber - 1),
                              v.skill.slot.liveVersion || 1,
                              v.skill.slot.liveStatus || "PUBLISHED"
                            )
                            : versionMessages.bannerDraftFirst(v.skill.versionNumber)}
                        </span>
                      </>
                    ) : null}
                  </div>
                )}
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 16px 24px; border-bottom: 1.5px solid #D6D4D0; background: #FCFBF7",
                  )}
                >
                  <div style={styleOf("min-width: 0; flex: 1 1 260px")}>
                    <a
                      href={"#"}
                      onClick={function (e) {
                        e.preventDefault();
                        navigate(v.skill ? "AdminExamSet?id=" + v.skill.set.id : "AdminExams");
                      }}
                      style={styleOf("display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #706473; text-decoration: none; cursor: pointer")}
                    >
                      <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                        <path d={"M19 12H5M12 19l-7-7 7-7"}></path>
                      </svg>
                      {v.examPath}
                    </a>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; flex-wrap: wrap",
                      )}
                    >
                      <div
                        style={styleOf(
                          "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 22px; font-weight: 600; letter-spacing: -0.015em",
                        )}
                      >
                        {"Soạn đề · " + v.examTitle}
                      </div>
                      {v.viewing ? (
                        <>
                          <a
                            href={"#"}
                            onClick={v.preview}
                            title={"Xem như người học"}
                            aria-label={"Xem như người học"}
                            style={styleOf(
                              "display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; color: #4B3D4D; text-decoration: none; border: 1.5px solid #E4E1DB; background: #FFFFFF; box-sizing: border-box",
                            )}
                          >
                            <svg
                              width={"18"}
                              height={"18"}
                              viewBox={"0 0 24 24"}
                              fill={"none"}
                              stroke={"currentColor"}
                              strokeWidth={"2"}
                              strokeLinecap={"round"}
                              strokeLinejoin={"round"}
                              aria-hidden={"true"}
                            >
                              <path
                                d={
                                  "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                                }
                              ></path>
                              <circle cx={"12"} cy={"12"} r={"3"}></circle>
                            </svg>
                          </a>
                        </>
                      ) : null}
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 6px",
                      )}
                    >
                      <span title={v.typeTitle} style={styleOf(v.typeSt)}>
                        {v.typeText}
                      </span>
                      <span style={styleOf(v.modeSt)}>{v.modeText}</span>
                      <span style={styleOf(v.counterSt)}>{v.counter}</span>
                      <button
                        type="button"
                        onClick={function () {
                          v.openHistory();
                        }}
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1px solid #D6D4D0; background: #FFFFFF; font-size: 12px; font-weight: 600; color: #5B4E5F; cursor: pointer; text-decoration: none;"
                        )}
                        title="Xem lịch sử các phiên bản"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>Lịch sử</span>
                      </button>
                    </div>
                  </div>
                  <div
                    role={"tablist"}
                    aria-label={"Speaking"}
                    style={styleOf(
                      "display: inline-flex; gap: 2px; padding: 3px; border-radius: 12px; background: #F3F0EA",
                    )}
                  >
                    {(v.tabs || []).map((t, index) => (
                      <React.Fragment key={index}>
                        <a
                          href={"#"}
                          role={"tab"}
                          aria-selected={t.on}
                          onClick={t.pick}
                          style={styleOf(t.st)}
                        >
                          <span style={styleOf("font-weight: 600")}>
                            {t.name}
                          </span>
                          <span
                            style={styleOf(
                              "font-size: 13px; color: " + t.sub,
                            )}
                          >
                            {t.range}
                          </span>
                        </a>
                      </React.Fragment>
                    ))}
                  </div>
                  <div
                    style={styleOf(
                      "display: flex; align-items: center; gap: 10px; flex-wrap: wrap",
                    )}
                  >
                    {v.viewing ? (
                      <>
                        <button
                          type="button"
                          disabled={true}
                          aria-disabled="true"
                          title="Nhập từ xlsx sẽ có khi nối API nhập đề"
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: not-allowed; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #B5ADB7",
                          )}
                        >
                          <svg
                            width={"16"}
                            height={"16"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M12 16V4M7 9l5-5 5 5M4 20h16"}></path>
                          </svg>
                          {" Nhập từ xlsx"}
                        </button>
                        {v.canEdit ? (
                          <a
                            href={"#"}
                            onClick={v.startEdit}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637",
                            )}
                          >
                            <svg
                              width={"16"}
                              height={"16"}
                              viewBox={"0 0 24 24"}
                              fill={"none"}
                              stroke={"currentColor"}
                              strokeWidth={"2"}
                              strokeLinecap={"round"}
                              strokeLinejoin={"round"}
                              aria-hidden={"true"}
                            >
                              <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                            </svg>
                            {" Chỉnh sửa"}
                          </a>
                        ) : null}
                        {v.canPublish ? (
                          <a
                            href={"#"}
                            onClick={v.publish}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                            )}
                          >
                            {"Đăng"}
                          </a>
                        ) : null}
                        {v.canDelete ? (
                          <a
                            href={"#"}
                            onClick={v.deleteSkillAction}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #C0412A; background: #FFFFFF; color: #C0412A",
                            )}
                          >
                            <svg
                              width={"16"}
                              height={"16"}
                              viewBox={"0 0 24 24"}
                              fill={"none"}
                              stroke={"currentColor"}
                              strokeWidth={"2"}
                              strokeLinecap={"round"}
                              strokeLinejoin={"round"}
                              aria-hidden={"true"}
                            >
                              <path d={"M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"}></path>
                            </svg>
                            {" " + v.deleteLabel}
                          </a>
                        ) : null}
                      </>
                    ) : null}
                    {v.editing ? (
                      <>
                        <span
                          style={styleOf(
                            "font-size: 13px; color: " + v.dirtyColor,
                          )}
                        >
                          {v.dirtyText}
                        </span>
                        <button
                          type="button"
                          disabled={true}
                          aria-disabled="true"
                          title="Nhập từ xlsx sẽ có khi nối API nhập đề"
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: not-allowed; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #B5ADB7",
                          )}
                        >
                          <svg
                            width={"16"}
                            height={"16"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M12 16V4M7 9l5-5 5 5M4 20h16"}></path>
                          </svg>
                          {" Nhập từ xlsx"}
                        </button>
                        <a
                          href={"#"}
                          onClick={v.undo}
                          aria-label={"Hoàn tác (Ctrl+Z)"}
                          style={styleOf(v.undoSt)}
                        >
                          <svg
                            width={"15"}
                            height={"15"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M19 12H5M11 6l-6 6 6 6"}></path>
                          </svg>
                          {" Hoàn tác"}
                        </a>
                        <a
                          href={"#"}
                          onClick={v.cancelEdit}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                          )}
                        >
                          {"Hủy"}
                        </a>
                        <a
                          href={"#"}
                          onClick={v.saveEdit}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                          )}
                        >
                          <svg
                            width={"16"}
                            height={"16"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M5 12.5l4.5 4.5L19 7"}></path>
                          </svg>
                          {" Lưu"}
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>
                {v.viewing ? (
                  <div
                    role={"note"}
                    data-ro-bar={"1"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 10px; padding: 9px 24px; background: #E3ECFD; border-bottom: 1.5px solid #D6D4D0; font-size: 13px; line-height: 1.5; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "flex: none; display: flex; color: #2963CC",
                      )}
                    >
                      <svg
                        width={"17"}
                        height={"17"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"1.9"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <rect
                          x={"5"}
                          y={"11"}
                          width={"14"}
                          height={"9"}
                          rx={"2"}
                        ></rect>
                        <path d={"M8 11V8a4 4 0 0 1 8 0v3"}></path>
                      </svg>
                    </span>
                    <span style={styleOf("min-width: 0")}>
                      <b>Chế độ chỉ xem.</b>
                      {" Nội dung đang khóa để tránh sửa nhầm. Bấm "}
                      <b>Chỉnh sửa</b>
                      {" để soạn; xong thì "}
                      <b>Lưu</b>
                      {", hoặc "}
                      <b>Hủy</b>
                      {" để bỏ thay đổi."}
                    </span>
                  </div>
                ) : null}
                {v.hasIssues ? (
                  <>
                    <div
                      role={"alert"}
                      style={styleOf(
                        "margin: 16px 24px 0; padding: 14px 16px; border-radius: 12px; background: #FDECE8; border: 1.5px solid #F1B3A3; display: flex; flex-direction: column; gap: 8px",
                      )}
                    >
                      <div
                        style={styleOf(
                          "display: flex; justify-content: space-between; gap: 12px",
                        )}
                      >
                        <div
                          style={styleOf("font-weight: 700; color: #C0412A")}
                        >
                          {v.issueHead}
                        </div>
                        <a
                          href={"#"}
                          onClick={v.closeIssues}
                          aria-label={"Đóng"}
                          style={styleOf("display: flex; color: #C0412A")}
                        >
                          <svg
                            width={"16"}
                            height={"16"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M6 6l12 12M18 6L6 18"}></path>
                          </svg>
                        </a>
                      </div>
                      {(v.issues || []).map((i, index) => (
                        <React.Fragment key={index}>
                          <a
                            href={"#"}
                            onClick={i.go}
                            style={styleOf(
                              "font-size: 14px; color: #7A2A1B; text-decoration: underline",
                            )}
                          >
                            {i.text}
                          </a>
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                ) : null}
                {v.confirmOpen ? (
                  <>
                    <div
                      style={styleOf(
                        "position: fixed; inset: 0; z-index: 60; background: rgba(53, 38, 55, 0.32); display: flex; align-items: center; justify-content: center; padding: 16px",
                      )}
                    >
                      <div
                        role={"alertdialog"}
                        aria-modal={"true"}
                        aria-labelledby={"xoa-tieu-de"}
                        style={styleOf(
                          "width: 440px; max-width: 100%; box-sizing: border-box; padding: 24px; border-radius: 22px; background: #FFFFFF; border: 1.5px solid #D6D4D0; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); display: flex; flex-direction: column; gap: 10px",
                        )}
                      >
                        <div
                          id={"xoa-tieu-de"}
                          style={styleOf(
                            "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 20px; font-weight: 600",
                          )}
                        >
                          {v.confirmTitle}
                        </div>
                        <div
                          style={styleOf("font-size: 14px; color: #706473")}
                        >
                          {v.confirmSub}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 8px; flex-wrap: wrap",
                          )}
                        >
                          <a
                            href={"#"}
                            onClick={v.confirmCancel}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                            )}
                          >
                            {"Hủy"}
                          </a>
                          <a
                            href={"#"}
                            onClick={v.confirmOk}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; background: #C0412A; border-color: #C0412A; color: #FFFFFF",
                            )}
                          >
                            {v.confirmGoText || "Xóa"}
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.leaveOpen ? (
                  <>
                    <div
                      style={styleOf(
                        "position: fixed; inset: 0; z-index: 60; background: rgba(53, 38, 55, 0.32); display: flex; align-items: center; justify-content: center; padding: 16px",
                      )}
                    >
                      <div
                        role={"alertdialog"}
                        aria-modal={"true"}
                        aria-labelledby={"luu-tieu-de"}
                        style={styleOf(
                          "width: 460px; max-width: 100%; box-sizing: border-box; padding: 24px; border-radius: 22px; background: #FFFFFF; border: 1.5px solid #D6D4D0; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); display: flex; flex-direction: column; gap: 10px",
                        )}
                      >
                        <div
                          id={"luu-tieu-de"}
                          style={styleOf(
                            "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 20px; font-weight: 600",
                          )}
                        >
                          {"Lưu thay đổi trước khi thoát?"}
                        </div>
                        <div
                          style={styleOf("font-size: 14px; color: #706473")}
                        >
                          {v.leaveSub}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 8px; flex-wrap: wrap",
                          )}
                        >
                          <a
                            href={"#"}
                            onClick={v.stayEdit}
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 10px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #706473; text-decoration: none; cursor: pointer; white-space: nowrap; margin-right: auto",
                            )}
                          >
                            {"Tiếp tục sửa"}
                          </a>
                          <a
                            href={"#"}
                            onClick={v.discardEdit}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; color: #C0412A",
                            )}
                          >
                            {"Không lưu"}
                          </a>
                          <a
                            href={"#"}
                            onClick={v.saveEdit}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                            )}
                          >
                            {"Lưu"}
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.pubOpen ? (
                  <>
                    <div
                      style={styleOf(
                        "position: fixed; inset: 0; z-index: 60; background: rgba(53, 38, 55, 0.32); display: flex; align-items: center; justify-content: center; padding: 16px",
                      )}
                    >
                      <div
                        role={"alertdialog"}
                        aria-modal={"true"}
                        aria-labelledby={"dang-tieu-de"}
                        style={styleOf(
                          "width: 460px; max-width: 100%; box-sizing: border-box; padding: 24px; border-radius: 22px; background: #FFFFFF; border: 1.5px solid #D6D4D0; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); display: flex; flex-direction: column; gap: 10px",
                        )}
                      >
                        <div
                          id={"dang-tieu-de"}
                          style={styleOf(
                            "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 20px; font-weight: 600",
                          )}
                        >
                          {"Đăng đề này?"}
                        </div>
                        <div
                          style={styleOf("font-size: 14px; color: #706473")}
                        >
                          {v.pubSub}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 8px; flex-wrap: wrap",
                          )}
                        >
                          <a
                            href={"#"}
                            onClick={v.pubCancel}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                            )}
                          >
                            {"Hủy"}
                          </a>
                          <a
                            href={"#"}
                            onClick={v.pubOk}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                            )}
                          >
                            {"Đăng"}
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.snackOpen ? (
                  <>
                    <div
                      role={"status"}
                      style={styleOf(
                        "position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 50; display: flex; align-items: center; gap: 16px; padding: 10px 12px 10px 18px; border-radius: 12px; background: #352637; color: #FFFFFF; font-size: 14px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07)",
                      )}
                    >
                      <span>{v.snack}</span>
                      <a
                        href={"#"}
                        onClick={v.undo}
                        style={styleOf(
                          "color: #A9C4F5; font-weight: 600; text-decoration: none",
                        )}
                      >
                        {"Hoàn tác"}
                      </a>
                      <a
                        href={"#"}
                        onClick={v.hideSnack}
                        aria-label={"Đóng"}
                        style={styleOf("display: flex; color: #FFFFFF")}
                      >
                        <svg
                          width={"16"}
                          height={"16"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"2"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                          aria-hidden={"true"}
                        >
                          <path d={"M6 6l12 12M18 6L6 18"}></path>
                        </svg>
                      </a>
                    </div>
                  </>
                ) : null}
                {v.toast ? (
                  <>
                    <div
                      role={"status"}
                      style={styleOf(
                        "position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 50; display: flex; align-items: center; gap: 16px; padding: 10px 12px 10px 18px; border-radius: 12px; background: #352637; color: #FFFFFF; font-size: 14px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); max-width: calc(100% - 48px)",
                      )}
                    >
                      <span>{v.toastText}</span>
                      <a
                        href={"#"}
                        onClick={v.hideToast}
                        aria-label={"Đóng"}
                        style={styleOf("display: flex; color: #FFFFFF")}
                      >
                        <svg
                          width={"16"}
                          height={"16"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"2"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                          aria-hidden={"true"}
                        >
                          <path d={"M6 6l12 12M18 6L6 18"}></path>
                        </svg>
                      </a>
                    </div>
                  </>
                ) : null}
                {v.impOn ? (
                  <>
                    <div
                      className={"im-fade"}
                      onClick={v.impClose}
                      style={styleOf(
                        "position: fixed; inset: 0; z-index: 60; background: rgba(53, 38, 55, 0.42); display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box",
                      )}
                    >
                      <div
                        className={"im-pop"}
                        role={"dialog"}
                        aria-modal={"true"}
                        aria-labelledby={"nhap-tieu-de"}
                        onClick={v.impKeep}
                        style={styleOf(
                          "width: 720px; max-width: 100%; max-height: calc(100vh - 48px); overflow: auto; background: #FFFFFF; border-radius: 22px; border: 1.5px solid #D6D4D0; box-shadow: 0 24px 64px rgba(53, 38, 55, 0.22); box-sizing: border-box; display: flex; flex-direction: column",
                        )}
                      >
                        <div
                          style={styleOf(
                            "display: flex; align-items: flex-start; gap: 12px; padding: 22px 24px 14px; border-bottom: 1.5px solid #EEECE8",
                          )}
                        >
                          <div style={styleOf("flex: 1; min-width: 0")}>
                            <div
                              id={"nhap-tieu-de"}
                              style={styleOf(
                                "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 20px; font-weight: 600",
                              )}
                            >
                              {"Nhập đề Speaking từ xlsx"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {v.impSub}
                            </div>
                          </div>
                          <a
                            href={"#"}
                            onClick={v.impClose}
                            aria-label={"Đóng"}
                            style={styleOf(
                              "display: flex; padding: 6px; border-radius: 10px; color: #706473",
                            )}
                          >
                            <svg
                              width={"18"}
                              height={"18"}
                              viewBox={"0 0 24 24"}
                              fill={"none"}
                              stroke={"currentColor"}
                              strokeWidth={"2"}
                              strokeLinecap={"round"}
                              strokeLinejoin={"round"}
                              aria-hidden={"true"}
                            >
                              <path d={"M6 6l12 12M18 6L6 18"}></path>
                            </svg>
                          </a>
                        </div>
                        <div
                          style={styleOf(
                            "padding: 18px 24px 22px; display: flex; flex-direction: column; gap: 14px",
                          )}
                        >
                          {v.impPick ? (
                            <>
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 14px 16px; border-radius: 12px; background: #EEF6F0; border: 1.5px solid #CFE5D7",
                                )}
                              >
                                <span
                                  style={styleOf(
                                    "display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; background: #2E7D4F; color: #FFFFFF; flex: none",
                                  )}
                                >
                                  <svg
                                    width={"22"}
                                    height={"22"}
                                    viewBox={"0 0 24 24"}
                                    fill={"none"}
                                    stroke={"currentColor"}
                                    strokeWidth={"2"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    aria-hidden={"true"}
                                  >
                                    <rect
                                      x={"4"}
                                      y={"3"}
                                      width={"16"}
                                      height={"18"}
                                      rx={"2"}
                                    ></rect>
                                    <path d={"M4 9h16M4 15h16M10 3v18"}></path>
                                  </svg>
                                </span>
                                <div
                                  style={styleOf(
                                    "flex: 1 1 260px; min-width: 0",
                                  )}
                                >
                                  <div
                                    style={styleOf(
                                      "font-weight: 600; font-size: 14px",
                                    )}
                                  >
                                    {"Tệp mẫu một đề Speaking"}
                                  </div>
                                  <div
                                    style={styleOf(
                                      "font-size: 13px; color: #706473",
                                    )}
                                  >
                                    {
                                      "ielts-speaking-template.xlsx · 9 KB · sheet De_thi, Part1, Part2, Part3 · có sẵn đề ví dụ 3 Part"
                                    }
                                  </div>
                                </div>
                                <a
                                  href={
                                    "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,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"
                                  }
                                  download={"ielts-speaking-template.xlsx"}
                                  onClick={v.impDl}
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF; background: #2E7D4F; border-color: #2E7D4F",
                                  )}
                                >
                                  <svg
                                    width={"16"}
                                    height={"16"}
                                    viewBox={"0 0 24 24"}
                                    fill={"none"}
                                    stroke={"currentColor"}
                                    strokeWidth={"2"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    aria-hidden={"true"}
                                  >
                                    <path
                                      d={"M12 4v12M7 11l5 5 5-5M4 20h16"}
                                    ></path>
                                  </svg>
                                  {" Tải tệp mẫu"}
                                </a>
                              </div>
                              <label
                                onDragOver={v.impDragOver}
                                onDragLeave={v.impDragLeave}
                                onDrop={v.impDrop}
                                style={styleOf(v.impDropSt)}
                              >
                                <input
                                  type={"file"}
                                  multiple={true}
                                  accept={".xlsx"}
                                  onChange={v.impPickFile}
                                  style={styleOf(
                                    "position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none",
                                  )}
                                />
                                <span
                                  style={styleOf(
                                    "display: flex; color: #706473",
                                  )}
                                >
                                  <svg
                                    width={"28"}
                                    height={"28"}
                                    viewBox={"0 0 24 24"}
                                    fill={"none"}
                                    stroke={"currentColor"}
                                    strokeWidth={"1.8"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    aria-hidden={"true"}
                                  >
                                    <path
                                      d={"M12 16V4M7 9l5-5 5 5M4 20h16"}
                                    ></path>
                                  </svg>
                                </span>
                                <span style={styleOf("font-weight: 600")}>
                                  {"Kéo thả tệp vào đây hoặc bấm để chọn"}
                                </span>
                                <span
                                  style={styleOf(
                                    "font-size: 13px; color: #706473",
                                  )}
                                >
                                  {"1 tệp .xlsx chứa cả đề"}
                                </span>
                              </label>
                              {(v.impFiles || []).map((f, index) => (
                                <React.Fragment key={index}>
                                  <div
                                    className={"im-rise"}
                                    style={styleOf(
                                      "display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 12px; border: 1.5px solid #E6E4E0",
                                    )}
                                  >
                                    <span style={styleOf(f.iconSt)}>
                                      {f.icon}
                                    </span>
                                    <span
                                      style={styleOf(
                                        "flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; font-size: 14px",
                                      )}
                                    >
                                      {f.name}
                                    </span>
                                    <span
                                      style={styleOf(
                                        "font-size: 13px; color: #706473",
                                      )}
                                    >
                                      {f.size}
                                    </span>
                                    <a
                                      href={"#"}
                                      onClick={f.rm}
                                      aria-label={"Bỏ tệp " + f.name}
                                      style={styleOf(
                                        "display: flex; padding: 4px; color: #706473",
                                      )}
                                    >
                                      <svg
                                        width={"15"}
                                        height={"15"}
                                        viewBox={"0 0 24 24"}
                                        fill={"none"}
                                        stroke={"currentColor"}
                                        strokeWidth={"2"}
                                        strokeLinecap={"round"}
                                        strokeLinejoin={"round"}
                                        aria-hidden={"true"}
                                      >
                                        <path d={"M6 6l12 12M18 6L6 18"}></path>
                                      </svg>
                                    </a>
                                  </div>
                                </React.Fragment>
                              ))}
                              {v.impErr ? (
                                <>
                                  <div
                                    role={"alert"}
                                    className={"im-rise"}
                                    style={styleOf(
                                      "display: flex; gap: 10px; align-items: flex-start; padding: 10px 14px; border-radius: 12px; background: #FBDCD3; border: 1.5px solid #F1B3A3; color: #7E2A1A; font-size: 14px",
                                    )}
                                  >
                                    <svg
                                      width={"18"}
                                      height={"18"}
                                      viewBox={"0 0 24 24"}
                                      fill={"none"}
                                      stroke={"currentColor"}
                                      strokeWidth={"2"}
                                      strokeLinecap={"round"}
                                      strokeLinejoin={"round"}
                                      aria-hidden={"true"}
                                    >
                                      <path d={"M12 3l10 18H2z"}></path>
                                      <path d={"M12 10v5M12 18h.01"}></path>
                                    </svg>
                                    <span>{v.impErrText}</span>
                                  </div>
                                </>
                              ) : null}
                              {v.impReplace ? (
                                <>
                                  <div
                                    style={styleOf(
                                      "font-size: 13px; color: #7A5A0E; padding: 10px 14px; border-radius: 12px; background: #FDF4D9",
                                    )}
                                  >
                                    {v.impReplaceText}
                                  </div>
                                </>
                              ) : null}
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; gap: 10px; flex-wrap: wrap",
                                )}
                              >
                                <a
                                  href={"#"}
                                  onClick={v.impSample}
                                  style={styleOf(
                                    "font-weight: 600; font-size: 14px; text-decoration: none",
                                  )}
                                >
                                  {v.impSampleText}
                                </a>
                                <span style={styleOf("flex: 1")}></span>
                                <a
                                  href={"#"}
                                  onClick={v.impClose}
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                                  )}
                                >
                                  {"Hủy"}
                                </a>
                                <a
                                  href={"#"}
                                  onClick={v.impCheck}
                                  aria-disabled={v.impNoX}
                                  style={styleOf(v.impCheckSt)}
                                >
                                  <svg
                                    width={"16"}
                                    height={"16"}
                                    viewBox={"0 0 24 24"}
                                    fill={"none"}
                                    stroke={"currentColor"}
                                    strokeWidth={"2"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    aria-hidden={"true"}
                                  >
                                    <path d={"M5 12.5l4.5 4.5L19 7"}></path>
                                  </svg>
                                  {" Kiểm tra"}
                                </a>
                              </div>
                            </>
                          ) : null}
                          {v.impRun ? (
                            <>
                              <div style={styleOf("font-weight: 600")}>
                                {"Đang kiểm tra " + v.impX}
                              </div>
                              {(v.impChecks || []).map((c, index) => (
                                <React.Fragment key={index}>
                                  <div
                                    style={styleOf(
                                      "display: flex; align-items: center; gap: 12px; font-size: 14px; color: " +
                                      c.color,
                                    )}
                                  >
                                    <span
                                      style={styleOf(c.iconSt)}
                                      className={c.cls}
                                    >
                                      {c.icon}
                                    </span>
                                    <span>{c.text}</span>
                                  </div>
                                </React.Fragment>
                              ))}
                            </>
                          ) : null}
                          {v.impBroken ? (
                            <>
                              <div
                                role={"alert"}
                                className={"im-rise"}
                                style={styleOf(
                                  "display: flex; gap: 10px; align-items: flex-start; padding: 14px 16px; border-radius: 12px; background: #FBDCD3; border: 1.5px solid #F1B3A3; color: #7E2A1A; font-size: 14px",
                                )}
                              >
                                <svg
                                  width={"18"}
                                  height={"18"}
                                  viewBox={"0 0 24 24"}
                                  fill={"none"}
                                  stroke={"currentColor"}
                                  strokeWidth={"2"}
                                  strokeLinecap={"round"}
                                  strokeLinejoin={"round"}
                                  aria-hidden={"true"}
                                >
                                  <path d={"M12 3l10 18H2z"}></path>
                                  <path d={"M12 10v5M12 18h.01"}></path>
                                </svg>
                                <span>
                                  <b>{"Không đọc được " + v.impX + "."}</b>
                                  {
                                    " Tệp bị hỏng hoặc không phải xlsx theo mẫu. Chưa có gì được đổ vào đề."
                                  }
                                </span>
                              </div>
                              <div
                                style={styleOf(
                                  "display: flex; justify-content: flex-end; gap: 10px",
                                )}
                              >
                                <a
                                  href={"#"}
                                  onClick={v.impClose}
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                                  )}
                                >
                                  {"Hủy"}
                                </a>
                                <a
                                  href={"#"}
                                  onClick={v.impBack}
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                                  )}
                                >
                                  <svg
                                    width={"16"}
                                    height={"16"}
                                    viewBox={"0 0 24 24"}
                                    fill={"none"}
                                    stroke={"currentColor"}
                                    strokeWidth={"2"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    aria-hidden={"true"}
                                  >
                                    <path
                                      d={"M12 16V4M7 9l5-5 5 5M4 20h16"}
                                    ></path>
                                  </svg>
                                  {" Chọn tệp khác"}
                                </a>
                              </div>
                            </>
                          ) : null}
                          {v.impBad ? (
                            <>
                              <div
                                style={styleOf(
                                  "display: flex; justify-content: space-between; align-items: center; gap: 10px",
                                )}
                              >
                                <div style={styleOf("font-weight: 600")}>
                                  {"Kết quả kiểm tra " + v.impX}
                                </div>
                                <span
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; background: #FBDCD3; color: #C0412A; font-size: 13px; font-weight: 600",
                                  )}
                                >
                                  {v.impErrN}
                                </span>
                              </div>
                              <div
                                style={styleOf(
                                  "border: 1.5px solid #E6E4E0; border-radius: 12px; overflow: hidden",
                                )}
                              >
                                <table
                                  style={styleOf(
                                    "width: 100%; border-collapse: collapse",
                                  )}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        style={styleOf(
                                          "text-align: left; padding: 10px 14px; font-size: 13px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                                        )}
                                      >
                                        {"Sheet"}
                                      </th>
                                      <th
                                        style={styleOf(
                                          "text-align: left; padding: 10px 14px; font-size: 13px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                                        )}
                                      >
                                        {"Dòng"}
                                      </th>
                                      <th
                                        style={styleOf(
                                          "text-align: left; padding: 10px 14px; font-size: 13px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                                        )}
                                      >
                                        {"Cột"}
                                      </th>
                                      <th
                                        style={styleOf(
                                          "text-align: left; padding: 10px 14px; font-size: 13px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                                        )}
                                      >
                                        {"Lỗi và cách sửa"}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(v.impRows || []).map((r, index) => (
                                      <React.Fragment key={index}>
                                        <tr>
                                          <td
                                            style={styleOf(
                                              "padding: 10px 14px; border-top: 1px solid #E6E4E0; font-size: 13px; vertical-align: top",
                                            )}
                                          >
                                            {r.sheet}
                                          </td>
                                          <td
                                            style={styleOf(
                                              "padding: 10px 14px; border-top: 1px solid #E6E4E0; font-size: 13px; vertical-align: top",
                                            )}
                                          >
                                            {r.row}
                                          </td>
                                          <td
                                            style={styleOf(
                                              "padding: 10px 14px; border-top: 1px solid #E6E4E0; font-size: 13px; vertical-align: top; font-family: 'IBM Plex Mono', monospace; font-size: 13px",
                                            )}
                                          >
                                            {r.col}
                                          </td>
                                          <td
                                            style={styleOf(
                                              "padding: 10px 14px; border-top: 1px solid #E6E4E0; font-size: 13px; vertical-align: top",
                                            )}
                                          >
                                            {r.text}
                                          </td>
                                        </tr>
                                      </React.Fragment>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <div
                                style={styleOf(
                                  "font-size: 13px; color: #706473",
                                )}
                              >
                                {
                                  "Còn lỗi thì không đổ gì vào đề. Sửa tệp rồi tải lại."
                                }
                              </div>
                              <div
                                style={styleOf(
                                  "display: flex; justify-content: flex-end; gap: 10px",
                                )}
                              >
                                <a
                                  href={"#"}
                                  onClick={v.impClose}
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                                  )}
                                >
                                  {"Hủy"}
                                </a>
                                <a
                                  href={"#"}
                                  onClick={v.impBack}
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                                  )}
                                >
                                  <svg
                                    width={"16"}
                                    height={"16"}
                                    viewBox={"0 0 24 24"}
                                    fill={"none"}
                                    stroke={"currentColor"}
                                    strokeWidth={"2"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    aria-hidden={"true"}
                                  >
                                    <path
                                      d={"M12 16V4M7 9l5-5 5 5M4 20h16"}
                                    ></path>
                                  </svg>
                                  {" Tải lại tệp đã sửa"}
                                </a>
                              </div>
                            </>
                          ) : null}
                          {v.impOk ? (
                            <>
                              <div
                                className={"im-rise"}
                                style={styleOf(
                                  "display: flex; gap: 10px; align-items: center; padding: 10px 14px; border-radius: 12px; background: #DCEDE2; color: #1F5A39; font-size: 14px",
                                )}
                              >
                                <svg
                                  width={"16"}
                                  height={"16"}
                                  viewBox={"0 0 24 24"}
                                  fill={"none"}
                                  stroke={"currentColor"}
                                  strokeWidth={"2"}
                                  strokeLinecap={"round"}
                                  strokeLinejoin={"round"}
                                  aria-hidden={"true"}
                                >
                                  <path d={"M5 12.5l4.5 4.5L19 7"}></path>
                                </svg>
                                <span>
                                  <b>{"Hợp lệ."}</b>
                                  {" " +
                                    v.impX +
                                    ": " +
                                    v.impTitle +
                                    ", " +
                                    v.impForm +
                                    "."}
                                </span>
                              </div>
                              <div
                                style={styleOf(
                                  "display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px",
                                )}
                              >
                                {(v.impStats || []).map((t, index) => (
                                  <React.Fragment key={index}>
                                    <div
                                      style={styleOf(
                                        "padding: 10px 12px; border-radius: 12px; border: 1.5px solid #E6E4E0",
                                      )}
                                    >
                                      <div
                                        style={styleOf(
                                          "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 22px; font-weight: 600; line-height: 1.2",
                                        )}
                                      >
                                        {t.n}
                                      </div>
                                      <div
                                        style={styleOf(
                                          "font-size: 13px; color: #706473",
                                        )}
                                      >
                                        {t.label}
                                      </div>
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                              {(v.impPrev || []).map((p, index) => (
                                <React.Fragment key={index}>
                                  <div
                                    style={styleOf(
                                      "display: flex; gap: 12px; align-items: flex-start; padding: 10px 12px; border-radius: 12px; background: #FAF9F5",
                                    )}
                                  >
                                    <div
                                      style={styleOf(
                                        "flex: 0 0 200px; min-width: 0",
                                      )}
                                    >
                                      <div
                                        style={styleOf(
                                          "font-weight: 600; font-size: 14px",
                                        )}
                                      >
                                        {p.title}
                                      </div>
                                      <div
                                        style={styleOf(
                                          "font-size: 13px; color: #706473",
                                        )}
                                      >
                                        {p.sub}
                                      </div>
                                    </div>
                                    <div
                                      style={styleOf(
                                        "display: flex; gap: 6px; flex-wrap: wrap",
                                      )}
                                    >
                                      {(p.groups || []).map((g, index) => (
                                        <React.Fragment key={index}>
                                          <span
                                            style={styleOf(
                                              "display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 999px; background: #FFFFFF; border: 1.5px solid #E6E4E0; font-size: 13px; font-weight: 600",
                                            )}
                                          >
                                            {g}
                                          </span>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  </div>
                                </React.Fragment>
                              ))}
                              <div
                                style={styleOf(
                                  "display: flex; flex-direction: column; gap: 4px; padding: 10px 14px; border-radius: 12px; background: #FDF4D9; font-size: 13px; color: #6B5212",
                                )}
                              >
                                <b>
                                  {
                                    "Cần làm tiếp trong editor (không chặn nhập)"
                                  }
                                </b>
                                {(v.impWarns || []).map((w, index) => (
                                  <React.Fragment key={index}>
                                    <span>{"• " + w}</span>
                                  </React.Fragment>
                                ))}
                              </div>
                              <div
                                style={styleOf(
                                  "font-size: 13px; color: #706473",
                                )}
                              >
                                {v.impReplaceNote}
                              </div>
                              <div
                                style={styleOf(
                                  "display: flex; justify-content: flex-end; gap: 10px",
                                )}
                              >
                                <a
                                  href={"#"}
                                  onClick={v.impClose}
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                                  )}
                                >
                                  {"Hủy"}
                                </a>
                                <a
                                  href={"#"}
                                  onClick={v.impApply}
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                                  )}
                                >
                                  {"Đổ vào đề"}
                                </a>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                <div
                  style={styleOf(
                    "display: flex; flex-wrap: wrap; align-items: stretch; flex: 1; min-height: 0; margin-top: 16px; border-top: 1.5px solid #D6D4D0",
                  )}
                >
                  <div
                    style={styleOf(
                      "flex: 1 1 440px; min-width: 0; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; border-right: 1.5px solid #D6D4D0; background: #FCFBF7",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; justify-content: space-between; gap: 12px",
                      )}
                    >
                      <div
                        style={styleOf(
                          "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 20px; font-weight: 600",
                        )}
                      >
                        {v.F.name}
                      </div>
                      <a
                        href={"#"}
                        className={"eo"}
                        onClick={v.F.clear}
                        style={styleOf(
                          "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                        )}
                      >
                        <svg
                          width={"15"}
                          height={"15"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"2"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                          aria-hidden={"true"}
                        >
                          <path d={"M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"}></path>
                        </svg>
                        {" Xóa nội dung " + v.F.name}
                      </a>
                    </div>
                    {v.F.empty ? (
                      <>
                        <div
                          style={styleOf(
                            "padding: 28px 24px; text-align: center; border-radius: 12px; border: 1.5px dashed #D6D4D0; color: #706473; display: flex; flex-direction: column; align-items: center; gap: 12px",
                          )}
                        >
                          <div style={styleOf("font-size: 15px")}>
                            {v.F.emptyText}
                          </div>
                          {v.viewing ? (
                            <>
                              <div
                                style={styleOf(
                                  "display: flex; gap: 10px; flex-wrap: wrap; justify-content: center",
                                )}
                              >
                                {v.canEdit ? (
                                  <a
                                    href={"#"}
                                    onClick={v.startEdit}
                                    style={styleOf(
                                      "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                                    )}
                                  >
                                    <svg
                                      width={"16"}
                                      height={"16"}
                                      viewBox={"0 0 24 24"}
                                      fill={"none"}
                                      stroke={"currentColor"}
                                      strokeWidth={"2"}
                                      strokeLinecap={"round"}
                                      strokeLinejoin={"round"}
                                      aria-hidden={"true"}
                                    >
                                      <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                                    </svg>
                                    {" Soạn ngay"}
                                  </a>
                                ) : null}
                                <button
                                  type="button"
                                  disabled={true}
                                  aria-disabled="true"
                                  title="Nhập từ xlsx sẽ có khi nối API nhập đề"
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: not-allowed; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #B5ADB7",
                                  )}
                                >
                                  <svg
                                    width={"16"}
                                    height={"16"}
                                    viewBox={"0 0 24 24"}
                                    fill={"none"}
                                    stroke={"currentColor"}
                                    strokeWidth={"2"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    aria-hidden={"true"}
                                  >
                                    <path d={"M12 16V4M7 9l5-5 5 5M4 20h16"}></path>
                                  </svg>
                                  {" Nhập từ xlsx"}
                                </button>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                    <TopicCombobox
                      value={v.F.topic || ""}
                      options={this.state.topicOptions || []}
                      onChange={v.F.setTopicValue}
                      disabled={!v.F.canEdit}
                      maxLength={TOPIC_MAX_LENGTH}
                      label={"Chủ đề (không bắt buộc)"}
                    />
                    {v.F.hasInstr ? (
                      <>
                        <label
                          style={styleOf(
                            "display: flex; flex-direction: column; gap: 6px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-size: 13px; font-weight: 700; color: #352637",
                            )}
                          >
                            {"Dòng hướng dẫn sau tên Part"}
                          </span>
                          <input
                            aria-label={"Dòng hướng dẫn"}
                            value={v.F.instr}
                            onChange={v.F.setInstr}
                            placeholder={
                              "Two or three complex sentences for each answer."
                            }
                            style={styleOf(
                              "box-sizing: border-box; width: 100%; min-width: 0; height: 38px; padding: 0 12px; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font: inherit; font-size: 14px; outline-color: #2963CC",
                            )}
                          />
                        </label>
                      </>
                    ) : null}
                    {v.F.isCue ? (
                      <>
                        <div
                          style={styleOf(
                            "display: flex; gap: 12px; flex-wrap: wrap",
                          )}
                        >
                          <label
                            style={styleOf(
                              "display: flex; flex-direction: column; gap: 6px; flex: 1 1 160px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 700; color: #352637",
                              )}
                            >
                              {"Thời gian chờ chuẩn bị (phút)"}
                            </span>
                            <input
                              inputMode={"numeric"}
                              aria-label={"Thời gian chờ chuẩn bị"}
                              value={v.F.prep}
                              onChange={v.F.setPrep}
                              style={styleOf(v.F.prepSt)}
                            />
                          </label>
                          <label
                            style={styleOf(
                              "display: flex; flex-direction: column; gap: 6px; flex: 1 1 160px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 700; color: #352637",
                              )}
                            >
                              {"Thời gian nói (phút)"}
                            </span>
                            <input
                              inputMode={"numeric"}
                              aria-label={"Thời gian nói"}
                              value={v.F.speak}
                              onChange={v.F.setSpeak}
                              style={styleOf(v.F.speakSt)}
                            />
                          </label>
                        </div>
                      </>
                    ) : null}
                    {v.F.isQ ? (
                      <>
                        <div
                          style={styleOf(
                            "display: flex; flex-direction: column; gap: 12px",
                          )}
                        >
                          <label
                            style={styleOf(
                              "display: flex; flex-direction: column; gap: 6px; max-width: 320px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 700; color: #352637",
                              )}
                            >
                              {"Thời gian tổng Part 1 và Part 3 (phút)"}
                            </span>
                            <input
                              inputMode={"numeric"}
                              aria-label={"Thời gian tổng Part 1 và Part 3"}
                              value={v.F.tot}
                              onChange={v.F.setTot}
                              style={styleOf(v.F.totSt)}
                            />
                            <span
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"Dùng chung cho cả hai Part, chỉnh được."}
                            </span>
                          </label>
                          <span
                            style={styleOf(
                              "font-size: 13px; font-weight: 700; color: #352637",
                            )}
                          >
                            {"Câu hỏi (" + v.F.qCount + ")"}
                          </span>
                          {(v.F.qlist || []).map((q, index) => (
                            <React.Fragment key={index}>
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; gap: 8px",
                                )}
                              >
                                <span
                                  style={styleOf(
                                    "flex: none; width: 24px; text-align: right; font-size: 13px; font-weight: 600; color: #706473",
                                  )}
                                >
                                  {q.n}
                                </span>
                                <input
                                  aria-label={q.lab}
                                  value={q.v}
                                  onChange={q.set}
                                  placeholder={"Nhập câu hỏi"}
                                  style={styleOf(
                                    "box-sizing: border-box; width: 100%; min-width: 0; height: 38px; padding: 0 12px; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font: inherit; font-size: 14px; outline-color: #2963CC; flex: 1; min-width: 0",
                                  )}
                                />
                                <a
                                  href={"#"}
                                  className={"eo"}
                                  onClick={q.del}
                                  title={q.delLab}
                                  aria-label={q.delLab}
                                  style={styleOf(
                                    "flex: none; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #C0412A; text-decoration: none; cursor: pointer",
                                  )}
                                >
                                  <svg
                                    width={"15"}
                                    height={"15"}
                                    viewBox={"0 0 24 24"}
                                    fill={"none"}
                                    stroke={"currentColor"}
                                    strokeWidth={"2"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    aria-hidden={"true"}
                                  >
                                    <path
                                      d={"M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"}
                                    ></path>
                                  </svg>
                                </a>
                              </div>
                            </React.Fragment>
                          ))}
                          <div>
                            <a
                              href={"#"}
                              className={"eo"}
                              onClick={v.F.addQ}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637",
                              )}
                            >
                              {"+ Thêm câu hỏi"}
                            </a>
                          </div>
                        </div>
                      </>
                    ) : null}
                    {v.F.isCue ? (
                      <>
                        <div
                          style={styleOf(
                            "display: flex; flex-direction: column; gap: 6px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-size: 13px; font-weight: 700; color: #352637",
                            )}
                          >
                            {v.F.edLabel}
                          </span>
                          <div
                            style={styleOf(
                              "border: 1.5px solid #8E8392; border-radius: 12px; overflow: hidden; background: #FFFFFF",
                            )}
                          >
                            <div
                              role={"toolbar"}
                              className={"eo"}
                              aria-label={"Định dạng"}
                              style={styleOf(
                                "display: flex; align-items: center; gap: 2px; flex-wrap: wrap; padding: 4px 6px; border-bottom: 1px solid #E6E4E0; background: #F3F0EA",
                              )}
                            >
                              <a
                                href={"#"}
                                onClick={v.F.fmtB}
                                title={"In đậm"}
                                aria-label={"In đậm"}
                                style={styleOf(
                                  "display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 8px; box-sizing: border-box; font-size: 13px; font-weight: 600; color: #352637; text-decoration: none; cursor: pointer; white-space: nowrap; font-weight: 800",
                                )}
                              >
                                {"B"}
                              </a>
                              <a
                                href={"#"}
                                onClick={v.F.fmtI}
                                title={"In nghiêng"}
                                aria-label={"In nghiêng"}
                                style={styleOf(
                                  "display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 8px; box-sizing: border-box; font-size: 13px; font-weight: 600; color: #352637; text-decoration: none; cursor: pointer; white-space: nowrap; font-style: italic; font-family: Georgia, serif",
                                )}
                              >
                                {"I"}
                              </a>
                              <span
                                style={styleOf(
                                  "width: 1px; height: 18px; background: #D6D4D0; margin: 0 4px",
                                )}
                              ></span>
                              <a
                                href={"#"}
                                onClick={v.F.fmtH}
                                title={"Tiêu đề mục"}
                                style={styleOf(
                                  "display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 8px; box-sizing: border-box; font-size: 13px; font-weight: 600; color: #352637; text-decoration: none; cursor: pointer; white-space: nowrap",
                                )}
                              >
                                {"Tiêu đề"}
                              </a>
                              <a
                                href={"#"}
                                onClick={v.F.fmtL}
                                title={"Gạch đầu dòng"}
                                style={styleOf(
                                  "display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 8px; box-sizing: border-box; font-size: 13px; font-weight: 600; color: #352637; text-decoration: none; cursor: pointer; white-space: nowrap",
                                )}
                              >
                                {"• Gạch đầu dòng"}
                              </a>
                            </div>
                            <textarea
                              id={v.F.edId}
                              rows={12}
                              aria-label={v.F.edLabel}
                              placeholder={v.F.ph}
                              value={v.F.text}
                              onChange={v.F.setText}
                              style={styleOf(
                                "box-sizing: border-box; display: block; width: 100%; min-width: 0; padding: 10px 12px; border: 0; background: transparent; color: #352637; font-family: 'IBM Plex Mono', monospace; font-size: 13px; line-height: 1.7; resize: vertical; outline: none",
                              )}
                            ></textarea>
                          </div>
                          <span
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {v.F.edHint}
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 1 400px; min-width: 0; padding: 20px 24px; display: flex; flex-direction: column; gap: 10px; background: #FAF9F5",
                    )}
                  >
                    <div
                      style={styleOf(
                        "font-size: 13px; font-weight: 700; color: #352637",
                      )}
                    >
                      {"Xem trước như người học thấy"}
                    </div>
                    <div
                      style={styleOf(
                        "padding: 18px 20px; border-radius: 6px; background: #FFFFFF; border: 1.5px solid #D98B7E; display: flex; flex-direction: column; gap: 12px; font-size: 14px; line-height: 1.7",
                      )}
                    >
                      <div
                        style={styleOf(
                          "text-align: center; font-size: 13px; font-weight: 700; color: #706473",
                        )}
                      >
                        {v.F.headLine}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 4px; ",
                        )}
                      >
                        {(v.F.pv || []).map((ln, index) => (
                          <React.Fragment key={index}>
                            <div style={styleOf(ln.st)}>
                              {ln.li ? (
                                <>
                                  <span
                                    style={styleOf("flex: none; width: 14px")}
                                  >
                                    {"•"}
                                  </span>
                                </>
                              ) : null}
                              <span>
                                {(ln.segs || []).map((sg, index) => (
                                  <React.Fragment key={index}>
                                    <span style={styleOf(sg.st)}>{sg.t}</span>
                                  </React.Fragment>
                                ))}
                              </span>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                      {(v.F.pq || []).map((q, index) => (
                        <React.Fragment key={index}>
                          <div
                            style={styleOf(
                              "display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; background: #F7F4EE",
                            )}
                          >
                            <span
                              style={styleOf(
                                "flex: none; font-weight: 700; color: #706473",
                              )}
                            >
                              {q.n}
                            </span>
                            <span style={styleOf("flex: 1; min-width: 0")}>
                              {q.v}
                            </span>
                            <span
                              style={styleOf(
                                "flex: none; font-size: 13px; color: #706473",
                              )}
                            >
                              {"● Ghi âm"}
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                      {v.F.noContent ? (
                        <>
                          <div
                            style={styleOf(
                              "color: #706473; text-align: center; padding: 12px 0",
                            )}
                          >
                            {"Chưa có nội dung."}
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {v.F.countNote}
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          {"\n"}
        </div>
        {"\n"}
        <SkillHistoryDrawer
          isOpen={v.historyOpen}
          onClose={v.closeHistory}
          skillId={v.skill ? v.skill.id : null}
          onSelectVersion={function (versionId) {
            if (v.editing && v.dirty) {
              v.ask(
                "Rời trang khi chưa lưu thay đổi?",
                "Các thay đổi bạn vừa chỉnh sửa sẽ bị mất nếu chuyển phiên bản.",
                function () {
                  v.closeHistory();
                  navigate("AdminSpeakingEditor?skillId=" + versionId);
                },
                "Rời đi"
              );
            } else {
              v.closeHistory();
              navigate("AdminSpeakingEditor?skillId=" + versionId);
            }
          }}
        />
      </>
    );
  }
}

export default AdminSpeakingEditor;
