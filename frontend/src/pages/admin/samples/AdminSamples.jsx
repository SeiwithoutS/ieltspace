import React from "react";
import { styleOf, cssText } from "../../../lib/styles";
import AdminSidebar from "../../../components/navigation/AdminSidebar";
import AdminTopbar from "../../../components/navigation/AdminTopbar";

class AdminSamples extends React.Component {
  renderVals() {
    var me = this,
      s = me.state || {},
      self = me;

    function stop(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
    }
    function keep(e) {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
    }
    function store(k, v) {
      try {
        sessionStorage.setItem(k, JSON.stringify({ at: Date.now(), v: v }));
      } catch (err) {}
    }
    // đọc ảnh người dùng chọn: kiểm tra loại và dung lượng, đo tỉ lệ để cảnh báo khi lệch xa 3:2
    function readImage(e, done) {
      var f = e && e.target && e.target.files && e.target.files[0];
      if (!f) {
        return;
      }
      if (!/^image\/(png|jpeg|webp)$/.test(f.type)) {
        done(null, "Ảnh phải là JPG, PNG hoặc WebP.");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        done(null, "Ảnh lớn hơn 5 MB, hãy chọn ảnh nhỏ hơn.");
        return;
      }
      var r = new FileReader();
      r.onload = function () {
        var url = r.result,
          im = new Image();
        im.onload = function () {
          var q = im.width / im.height;
          done(
            url,
            Math.abs(q - 1.5) > 0.12
              ? "Ảnh " +
                  im.width +
                  " × " +
                  im.height +
                  " không đúng tỉ lệ 3:2, sẽ được thu vừa khung bìa trên nền màu."
              : "",
            true,
          );
        };
        im.onerror = function () {
          done(url, "");
        };
        im.src = url;
      };
      r.readAsDataURL(f);
      try {
        e.target.value = "";
      } catch (err) {}
    }

    var DATA = [
        {
          id: "w1",
          skill: "W",
          form: "AC",
          task: 2,
          type: "agree",
          title: "Celebrity privacy",
          topic: "Social issues",
          band: "8.5",
          n: 190,
          status: "pub",
          updated: "28/10/2026",
        },
        {
          id: "w2",
          skill: "W",
          form: "AC",
          task: 2,
          type: "advdis",
          title: "Community gardens",
          topic: "Urban planning",
          band: "8.0",
          n: 0,
          status: "draft",
          updated: "27/10/2026",
        },
        {
          id: "w3",
          skill: "W",
          form: "AC",
          task: 2,
          type: "two",
          title: "Advertising and consumer protection",
          topic: "Advertising",
          band: "8.0",
          n: 0,
          status: "draft",
          updated: "26/10/2026",
        },
        {
          id: "w4",
          skill: "W",
          form: "AC",
          task: 1,
          type: "line",
          title: "Radio and television audiences",
          topic: "Media",
          band: "8.0",
          n: 165,
          status: "pub",
          updated: "28/10/2026",
        },
        {
          id: "w5",
          skill: "W",
          form: "AC",
          task: 1,
          type: "map",
          title: "Building's ground",
          topic: "Map",
          band: "8.5",
          n: 0,
          status: "draft",
          updated: "25/10/2026",
        },
        {
          id: "w7",
          skill: "W",
          form: "GT",
          task: 1,
          type: "advice",
          title: "Gợi ý cho bạn ở chỗ làm",
          topic: "Work",
          band: "8.0",
          n: 126,
          status: "pub",
          updated: "24/10/2026",
        },
        {
          id: "w8",
          skill: "W",
          form: "GT",
          task: 1,
          type: "request",
          title: "Xin nghỉ phép kéo dài",
          topic: "Work",
          band: "7.5",
          n: 0,
          status: "draft",
          updated: "23/10/2026",
        },
        {
          id: "s1",
          skill: "S",
          part: 1,
          title: "Websites",
          topic: "Technology",
          band: "8.0",
          n: 3,
          status: "pub",
          updated: "28/10/2026",
        },
        {
          id: "s2",
          skill: "S",
          part: 1,
          title: "Hometown",
          topic: "Places",
          band: "7.5",
          n: 4,
          status: "draft",
          updated: "24/10/2026",
        },
        {
          id: "s3",
          skill: "S",
          part: 2,
          title: "Describe a law on environmental protection",
          topic: "Environment",
          band: "8.0",
          n: 1,
          status: "pub",
          updated: "27/10/2026",
        },
        {
          id: "s4",
          skill: "S",
          part: 2,
          title: "Describe a book you enjoyed",
          topic: "Books",
          band: "8.0",
          n: 1,
          status: "draft",
          updated: "22/10/2026",
        },
        {
          id: "s5",
          skill: "S",
          part: 3,
          title: "Changing important ideas",
          topic: "Decisions",
          band: "8.0",
          n: 4,
          status: "pub",
          updated: "27/10/2026",
        },
      ],
      FORMS = {
        AC: ["Academic", "#DFF1F4", "#1F6A78"],
        GT: ["General Training", "#FCE6D6", "#9A4A17"],
      },
      STATUS = {
        pub: ["Đã đăng", "#DCEDE2", "#2E6A48"],
        draft: ["Bản nháp", "#FBEDBF", "#7A5A0E"],
      };
    var items = s.items || DATA;
    var tab = s.tab || "all",
      st = s.st || "all",
      q = (s.q || "").trim().toLowerCase();
    function chipSt(bg, fg) {
      return (
        "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; font-size: 12.5px; font-weight: 600; white-space: nowrap; background: " +
        bg +
        "; color: " +
        fg
      );
    }
    var PILL =
      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 999px; box-sizing: border-box; font-size: 13.5px; font-weight: 600; text-decoration: none; cursor: pointer; white-space: nowrap";
    function seg(list, cur, key) {
      return list.map(function (t) {
        var on = cur === t[0];
        return {
          name: t[1],
          pick: function (e) {
            stop(e);
            var o = {};
            o[key] = t[0];
            self.setState(o);
          },
          st:
            "display: inline-flex; align-items: center; height: 32px; padding: 0 14px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; color: #352637; cursor: pointer; " +
            (on
              ? "background: #FFFFFF; box-shadow: 0 1px 3px rgba(53, 38, 55, 0.12)"
              : "color: #6A5D6C"),
        };
      });
    }
    function match(x) {
      if (st !== "all" && x.status !== st) {
        return false;
      }
      return !q || (x.title + " " + x.topic).toLowerCase().indexOf(q) >= 0;
    }
    function toastSet(text, undo) {
      self.setState({ toast: text, undoList: undo || null, canUndo: !!undo });
    }
    function rowOf(x) {
      var f = x.skill === "W" ? FORMS[x.form] : null,
        ss = STATUS[x.status];
      return {
        title: x.title,
        topic: x.topic,
        form: f ? f[0] : x.topic,
        formSt: f ? chipSt(f[1], f[2]) : "font-size: 13.5px; color: #6A5D6C",
        band: x.band,
        n: x.n ? String(x.n) : "—",
        stText: ss[0],
        stSt: chipSt(ss[1], ss[2]),
        updated: x.updated,
        href:
          x.skill === "W"
            ? "AdminSampleWriting.dc.html"
            : "AdminSampleSpeaking.dc.html",
        open: function (e) {
          store("ieltspace-sample", { mode: "edit", id: x.id, meta: x });
        },
        del: function (e) {
          stop(e);
          self.setState({ delItem: x });
        },
      };
    }
    var all = items;
    var W = all.filter(function (x) {
        return x.skill === "W";
      }),
      S = all.filter(function (x) {
        return x.skill === "S";
      });
    function wGroupsOf() {
      var out = [];
      [
        [
          "Task 1 · Academic",
          function (x) {
            return x.task === 1 && x.form === "AC";
          },
          { form: "AC", task: 1 },
        ],
        [
          "Task 2",
          function (x) {
            return x.task === 2;
          },
          { task: 2 },
        ],
        [
          "General Training · Task 1 (thư)",
          function (x) {
            return x.task === 1 && x.form === "GT";
          },
          { form: "GT", task: 1 },
        ],
      ].forEach(function (grp) {
        var rows = W.filter(grp[1]),
          shown = rows.filter(match);
        if ((q || st !== "all") && !shown.length) {
          return;
        }
        out.push({
          label: grp[0],
          count: rows.length + " bài",
          empty: !shown.length,
          rows: shown.map(rowOf),
          href: "AdminSampleWriting.dc.html",
          add: function () {
            store("ieltspace-sample", {
              mode: "new",
              form: grp[2].form,
              task: grp[2].task,
            });
          },
        });
      });
      return out;
    }
    function sGroupsOf() {
      return [1, 2, 3].map(function (p) {
        var rows = S.filter(function (x) {
            return x.part === p;
          }),
          shown = rows.filter(match);
        return {
          label: "Part " + p,
          count: rows.length + " bài",
          empty: !shown.length,
          rows: shown.map(rowOf),
          href: "AdminSampleSpeaking.dc.html",
          add: function () {
            store("ieltspace-sample", { mode: "new", part: p });
          },
        };
      });
    }
    var pub = all.filter(function (x) {
      return x.status === "pub";
    }).length;
    function cnt(list, f) {
      return list.filter(f).length;
    }
    var wT1a = cnt(W, function (x) {
        return x.task === 1 && x.form === "AC";
      }),
      wT1g = cnt(W, function (x) {
        return x.task === 1 && x.form === "GT";
      }),
      wT2 = cnt(W, function (x) {
        return x.task === 2;
      });
    var ck = function (t, b, f) {
      return { t: t, bg: b, fg: f };
    };
    var wPub = cnt(W, function (x) {
        return x.status === "pub";
      }),
      sPub = cnt(S, function (x) {
        return x.status === "pub";
      });
    var stat = {
      all: all.length,
      allSub: pub + " đã đăng · " + (all.length - pub) + " bản nháp",
      allChips: [
        ck("Writing " + W.length, "#FBEDBF", "#7A5A0E"),
        ck("Speaking " + S.length, "#E8E4FA", "#5543B0"),
      ],
      w: W.length,
      wSub: wPub + " đã đăng · " + (W.length - wPub) + " bản nháp",
      wChips: [
        ck("Task 1 Academic " + wT1a, "#DFF1F4", "#1F6A78"),
        ck("Task 1 GT " + wT1g, "#FCE6D6", "#9A4A17"),
        ck("Task 2 " + wT2, "#F3F0EA", "#4B3D4D"),
      ],
      s: S.length,
      sSub: sPub + " đã đăng · " + (S.length - sPub) + " bản nháp",
      sChips: [1, 2, 3].map(function (p) {
        return ck(
          "Part " +
            p +
            " " +
            cnt(S, function (x) {
              return x.part === p;
            }),
          "#F3F0EA",
          "#4B3D4D",
        );
      }),
    };
    var showW = tab !== "S",
      showS = tab !== "W";
    var d = s.delItem;
    return {
      stat: stat,
      skillTabs: seg(
        [
          ["all", "Tất cả"],
          ["W", "Writing"],
          ["S", "Speaking"],
        ],
        tab,
        "tab",
      ),
      statusTabs: seg(
        [
          ["all", "Mọi trạng thái"],
          ["pub", "Đã đăng"],
          ["draft", "Bản nháp"],
        ],
        st,
        "st",
      ),
      q: s.q || "",
      setQ: function (e) {
        self.setState({ q: e.target.value });
      },
      count:
        (showW ? W.filter(match).length : 0) +
        (showS ? S.filter(match).length : 0) +
        " bài mẫu",
      showW: showW,
      showS: showS,
      wGroups: showW ? wGroupsOf() : [],
      sGroups: showS ? sGroupsOf() : [],
      modeCls: "",
      addOpen: !!s.add,
      openAdd: function (e) {
        stop(e);
        self.setState({ add: true });
      },
      closeAdd: function (e) {
        stop(e);
        self.setState({ add: false });
      },
      keep: keep,
      addW: function () {
        store("ieltspace-sample", { mode: "new" });
      },
      addS: function () {
        store("ieltspace-sample", { mode: "new" });
      },
      delOpen: !!d,
      delTitle: d ? "Xóa bài mẫu “" + d.title + "”?" : "",
      delSub: d
        ? d.status === "pub"
          ? "Bài đã đăng sẽ biến mất khỏi thư viện bài mẫu của người học. Có thể hoàn tác ngay sau khi xóa."
          : "Bản nháp này sẽ bị xóa. Có thể hoàn tác ngay sau khi xóa."
        : "",
      delCancel: function (e) {
        stop(e);
        self.setState({ delItem: null });
      },
      delOk: function (e) {
        stop(e);
        var prev = items;
        self.setState({
          items: items.filter(function (x) {
            return x.id !== d.id;
          }),
          delItem: null,
        });
        toastSet("Đã xóa bài mẫu “" + d.title + "”.", prev);
      },
      toast: !!s.toast,
      toastText: s.toast || "",
      canUndo: !!s.canUndo,
      toastLink: false,
      toastHref: "#",
      toastLinkText: "",
      undo: function (e) {
        stop(e);
        if (s.undoList) {
          self.setState({
            items: s.undoList,
            toast: "",
            undoList: null,
            canUndo: false,
          });
        }
      },
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
            "\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\n@keyframes isFade{from{opacity:0}to{opacity:1}}@keyframes isPop{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}@keyframes isDrop{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}@keyframes isToast{from{opacity:0;transform:translate(-50%,14px)}to{opacity:1;transform:translate(-50%,0)}}@keyframes isFlash{0%{background:#E3ECFD}100%{background:transparent}}@keyframes isSpin{to{transform:rotate(360deg)}}@keyframes isGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes isCheck{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}@keyframes isRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.an-fade{animation:isFade .2s ease-out both}.an-pop{animation:isPop .28s cubic-bezier(.2,.8,.2,1) both}.an-drop{animation:isDrop .18s cubic-bezier(.2,.8,.2,1) both;transform-origin:top left}.an-toast{animation:isToast .3s cubic-bezier(.2,.8,.2,1) both}.an-check{animation:isCheck .45s cubic-bezier(.2,.8,.2,1) both}.an-rise{animation:isRise .32s cubic-bezier(.2,.8,.2,1) both}.an-flash>td{animation:isFlash 2s ease-out}.an-spin{animation:isSpin .8s linear infinite}a,label,input,textarea,select,[role=button]{transition:background-color .16s ease,border-color .16s ease,color .16s ease,box-shadow .2s ease,transform .18s ease,opacity .16s ease,outline-color .16s ease}.lift:hover{transform:translateY(-2px);box-shadow:0 2px 4px rgba(53,38,55,.05),0 12px 28px rgba(53,38,55,.10)}.press:active{transform:scale(.97)}.hov>tbody>tr{transition:background-color .15s ease}.hov>tbody>tr:hover{background:#FDFCF8}.thumb-h{transition:transform .2s ease,box-shadow .2s ease}.thumb-h:hover{transform:translateY(-3px) rotate(-1deg)}input:focus,textarea:focus,select:focus{outline:none;border-color:#2963CC !important;box-shadow:0 0 0 3px rgba(41,99,204,.16)}@media (prefers-reduced-motion: reduce){*{animation:none !important;transition:none !important}}input::placeholder,textarea::placeholder{color:#9A8F9C}.rowh:hover{background:#FDFCF8}\n",
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
              "display: flex; flex-wrap: wrap; align-items: stretch; min-height: 900px",
            )}
          >
            <div
              className="app-sidebar-slot"
              style={styleOf("display: flex; flex: none; align-self: stretch")}
            >
              <AdminSidebar active={"samples"}></AdminSidebar>
            </div>
            <div
              className="app-content"
              style={styleOf(
                "flex: 1 1 560px; min-width: 0; display: flex; flex-direction: column",
              )}
            >
              <AdminTopbar crumb={"Quản lý / Quản lý bài mẫu"}></AdminTopbar>
              <main
                className={v.modeCls}
                style={styleOf(
                  "flex: 1; background: #FAF9F5; display: flex; flex-direction: column; min-width: 0",
                )}
              >
                <div
                  style={styleOf(
                    "padding: 32px 32px 48px; display: flex; flex-direction: column; gap: 24px; min-width: 0",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap",
                    )}
                  >
                    <div>
                      <h1
                        style={styleOf(
                          "margin: 0; font-family: 'IBM Plex Serif', Georgia, serif; font-size: 34px; font-weight: 600; letter-spacing: -0.02em",
                        )}
                      >
                        {"Quản lý bài mẫu"}
                      </h1>
                      <p style={styleOf("margin: 4px 0 0; color: #6A5D6C")}>
                        {
                          "Bài mẫu Writing và Speaking hiển thị ở thư viện bài mẫu của người học. Mỗi bài gồm đề bài, dàn ý, bài mẫu và phần dịch."
                        }
                      </p>
                    </div>
                    <a
                      href={"#"}
                      onClick={v.openAdd}
                      className={"press"}
                      style={styleOf(
                        "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                      )}
                    >
                      <svg
                        width={"17"}
                        height={"17"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M12 5v14M5 12h14"}></path>
                      </svg>
                      {" Thêm bài mẫu"}
                    </a>
                  </div>
                  <div
                    style={styleOf("display: flex; gap: 16px; flex-wrap: wrap")}
                  >
                    <div
                      className={"lift"}
                      style={styleOf(
                        "flex: 1 1 240px; min-width: 0; box-sizing: border-box; padding: 18px 20px; border-radius: 20px; border: 1.5px solid #D6D4D0; background: #FFFFFF; display: flex; flex-direction: column; gap: 6px",
                      )}
                    >
                      <div
                        style={styleOf(
                          "font-size: 13.5px; font-weight: 600; color: #6A5D6C",
                        )}
                      >
                        {"Tổng số bài mẫu"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: baseline; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 34px; font-weight: 600; line-height: 1.1",
                          )}
                        >
                          {v.stat.all}
                        </span>
                        <span style={styleOf("color: #6A5D6C")}>
                          {"bài mẫu"}
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13.5px; color: #6A5D6C")}>
                        {v.stat.allSub}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 6px; flex-wrap: wrap",
                        )}
                      >
                        {(v.stat.allChips || []).map((c, index) => (
                          <React.Fragment key={index}>
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; font-size: 12.5px; font-weight: 600; white-space: nowrap; background: " +
                                  c.bg +
                                  "; color: " +
                                  c.fg,
                              )}
                            >
                              {c.t}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <div
                      className={"lift"}
                      style={styleOf(
                        "flex: 1 1 240px; min-width: 0; box-sizing: border-box; padding: 18px 20px; border-radius: 20px; border: 1.5px solid #D6D4D0; background: #FFFFFF; display: flex; flex-direction: column; gap: 6px",
                      )}
                    >
                      <div
                        style={styleOf(
                          "font-size: 13.5px; font-weight: 600; color: #6A5D6C",
                        )}
                      >
                        {"Writing"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: baseline; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 34px; font-weight: 600; line-height: 1.1",
                          )}
                        >
                          {v.stat.w}
                        </span>
                        <span style={styleOf("color: #6A5D6C")}>
                          {"bài mẫu"}
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13.5px; color: #6A5D6C")}>
                        {v.stat.wSub}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 6px; flex-wrap: wrap",
                        )}
                      >
                        {(v.stat.wChips || []).map((c, index) => (
                          <React.Fragment key={index}>
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; font-size: 12.5px; font-weight: 600; white-space: nowrap; background: " +
                                  c.bg +
                                  "; color: " +
                                  c.fg,
                              )}
                            >
                              {c.t}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <div
                      className={"lift"}
                      style={styleOf(
                        "flex: 1 1 240px; min-width: 0; box-sizing: border-box; padding: 18px 20px; border-radius: 20px; border: 1.5px solid #D6D4D0; background: #FFFFFF; display: flex; flex-direction: column; gap: 6px",
                      )}
                    >
                      <div
                        style={styleOf(
                          "font-size: 13.5px; font-weight: 600; color: #6A5D6C",
                        )}
                      >
                        {"Speaking"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: baseline; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 34px; font-weight: 600; line-height: 1.1",
                          )}
                        >
                          {v.stat.s}
                        </span>
                        <span style={styleOf("color: #6A5D6C")}>
                          {"bài mẫu"}
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13.5px; color: #6A5D6C")}>
                        {v.stat.sSub}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 6px; flex-wrap: wrap",
                        )}
                      >
                        {(v.stat.sChips || []).map((c, index) => (
                          <React.Fragment key={index}>
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; font-size: 12.5px; font-weight: 600; white-space: nowrap; background: " +
                                  c.bg +
                                  "; color: " +
                                  c.fg,
                              )}
                            >
                              {c.t}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; flex-wrap: wrap",
                    )}
                  >
                    <label
                      style={styleOf(
                        "flex: 1 1 260px; max-width: 340px; height: 44px; display: flex; align-items: center; gap: 10px; padding: 0 14px; border-radius: 12px; border: 1.5px solid #8E8392; background: #FFFFFF; box-sizing: border-box; color: #706473",
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
                        <circle cx={"11"} cy={"11"} r={"7"}></circle>
                        <path d={"M20 20l-4-4"}></path>
                      </svg>
                      <input
                        aria-label={"Tìm bài mẫu"}
                        placeholder={"Tìm theo tiêu đề hoặc chủ đề"}
                        value={v.q}
                        onInput={v.setQ}
                        style={styleOf(
                          "flex: 1; min-width: 0; border: 0; outline: none; background: transparent; font: inherit; color: #352637",
                        )}
                      />
                    </label>
                    <div
                      style={styleOf(
                        "display: inline-flex; gap: 2px; padding: 3px; border-radius: 12px; background: #F3F0EA",
                      )}
                    >
                      {(v.skillTabs || []).map((t, index) => (
                        <React.Fragment key={index}>
                          <a href={"#"} onClick={t.pick} style={styleOf(t.st)}>
                            {t.name}
                          </a>
                        </React.Fragment>
                      ))}
                    </div>
                    <div
                      style={styleOf(
                        "display: inline-flex; gap: 2px; padding: 3px; border-radius: 12px; background: #F3F0EA",
                      )}
                    >
                      {(v.statusTabs || []).map((t, index) => (
                        <React.Fragment key={index}>
                          <a href={"#"} onClick={t.pick} style={styleOf(t.st)}>
                            {t.name}
                          </a>
                        </React.Fragment>
                      ))}
                    </div>
                    <span style={styleOf("font-size: 13.5px; color: #6A5D6C")}>
                      {v.count}
                    </span>
                  </div>
                  {v.showW ? (
                    <>
                      <section
                        style={styleOf(
                          "border-radius: 20px; border: 1.5px solid #D6D4D0; background: #FFFFFF; overflow: hidden",
                        )}
                      >
                        <div
                          style={styleOf(
                            "display: flex; align-items: baseline; gap: 10px; padding: 16px 20px; flex-wrap: wrap",
                          )}
                        >
                          <h2
                            style={styleOf(
                              "margin: 0; font-family: 'IBM Plex Serif', Georgia, serif; font-size: 20px; font-weight: 600",
                            )}
                          >
                            {"Writing"}
                          </h2>
                          <span
                            style={styleOf("font-size: 13.5px; color: #6A5D6C")}
                          >
                            {
                              "Nhóm theo Task và General Training; mỗi nhóm có nút nhập riêng"
                            }
                          </span>
                        </div>
                        <div style={styleOf("overflow-x: auto")}>
                          <div style={styleOf("min-width: 820px")}>
                            <div
                              style={styleOf(
                                "display: grid; grid-template-columns: minmax(200px, 2.6fr) minmax(120px, 1.2fr) 64px 90px 100px 100px 148px; gap: 12px; padding: 12px 20px; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; font-size: 12.5px; font-weight: 600; color: #706473",
                              )}
                            >
                              <span>{"Tiêu đề"}</span>
                              <span>{"Hình thức"}</span>
                              <span>{"Band"}</span>
                              <span>{"Số từ"}</span>
                              <span>{"Trạng thái"}</span>
                              <span>{"Cập nhật"}</span>
                              <span></span>
                            </div>
                            {(v.wGroups || []).map((g, index) => (
                              <React.Fragment key={index}>
                                <div>
                                  <div
                                    style={styleOf(
                                      "display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 10px 20px; background: #F3F0EA; border-top: 1px solid #E6E4E0",
                                    )}
                                  >
                                    <span
                                      style={styleOf(
                                        "font-weight: 700; font-size: 14px",
                                      )}
                                    >
                                      {g.label}
                                    </span>
                                    <span
                                      style={styleOf(
                                        "font-size: 12.5px; color: #706473",
                                      )}
                                    >
                                      {g.count}
                                    </span>
                                    <a
                                      href={g.href}
                                      onClick={g.add}
                                      style={styleOf(
                                        "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 30px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 13px; margin-left: auto",
                                      )}
                                    >
                                      {"+ Nhập bài"}
                                    </a>
                                  </div>
                                  {(g.rows || []).map((r, index) => (
                                    <React.Fragment key={index}>
                                      <div
                                        className={"rowh"}
                                        style={styleOf(
                                          "display: grid; grid-template-columns: minmax(200px, 2.6fr) minmax(120px, 1.2fr) 64px 90px 100px 100px 148px; align-items: center; gap: 12px; padding: 10px 20px; border-top: 1px solid #E6E4E0; font-size: 14px",
                                        )}
                                      >
                                        <div
                                          style={styleOf(
                                            "min-width: 0; display: flex; flex-direction: column",
                                          )}
                                        >
                                          <span
                                            style={styleOf(
                                              "font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap",
                                            )}
                                          >
                                            {r.title}
                                          </span>
                                          <span
                                            style={styleOf(
                                              "font-size: 12.5px; color: #706473",
                                            )}
                                          >
                                            {r.topic}
                                          </span>
                                        </div>
                                        <div>
                                          <span style={styleOf(r.formSt)}>
                                            {r.form}
                                          </span>
                                        </div>
                                        <div>{r.band}</div>
                                        <div>{r.n}</div>
                                        <div>
                                          <span style={styleOf(r.stSt)}>
                                            {r.stText}
                                          </span>
                                        </div>
                                        <div style={styleOf("color: #6A5D6C")}>
                                          {r.updated}
                                        </div>
                                        <div
                                          style={styleOf(
                                            "display: flex; align-items: center; gap: 8px; justify-content: flex-end",
                                          )}
                                        >
                                          <a
                                            href={r.href}
                                            onClick={r.open}
                                            style={styleOf(
                                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637",
                                            )}
                                          >
                                            {"Mở"}
                                          </a>
                                          <a
                                            href={"#"}
                                            onClick={r.del}
                                            title={"Xóa bài mẫu"}
                                            aria-label={"Xóa bài mẫu"}
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
                                                d={
                                                  "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
                                                }
                                              ></path>
                                            </svg>
                                          </a>
                                        </div>
                                      </div>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </section>
                    </>
                  ) : null}
                  {v.showS ? (
                    <>
                      <section
                        style={styleOf(
                          "border-radius: 20px; border: 1.5px solid #D6D4D0; background: #FFFFFF; overflow: hidden",
                        )}
                      >
                        <div
                          style={styleOf(
                            "display: flex; align-items: baseline; gap: 10px; padding: 16px 20px; flex-wrap: wrap",
                          )}
                        >
                          <h2
                            style={styleOf(
                              "margin: 0; font-family: 'IBM Plex Serif', Georgia, serif; font-size: 20px; font-weight: 600",
                            )}
                          >
                            {"Speaking"}
                          </h2>
                          <span
                            style={styleOf("font-size: 13.5px; color: #6A5D6C")}
                          >
                            {"Nhóm theo Part (editor Speaking sẽ làm sau)"}
                          </span>
                        </div>
                        <div style={styleOf("overflow-x: auto")}>
                          <div style={styleOf("min-width: 820px")}>
                            <div
                              style={styleOf(
                                "display: grid; grid-template-columns: minmax(200px, 2.6fr) minmax(120px, 1.2fr) 64px 90px 100px 100px 148px; gap: 12px; padding: 12px 20px; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; font-size: 12.5px; font-weight: 600; color: #706473",
                              )}
                            >
                              <span>{"Tiêu đề"}</span>
                              <span>{"Chủ đề"}</span>
                              <span>{"Band"}</span>
                              <span>{"Số câu"}</span>
                              <span>{"Trạng thái"}</span>
                              <span>{"Cập nhật"}</span>
                              <span></span>
                            </div>
                            {(v.sGroups || []).map((g, index) => (
                              <React.Fragment key={index}>
                                <div>
                                  <div
                                    style={styleOf(
                                      "display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 10px 20px; background: #F3F0EA; border-top: 1px solid #E6E4E0",
                                    )}
                                  >
                                    <span
                                      style={styleOf(
                                        "font-weight: 700; font-size: 14px",
                                      )}
                                    >
                                      {g.label}
                                    </span>
                                    <span
                                      style={styleOf(
                                        "font-size: 12.5px; color: #706473",
                                      )}
                                    >
                                      {g.count}
                                    </span>
                                    <a
                                      href={g.href}
                                      onClick={g.add}
                                      style={styleOf(
                                        "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 30px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 13px; margin-left: auto",
                                      )}
                                    >
                                      {"+ Nhập bài"}
                                    </a>
                                  </div>
                                  {(g.rows || []).map((r, index) => (
                                    <React.Fragment key={index}>
                                      <div
                                        className={"rowh"}
                                        style={styleOf(
                                          "display: grid; grid-template-columns: minmax(200px, 2.6fr) minmax(120px, 1.2fr) 64px 90px 100px 100px 148px; align-items: center; gap: 12px; padding: 10px 20px; border-top: 1px solid #E6E4E0; font-size: 14px",
                                        )}
                                      >
                                        <div
                                          style={styleOf(
                                            "min-width: 0; display: flex; flex-direction: column",
                                          )}
                                        >
                                          <span
                                            style={styleOf(
                                              "font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap",
                                            )}
                                          >
                                            {r.title}
                                          </span>
                                          <span
                                            style={styleOf(
                                              "font-size: 12.5px; color: #706473",
                                            )}
                                          >
                                            {r.topic}
                                          </span>
                                        </div>
                                        <div>
                                          <span style={styleOf(r.formSt)}>
                                            {r.form}
                                          </span>
                                        </div>
                                        <div>{r.band}</div>
                                        <div>{r.n}</div>
                                        <div>
                                          <span style={styleOf(r.stSt)}>
                                            {r.stText}
                                          </span>
                                        </div>
                                        <div style={styleOf("color: #6A5D6C")}>
                                          {r.updated}
                                        </div>
                                        <div
                                          style={styleOf(
                                            "display: flex; align-items: center; gap: 8px; justify-content: flex-end",
                                          )}
                                        >
                                          <a
                                            href={r.href}
                                            onClick={r.open}
                                            style={styleOf(
                                              "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637",
                                            )}
                                          >
                                            {"Mở"}
                                          </a>
                                          <a
                                            href={"#"}
                                            onClick={r.del}
                                            title={"Xóa bài mẫu"}
                                            aria-label={"Xóa bài mẫu"}
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
                                                d={
                                                  "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
                                                }
                                              ></path>
                                            </svg>
                                          </a>
                                        </div>
                                      </div>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </section>
                    </>
                  ) : null}
                </div>
                {v.addOpen ? (
                  <>
                    <div
                      className={"an-fade"}
                      onClick={v.closeAdd}
                      style={styleOf(
                        "position: fixed; inset: 0; z-index: 60; background: rgba(53, 38, 55, 0.42); display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box",
                      )}
                    >
                      <div
                        className={"an-pop"}
                        role={"dialog"}
                        aria-modal={"true"}
                        aria-label={"Thêm bài mẫu"}
                        onClick={v.keep}
                        style={styleOf(
                          "width: 520px; max-width: 100%; max-height: calc(100vh - 48px); overflow: auto; background: #FFFFFF; border-radius: 22px; border: 1.5px solid #D6D4D0; box-shadow: 0 24px 64px rgba(53, 38, 55, 0.22); box-sizing: border-box",
                        )}
                      >
                        <div
                          style={styleOf(
                            "padding: 26px; display: flex; flex-direction: column; gap: 16px",
                          )}
                        >
                          <div>
                            <div
                              style={styleOf(
                                "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 22px; font-weight: 600",
                              )}
                            >
                              {"Thêm bài mẫu"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 14.5px; color: #6A5D6C; margin-top: 4px",
                              )}
                            >
                              {
                                "Bạn muốn nhập bài mẫu kỹ năng nào? Editor tương ứng sẽ mở ra."
                              }
                            </div>
                          </div>
                          <div
                            style={styleOf(
                              "display: flex; gap: 12px; flex-wrap: wrap",
                            )}
                          >
                            <a
                              href={"AdminSampleWriting.dc.html"}
                              onClick={v.addW}
                              className={"lift press"}
                              style={styleOf(
                                "flex: 1 1 200px; box-sizing: border-box; padding: 18px; border-radius: 16px; border: 1.5px solid #D6D4D0; background: #FFFFFF; text-decoration: none; color: #352637; display: flex; flex-direction: column; gap: 6px",
                              )}
                            >
                              <span
                                style={styleOf(
                                  "width: 36px; height: 36px; border-radius: 10px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                                  <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                                </svg>
                              </span>
                              <span
                                style={styleOf(
                                  "font-weight: 700; font-size: 16px",
                                )}
                              >
                                {"Writing"}
                              </span>
                              <span
                                style={styleOf(
                                  "font-size: 13.5px; color: #6A5D6C",
                                )}
                              >
                                {"Task 1 (biểu đồ, bản đồ, thư) và Task 2"}
                              </span>
                            </a>
                            <a
                              href={"AdminSampleSpeaking.dc.html"}
                              onClick={v.addS}
                              className={"lift press"}
                              style={styleOf(
                                "flex: 1 1 200px; box-sizing: border-box; padding: 18px; border-radius: 16px; border: 1.5px solid #D6D4D0; background: #FFFFFF; text-decoration: none; color: #352637; display: flex; flex-direction: column; gap: 6px",
                              )}
                            >
                              <span
                                style={styleOf(
                                  "width: 36px; height: 36px; border-radius: 10px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
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
                                  <rect
                                    x={"9"}
                                    y={"3"}
                                    width={"6"}
                                    height={"11"}
                                    rx={"3"}
                                  ></rect>
                                  <path
                                    d={"M5 11a7 7 0 0 0 14 0M12 18v3"}
                                  ></path>
                                </svg>
                              </span>
                              <span
                                style={styleOf(
                                  "font-weight: 700; font-size: 16px",
                                )}
                              >
                                {"Speaking"}
                              </span>
                              <span
                                style={styleOf(
                                  "font-size: 13.5px; color: #6A5D6C",
                                )}
                              >
                                {"Part 1, 2, 3 trong một editor"}
                              </span>
                            </a>
                          </div>
                          <div
                            style={styleOf(
                              "display: flex; justify-content: flex-end",
                            )}
                          >
                            <a
                              href={"#"}
                              onClick={v.closeAdd}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637",
                              )}
                            >
                              {"Đóng"}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.delOpen ? (
                  <>
                    <div
                      className={"an-fade"}
                      onClick={v.delCancel}
                      style={styleOf(
                        "position: fixed; inset: 0; z-index: 60; background: rgba(53, 38, 55, 0.42); display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box",
                      )}
                    >
                      <div
                        className={"an-pop"}
                        role={"dialog"}
                        aria-modal={"true"}
                        aria-label={"Xóa bài mẫu"}
                        onClick={v.keep}
                        style={styleOf(
                          "width: 440px; max-width: 100%; max-height: calc(100vh - 48px); overflow: auto; background: #FFFFFF; border-radius: 22px; border: 1.5px solid #D6D4D0; box-shadow: 0 24px 64px rgba(53, 38, 55, 0.22); box-sizing: border-box",
                        )}
                      >
                        <div
                          style={styleOf(
                            "padding: 26px; display: flex; flex-direction: column; gap: 10px",
                          )}
                        >
                          <div
                            style={styleOf(
                              "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 20px; font-weight: 600",
                            )}
                          >
                            {v.delTitle}
                          </div>
                          <div
                            style={styleOf("font-size: 14.5px; color: #6A5D6C")}
                          >
                            {v.delSub}
                          </div>
                          <div
                            style={styleOf(
                              "display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px",
                            )}
                          >
                            <a
                              href={"#"}
                              onClick={v.delCancel}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                              )}
                            >
                              {"Hủy"}
                            </a>
                            <a
                              href={"#"}
                              onClick={v.delOk}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #C0412A; background: #C0412A; color: #FFFFFF",
                              )}
                            >
                              {"Xóa"}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.toast ? (
                  <>
                    <div
                      role={"status"}
                      className={"an-toast"}
                      style={styleOf(
                        "position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 70; display: flex; align-items: center; gap: 16px; padding: 10px 14px 10px 18px; border-radius: 14px; background: #352637; color: #FFFFFF; font-size: 14px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); max-width: calc(100% - 48px)",
                      )}
                    >
                      <span>{v.toastText}</span>
                      {v.canUndo ? (
                        <>
                          <a
                            href={"#"}
                            onClick={v.undo}
                            style={styleOf(
                              "color: #A9C4F5; font-weight: 600; text-decoration: none; white-space: nowrap",
                            )}
                          >
                            {"Hoàn tác"}
                          </a>
                        </>
                      ) : null}
                      {v.toastLink ? (
                        <>
                          <a
                            href={v.toastHref}
                            style={styleOf(
                              "color: #A9C4F5; font-weight: 600; text-decoration: none; white-space: nowrap",
                            )}
                          >
                            {v.toastLinkText}
                          </a>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </main>
            </div>
          </div>
          {"\n"}
        </div>
        {"\n"}
      </>
    );
  }
}

export default AdminSamples;
