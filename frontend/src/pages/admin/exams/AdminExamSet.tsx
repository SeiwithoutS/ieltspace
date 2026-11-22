import React from "react";
import { styleOf, cssText } from "../../../lib/shared/styles";
import { readImage } from "../../../lib/shared/image-file";
import {
  ART,
  SK,
  SST,
  SST_TONE,
  ST,
  TY,
  type FormKey,
  type SkillKey,
} from "../../../lib/exams/exam-ui";
import {
  Button,
  Chip,
  ConfirmDialog,
  DataCard,
  DataTable,
  Icon,
  PageHeader,
  StatCard,
  StatGrid,
  Toast,
  type ConfirmTone,
} from "../../../components/shared/ui";
import "./admin-exams.css";
import StaffLayout from "../../../components/layout/StaffLayout";
import { navigate } from "../../../lib/auth/auth";
import {
  getSet,
  createTest,
  deleteTest,
  createSkill,
  deleteSkill,
  hideSkill,
  showSkill,
  publishSet,
  hideSet,
  deleteSet,
  patchSet,
  uploadCover,
  toUiSet,
  errorInfo,
  type Cell,
  type ExamSetAdmin,
  type FormCells,
  type SlotKey,
  type UiSet,
  type UiTest,
} from "../../../lib/exams/exam-admin";
import SkillHistoryDrawer from "../../../components/exams/SkillHistoryDrawer";
import { TOAST_MS } from "../../../lib/shared/toast";

type Ev = React.SyntheticEvent | null | undefined;
type ConfirmKind = "pub" | "hide" | "del" | "delSkill";
// Việc hoàn tác sau khi ẩn hoặc hiện lại một kỹ năng, hoặc hoàn tác tạo kỹ năng.
type UndoAction =
  | {
      action: "show" | "hide";
      liveId: string;
      nm: string;
      tName: string;
    }
  | {
      action: "deleteSkill";
      draftId: string;
      nm: string;
      tName: string;
    };
type MenuPos = { l: number; t: number; b: number; up: boolean };
type MenuItem = {
  label: string;
  cls: string;
  href: string;
  act: (e: Ev) => unknown;
  disabled?: boolean;
};
// Nội dung hộp xác nhận Đăng / Ẩn / Xóa bộ đề.
type Confirm = {
  title: string;
  text: string;
  list: Array<{ n: number; text: string; dotColor: string }>;
  goText: string;
  goDanger: boolean;
  icon: string;
  tone: ConfirmTone;
  noGo: boolean;
};

type DelSkillTarget = {
  skillId: string;
  nm: string;
  testName: string;
  isDiscard: boolean;
};

type State = {
  id: string | null;
  loading: boolean;
  loadError: string | null;
  apiSet: ExamSetAdmin | null;
  gone: boolean;
  col: number;
  menu: string | null;
  menuPos: MenuPos | null;
  cf: ConfirmKind | null;
  artOpen: boolean;
  artMsg: string;
  artBad: boolean;
  toast: string;
  flash: string;
  undoAction: UndoAction | null;
  toastLink: string | null;
  delSkillTarget: DelSkillTarget | null;
  historySkillId: string | null;
  historyOpen: boolean;
  historyEditorPage: string | null;
};

const SLOT_KEYS: Record<string, SlotKey> = {
  "0-null": "LISTENING",
  "1-A": "READING_ACADEMIC",
  "1-G": "READING_GENERAL",
  "2-A": "WRITING_ACADEMIC",
  "2-G": "WRITING_GENERAL",
  "3-null": "SPEAKING",
};
const EDITORS: Record<SkillKey, string> = {
  L: "AdminListeningEditor",
  R: "AdminReadingEditor",
  W: "AdminWritingEditor",
  S: "AdminSpeakingEditor",
};
const EMPTY_CONFIRM: Confirm = {
  title: "",
  text: "",
  list: [],
  goText: "",
  goDanger: false,
  icon: "",
  tone: "neutral",
  noGo: false,
};

function isForms(x: Cell | FormCells): x is FormCells {
  return typeof x === "object" && x !== null;
}

class AdminExamSet extends React.Component<Record<string, unknown>, State> {
  state: State = {
    id: null,
    loading: true,
    loadError: null,
    apiSet: null,
    gone: false,
    col: -1,
    menu: null,
    menuPos: null,
    cf: null,
    artOpen: false,
    artMsg: "",
    artBad: false,
    toast: "",
    flash: "",
    undoAction: null,
    toastLink: null,
    delSkillTarget: null,
    historySkillId: null,
    historyOpen: false,
    historyEditorPage: null,
  };
  _key?: (e: KeyboardEvent) => void;
  _scr?: () => void;
  _t?: ReturnType<typeof setTimeout>;

  loadData = async (id?: string) => {
    var setId = id || this.state.id || "";
    this.setState({ loading: true, loadError: null });
    try {
      var data = await getSet(setId);
      this.setState({ apiSet: data, loading: false });
    } catch (err) {
      if (errorInfo(err).status === 404) {
        this.setState({ gone: true, loading: false });
      } else {
        this.setState({
          loading: false,
          loadError: errorInfo(err).message || "Không thể tải bộ đề.",
        });
      }
    }
  };

  componentDidMount() {
    var me = this;
    var hash = window.location.hash || "";
    var query = window.location.search || "";
    var paramStr = hash.includes("?")
      ? hash.split("?")[1]
      : query.replace(/^\?/, "");
    var urlParams = new URLSearchParams(paramStr);
    var id = urlParams.get("id");
    if (!id) {
      navigate("AdminExams");
      return;
    }
    this.setState({ id: id });
    this.loadData(id);

    this._key = function (e: KeyboardEvent) {
      if (e.key === "Escape") {
        me.setState({ cf: null, menu: null, artOpen: false });
      }
    };
    document.addEventListener("keydown", this._key);

    this._scr = function () {
      if (me.state && me.state.menu) {
        me.setState({ menu: null });
      }
    };
    window.addEventListener("scroll", this._scr, {
      passive: true,
      capture: true,
    });
  }

  componentWillUnmount() {
    if (this._key) document.removeEventListener("keydown", this._key);
    if (this._scr)
      window.removeEventListener("scroll", this._scr, { capture: true });
    clearTimeout(this._t);
  }

  renderVals() {
    var me = this,
      s = this.state,
      self = this;
    var sid: string = s.id || "";

    function stop(e?: Ev) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
    }
    function keep(e?: Ev) {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
    }

    var SET: UiSet = s.apiSet
      ? toUiSet(s.apiSet)
      : {
          id: sid,
          cat: "",
          catName: "",
          name: s.loading ? "Đang tải…" : s.gone ? "Đã xóa" : "",
          art: null,
          img: null,
          short: "",
          status: "DRAFT",
          updated: "",
          plays: "0",
          desc: "",
          tests: [],
          canDelete: true,
        };

    var tests = SET.tests,
      col = s.col == null ? -1 : s.col,
      status = SET.status;

    // 6 cột trạng thái: Listening, Reading Academic/GT, Writing Academic/GT, Speaking
    var COLS: Array<[0 | 1 | 2 | 3, FormKey | null]> = [
      [0, null],
      [1, "A"],
      [1, "G"],
      [2, "A"],
      [2, "G"],
      [3, null],
    ];
    function val(t: UiTest, k: SkillKey, v?: FormKey | null): Cell {
      var x = t[k];
      if (isForms(x)) return v ? x[v] : null;
      return v ? null : x;
    }
    function vals(t: UiTest, k: SkillKey): Cell[] {
      var x = t[k];
      return (isForms(x) ? [x.A, x.G] : [x]).filter(function (y) {
        return y;
      });
    }
    function toastSet(
      m: string,
      extra?: Partial<State>,
      undoable?: boolean,
      undoAction?: UndoAction,
    ) {
      clearTimeout(me._t);
      var st: Partial<State> = {
        toast: m,
        undoAction: undoable && undoAction ? undoAction : null,
        toastLink: null,
      };
      Object.assign(st, extra);
      self.setState(st as Pick<State, keyof State>);
      me._t = setTimeout(function () {
        self.setState({ toast: "", undoAction: null });
      }, TOAST_MS);
    }
    var tiles = SK.map(function (k, i) {
      var all: Cell[] = [],
        on = col === i;
      tests.forEach(function (t) {
        all = all.concat(vals(t, k[0]));
      });
      var pub = all.filter(function (x) {
          return x === "pub";
        }).length,
        dr = all.filter(function (x) {
          return x === "draft";
        }).length,
        hid = all.length - pub - dr;
      var sub = [pub + " đã đăng", dr + " đang soạn"]
          .concat(hid ? [hid + " đã ẩn"] : [])
          .join(" · "),
        rw = k[0] === "R" || k[0] === "W";
      var kinds = rw
        ? (["A", "G"] as FormKey[]).map(function (c) {
            var n = tests.filter(function (t) {
              return val(t, k[0], c);
            }).length;
            return {
              text: TY[c][0] + " " + n,
              tone: `form-${c}` as `form-${FormKey}` | null,
            };
          })
        : [
            {
              text: "Dùng chung cho cả 2 hình thức",
              tone: null as `form-${FormKey}` | null,
            },
          ];
      return {
        label: k[1],
        n: String(all.length),
        sub: all.length ? sub : "Chưa có đề nào",
        icon: k[1].charAt(0),
        on: on,
        kinds: kinds,
        tone: `skill-${k[0]}` as `skill-${SkillKey}`,
        canImp: true,
        impDisabled: true,
        impHref: "#",
        imp: function (e: Ev) {
          stop(e);
          keep(e);
          // O-L3: Khóa nút Nhập xlsx trong khi nâng cấp định dạng
        },
        pick: function (e: Ev) {
          stop(e);
          self.setState({ col: on ? -1 : i });
        },
      };
    });
    function hst(i: number, grp?: boolean, subRow?: boolean) {
      var k = SK[i],
        on = col === i;
      return (
        "text-align: " +
        (grp ? "center" : "left") +
        "; padding: " +
        (subRow ? "6px 12px 10px" : "12px 16px") +
        "; font-size: 13px; font-weight: 600; white-space: nowrap; vertical-align: bottom; transition: background-color .2s, color .2s; " +
        (grp && !subRow
          ? "border-bottom: 1px solid #E6E4E0; "
          : "border-bottom: 1.5px solid #D6D4D0; ") +
        (grp || i === 3 ? "border-left: 1px solid #E6E4E0; " : "") +
        (on
          ? "background: " + k[2] + "; color: " + k[3]
          : "background: #FAF9F5; color: #706473")
      );
    }
    var rows = tests.map(function (t, r) {
      var n = SK.filter(function (k) {
        return vals(t, k[0]).length;
      }).length;
      var ty = (["A", "G"] as FormKey[])
        .filter(function (c) {
          return val(t, "R", c) || val(t, "W", c);
        })
        .map(function (c) {
          return c === "A" ? "Academic" : "GT";
        })
        .join(" + ");
      return {
        name: t.name,
        updated: t.updated,
        sub: n
          ? n + "/4 kỹ năng" + (ty ? " · " + ty : "")
          : "Chưa có kỹ năng nào",
        cls: s.flash === t.name ? "an-flash" : "",
        del: async function (e: Ev) {
          stop(e);
          if (t.everPublished) {
            toastSet(
              t.name +
                " đã đăng nên không xóa được, để giữ bài làm của người học. Hãy ẩn từng kỹ năng nếu không muốn người học thấy.",
            );
            return;
          }
          try {
            var res = await deleteTest(sid, t.id);
            self.setState({ apiSet: res, menu: null });
            toastSet("Đã xóa " + t.name + ".");
          } catch (err) {
            toastSet(errorInfo(err).message || "Không thể xóa đề thi.");
          }
        },
        cells: COLS.map(function (cv, ci) {
          var i = cv[0],
            c = cv[1],
            k = SK[i],
            v = val(t, k[0], c),
            stx = v ? ST[v] : null,
            nm = k[1] + (c ? " " + TY[c][0] : ""),
            key = r + "-" + ci,
            open = s.menu === key;

          var slotKey = SLOT_KEYS[i + "-" + c];
          var slot = t._slots ? t._slots[slotKey] : null;

          var items: MenuItem[] = [];
          if (v === "pub") {
            items.push({
              label: "Ẩn với người học",
              cls: "ex-mi",
              href: "#",
              act: async function (e: Ev) {
                stop(e);
                if (!slot || !slot.liveId) return;
                try {
                  var res = await hideSkill(sid, slot.liveId);
                  self.setState({ apiSet: res, menu: null });
                  toastSet(
                    "Đã ẩn " +
                      nm +
                      " của " +
                      t.name +
                      ". Người học không thấy kỹ năng này nữa.",
                    {},
                    true,
                    {
                      action: "show",
                      liveId: slot.liveId,
                      nm: nm,
                      tName: t.name,
                    },
                  );
                } catch (err) {
                  toastSet(errorInfo(err).message || "Không thể ẩn kỹ năng.");
                }
              },
            });
          }
          if (v === "hidden") {
            items.push({
              label: "Hiện lại cho người học",
              cls: "ex-mi",
              href: "#",
              act: async function (e: Ev) {
                stop(e);
                if (!slot || !slot.liveId) return;
                try {
                  var res = await showSkill(sid, slot.liveId);
                  self.setState({ apiSet: res, menu: null });
                  toastSet(
                    "Đã hiện lại " + nm + " của " + t.name + ".",
                    {},
                    true,
                    {
                      action: "hide",
                      liveId: slot.liveId,
                      nm: nm,
                      tName: t.name,
                    },
                  );
                } catch (err) {
                  toastSet(errorInfo(err).message || "Không thể hiện kỹ năng.");
                }
              },
            });
          }
          var skillId = (slot && (slot.draftId || slot.liveId)) || "";
          var edName = EDITORS[k[0]];
          items.push({
            label: "Mở editor " + k[1],
            cls: "ex-mi ex-mi--accent",
            href: "#",
            act: function (e: Ev) {
              stop(e);
              navigate(edName + (skillId ? "?skillId=" + skillId : ""));
            },
          });
          if (slot && slot.liveId && slot.draftId) {
            items.push({
              label: "Có bản sửa chưa đăng",
              disabled: true,
              cls: "ex-mi--note",
              href: "#",
              act: stop,
            });
          }
          if (slot && (slot.draftId || slot.liveId)) {
            const histId = slot.draftId || slot.liveId;
            items.push({
              label: "Xem lịch sử",
              cls: "ex-mi",
              href: "#",
              act: function (e: Ev) {
                stop(e);
                self.setState({
                  menu: null,
                  historySkillId: histId,
                  historyOpen: true,
                  historyEditorPage: EDITORS[k[0]],
                });
              },
            });
          }
          if (v === "draft" && !(slot && slot.liveId && slot.draftId)) {
            items.push({
              label: "Đăng trong editor khi soạn xong",
              disabled: true,
              cls: "ex-mi--hint",
              href: "#",
              act: stop,
            });
          }
          if (slot && slot.draftId && !slot.liveId) {
            const draftId = slot.draftId;
            items.push({
              label: "Xóa " + nm,
              cls: "ex-mi ex-mi--danger",
              href: "#",
              act: function (e: Ev) {
                stop(e);
                self.setState({
                  menu: null,
                  cf: "delSkill",
                  delSkillTarget: {
                    skillId: draftId,
                    nm: nm,
                    testName: t.name,
                    isDiscard: false,
                  },
                });
              },
            });
          } else if (slot && slot.liveId && slot.draftId) {
            const draftId = slot.draftId;
            items.push({
              label: "Bỏ bản sửa chưa đăng",
              cls: "ex-mi ex-mi--danger",
              href: "#",
              act: function (e: Ev) {
                stop(e);
                self.setState({
                  menu: null,
                  cf: "delSkill",
                  delSkillTarget: {
                    skillId: draftId,
                    nm: nm,
                    testName: t.name,
                    isDiscard: true,
                  },
                });
              },
            });
          }
          return {
            has: !!v,
            none: !v,
            label: stx ? stx[0] : "",
            open: open,
            items: items,
            menuHead: t.name + " · " + nm,
            title:
              t.name +
              " · " +
              nm +
              (stx ? " · " + stx[0] : " · chưa có, bấm để tạo"),
            menuStyle: Object.assign(
              { left: s.menuPos ? s.menuPos.l : 0 },
              s.menuPos && s.menuPos.up
                ? { bottom: s.menuPos.b }
                : { top: s.menuPos ? s.menuPos.t : 0 },
            ) as { left: number; top?: number; bottom?: number },
            toggle: function (e: React.MouseEvent<HTMLElement>) {
              stop(e);
              var el = e && e.currentTarget,
                pos: MenuPos | null = null;
              if (!open && el && el.getBoundingClientRect) {
                var r0 = el.getBoundingClientRect(),
                  vw = window.innerWidth,
                  vh = window.innerHeight,
                  up = vh - r0.bottom < 190 && r0.top > 190;
                pos = {
                  l: Math.max(8, Math.min(r0.left, vw - 296)),
                  t: r0.bottom + 6,
                  b: vh - r0.top + 6,
                  up: up,
                };
              }
              self.setState({ menu: open ? null : key, menuPos: pos });
            },
            tdSt:
              "padding: 10px 12px; border-top: 1px solid #E6E4E0; vertical-align: middle; transition: background-color .2s; " +
              (c || i === 3 ? "border-left: 1px solid #E6E4E0; " : "") +
              (col === i ? "background: " + k[2] + "55" : ""),
            st:
              "display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 8px 0 10px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; text-decoration: none; box-sizing: border-box; cursor: pointer; background: " +
              (stx ? stx[1] + "; color: " + stx[2] : "#FFFFFF") +
              (open
                ? "; box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px " +
                  (stx ? stx[2] : "#2963CC") +
                  "55"
                : ""),
            create: async function (e: Ev) {
              stop(e);
              var skillEnum = {
                0: "LISTENING",
                1: "READING",
                2: "WRITING",
                3: "SPEAKING",
              }[i];
              var formEnum = c ? (c === "G" ? "GENERAL" : "ACADEMIC") : null;
              try {
                var res = await createSkill(t.id, skillEnum, formEnum);
                self.setState({ apiSet: res, menu: null });
                var uiRes = toUiSet(res);
                var updatedTest = uiRes.tests.find(function (x) {
                  return x.id === t.id;
                });
                var updatedSlot = updatedTest
                  ? updatedTest._slots[slotKey]
                  : null;
                var newDraftId = updatedSlot ? updatedSlot.draftId : null;
                if (newDraftId) {
                  toastSet(
                    "Đã tạo bản soạn " + nm + " của " + t.name + ".",
                    {},
                    true,
                    {
                      action: "deleteSkill",
                      draftId: newDraftId,
                      nm: nm,
                      tName: t.name,
                    },
                  );
                } else {
                  toastSet("Đã tạo " + nm + " cho " + t.name + " (Đang soạn).");
                }
              } catch (err) {
                toastSet(errorInfo(err).message || "Không thể tạo kỹ năng.");
              }
            },
          };
        }),
      };
    });
    // ---- ảnh bìa
    var ai = SET.art,
      img = SET.img || null,
      AR: [string, string, boolean] | null = img
        ? [
            "Ảnh đã tải lên",
            "url('" + img + "') center / contain no-repeat, #E9E4DA",
            false,
          ]
        : ai == null
          ? null
          : ART[ai];
    // ---- đăng / ẩn / xóa bộ đề
    var cnt: Record<"pub" | "draft" | "hidden", number> = {
        pub: 0,
        draft: 0,
        hidden: 0,
      },
      live = 0;
    tests.forEach(function (t) {
      var any = false;
      SK.forEach(function (k) {
        vals(t, k[0]).forEach(function (x) {
          if (!x) return;
          cnt[x]++;
          if (x === "pub") {
            any = true;
          }
        });
      });
      if (any) {
        live++;
      }
    });
    var canDel =
        SET.canDelete !== undefined
          ? SET.canDelete
          : status === "DRAFT" || !tests.length,
      cf: Confirm | null = null;
    // Chấm màu trước mỗi dòng danh sách: đi qua styleOf để có màu tối tương ứng.
    function dot(c: string) {
      return String(styleOf("background: " + c).backgroundColor || c);
    }
    if (s.cf === "pub") {
      cf = cnt.pub
        ? {
            title:
              (status === "HIDDEN" ? "Đăng lại" : "Đăng") +
              " bộ đề “" +
              SET.name +
              "”?",
            text: "Bộ đề sẽ hiện trong Thư viện đề của người học. Từng đề hiện theo các kỹ năng đã có:",
            list: [
              {
                n: cnt.pub,
                text:
                  "kỹ năng đã đăng trong " +
                  live +
                  " đề: người học bấm Làm bài được ngay",
                dotColor: dot("#2E7D4F"),
              },
              {
                n: cnt.draft,
                text: "kỹ năng đang soạn: chưa hiện, thấy “—”",
                dotColor: dot("#C9A227"),
              },
              {
                n: cnt.hidden,
                text: "kỹ năng đã ẩn: không hiện",
                dotColor: dot("#B3A9B5"),
              },
            ],
            goText: "Đăng bộ đề",
            goDanger: false,
            icon: "↑",
            tone: "success",
            noGo: false,
          }
        : {
            title: "Chưa đăng được bộ đề",
            text: "Bộ đề chưa có kỹ năng nào ở trạng thái Đã đăng. Soạn xong và đăng ít nhất một kỹ năng của một đề trong editor (đủ đáp án, tiêu chí và tệp audio/ảnh) rồi mới đăng cả bộ.",
            list: [],
            noGo: true,
            goText: "",
            goDanger: false,
            icon: "!",
            tone: "warning",
          };
    }
    if (s.cf === "hide") {
      cf = {
        title: "Ẩn bộ đề “" + SET.name + "”?",
        text: "Người học không thấy bộ đề trong thư viện và không bắt đầu lượt làm mới. Bài đã làm, bài đã lưu và lượt đang làm dở vẫn được giữ nguyên.",
        list: [],
        goText: "Ẩn bộ đề",
        goDanger: false,
        icon: "–",
        tone: "neutral",
        noGo: false,
      };
    }
    if (s.cf === "del") {
      cf = {
        title: "Xóa bộ đề “" + SET.name + "”?",
        text: tests.length
          ? "Bộ đề đang là Bản nháp với " +
            tests.length +
            " đề chưa công khai, chưa có người học nào làm. Toàn bộ đề và nội dung đang soạn bên trong sẽ bị xóa vĩnh viễn."
          : "Bộ đề chưa có đề nào. Thao tác này không hoàn tác được.",
        list: [],
        goText: "Xóa bộ đề",
        goDanger: true,
        icon: "×",
        tone: "danger",
        noGo: false,
      };
    }
    if (s.cf === "delSkill" && s.delSkillTarget) {
      var tgt = s.delSkillTarget;
      cf = {
        title: tgt.isDiscard
          ? "Bỏ bản sửa " + tgt.nm + " của " + tgt.testName + "?"
          : "Xóa " + tgt.nm + " của " + tgt.testName + "?",
        text: tgt.isDiscard
          ? "Bản đang hiển thị với người học giữ nguyên. Các thay đổi đã lưu trong bản sửa sẽ bị xóa vĩnh viễn."
          : "Kỹ năng đang soạn, chưa đăng lần nào. Nội dung đã soạn sẽ bị xóa vĩnh viễn, ô trở về trống để tạo lại.",
        list: [],
        goText: tgt.isDiscard ? "Bỏ bản sửa" : "Xóa kỹ năng",
        goDanger: true,
        icon: "×",
        tone: "danger",
        noGo: false,
      };
    }
    var sst = SST[status],
      used = (["A", "G"] as FormKey[]).filter(function (c) {
        return tests.some(function (t) {
          return val(t, "R", c) || val(t, "W", c);
        });
      });
    return {
      keep: keep,
      alive: !s.gone && !s.loading && !s.loadError,
      loading: !!s.loading,
      loadError: s.loadError || null,
      retry: function (e: Ev) {
        stop(e);
        me.loadData(sid);
      },
      gone: !!s.gone,
      goneTitle: s.apiSet
        ? "Đã xóa bộ đề “" + SET.name + "”"
        : "Không tìm thấy bộ đề.",
      goneSub: s.apiSet
        ? "Bộ đề và các đề đang soạn bên trong đã bị xóa."
        : "Bộ đề không tồn tại hoặc đã bị xóa.",
      setName: SET.name,
      setTypes: used.map(function (c) {
        return {
          text: TY[c][0],
          tone: `form-${c}` as `form-${FormKey}`,
        };
      }),
      setStatus: sst[0],
      setStatusTone: SST_TONE[status],
      setSub:
        tests.length +
        " đề · cập nhật " +
        (SET.updated || "") +
        (status === "PUBLISHED" ? " · " + SET.plays + " lượt làm bài" : ""),
      isPub: status === "PUBLISHED",
      notPub: status !== "PUBLISHED" && tests.length > 0,
      blockPub: status !== "PUBLISHED" && tests.length === 0,
      pubLabel: status === "HIDDEN" ? "Đăng lại bộ đề" : "Đăng bộ đề",
      canDel: canDel,
      back: function (e: Ev) {
        stop(e);
        navigate("AdminExams");
      },
      toLearner: function (e: Ev) {
        stop(e);
        navigate("ExamDetail?id=" + s.id);
      },
      askPub: function (e: Ev) {
        stop(e);
        self.setState({ cf: "pub", menu: null });
      },
      askHide: function (e: Ev) {
        stop(e);
        self.setState({ cf: "hide", menu: null });
      },
      askDel: function (e: Ev) {
        stop(e);
        self.setState({ cf: "del", menu: null });
      },
      cfOpen: !!cf,
      cf: cf || EMPTY_CONFIRM,
      cfClose: function (e: Ev) {
        stop(e);
        self.setState({ cf: null, delSkillTarget: null });
      },
      cfGo: async function (e: Ev) {
        stop(e);
        var w = s.cf;
        if (w === "delSkill" && s.delSkillTarget) {
          var tgt = s.delSkillTarget;
          try {
            await deleteSkill(tgt.skillId);
            await me.loadData();
            toastSet(
              tgt.isDiscard
                ? "Đã bỏ bản sửa " + tgt.nm + " của " + tgt.testName + "."
                : "Đã xóa " + tgt.nm + " của " + tgt.testName + ".",
              { cf: null, delSkillTarget: null },
            );
          } catch (err) {
            toastSet(errorInfo(err).message || "Không thể xóa kỹ năng.", {
              cf: null,
              delSkillTarget: null,
            });
          }
        }
        if (w === "pub") {
          try {
            var res = await publishSet(sid);
            clearTimeout(me._t);
            self.setState({
              apiSet: res,
              cf: null,
              toast: "Đã đăng bộ đề. Người học thấy bộ đề trong Thư viện đề.",
              undoAction: null,
              toastLink: "Xem trang người học",
            });
            me._t = setTimeout(function () {
              self.setState({ toast: "" });
            }, 6000);
          } catch (err) {
            toastSet(errorInfo(err).message || "Không thể đăng bộ đề.", {
              cf: null,
            });
          }
        }
        if (w === "hide") {
          try {
            var res = await hideSet(sid);
            toastSet("Đã ẩn bộ đề. Bài đã làm của người học vẫn được giữ.", {
              apiSet: res,
              cf: null,
            });
          } catch (err) {
            toastSet(errorInfo(err).message || "Không thể ẩn bộ đề.", {
              cf: null,
            });
          }
        }
        if (w === "del") {
          try {
            await deleteSet(sid);
            self.setState({ cf: null, gone: true, toast: "" });
          } catch (err) {
            toastSet(errorInfo(err).message || "Không thể xóa bộ đề.", {
              cf: null,
            });
          }
        }
      },
      artSt:
        "display: flex; align-items: flex-end; width: 144px; height: 96px; border-radius: 12px; box-sizing: border-box; overflow: hidden; transition: background .3s; color: " +
        (AR
          ? "#FFFFFF; background: " + AR[1]
          : "#706473; background: #F3F0EA; border: 1.5px dashed #D6D4D0"),
      artHas: !!AR,
      artShowText: !!(AR && AR[2]),
      artNone: !AR,
      artText: SET.short || "",
      artLabel: AR ? "Ảnh bìa: " + AR[0] : "Bộ đề chưa có ảnh bìa",
      artOpen: !!s.artOpen,
      artMsg: !!s.artMsg,
      artMsgText: s.artMsg || "",
      artMsgBad: !!s.artBad,
      artMenu: function (e: Ev) {
        stop(e);
        self.setState({ artOpen: !s.artOpen, menu: null, artMsg: "" });
      },
      arts: ART.map(function (g, i) {
        return {
          name: g[0],
          pick: async function (e: Ev) {
            stop(e);
            try {
              var res = await patchSet(sid, { coverUrl: "preset:" + i });
              self.setState({ apiSet: res, artOpen: false, artMsg: "" });
            } catch (err) {
              self.setState({
                artMsg: errorInfo(err).message || "Không thể chọn ảnh mẫu.",
                artBad: true,
              });
            }
          },
          st:
            "display: block; width: 42px; height: 60px; border-radius: 8px; box-sizing: border-box; background: " +
            g[1] +
            "; " +
            (!img && i === ai
              ? "outline: 3px solid #2963CC; outline-offset: 2px"
              : "outline: 1.5px solid #D6D4D0"),
        };
      }),
      artFile: function (e: React.ChangeEvent<HTMLInputElement>) {
        var f = e && e.target && e.target.files && e.target.files[0];
        if (!f) return;
        var file: File = f;
        readImage(
          e,
          async function (_f: File | null, url: string | null, msg: string) {
            if (!url) {
              self.setState({ artMsg: msg, artBad: true });
              return;
            }
            try {
              var cov = await uploadCover(sid, file);
              var updatedApiSet = Object.assign({}, s.apiSet, {
                coverUrl: cov.coverUrl,
              });
              self.setState({
                apiSet: updatedApiSet,
                artOpen: !!msg,
                artMsg: msg,
                artBad: false,
              });
            } catch (err) {
              self.setState({
                artMsg:
                  errorInfo(err).message ||
                  "Chưa tải được ảnh. Hãy chọn ảnh mẫu hoặc thử lại sau.",
                artBad: true,
              });
            }
          },
        );
      },
      artRemove: async function (e: Ev) {
        stop(e);
        try {
          var res = await patchSet(sid, { coverUrl: null });
          self.setState({ apiSet: res, artOpen: false, artMsg: "" });
        } catch (err) {
          self.setState({
            artMsg: errorInfo(err).message || "Không thể xóa ảnh bìa.",
            artBad: true,
          });
        }
      },
      tiles: tiles,
      rows: rows,
      noTests: !tests.length,
      anyMenu: !!s.menu || !!s.artOpen,
      closeMenus: function (e: Ev) {
        stop(e);
        self.setState({ menu: null, artOpen: false });
      },
      h0: hst(0),
      h1: hst(1, true),
      h2: hst(2, true),
      h3: hst(3),
      s1: hst(1, true, true),
      s2: hst(2, true, true),
      addTest: async function (e: Ev) {
        stop(e);
        try {
          var res = await createTest(sid);
          var newTest = res.tests[res.tests.length - 1];
          self.setState({
            apiSet: res,
            flash: newTest ? newTest.title : "",
            menu: null,
          });
          toastSet(
            "Đã thêm " +
              (newTest ? newTest.title : "đề mới") +
              ". Bấm “Tạo” ở từng kỹ năng để soạn.",
          );
        } catch (err) {
          toastSet(errorInfo(err).message || "Không thể thêm đề thi.");
        }
      },
      toast: !!s.toast,
      toastText: s.toast || "",
      canUndo: !!s.undoAction,
      undo: async function (e: Ev) {
        stop(e);
        var u = s.undoAction;
        if (!u) return;
        self.setState({ undoAction: null, toast: "" });
        try {
          var res;
          if (u.action === "show") {
            res = await showSkill(sid, u.liveId);
            toastSet("Đã hiện lại " + u.nm + " của " + u.tName + ".");
            self.setState({ apiSet: res });
          } else if (u.action === "hide") {
            res = await hideSkill(sid, u.liveId);
            toastSet("Đã ẩn " + u.nm + " của " + u.tName + ".");
            self.setState({ apiSet: res });
          } else if (u.action === "deleteSkill") {
            await deleteSkill(u.draftId);
            await me.loadData();
            toastSet("Đã hoàn tác tạo kỹ năng.");
          }
        } catch (err) {
          toastSet(errorInfo(err).message || "Không thể hoàn tác.");
        }
      },
      toastLink: !!s.toastLink,
      toastHref: "#ExamDetail?id=" + sid,
      toLearnerHref: "#ExamDetail?id=" + sid,
      toastLinkText: s.toastLink || "",
      clickToastLink: function (e: Ev) {
        stop(e);
        navigate("ExamDetail?id=" + s.id);
      },
    };
  }
  render() {
    const v = this.renderVals();
    return (
      <>
        {"\n"}
        {"\n"}
        <style>
          {cssText(
            "\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\n@keyframes isFade{from{opacity:0}to{opacity:1}}@keyframes isPop{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}@keyframes isDrop{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}@keyframes isToast{from{opacity:0;transform:translate(-50%,14px)}to{opacity:1;transform:translate(-50%,0)}}@keyframes isFlash{0%{background:#E3ECFD}100%{background:transparent}}@keyframes isSpin{to{transform:rotate(360deg)}}@keyframes isGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes isCheck{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}@keyframes isRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.an-fade{animation:isFade .2s ease-out both}.an-pop{animation:isPop .28s cubic-bezier(.2,.8,.2,1) both}.an-drop{animation:isDrop .18s cubic-bezier(.2,.8,.2,1) both;transform-origin:top left}.an-toast{animation:isToast .3s cubic-bezier(.2,.8,.2,1) both}.an-check{animation:isCheck .45s cubic-bezier(.2,.8,.2,1) both}.an-rise{animation:isRise .32s cubic-bezier(.2,.8,.2,1) both}.an-flash>td{animation:isFlash 2s ease-out}.an-spin{animation:isSpin .8s linear infinite}a,label,input,textarea,select,[role=button]{transition:background-color .16s ease,border-color .16s ease,color .16s ease,box-shadow .2s ease,transform .18s ease,opacity .16s ease,outline-color .16s ease}.lift:hover{transform:translateY(-2px);box-shadow:0 2px 4px rgba(53,38,55,.05),0 12px 28px rgba(53,38,55,.10)}.press:active{transform:scale(.97)}.hov>tbody>tr{transition:background-color .15s ease}.hov>tbody>tr:hover{background:#FDFCF8}.thumb-h{transition:transform .2s ease,box-shadow .2s ease}.thumb-h:hover{transform:translateY(-3px) rotate(-1deg)}input:focus,textarea:focus,select:focus{outline:none;border-color:#2963CC !important;box-shadow:0 0 0 3px rgba(41,99,204,.16)}@media (prefers-reduced-motion: reduce){*{animation:none !important;transition:none !important}}\n",
          )}
        </style>
        {"\n"}
        {"\n"}
        <StaffLayout
          active="exams"
          crumbs={[
            { label: "Quản lý", page: "AdminHome" },
            { label: "Bộ đề và đề thi", page: "AdminExams" },
            { label: this.state.apiSet?.name || "Thông tin bộ đề" },
          ]}
          contentClassName="p-4 sm:p-6 md:p-8 flex flex-col gap-6"
        >
          <a href="#" onClick={v.back} className="ex-back">
            <Icon name="back" />
            Bộ đề và đề thi
          </a>
          {v.loading ? (
            <div className="an-fade ex-state ex-state--card">
              Đang tải thông tin bộ đề…
            </div>
          ) : v.loadError ? (
            <div className="an-fade ex-state ex-state--card ex-state--error">
              <div>{v.loadError}</div>
              <a href="#" onClick={v.retry} className="ex-link ex-link--flex">
                Thử lại
              </a>
            </div>
          ) : v.alive ? (
            <div className="ex-stack">
              <PageHeader
                title={v.setName}
                lead={
                  <div className="ex-cover">
                    <div className="thumb-h ex-cover__frame">
                      <div
                        role="img"
                        aria-label={v.artLabel}
                        style={styleOf(v.artSt)}
                      >
                        {v.artShowText ? (
                          <span className="ex-art__text">{v.artText}</span>
                        ) : null}
                        {v.artNone ? (
                          <span className="ex-art__none">
                            <Icon name="image" size={26} strokeWidth={1.8} />
                            Chưa có ảnh
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={v.artMenu}
                      title="Đổi ảnh bìa"
                      aria-label="Đổi ảnh bìa"
                      aria-expanded={v.artOpen}
                      className="press ex-cam"
                    >
                      <Icon name="camera" size={17} />
                    </button>
                    {v.artOpen ? (
                      <div
                        role="dialog"
                        aria-label="Ảnh bìa bộ đề"
                        className="an-drop ex-pop"
                      >
                        <div className="ex-pop__title">Ảnh bìa bộ đề</div>
                        <div className="ex-presets ex-presets--8">
                          {(v.arts || []).map((g, index) => (
                            <a
                              key={index}
                              href="#"
                              onClick={g.pick}
                              title={g.name}
                              aria-label={g.name}
                              style={styleOf(g.st)}
                            ></a>
                          ))}
                        </div>
                        <div className="ex-note ex-note--plain">
                          Ảnh bìa ngang tỉ lệ 3:2, tối thiểu 1200 × 800 px, JPG,
                          PNG hoặc WebP.
                        </div>
                        {v.artMsg ? (
                          <div
                            className={
                              "ex-note ex-note--plain " +
                              (v.artMsgBad ? "ex-note--bad" : "ex-note--warn")
                            }
                          >
                            {v.artMsgText}
                          </div>
                        ) : null}
                        <label className="ex-menuitem">
                          <Icon name="upload" size={15} />
                          Tải ảnh lên
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={v.artFile}
                            className="ex-file-hidden"
                          />
                        </label>
                        {v.artHas ? (
                          <button
                            type="button"
                            onClick={v.artRemove}
                            className="ex-menuitem ex-menuitem--danger"
                          >
                            <Icon name="trash" />
                            Xóa ảnh
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                }
                meta={
                  <>
                    <div className="ex-chips ex-chips--8">
                      {(v.setTypes || []).map((y, index) => (
                        <Chip key={index} tone={y.tone}>
                          {y.text}
                        </Chip>
                      ))}
                      <Chip tone={v.setStatusTone} className="ex-chip-fade">
                        {v.setStatus}
                      </Chip>
                    </div>
                    <div className="ex-sub">{v.setSub}</div>
                  </>
                }
                actions={
                  <>
                    {v.isPub ? (
                      <Button
                        as="a"
                        href={v.toLearnerHref}
                        icon
                        className="press"
                        onClick={v.toLearner}
                        title="Xem như người học"
                        aria-label="Xem như người học"
                      >
                        <Icon name="eye" size={18} />
                      </Button>
                    ) : (
                      <Button
                        as="a"
                        role="button"
                        icon
                        aria-disabled="true"
                        title="Bộ đề chưa công khai nên người học chưa xem được."
                        aria-label="Xem như người học"
                      >
                        <Icon name="eye" size={18} />
                      </Button>
                    )}
                    {v.canDel ? (
                      <Button
                        variant="danger"
                        className="press"
                        onClick={v.askDel}
                      >
                        <Icon name="trash" />
                        Xóa bộ đề
                      </Button>
                    ) : null}
                    <Button className="press" onClick={v.addTest}>
                      <Icon name="plus" />
                      Thêm đề
                    </Button>
                    {v.isPub ? (
                      <Button className="press" onClick={v.askHide}>
                        <Icon name="eye-off" />
                        Ẩn bộ đề
                      </Button>
                    ) : null}
                    {v.notPub ? (
                      <Button
                        variant="primary"
                        className="press"
                        onClick={v.askPub}
                      >
                        <Icon name="send" />
                        {v.pubLabel}
                      </Button>
                    ) : null}
                    {v.blockPub ? (
                      <Button
                        as="a"
                        role="button"
                        aria-disabled="true"
                        title="Bộ đề chưa có đề nào. Thêm ít nhất một đề rồi mới đăng được."
                      >
                        <Icon name="send" />
                        {v.pubLabel}
                      </Button>
                    ) : null}
                  </>
                }
              />
              <StatGrid>
                {(v.tiles || []).map((t, index) => (
                  <StatCard
                    key={index}
                    label={t.label}
                    icon={t.icon}
                    tone={t.tone}
                    value={t.n}
                    unit="đề"
                    sub={t.sub}
                    selected={t.on}
                    onSelect={() => t.pick(null)}
                    action={
                      t.canImp ? (
                        <Button
                          as="a"
                          size="xs"
                          href={t.impHref}
                          onClick={t.imp}
                          title="Đang nâng cấp định dạng xlsx cho kỹ năng này"
                          aria-disabled="true"
                          className="press ex-imp"
                        >
                          <Icon name="upload" size={13} />
                          Nhập xlsx
                        </Button>
                      ) : null
                    }
                  >
                    {(t.kinds || []).map((q, i) =>
                      q.tone ? (
                        <Chip key={i} size="sm" tone={q.tone}>
                          {q.text}
                        </Chip>
                      ) : (
                        <span key={i}>{q.text}</span>
                      ),
                    )}
                  </StatCard>
                ))}
              </StatGrid>
              <DataCard
                overflowVisible
                title="Các đề trong bộ"
                aside={
                  <span className="ex-chips ex-chips--6">
                    <Chip tone="published">Đã đăng</Chip>
                    <Chip tone="draft">Đang soạn</Chip>
                    <Chip tone="hidden">Đã ẩn</Chip>
                    <Chip tone="neutral" dashed>
                      <Icon name="plus" size={12} />
                      Chưa có
                    </Chip>
                  </span>
                }
              >
                <DataTable label="Bảng đề thi theo kỹ năng" minWidth={1000}>
                  <thead>
                    <tr>
                      <th
                        rowSpan={2}
                        className="ui-th ui-th--w20 ui-th--bottom"
                      >
                        Đề
                      </th>
                      <th rowSpan={2} style={styleOf(v.h0)}>
                        Listening
                      </th>
                      <th colSpan={2} style={styleOf(v.h1)}>
                        Reading
                      </th>
                      <th colSpan={2} style={styleOf(v.h2)}>
                        Writing
                      </th>
                      <th rowSpan={2} style={styleOf(v.h3)}>
                        Speaking
                      </th>
                      <th rowSpan={2} className="ui-th ui-th--bottom">
                        Cập nhật
                      </th>
                      <th rowSpan={2} className="ui-th"></th>
                    </tr>
                    <tr>
                      <th style={styleOf(v.s1)}>
                        <Chip size="sm" tone="form-A">
                          Academic
                        </Chip>
                      </th>
                      <th style={styleOf(v.s1)}>
                        <Chip size="sm" tone="form-G">
                          General Training
                        </Chip>
                      </th>
                      <th style={styleOf(v.s2)}>
                        <Chip size="sm" tone="form-A">
                          Academic
                        </Chip>
                      </th>
                      <th style={styleOf(v.s2)}>
                        <Chip size="sm" tone="form-G">
                          General Training
                        </Chip>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(v.rows || []).map((r, index) => (
                      <tr key={index} className={r.cls}>
                        <td className="ui-td">
                          <div className="ex-strong">{r.name}</div>
                          <div className="ex-muted13">{r.sub}</div>
                        </td>
                        {(r.cells || []).map((x, xi) => (
                          <td key={xi} style={styleOf(x.tdSt)}>
                            <div className="ex-cellwrap">
                              {x.has ? (
                                <a
                                  href="#"
                                  onClick={x.toggle}
                                  title={x.title}
                                  aria-haspopup="menu"
                                  aria-expanded={x.open}
                                  className="press"
                                  style={styleOf(x.st)}
                                >
                                  {x.label + " "}
                                  <Icon
                                    name="caret"
                                    size={13}
                                    strokeWidth={2.2}
                                  />
                                </a>
                              ) : null}
                              {x.none ? (
                                <a
                                  href="#"
                                  onClick={x.create}
                                  title={x.title}
                                  className="press ex-create-btn"
                                >
                                  <Icon name="plus" size={13} />
                                  Tạo
                                </a>
                              ) : null}
                              {x.open ? (
                                <div
                                  role="menu"
                                  className="an-drop ex-cellmenu"
                                  style={x.menuStyle}
                                >
                                  <div className="ex-cellmenu__head">
                                    {x.menuHead}
                                  </div>
                                  {(x.items || []).map((it, ii) =>
                                    it.disabled ? (
                                      <div
                                        key={ii}
                                        role="menuitem"
                                        aria-disabled="true"
                                        className={"press " + it.cls}
                                      >
                                        {it.label}
                                      </div>
                                    ) : (
                                      <a
                                        key={ii}
                                        href={it.href}
                                        role="menuitem"
                                        onClick={it.act}
                                        className={"press " + it.cls}
                                      >
                                        {it.label}
                                      </a>
                                    ),
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </td>
                        ))}
                        <td className="ui-td ui-td--muted">{r.updated}</td>
                        <td className="ui-td ui-td--right">
                          <button
                            type="button"
                            onClick={r.del}
                            aria-label={"Xóa " + r.name}
                            title="Xóa đề"
                            className="press ex-trash"
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
                {v.noTests ? (
                  <div className="an-fade ex-empty">
                    <div className="ex-empty__title">Bộ đề chưa có đề nào</div>
                    <div className="ex-empty__text">
                      Thêm đề rồi bấm “Tạo” ở từng kỹ năng để soạn trong editor,
                      hoặc dùng nút Nhập xlsx ở ô Listening, Reading phía trên
                      để nhập cả đề từ file.
                    </div>
                    <Button
                      variant="primary"
                      className="press ex-mt4"
                      onClick={v.addTest}
                    >
                      <Icon name="plus" />
                      Thêm đề đầu tiên
                    </Button>
                  </div>
                ) : null}
              </DataCard>
            </div>
          ) : null}
          {v.gone ? (
            <div className="an-pop ex-state--card ex-gone">
              <span className="an-check ex-gone__icon">
                <Icon name="trash" size={22} />
              </span>
              <div className="ex-gone__title">{v.goneTitle}</div>
              <div className="ex-gone__sub">{v.goneSub}</div>
              <Button
                as="a"
                href="AdminExams.dc.html"
                variant="primary"
                className="press ex-mt6"
              >
                <Icon name="back" />
                Về danh sách bộ đề
              </Button>
            </div>
          ) : null}
          {v.anyMenu ? (
            <div onClick={v.closeMenus} className="ex-backdrop"></div>
          ) : null}
          <ConfirmDialog
            open={v.cfOpen}
            onClose={() => v.cfClose(null)}
            onConfirm={() => v.cfGo(null)}
            label="Xác nhận"
            width={460}
            tone={v.cf.tone}
            icon={v.cf.icon}
            title={v.cf.title}
            items={v.cf.list.map((li) => ({
              count: li.n,
              text: li.text,
              dotColor: li.dotColor,
            }))}
            info={v.cf.noGo}
            cancelVariant="danger"
            confirmVariant={v.cf.goDanger ? "danger-solid" : "primary"}
            confirmClassName={v.cf.goDanger ? "ui-btn--on-solid" : undefined}
            confirmLabel={v.cf.goText}
          >
            {v.cf.text}
          </ConfirmDialog>
          <Toast
            open={v.toast}
            action={
              v.canUndo
                ? { label: "Hoàn tác", onClick: () => v.undo(null) }
                : null
            }
            link={
              v.toastLink
                ? {
                    label: v.toastLinkText,
                    href: v.toastHref,
                    onClick: () => v.clickToastLink(null),
                  }
                : null
            }
          >
            {v.toastText}
          </Toast>
        </StaffLayout>
        {"\n"}
        <SkillHistoryDrawer
          isOpen={!!this.state.historyOpen}
          onClose={() => {
            this.setState({ historyOpen: false });
          }}
          skillId={this.state.historySkillId}
          onSelectVersion={(versionId) => {
            this.setState({ historyOpen: false });
            var page = this.state.historyEditorPage || "AdminWritingEditor";
            navigate(page + "?skillId=" + versionId);
          }}
        />
      </>
    );
  }
}

export default AdminExamSet;
