import React from "react";
import { TOAST_MS } from "../../../lib/shared/toast";
import { styleOf, cssText } from "../../../lib/shared/styles";
import { readImage } from "../../../lib/shared/image-file";
import {
  ART,
  SK,
  SST,
  SST_TONE,
  TY,
  artBg,
  type FormKey,
  type SkillKey,
} from "../../../lib/exams/exam-ui";
import {
  Button,
  Chip,
  ConfirmDialog,
  CoverPicker,
  CoverThumb,
  DataCard,
  DataTable,
  Dialog,
  DialogBody,
  DialogFoot,
  DialogHead,
  Icon,
  PageHeader,
  SearchField,
  SegmentedTabs,
  TextField,
  Toast,
  type CoverPreset,
} from "../../../components/shared/ui";
import "./admin-exams.css";
import StaffLayout from "../../../components/layout/StaffLayout";
import { navigate } from "../../../lib/auth/auth";
import {
  listCategories,
  listSets,
  createSet,
  uploadCover,
  deleteSet,
  toUiSet,
  errorInfo,
  type Category,
  type ExamSetAdmin,
  type UiSet,
  type UiTest,
  type Cell,
} from "../../../lib/exams/exam-admin";

type Ev = React.SyntheticEvent | null | undefined;

// Trạng thái form "Tạo bộ đề mới" (cũng giữ kết quả sau khi tạo ở trường done).
type CreateForm = {
  name?: string;
  desc?: string;
  cat?: string;
  newCat?: string;
  art?: number | null;
  img?: string | null;
  fileObj?: File | null;
  msg?: string;
  msgBad?: boolean;
  tried?: boolean;
  serverErr?: string;
  submitting?: boolean;
  catOpen?: boolean;
  catQ?: string;
  done?: UiSet;
};

type State = {
  loading: boolean;
  loadError: string | null;
  cats: Category[];
  apiSets: ExamSetAdmin[];
  q: string;
  fT: string;
  fS: string;
  create: CreateForm | null;
  del: UiSet | null;
  toast: string;
  flash?: string;
};

class AdminExams extends React.Component<Record<string, unknown>, State> {
  state: State = {
    loading: true,
    loadError: null,
    cats: [],
    apiSets: [],
    q: "",
    fT: "all",
    fS: "all",
    create: null,
    del: null,
    toast: "",
  };
  _key?: (e: KeyboardEvent) => void;
  _t?: ReturnType<typeof setTimeout>;

  loadData = async () => {
    this.setState({ loading: true, loadError: null });
    try {
      const [cats, sets] = await Promise.all([listCategories(), listSets()]);
      this.setState({ cats: cats || [], apiSets: sets || [], loading: false });
    } catch (err) {
      this.setState({
        loading: false,
        loadError: errorInfo(err).message || "Không thể tải danh sách bộ đề.",
      });
    }
  };

  componentDidMount() {
    var me = this;
    this._key = function (e: KeyboardEvent) {
      if (e.key === "Escape") {
        me.setState({ create: null, del: null });
      }
    };
    document.addEventListener("keydown", this._key);
    this.loadData();
  }
  componentWillUnmount() {
    if (this._key) document.removeEventListener("keydown", this._key);
    clearTimeout(this._t);
  }
  renderVals() {
    var me = this,
      s = this.state,
      self = this;
    var sCats = s.cats || [];
    var CATS: Array<[string, string]> = sCats.length
        ? sCats.map(function (c): [string, string] {
            return [c.id, c.name];
          })
        : [
            ["MOCK", "Mock Test"],
            ["ACTUAL", "Actual Test"],
            ["PRACTICE", "Practice Test"],
            ["FORECAST", "Forecast"],
            ["OTHER", "Khác"],
          ],
      CATN: Record<string, string> = {};
    CATS.forEach(function (x) {
      CATN[x[0]] = x[1];
    });
    var SETS: UiSet[] = (s.apiSets || []).map(toUiSet);

    function stop(e?: Ev) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
    }
    function vals(t: UiTest, k: SkillKey): Cell[] {
      var x = t[k];
      return (x && typeof x === "object" ? [x.A, x.G] : [x]).filter(
        function (y) {
          return y;
        },
      );
    }
    function has(st: UiSet, c: FormKey) {
      return st.tests.some(function (t) {
        return (t.R && t.R[c]) || (t.W && t.W[c]);
      });
    }
    function toastSet(m: string, extra?: Partial<State>) {
      clearTimeout(me._t);
      var st: Partial<State> = { toast: m };
      Object.assign(st, extra);
      self.setState(st as Pick<State, keyof State>);
      me._t = setTimeout(function () {
        me.setState({ toast: "" });
      }, TOAST_MS);
    }
    var sets = SETS,
      q = (s.q || "").trim().toLowerCase(),
      fT = s.fT || "all",
      fS = s.fS || "all";
    var shown = sets.filter(function (st) {
      return (
        (!q || st.name.toLowerCase().indexOf(q) >= 0) &&
        (fT === "all" || ((fT === "A" || fT === "G") && has(st, fT))) &&
        (fS === "all" || st.status === fS)
      );
    });
    function segItems(list: Array<[string, string]>) {
      return list.map(function (x) {
        return { value: x[0], label: x[1] };
      });
    }
    var rows = shown.map(function (st) {
      var sst = SST[st.status],
        bg = artBg(st),
        canDel =
          st.canDelete !== undefined
            ? st.canDelete
            : st.status === "DRAFT" || !st.tests.length;
      var types = (["A", "G"] as FormKey[])
        .filter(function (c) {
          return has(st, c);
        })
        .map(function (c) {
          return { text: TY[c][0], tone: `form-${c}` as const };
        });
      var skills = SK.map(function (k) {
        var n = 0;
        st.tests.forEach(function (t) {
          n += vals(t, k[0]).length;
        });
        return n
          ? { text: k[1] + " " + n, tone: `skill-${k[0]}` as const }
          : null;
      }).filter(function (x): x is { text: string; tone: `skill-${SkillKey}` } {
        return !!x;
      });
      return {
        name: st.name,
        cat: st.catName || CATN[st.cat] || "Khác",
        n: st.tests.length + " đề",
        updated: st.updated,
        st: sst[0],
        stTone: SST_TONE[st.status],
        cls: s.flash === st.name ? "an-flash" : "",
        types: types.length
          ? types
          : [
              {
                text: st.tests.length ? "Chỉ L/S" : "Chưa có đề",
                tone: "neutral" as const,
              },
            ],
        skills: skills,
        bg: bg,
        thumbText: !st.img && st.art != null && ART[st.art][2] ? st.short : "",
        open: function (e: Ev) {
          stop(e);
          navigate("AdminExamSet?id=" + st.id);
        },
        canDel: canDel,
        noDel: !canDel,
        noDelWhy:
          "Bộ đề " +
          sst[0].toLowerCase() +
          " và đã có đề: chỉ ẩn được, không xóa.",
        del: function (e: Ev) {
          stop(e);
          self.setState({ del: st });
        },
      };
    });
    // ---- form tạo bộ đề
    var c = s.create,
      cv: CreateForm = c || {},
      cName = cv.name || "",
      cBg = artBg(cv);
    function setC(o: CreateForm) {
      self.setState({ create: Object.assign({}, cv, o) });
    }
    var presets: CoverPreset[] = ART.map(function (g, j) {
      return {
        name: g[0],
        background: g[1],
        selected: !cv.img && cv.art === j,
        onPick: function () {
          setC({ art: j, img: null, fileObj: null, msg: "" });
        },
      };
    });
    var picker = {
      bg: cBg,
      text: !!(!cv.img && cv.art != null && ART[cv.art][2]),
      short: (cName.match(/(Vol|Test|Pack)\s*\S+$/i) || [
        cName.split(" ").slice(-1)[0] || "",
      ])[0],
      none: !cBg,
      label: cBg ? "Ảnh bìa đã chọn" : "Chưa có ảnh bìa",
      presets: presets,
      msg: !!cv.msg,
      msgText: cv.msg || "",
      msgBad: !!cv.msgBad,
      file: function (e: React.ChangeEvent<HTMLInputElement>) {
        readImage(e, function (fileObj, url, msg) {
          if (!url) {
            setC({ msg: msg, msgBad: true });
            return;
          }
          setC({
            img: url,
            art: null,
            fileObj: fileObj,
            msg: msg,
            msgBad: false,
          });
        });
      },
    };
    var dup = sets.some(function (st) {
      return st.name.trim().toLowerCase() === cName.trim().toLowerCase();
    });
    var isNewCat = cv.cat === "__new";
    var newCatLbl = (cv.newCat || "").trim();
    // Lỗi gắn với đúng ô: viền đỏ + câu báo dưới ô (TextField).
    var cErr = cv.tried
      ? !cName.trim()
        ? "Nhập tên bộ đề."
        : dup
          ? "Đã có bộ đề cùng tên."
          : cv.serverErr || ""
      : cv.serverErr || "";
    var catErr =
      cv.tried && isNewCat && !newCatLbl ? "Nhập tên danh mục mới." : "";
    var done = c && c.done ? c.done : null;
    // ---- xóa
    var d = s.del || null;
    return {
      rows: rows,
      noRows: !rows.length,
      loading: !!s.loading,
      loadError: s.loadError || null,
      retry: function (e: Ev) {
        stop(e);
        me.loadData();
      },
      countText: s.loading
        ? "Đang tải…"
        : shown.length === sets.length
          ? sets.length + " bộ đề"
          : shown.length + "/" + sets.length + " bộ đề",
      q: s.q || "",
      setQ: function (value: string) {
        self.setState({ q: value });
      },
      fT: fT,
      fS: fS,
      setFT: function (value: string) {
        self.setState({ fT: value });
      },
      setFS: function (value: string) {
        self.setState({ fS: value });
      },
      fTypes: segItems([
        ["all", "Tất cả"],
        ["A", "Có Academic"],
        ["G", "Có General Training"],
      ]),
      fSts: segItems([
        ["all", "Mọi trạng thái"],
        ["PUBLISHED", "Công khai"],
        ["DRAFT", "Bản nháp"],
        ["HIDDEN", "Đã ẩn"],
      ]),
      clearFilters: function (e: Ev) {
        stop(e);
        self.setState({ q: "", fT: "all", fS: "all" });
      },
      openCreate: function (e: Ev) {
        stop(e);
        self.setState({
          create: {
            name: "",
            desc: "",
            cat: sCats[0] ? sCats[0].id : "MOCK",
            art: null,
            img: null,
            fileObj: null,
          },
        });
      },
      catOpen: !!cv.catOpen,
      catInput: cv.catOpen
        ? cv.catQ || ""
        : cv.cat === "__new"
          ? cv.newCat || ""
          : CATN[cv.cat || (sCats[0] && sCats[0].id) || "MOCK"] || "",
      catFocus: function () {
        if (!cv.catOpen) {
          setC({ catOpen: true, catQ: "" });
        }
      },
      catType: function (e: React.ChangeEvent<HTMLInputElement>) {
        setC({ catOpen: true, catQ: e.target.value });
      },
      catClose: function (e: Ev) {
        stop(e);
        setC({ catOpen: false, catQ: "" });
      },
      catOpts: (function () {
        var q = (cv.catQ || "").trim(),
          ql = q.toLowerCase(),
          cur = cv.cat || (sCats[0] && sCats[0].id) || "MOCK";
        var base = "ex-opt";
        var list = CATS.filter(function (x) {
          return !ql || x[1].toLowerCase().indexOf(ql) >= 0;
        }).map(function (x) {
          var on = cur === x[0];
          return {
            label: x[1],
            on: on,
            st: base + (on ? " ex-opt--on" : ""),
            pick: function (e: Ev) {
              stop(e);
              setC({ cat: x[0], newCat: "", catOpen: false, catQ: "" });
            },
          };
        });
        if (
          q &&
          !CATS.some(function (x) {
            return x[1].toLowerCase() === ql;
          })
        ) {
          list.push({
            label: "Tạo danh mục “" + q + "”",
            on: cur === "__new" && (cv.newCat || "") === q,
            st: base + " ex-opt--new",
            pick: function (e: Ev) {
              stop(e);
              setC({ cat: "__new", newCat: q, catOpen: false, catQ: "" });
            },
          });
        }
        return list.length
          ? list
          : [
              {
                label: "Không có danh mục khớp",
                on: false,
                st: base + " ex-opt--none",
                pick: stop,
              },
            ];
      })(),
      closeCreate: function (e: Ev) {
        stop(e);
        self.setState({ create: null });
      },
      createOpen: !!c,
      cForm: !!c && !done,
      cDone: !!done,
      cv: picker,
      cName: cName,
      cDesc: cv.desc || "",
      cErr: cErr,
      catErr: catErr,
      setCName: function (e: React.ChangeEvent<HTMLInputElement>) {
        setC({ name: e.target.value });
      },
      setCDesc: function (e: React.ChangeEvent<HTMLTextAreaElement>) {
        setC({ desc: e.target.value });
      },
      submitCreate: async function (e: Ev) {
        stop(e);
        var isNew = cv.cat === "__new";
        var newLbl = (cv.newCat || "").trim();
        if (!cName.trim() || dup || (isNew && !newLbl)) {
          setC({ tried: true });
          return;
        }
        if (cv.submitting) return;
        setC({ submitting: true, serverErr: "" });
        try {
          var defaultCatId = sCats.length ? sCats[0].id : undefined;
          var payload: Parameters<typeof createSet>[0] = {
            name: cName.trim(),
            description: (cv.desc || "").trim() || null,
            coverUrl: cv.art != null ? "preset:" + cv.art : null,
          };
          if (isNew) {
            payload.newCategoryName = newLbl;
          } else {
            payload.categoryId = cv.cat || defaultCatId;
          }
          var created = await createSet(payload);
          if (cv.fileObj) {
            try {
              var coverRes = await uploadCover(created.id, cv.fileObj);
              created.coverUrl = coverRes.coverUrl;
            } catch (covErr) {
              console.warn("Cover upload failed", covErr);
            }
          }
          var uiCreated = toUiSet(created);
          var updatedApiSets = [created].concat(s.apiSets || []);
          var updatedCats = s.cats;
          if (isNew) {
            try {
              updatedCats = await listCategories();
            } catch (err) {}
          }
          self.setState({
            apiSets: updatedApiSets,
            cats: updatedCats,
            create: { done: uiCreated },
            flash: uiCreated.name,
            q: "",
            fT: "all",
            fS: "all",
          });
        } catch (err) {
          setC({
            submitting: false,
            serverErr:
              errorInfo(err).code === "EXAM_SET_NAME_EXISTS"
                ? "Đã có bộ đề cùng tên."
                : errorInfo(err).message || "Không thể tạo bộ đề.",
            tried: true,
          });
        }
      },
      doneName: done ? done.name : "",
      doneArtSt:
        "width: 98px; height: 140px; border-radius: 10px; box-shadow: 0 2px 6px rgba(53,38,55,.14), 0 14px 30px rgba(53,38,55,.14); background: " +
        ((done && artBg(done)) ||
          "repeating-linear-gradient(135deg, #F3F0EA 0 10px, #FAF9F5 10px 20px)"),
      openNew: function (e: Ev) {
        stop(e);
        if (done && done.id) {
          navigate("AdminExamSet?id=" + done.id);
        }
      },
      delOpen: !!d,
      delName: d ? d.name : "",
      delText: d
        ? d.tests && d.tests.length
          ? "Bộ đề đang là Bản nháp với " +
            d.tests.length +
            " đề chưa công khai, chưa có người học nào làm. Toàn bộ đề và nội dung đang soạn bên trong sẽ bị xóa vĩnh viễn."
          : "Bộ đề chưa có đề nào. Thao tác này không hoàn tác được."
        : "",
      delCancel: function (e: Ev) {
        stop(e);
        self.setState({ del: null });
      },
      delOk: async function (e: Ev) {
        stop(e);
        if (!d) return;
        var delId = d.id,
          delName = d.name;
        try {
          await deleteSet(delId);
          var newApiSets = (s.apiSets || []).filter(function (x) {
            return x.id !== delId;
          });
          toastSet("Đã xóa bộ đề “" + delName + "”.", {
            apiSets: newApiSets,
            del: null,
          });
        } catch (err) {
          toastSet(errorInfo(err).message || "Không thể xóa bộ đề.", {
            del: null,
          });
        }
      },
      toast: !!s.toast,
      toastText: s.toast || "",
    };
  }

  static defaultProps = {};
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
          crumb="Quản lý / Bộ đề và đề thi"
          contentClassName="p-4 sm:p-6 md:p-8 flex flex-col gap-6"
        >
          <PageHeader
            title="Bộ đề và đề thi"
            description="Bấm một bộ đề để xem các đề bên trong theo từng kỹ năng. Reading và Writing có đề Academic và General Training riêng."
            actions={
              <Button
                variant="primary"
                className="press"
                onClick={v.openCreate}
              >
                <Icon name="plus" />
                Tạo bộ đề
              </Button>
            }
          />
          <div className="ex-toolbar">
            <SearchField
              value={v.q}
              onChange={v.setQ}
              placeholder="Tìm bộ đề"
              delayMs={0}
            />
            <SegmentedTabs
              label="Lọc theo hình thức"
              options={v.fTypes}
              value={v.fT}
              onChange={v.setFT}
            />
            <SegmentedTabs
              label="Lọc theo trạng thái"
              options={v.fSts}
              value={v.fS}
              onChange={v.setFS}
            />
            <span className="ex-count">{v.countText}</span>
          </div>
          <DataCard>
            <DataTable label="Bảng danh sách bộ đề">
              <thead>
                <tr>
                  <th className="ui-th">Tên bộ đề</th>
                  <th className="ui-th">Loại</th>
                  <th className="ui-th">Số đề</th>
                  <th className="ui-th">Đề theo kỹ năng</th>
                  <th className="ui-th">Cập nhật</th>
                  <th className="ui-th">Trạng thái</th>
                  <th className="ui-th"></th>
                </tr>
              </thead>
              <tbody>
                {(v.rows || []).map((r, index) => (
                  <tr key={index} className={r.cls}>
                    <td className="ui-td">
                      <a href="#" onClick={r.open} className="ex-namelink">
                        <CoverThumb
                          background={r.bg}
                          text={r.thumbText}
                          raised
                        />
                        <span className="ex-name">
                          <span>{r.name}</span>
                          <span className="ex-name__cat">{r.cat}</span>
                        </span>
                      </a>
                    </td>
                    <td className="ui-td">
                      <span className="ex-chips">
                        {(r.types || []).map((y, i) => (
                          <Chip key={i} tone={y.tone}>
                            {y.text}
                          </Chip>
                        ))}
                      </span>
                    </td>
                    <td className="ui-td ui-td--nowrap">{r.n}</td>
                    <td className="ui-td">
                      <span className="ex-chips">
                        {(r.skills || []).length ? (
                          r.skills.map((k, i) => (
                            <Chip key={i} tone={k.tone}>
                              {k.text}
                            </Chip>
                          ))
                        ) : (
                          <span className="ex-muted">—</span>
                        )}
                      </span>
                    </td>
                    <td className="ui-td">{r.updated}</td>
                    <td className="ui-td">
                      <Chip tone={r.stTone}>{r.st}</Chip>
                    </td>
                    <td className="ui-td ui-td--right ui-td--nowrap">
                      <span className="ui-rowactions">
                        <Button className="press ui-btn--h34" onClick={r.open}>
                          Mở
                          <Icon name="chevron-right" size={15} />
                        </Button>
                        {r.canDel ? (
                          <Button
                            icon
                            size="sm"
                            variant="danger"
                            className="press"
                            onClick={r.del}
                            aria-label={"Xóa bộ đề " + r.name}
                            title="Xóa bộ đề"
                          >
                            <Icon name="trash" size={15} />
                          </Button>
                        ) : null}
                        {r.noDel ? (
                          <Button
                            as="a"
                            icon
                            size="sm"
                            role="img"
                            aria-disabled="true"
                            aria-label="Không xóa được"
                            title={r.noDelWhy}
                          >
                            <Icon name="trash" size={15} />
                          </Button>
                        ) : null}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            {v.loading ? (
              <div className="an-fade ex-state">Đang tải danh sách bộ đề…</div>
            ) : v.loadError ? (
              <div className="an-fade ex-state ex-state--error">
                <span>{v.loadError} </span>
                <a href="#" onClick={v.retry} className="ex-link">
                  Thử lại
                </a>
              </div>
            ) : v.noRows ? (
              <div className="an-fade ex-state">
                {"Không có bộ đề khớp bộ lọc. "}
                <a href="#" onClick={v.clearFilters} className="ex-strong">
                  Bỏ lọc
                </a>
              </div>
            ) : null}
          </DataCard>
          <Dialog
            open={v.createOpen}
            onClose={() => v.closeCreate(null)}
            label="Tạo bộ đề"
            width={660}
          >
            {v.cForm ? (
              <DialogBody>
                <DialogHead
                  title="Tạo bộ đề mới"
                  description="Bộ đề mới ở trạng thái Bản nháp. Thêm đề và nhập nội dung ở bước sau."
                  onClose={() => v.closeCreate(null)}
                />
                <div className="ui-split">
                  <CoverPicker
                    background={v.cv.bg}
                    label={v.cv.label}
                    overlay={
                      v.cv.text ? (
                        <span className="ex-art__text ex-art__text--lg">
                          {v.cv.short}
                        </span>
                      ) : null
                    }
                    onFile={v.cv.file}
                    presets={v.cv.presets}
                    message={v.cv.msg ? v.cv.msgText : null}
                    messageTone={v.cv.msgBad ? "bad" : "warn"}
                    note="JPG, PNG hoặc WebP, tối đa 5 MB. Nên dùng ảnh 1200 × 800 px (3:2)."
                  />
                  <div className="ui-split__main">
                    <TextField
                      label="Tên bộ đề"
                      required
                      showCount
                      className="ui-control--lg"
                      value={v.cName}
                      onChange={v.setCName}
                      placeholder="Ví dụ: IELTS CAM Inspired Vol 20"
                      maxLength={80}
                      error={v.cErr}
                    />
                    <div className="ui-field">
                      <span id="cat-label" className="ui-label">
                        Danh mục
                      </span>
                      <div className="ex-rel">
                        {v.catOpen ? (
                          <div
                            aria-hidden="true"
                            onClick={v.catClose}
                            className="ex-catback"
                          ></div>
                        ) : null}
                        <div className="ex-rel ex-rel--top">
                          <input
                            id="cat-input"
                            role="combobox"
                            aria-expanded={v.catOpen}
                            aria-controls="cat-list"
                            aria-autocomplete="list"
                            aria-labelledby="cat-label"
                            autoComplete="off"
                            className="ui-control ui-control--lg ex-combo"
                            aria-invalid={v.catErr ? true : undefined}
                            aria-describedby={
                              v.catErr ? "cat-error" : undefined
                            }
                            value={v.catInput}
                            placeholder="Chọn hoặc gõ để tìm danh mục"
                            onFocus={v.catFocus}
                            onChange={v.catType}
                          />
                          <span aria-hidden="true" className="ex-combo__icon">
                            <Icon name="chevron-down" />
                          </span>
                          {v.catOpen ? (
                            <ul
                              id="cat-list"
                              role="listbox"
                              aria-label="Danh mục"
                              className="ex-menu"
                            >
                              {(v.catOpts || []).map((o, cidx) => (
                                <li
                                  key={cidx}
                                  role="option"
                                  aria-selected={o.on}
                                >
                                  <a
                                    href="#"
                                    onClick={o.pick}
                                    className={"press " + o.st}
                                  >
                                    <span>{o.label}</span>
                                    {o.on ? (
                                      <span className="ex-opt__check">
                                        <Icon name="check" strokeWidth={2.2} />
                                      </span>
                                    ) : null}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                      {v.catErr ? (
                        <span id="cat-error" role="alert" className="ui-error">
                          {v.catErr}
                        </span>
                      ) : null}
                    </div>
                    <label className="ui-field">
                      <span className="ui-label">
                        {"Mô tả "}
                        <span className="ex-opt-label">(không bắt buộc)</span>
                      </span>
                      <textarea
                        className="ui-control"
                        rows={4}
                        value={v.cDesc}
                        onChange={v.setCDesc}
                        placeholder="Giới thiệu ngắn hiện ở trang bộ đề của người học"
                      ></textarea>
                    </label>
                    <div className="ex-infobox">
                      <Icon name="info" />
                      <span>
                        Academic hay General Training được chọn ở từng đề
                        Reading/Writing bên trong bộ, không chọn ở đây.
                      </span>
                    </div>
                  </div>
                </div>
                <DialogFoot>
                  <Button
                    variant="danger"
                    className="press"
                    onClick={v.closeCreate}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    className="press"
                    onClick={v.submitCreate}
                  >
                    <Icon name="plus" />
                    Tạo bộ đề
                  </Button>
                </DialogFoot>
              </DialogBody>
            ) : null}
            {v.cDone ? (
              <div className="ex-done">
                <div className="ex-rel">
                  <div className="an-pop" style={styleOf(v.doneArtSt)}></div>
                  <span className="an-check ex-done__check">
                    <Icon name="check-bold" size={20} strokeWidth={2.4} />
                  </span>
                </div>
                <div className="an-rise ex-done__title">
                  {"Đã tạo “" + v.doneName + "”"}
                </div>
                <div className="an-rise ex-done__text">
                  Bộ đề đang là Bản nháp và chưa có đề nào. Mở trang Thông tin
                  bộ đề để thêm đề, nhập xlsx hoặc soạn trực tiếp.
                </div>
                <div className="ex-done__actions">
                  <Button className="press" onClick={v.closeCreate}>
                    Đóng
                  </Button>
                  <Button
                    variant="primary"
                    className="press"
                    onClick={v.openNew}
                  >
                    Mở Thông tin bộ đề
                    <Icon name="chevron-right" size={15} />
                  </Button>
                </div>
              </div>
            ) : null}
          </Dialog>
          <ConfirmDialog
            open={v.delOpen}
            onClose={() => v.delCancel(null)}
            onConfirm={() => v.delOk(null)}
            label="Xác nhận xóa bộ đề"
            width={440}
            tone="danger"
            icon={<Icon name="trash" size={20} />}
            title={"Xóa bộ đề “" + v.delName + "”?"}
            cancelVariant="danger"
            confirmVariant="danger-solid"
            confirmClassName="ui-btn--on-solid"
            confirmLabel={
              <>
                <Icon name="trash" />
                Xóa bộ đề
              </>
            }
          >
            {v.delText}
          </ConfirmDialog>
          <Toast open={v.toast}>{v.toastText}</Toast>
        </StaffLayout>
        {"\n"}
      </>
    );
  }
}

export default AdminExams;
