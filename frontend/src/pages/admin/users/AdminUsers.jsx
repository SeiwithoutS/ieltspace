import React from "react";
import { styleOf, cssText } from "../../../lib/styles";
import AdminSidebar from "../../../components/navigation/AdminSidebar";
import AdminTopbar from "../../../components/navigation/AdminTopbar";

class AdminUsers extends React.Component {
  componentDidMount() {
    var self = this;
    this._esc = function (e) {
      if (e.key === "Escape") {
        self.setState({ sel: null, createOpen: false });
      }
    };
    document.addEventListener("keydown", this._esc);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this._esc);
  }
  renderVals() {
    var accent = this.props.accent ?? "#2963CC";
    var hx = String(accent).replace("#", "");
    if (hx.length === 3) {
      hx = hx[0] + hx[0] + hx[1] + hx[1] + hx[2] + hx[2];
    }
    var nn = parseInt(hx, 16);
    var lum =
      (0.299 * ((nn >> 16) & 255) +
        0.587 * ((nn >> 8) & 255) +
        0.114 * (nn & 255)) /
      255;
    var onAccent = lum > 0.6 ? "#1A1A1A" : "#FFFFFF";
    var s = this.state || {},
      P = this.props,
      self = this;
    var BASE = [
        {
          id: "minhanh",
          name: "Nguyễn Minh Anh",
          email: "minhanh@email.com",
          role: "learner",
          grade: "—",
          created: "18/09/2026",
          last: "09:12 · 23/10/2026",
          status: "active",
          via: "Tự đăng ký bằng email",
          ini: "MA",
          av: "#BFD8F7",
        },
        {
          id: "lanhuong",
          name: "Cô Lan Hương",
          email: "lanhuong@ieltspace.vn",
          role: "teacher",
          grade: "W, S · 7/10",
          created: "07/10/2026",
          last: "08:58 · 23/10/2026",
          status: "active",
          via: "Quản lý tạo, email mời",
          ini: "LH",
          av: "#DCEDE2",
        },
        {
          id: "quocbao",
          name: "Thầy Quốc Bảo",
          email: "quocbao@ieltspace.vn",
          role: "teacher",
          grade: "W · 3/8",
          created: "03/10/2026",
          last: "22:14 · 22/10/2026",
          status: "stopping",
          via: "Quản lý tạo, email mời",
          ini: "QB",
          av: "#C5CEF5",
        },
        {
          id: "ducminh",
          name: "Thầy Đức Minh",
          email: "ducminh@ieltspace.vn",
          role: "teacher",
          grade: "S · 2/6",
          created: "12/10/2026",
          last: "19:30 · 22/10/2026",
          status: "active",
          via: "Quản lý tạo, email mời",
          ini: "ĐM",
          av: "#FBEDBF",
        },
        {
          id: "hoangnam",
          name: "Hoàng Nam",
          email: "hoangnam@email.com",
          role: "learner",
          grade: "—",
          created: "06/10/2026",
          last: "08:02 · 23/10/2026",
          status: "active",
          via: "Tự đăng ký bằng email",
          ini: "HN",
          av: "#E8E4FA",
        },
        {
          id: "ngoclan",
          name: "Ngọc Lan",
          email: "ngoclan@gmail.com",
          role: "learner",
          grade: "—",
          created: "09/10/2026",
          last: "08:30 · 23/10/2026",
          status: "active",
          via: "Đăng ký bằng Google",
          ini: "NL",
          av: "#DCEDE2",
        },
        {
          id: "quocviet",
          name: "Quốc Việt",
          email: "quocviet@gmail.com",
          role: "learner",
          grade: "—",
          created: "11/10/2026",
          last: "21:03 · 22/10/2026",
          status: "active",
          via: "Đăng ký bằng Google",
          ini: "QV",
          av: "#BFD8F7",
        },
        {
          id: "moi",
          name: "Lê Thị Mới",
          email: "moi@email.com",
          role: "learner",
          grade: "—",
          created: "22/10/2026",
          last: "Chưa đăng nhập",
          status: "unverified",
          via: "Tự đăng ký bằng email",
          ini: "LM",
          av: "#F3F0EA",
        },
        {
          id: "thuha",
          name: "Thu Hà",
          email: "thuha@email.com",
          role: "learner",
          grade: "—",
          created: "28/09/2026",
          last: "20:11 · 19/10/2026",
          status: "locked",
          via: "Tự đăng ký bằng email",
          ini: "TH",
          av: "#FBDCD3",
        },
        {
          id: "khoa",
          name: "Phạm Đăng Khoa",
          email: "khoa@email.com",
          role: "learner",
          grade: "—",
          created: "15/09/2026",
          last: "17:45 · 15/10/2026",
          status: "locked",
          via: "Tự đăng ký bằng email",
          ini: "ĐK",
          av: "#FBDCD3",
        },
        {
          id: "tuan",
          name: "Trần Tuấn",
          email: "tuan@email.com",
          role: "learner",
          grade: "—",
          created: "02/09/2026",
          last: "—",
          status: "deleted",
          via: "Tự đăng ký bằng email",
          ini: "TT",
          av: "#F3F0EA",
        },
        {
          id: "admin",
          name: "Trần Quản Lý",
          email: "admin@ieltspace.vn",
          role: "manager",
          grade: "—",
          created: "01/09/2026",
          last: "07:55 · 23/10/2026",
          status: "active",
          via: "Tài khoản khởi tạo hệ thống",
          ini: "QL",
          av: "#C5CEF5",
        },
      ],
      LEARN = {
        minhanh: [24, 3, 1],
        hoangnam: [11, 1, 1],
        ngoclan: [6, 2, 0],
        quocviet: [9, 0, 1],
        moi: [0, 2, 0],
        thuha: [15, 0, 1],
        khoa: [4, 1, 0],
        tuan: [2, 0, 0],
      },
      TEACH = {
        lanhuong: ["on", "on", "7 / 10"],
        quocbao: ["stopping", "revoked", "3 / 8"],
        ducminh: ["off", "on", "2 / 6"],
      },
      LOGS = [
        [
          "09:12 · 23/10",
          "minhanh",
          "login",
          "Đăng nhập",
          "Email · Chrome · Windows",
          "ok",
          "Thành công",
        ],
        [
          "08:58 · 23/10",
          "lanhuong",
          "login",
          "Đăng nhập",
          "Email · Chrome · macOS",
          "ok",
          "Thành công",
        ],
        [
          "08:30 · 23/10",
          "ngoclan",
          "login",
          "Đăng nhập",
          "Google · Edge · Windows",
          "ok",
          "Thành công",
        ],
        [
          "08:02 · 23/10",
          "hoangnam",
          "login",
          "Đăng nhập",
          "Email · Chrome · Windows",
          "ok",
          "Thành công",
        ],
        [
          "22:14 · 22/10",
          "quocbao",
          "login",
          "Đăng nhập",
          "Email · Chrome · macOS",
          "ok",
          "Thành công",
        ],
        [
          "21:03 · 22/10",
          "quocviet",
          "login",
          "Đăng nhập",
          "Google · Safari · iPhone",
          "ok",
          "Thành công",
        ],
        [
          "19:30 · 22/10",
          "ducminh",
          "login",
          "Đăng nhập",
          "Email · Chrome · Windows",
          "ok",
          "Thành công",
        ],
      ];
    var PILL =
        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; box-sizing: border-box; font-size: 12.5px; font-weight: 600; white-space: nowrap; ",
      SEG_ON =
        "display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13.5px; font-weight: 600; color: #352637; text-decoration: none; cursor: pointer; white-space: nowrap; box-sizing: border-box",
      SEG_OFF =
        "display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #6A5D6C; font-size: 13.5px; font-weight: 500; text-decoration: none; cursor: pointer; white-space: nowrap; box-sizing: border-box";
    var over = s.over || {},
      added = s.added || [];
    var ROLE = {
      learner: ["Người học", "#FFFFFF", "#352637"],
      teacher: ["Giáo viên", "#E3ECFD", "#352637"],
      manager: ["Quản lý", "#352637", "#FFFFFF"],
    };
    var STAT = {
      active: ["Hoạt động", "#DCEDE2", "#2E6A48"],
      stopping: ["Ngừng nhận bài mới", "#FBEDBF", "#7A5A0E"],
      locked: ["Bị khóa", "#FBDCD3", "#B23A24"],
      unverified: ["Chưa xác minh email", "#F3F0EA", "#6A5D6C"],
      deleted: ["Đã xóa", "#F3F0EA", "#6A5D6C"],
      invited: ["Chờ kích hoạt", "#E8E4FA", "#5543B0"],
    };
    var PERM = {
      on: ["Đang chấm", "#DCEDE2", "#2E6A48"],
      stopping: ["Ngừng nhận bài mới", "#FBEDBF", "#7A5A0E"],
      revoked: ["Đã thu hồi", "#F3F0EA", "#6A5D6C"],
      off: ["Chưa cấp", "#F3F0EA", "#6A5D6C"],
    };
    var RES = {
      ok: ["", "#DCEDE2", "#2E6A48"],
      fail: ["", "#FBDCD3", "#B23A24"],
      warn: ["", "#FBEDBF", "#7A5A0E"],
      info: ["", "#F3F0EA", "#4B3D4D"],
      band: ["", "#E3ECFD", "#2A55B8"],
    };
    function pill(x) {
      return (
        PILL +
        "border: 1.5px solid #D6D4D0; background: " +
        x[1] +
        "; color: " +
        x[2]
      );
    }
    function stop(e) {
      if (e) {
        e.preventDefault();
      }
    }
    var all = BASE.concat(added).map(function (u) {
      var st = over[u.id] || u.status;
      var o = {};
      for (var k in u) {
        o[k] = u[k];
      }
      o.status = st;
      return o;
    });
    var byId = {};
    all.forEach(function (u) {
      byId[u.id] = u;
    });
    var fr = s.fRole || "all",
      fs = s.fStatus || "all",
      q = (s.q || "").trim().toLowerCase();
    function open(id) {
      return function (e) {
        stop(e);
        self.setState({ sel: id });
      };
    }
    var rows = all
      .filter(function (u) {
        if (fr !== "all" && u.role !== fr) {
          return false;
        }
        if (
          fs === "active" &&
          !(u.status === "active" || u.status === "stopping")
        ) {
          return false;
        }
        if (fs === "locked" && u.status !== "locked") {
          return false;
        }
        if (fs === "deleted" && u.status !== "deleted") {
          return false;
        }
        if (fs === "all" && u.status === "deleted") {
          return false;
        }
        if (q && (u.name + " " + u.email).toLowerCase().indexOf(q) < 0) {
          return false;
        }
        return true;
      })
      .map(function (u) {
        var sel = s.sel === u.id;
        return {
          name: u.name,
          email: u.email,
          ini: u.ini,
          av: u.av,
          grade: u.grade,
          created: u.created,
          last: u.last,
          roleLabel: ROLE[u.role][0],
          roleStyle: pill(ROLE[u.role]),
          statusLabel: STAT[u.status][0],
          statusStyle: pill(STAT[u.status]),
          open: open(u.id),
          rowStyle:
            "display: grid; grid-template-columns: minmax(230px, 2.2fr) 120px minmax(140px, 1.1fr) 110px 170px 170px 24px; border-top: 1px solid #E6E4E0; color: #352637; text-decoration: none; cursor: pointer; " +
            (sel
              ? "background: #E3ECFD"
              : u.status === "deleted"
                ? "opacity: 0.6"
                : ""),
        };
      });
    function logRow(g) {
      var u = byId[g[1]] || { name: g[1], email: "", role: "learner" };
      var r = RES[g[5]];
      return {
        time: g[0],
        name: u.name,
        email: u.email,
        act: g[3],
        detail: g[4],
        result: g[6],
        resStyle: pill(r),
        open: open(g[1]),
      };
    }
    function logsFor(roles, f) {
      return LOGS.filter(function (g) {
        var u = byId[g[1]];
        return u && roles.indexOf(u.role) >= 0 && (f === "all" || g[2] === f);
      }).map(logRow);
    }
    var fll = "all",
      flt = "all";
    var learnLog = logsFor(["learner"], fll),
      teachLog = logsFor(["teacher"], flt);
    function segs(key, cur, keys) {
      var o = {};
      keys.forEach(function (k) {
        o[k] = {
          on: cur === k,
          st: cur === k ? SEG_ON : SEG_OFF,
          pick: function (e) {
            stop(e);
            var x = {};
            x[key] = k;
            self.setState(x);
          },
        };
      });
      return o;
    }
    var su = s.sel ? byId[s.sel] : null,
      sel = null;
    if (su) {
      var L = LEARN[su.id] || [0, 2, 0],
        T = TEACH[su.id] || ["on", "off", "0 / " + (su.limit || 10)];
      var sl = LOGS.filter(function (g) {
        return g[1] === su.id;
      })
        .slice(0, 3)
        .map(logRow);
      var locked = su.status === "locked";
      sel = {
        name: su.name,
        email: su.email,
        ini: su.ini,
        av: su.av,
        created: su.created,
        last: su.last,
        via: su.via,
        verified:
          su.status === "unverified"
            ? "Chưa xác minh"
            : su.status === "invited"
              ? "Chờ đặt mật khẩu"
              : su.via.indexOf("Google") >= 0
                ? "Qua Google"
                : "Đã xác minh",
        roleLabel: ROLE[su.role][0],
        roleStyle: pill(ROLE[su.role]),
        statusLabel: STAT[su.status][0],
        statusStyle: pill(STAT[su.status]),
        isLearner: su.role === "learner",
        isTeacher: su.role === "teacher",
        isManager: su.role === "manager",
        isBao: su.id === "quocbao",
        done: String(L[0]),
        bonus: String(L[1]),
        pending: String(L[2]),
        wLabel: PERM[T[0]][0],
        wStyle: pill(PERM[T[0]]),
        sLabel: PERM[T[1]][0],
        sStyle: pill(PERM[T[1]]),
        load: T[2],
        logs: sl,
        noLogs: sl.length === 0,
        canAct: su.role !== "manager" && su.status !== "deleted",
        lockLabel: locked ? "Mở khóa tài khoản" : "Khóa tài khoản",
        lockToggle: function (e) {
          stop(e);
          var o = {};
          for (var k in over) {
            o[k] = over[k];
          }
          o[su.id] = locked ? "active" : "locked";
          self.setState({
            over: o,
            toast:
              (locked ? "Đã mở khóa tài khoản " : "Đã khóa tài khoản ") +
              su.name +
              ".",
          });
        },
        remove: function (e) {
          stop(e);
          var o = {};
          for (var k in over) {
            o[k] = over[k];
          }
          o[su.id] = "deleted";
          self.setState({
            over: o,
            sel: null,
            toast:
              "Đã xóa tài khoản " +
              su.name +
              ". Bộ lọc Đã xóa vẫn xem lại được.",
          });
        },
      };
    }
    var nfRole = s.nfRole || "teacher",
      nfName = s.nfName || "",
      nfEmail = (s.nfEmail || "").trim();
    var nfW = s.nfW == null ? true : s.nfW,
      nfS = s.nfS == null ? false : s.nfS,
      nfLimit = s.nfLimit == null ? "10" : s.nfLimit;
    var nfErr = !nfName.trim()
      ? "Vui lòng nhập họ và tên."
      : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(nfEmail)
        ? "Email không hợp lệ."
        : all.some(function (u) {
              return u.email.toLowerCase() === nfEmail.toLowerCase();
            })
          ? "Email này đã có tài khoản."
          : nfRole === "teacher" && !nfW && !nfS
            ? "Giáo viên cần ít nhất một quyền chấm."
            : nfRole === "teacher" && !(parseInt(nfLimit, 10) >= 1)
              ? "Giới hạn bài chưa chấm phải từ 1 trở lên."
              : "";
    function set(k) {
      return function (e) {
        var o = {};
        o[k] = e.target.value;
        self.setState(o);
      };
    }
    var nActive = all.filter(function (u) {
      return u.status !== "deleted";
    }).length;
    return {
      accent: accent,
      onAccent: onAccent,
      rows: rows,
      empty: rows.length === 0,
      learnLog: learnLog,
      teachLog: teachLog,
      learnLogEmpty: learnLog.length === 0,
      teachLogEmpty: teachLog.length === 0,
      countText: rows.length + " / " + nActive + " tài khoản",
      q: s.q || "",
      setQ: set("q"),
      fRole: segs("fRole", fr, ["all", "learner", "teacher", "manager"]),
      fStatus: segs("fStatus", fs, ["all", "active", "locked", "deleted"]),
      hasSel: !!sel,
      sel: sel || { logs: [] },
      closeSel: function (e) {
        stop(e);
        self.setState({ sel: null });
      },
      toast: !!s.toast,
      toastText: s.toast || "",
      hideToast: function (e) {
        stop(e);
        self.setState({ toast: "" });
      },
      createOpen: !!s.createOpen,
      openCreate: function (e) {
        stop(e);
        self.setState({ createOpen: true, sel: null, nfTried: false });
      },
      closeCreate: function (e) {
        stop(e);
        self.setState({ createOpen: false });
      },
      nfName: nfName,
      nfEmail: s.nfEmail || "",
      nfRole: nfRole,
      nfLimit: nfLimit,
      nfW: nfW,
      nfS: nfS,
      nfTeacher: nfRole === "teacher",
      setNfName: set("nfName"),
      setNfEmail: set("nfEmail"),
      setNfRole: set("nfRole"),
      setNfLimit: set("nfLimit"),
      toggleW: function () {
        self.setState({ nfW: !nfW });
      },
      toggleS: function () {
        self.setState({ nfS: !nfS });
      },
      nfErr: nfErr,
      nfShowErr: !!(s.nfTried && nfErr),
      submitCreate: function (e) {
        stop(e);
        if (nfErr) {
          self.setState({ nfTried: true });
          return;
        }
        var parts = nfName.trim().split(/\s+/),
          ini =
            (parts.length > 1 ? parts[parts.length - 2][0] : "") +
            parts[parts.length - 1][0];
        var perm = [nfW ? "W" : "", nfS ? "S" : ""].filter(Boolean).join(", ");
        var nu = {
          id: "new" + (added.length + 1),
          name: nfName.trim(),
          email: nfEmail,
          role: nfRole,
          grade:
            nfRole === "teacher" ? perm + " · 0/" + parseInt(nfLimit, 10) : "—",
          created: "23/10/2026",
          last: "Chưa đăng nhập",
          status: "invited",
          via: "Quản lý tạo, email mời",
          ini: ini.toUpperCase(),
          av: "#E8E4FA",
          limit: parseInt(nfLimit, 10),
        };
        self.setState({
          added: added.concat([nu]),
          createOpen: false,
          nfName: "",
          nfEmail: "",
          nfTried: false,
          fStatus: "all",
          fRole: "all",
          q: "",
          toast:
            "Đã tạo tài khoản " +
            nu.name +
            " và gửi email mời đến " +
            nu.email +
            ".",
        });
      },
    };
  }

  static defaultProps = { accent: "#2963CC" };
  render() {
    const v = this.renderVals();
    return (
      <>
        {"\n"}
        {"\n"}
        <style>
          {cssText(
            "\nbody{margin:0;background:#FCFBF7}\na{color:#2963CC}\n.bu-dd-menu{display:none}.bu-dd:hover .bu-dd-menu,.bu-dd:focus-within .bu-dd-menu{display:block}.bu-dd:hover > a{background:#F3F0EA}\n\n@keyframes is-drawer-in{from{transform:translateX(32px);opacity:0}to{transform:none;opacity:1}}\n",
          )}
        </style>
        {"\n"}
        {"\n"}
        <div
          className="app-sidebar-slot"
          style={styleOf(
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; position: relative; min-height: 100%; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 1240px",
          )}
        >
          {"\n"}
          <div
            className="app-shell"
            style={styleOf(
              "display: flex; flex-wrap: wrap; align-items: stretch; min-height: inherit",
            )}
          >
            <div
              className="app-sidebar-slot"
              style={styleOf("display: flex; flex: none; align-self: stretch")}
            >
              <AdminSidebar active={"users"}></AdminSidebar>
            </div>
            <div
              className="app-content"
              style={styleOf(
                "flex: 1 1 560px; min-width: 0; display: flex; flex-direction: column",
              )}
            >
              <AdminTopbar crumb={"Quản lý / Người dùng"}></AdminTopbar>
              <main
                style={styleOf(
                  "flex: 1; background: #FAF9F5; padding: 36px 32px 48px; display: flex; flex-direction: column; gap: 24px",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap",
                  )}
                >
                  <div>
                    <h1
                      style={styleOf(
                        "margin: 0; font-size: 30px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif",
                      )}
                    >
                      {"Người dùng"}
                    </h1>
                    <div
                      style={styleOf(
                        "font-size: 15px; color: #6A5D6C; margin-top: 4px",
                      )}
                    >
                      {
                        "Tài khoản Người học, Giáo viên và Quản lý; quyền chấm và giới hạn nhận bài của Giáo viên."
                      }
                    </div>
                  </div>
                  <a
                    href={"#"}
                    onClick={v.openCreate}
                    aria-haspopup={"dialog"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap; cursor: pointer; font-family: inherit; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
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
                      <path d={"M12 5v14M5 12h14"}></path>
                    </svg>
                    {" Tạo tài khoản"}
                  </a>
                </div>
                <div
                  style={styleOf(
                    "display: flex; flex-wrap: wrap; gap: 14px; align-items: center",
                  )}
                >
                  <div
                    role={"group"}
                    style={styleOf(
                      "display: inline-flex; gap: 2px; padding: 3px; border-radius: 11px; background: #F3F0EA",
                    )}
                  >
                    <a
                      href={"#"}
                      onClick={v.fRole.all.pick}
                      aria-pressed={v.fRole.all.on}
                      style={styleOf(v.fRole.all.st)}
                    >
                      {"Tất cả"}
                    </a>
                    <a
                      href={"#"}
                      onClick={v.fRole.learner.pick}
                      aria-pressed={v.fRole.learner.on}
                      style={styleOf(v.fRole.learner.st)}
                    >
                      {"Người học"}
                    </a>
                    <a
                      href={"#"}
                      onClick={v.fRole.teacher.pick}
                      aria-pressed={v.fRole.teacher.on}
                      style={styleOf(v.fRole.teacher.st)}
                    >
                      {"Giáo viên"}
                    </a>
                    <a
                      href={"#"}
                      onClick={v.fRole.manager.pick}
                      aria-pressed={v.fRole.manager.on}
                      style={styleOf(v.fRole.manager.st)}
                    >
                      {"Quản lý"}
                    </a>
                  </div>
                  <label
                    style={styleOf(
                      "display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 14px; width: 280px; box-sizing: border-box; border: 1.5px solid #D6D4D0; border-radius: 10px; background: #FFFFFF; color: #706473",
                    )}
                  >
                    <svg
                      width={"18"}
                      height={"18"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                      aria-hidden={"true"}
                    >
                      <circle cx={"11"} cy={"11"} r={"7"}></circle>
                      <path d={"M20 20l-4-4"}></path>
                    </svg>
                    <input
                      type={"search"}
                      value={v.q}
                      onChange={v.setQ}
                      placeholder={"Tìm tên hoặc email"}
                      aria-label={"Tìm tên hoặc email"}
                      style={styleOf(
                        "flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: 14.5px; color: #352637",
                      )}
                    />
                  </label>
                  <div
                    role={"group"}
                    style={styleOf(
                      "display: inline-flex; gap: 2px; padding: 3px; border-radius: 11px; background: #F3F0EA",
                    )}
                  >
                    <a
                      href={"#"}
                      onClick={v.fStatus.all.pick}
                      aria-pressed={v.fStatus.all.on}
                      style={styleOf(v.fStatus.all.st)}
                    >
                      {"Mọi trạng thái"}
                    </a>
                    <a
                      href={"#"}
                      onClick={v.fStatus.active.pick}
                      aria-pressed={v.fStatus.active.on}
                      style={styleOf(v.fStatus.active.st)}
                    >
                      {"Hoạt động"}
                    </a>
                    <a
                      href={"#"}
                      onClick={v.fStatus.locked.pick}
                      aria-pressed={v.fStatus.locked.on}
                      style={styleOf(v.fStatus.locked.st)}
                    >
                      {"Bị khóa"}
                    </a>
                    <a
                      href={"#"}
                      onClick={v.fStatus.deleted.pick}
                      aria-pressed={v.fStatus.deleted.on}
                      style={styleOf(v.fStatus.deleted.st)}
                    >
                      {"Đã xóa"}
                    </a>
                  </div>
                  <span
                    style={styleOf(
                      "margin-left: auto; font-size: 13.5px; color: #706473",
                    )}
                  >
                    {v.countText}
                  </span>
                </div>
                {v.toast ? (
                  <>
                    <div
                      role={"status"}
                      style={styleOf(
                        "display: flex; gap: 10px; align-items: center; padding: 12px 16px; border-radius: 12px; background: #DCEDE2; color: #2E6A48; border: 1.5px solid #D6D4D0; font-size: 14px",
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
                        <path d={"M5 12.5l4.5 4.5L19 7"}></path>
                      </svg>
                      <span style={styleOf("flex: 1")}>{v.toastText}</span>
                      <a
                        href={"#"}
                        onClick={v.hideToast}
                        aria-label={"Đóng thông báo"}
                        style={styleOf("display: flex; color: #2E6A48")}
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
                <div
                  style={styleOf(
                    "border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow: hidden",
                  )}
                >
                  <div style={styleOf("overflow-x: auto")}>
                    <div
                      role={"table"}
                      aria-label={"Danh sách người dùng"}
                      style={styleOf("min-width: 1000px")}
                    >
                      <div
                        role={"row"}
                        style={styleOf(
                          "display: grid; grid-template-columns: minmax(230px, 2.2fr) 120px minmax(140px, 1.1fr) 110px 170px 170px 24px; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0",
                        )}
                      >
                        <div
                          role={"columnheader"}
                          style={styleOf(
                            "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                          )}
                        >
                          {"Người dùng"}
                        </div>
                        <div
                          role={"columnheader"}
                          style={styleOf(
                            "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                          )}
                        >
                          {"Vai trò"}
                        </div>
                        <div
                          role={"columnheader"}
                          style={styleOf(
                            "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                          )}
                        >
                          {"Quyền chấm · bài/giới hạn"}
                        </div>
                        <div
                          role={"columnheader"}
                          style={styleOf(
                            "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                          )}
                        >
                          {"Ngày tạo"}
                        </div>
                        <div
                          role={"columnheader"}
                          style={styleOf(
                            "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                          )}
                        >
                          {"Đăng nhập gần nhất"}
                        </div>
                        <div
                          role={"columnheader"}
                          style={styleOf(
                            "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                          )}
                        >
                          {"Trạng thái"}
                        </div>
                        <div
                          role={"columnheader"}
                          style={styleOf(
                            "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                          )}
                        ></div>
                      </div>
                      {(v.rows || []).map((u, index) => (
                        <React.Fragment key={index}>
                          <a
                            href={"#"}
                            role={"row"}
                            onClick={u.open}
                            aria-label={"Xem chi tiết " + u.name}
                            style={styleOf(u.rowStyle)}
                          >
                            <div
                              role={"cell"}
                              style={styleOf(
                                "padding: 12px 16px; display: flex; align-items: center; gap: 12px; min-width: 0",
                              )}
                            >
                              <span
                                style={styleOf(
                                  "flex: none; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: " +
                                    u.av +
                                    "; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12.5px",
                                )}
                              >
                                {u.ini}
                              </span>
                              <div style={styleOf("min-width: 0")}>
                                <div style={styleOf("font-weight: 600")}>
                                  {u.name}
                                </div>
                                <div
                                  style={styleOf(
                                    "font-size: 12.5px; color: #706473; overflow: hidden; text-overflow: ellipsis",
                                  )}
                                >
                                  {u.email}
                                </div>
                              </div>
                            </div>
                            <div
                              role={"cell"}
                              style={styleOf(
                                "padding: 12px 16px; display: flex; align-items: center",
                              )}
                            >
                              <span style={styleOf(u.roleStyle)}>
                                {u.roleLabel}
                              </span>
                            </div>
                            <div
                              role={"cell"}
                              style={styleOf(
                                "padding: 12px 16px; display: flex; align-items: center; font-size: 14px",
                              )}
                            >
                              {u.grade}
                            </div>
                            <div
                              role={"cell"}
                              style={styleOf(
                                "padding: 12px 16px; display: flex; align-items: center; font-size: 14px",
                              )}
                            >
                              {u.created}
                            </div>
                            <div
                              role={"cell"}
                              style={styleOf(
                                "padding: 12px 16px; display: flex; align-items: center; font-size: 14px; color: #4B3D4D",
                              )}
                            >
                              {u.last}
                            </div>
                            <div
                              role={"cell"}
                              style={styleOf(
                                "padding: 12px 16px; display: flex; align-items: center",
                              )}
                            >
                              <span style={styleOf(u.statusStyle)}>
                                {u.statusLabel}
                              </span>
                            </div>
                            <div
                              role={"cell"}
                              style={styleOf(
                                "display: flex; align-items: center; color: #706473",
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
                                <path d={"M9 18l6-6-6-6"}></path>
                              </svg>
                            </div>
                          </a>
                        </React.Fragment>
                      ))}
                      {v.empty ? (
                        <>
                          <div
                            style={styleOf(
                              "padding: 32px 16px; text-align: center; color: #6A5D6C; border-top: 1px solid #E6E4E0",
                            )}
                          >
                            {"Không có tài khoản phù hợp với bộ lọc."}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div
                  style={styleOf(
                    "display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start",
                  )}
                >
                  <section
                    aria-labelledby={"learnLog-title"}
                    style={styleOf(
                      "flex: 1 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 14px",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap",
                      )}
                    >
                      <div>
                        <h2
                          id={"learnLog-title"}
                          style={styleOf(
                            "margin: 0; font-size: 22px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"Hoạt động người học"}
                        </h2>
                        <div
                          style={styleOf(
                            "font-size: 14px; color: #6A5D6C; margin-top: 2px",
                          )}
                        >
                          {"Người học đã đăng nhập trong các ngày qua."}
                        </div>
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow: hidden",
                      )}
                    >
                      <div role={"table"} aria-label={"Hoạt động người học"}>
                        <div
                          role={"row"}
                          style={styleOf(
                            "display: grid; grid-template-columns: 140px minmax(0, 1fr); background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0",
                          )}
                        >
                          <div
                            role={"columnheader"}
                            style={styleOf(
                              "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                            )}
                          >
                            {"Đăng nhập lúc"}
                          </div>
                          <div
                            role={"columnheader"}
                            style={styleOf(
                              "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                            )}
                          >
                            {"Người dùng"}
                          </div>
                        </div>
                        {(v.learnLog || []).map((g, index) => (
                          <React.Fragment key={index}>
                            <a
                              href={"#"}
                              role={"row"}
                              onClick={g.open}
                              style={styleOf(
                                "display: grid; grid-template-columns: 140px minmax(0, 1fr); align-items: center; border-top: 1px solid #E6E4E0; color: #352637; text-decoration: none; font-size: 14px; cursor: pointer",
                              )}
                            >
                              <div
                                role={"cell"}
                                style={styleOf(
                                  "padding: 11px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; white-space: nowrap; color: #4B3D4D",
                                )}
                              >
                                {g.time}
                              </div>
                              <div
                                role={"cell"}
                                style={styleOf(
                                  "padding: 9px 16px; min-width: 0; display: flex; flex-direction: column; align-items: flex-start",
                                )}
                              >
                                <div
                                  style={styleOf(
                                    "max-width: 100%; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis",
                                  )}
                                >
                                  {g.name}
                                </div>
                                <div
                                  style={styleOf(
                                    "max-width: 100%; color: #706473; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis",
                                  )}
                                >
                                  {g.email}
                                </div>
                              </div>
                            </a>
                          </React.Fragment>
                        ))}
                        {v.learnLogEmpty ? (
                          <>
                            <div
                              style={styleOf(
                                "padding: 24px 16px; text-align: center; color: #6A5D6C; border-top: 1px solid #E6E4E0",
                              )}
                            >
                              {"Chưa có lượt đăng nhập nào."}
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </section>
                  <section
                    aria-labelledby={"teachLog-title"}
                    style={styleOf(
                      "flex: 1 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 14px",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap",
                      )}
                    >
                      <div>
                        <h2
                          id={"teachLog-title"}
                          style={styleOf(
                            "margin: 0; font-size: 22px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"Hoạt động giáo viên"}
                        </h2>
                        <div
                          style={styleOf(
                            "font-size: 14px; color: #6A5D6C; margin-top: 2px",
                          )}
                        >
                          {"Giáo viên đã đăng nhập trong các ngày qua."}
                        </div>
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow: hidden",
                      )}
                    >
                      <div role={"table"} aria-label={"Hoạt động giáo viên"}>
                        <div
                          role={"row"}
                          style={styleOf(
                            "display: grid; grid-template-columns: 140px minmax(0, 1fr); background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0",
                          )}
                        >
                          <div
                            role={"columnheader"}
                            style={styleOf(
                              "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                            )}
                          >
                            {"Đăng nhập lúc"}
                          </div>
                          <div
                            role={"columnheader"}
                            style={styleOf(
                              "padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; white-space: nowrap",
                            )}
                          >
                            {"Người dùng"}
                          </div>
                        </div>
                        {(v.teachLog || []).map((g, index) => (
                          <React.Fragment key={index}>
                            <a
                              href={"#"}
                              role={"row"}
                              onClick={g.open}
                              style={styleOf(
                                "display: grid; grid-template-columns: 140px minmax(0, 1fr); align-items: center; border-top: 1px solid #E6E4E0; color: #352637; text-decoration: none; font-size: 14px; cursor: pointer",
                              )}
                            >
                              <div
                                role={"cell"}
                                style={styleOf(
                                  "padding: 11px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; white-space: nowrap; color: #4B3D4D",
                                )}
                              >
                                {g.time}
                              </div>
                              <div
                                role={"cell"}
                                style={styleOf(
                                  "padding: 9px 16px; min-width: 0; display: flex; flex-direction: column; align-items: flex-start",
                                )}
                              >
                                <div
                                  style={styleOf(
                                    "max-width: 100%; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis",
                                  )}
                                >
                                  {g.name}
                                </div>
                                <div
                                  style={styleOf(
                                    "max-width: 100%; color: #706473; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis",
                                  )}
                                >
                                  {g.email}
                                </div>
                              </div>
                            </a>
                          </React.Fragment>
                        ))}
                        {v.teachLogEmpty ? (
                          <>
                            <div
                              style={styleOf(
                                "padding: 24px 16px; text-align: center; color: #6A5D6C; border-top: 1px solid #E6E4E0",
                              )}
                            >
                              {"Chưa có lượt đăng nhập nào."}
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </section>
                </div>
                <div
                  style={styleOf(
                    "font-size: 13px; color: #706473; margin-top: -8px",
                  )}
                >
                  {
                    "Mỗi bảng hiển thị các lượt đăng nhập gần nhất. Bấm một dòng để mở tài khoản."
                  }
                </div>
                <div
                  style={styleOf(
                    "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #E3ECFD; border: 1.5px solid #D6D4D0; font-size: 14px",
                  )}
                >
                  <span style={styleOf("flex: 0 0 18px; margin-top: 2px")}>
                    <svg
                      width={"18"}
                      height={"18"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"1.8"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                      aria-hidden={"true"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path d={"M12 11v5M12 8h.01"}></path>
                    </svg>
                  </span>
                  <span>
                    {
                      "Khóa tài khoản Người học không hủy yêu cầu chấm đang hoạt động. Xóa tài khoản Người học hủy các yêu cầu chưa có kết quả và không hoàn bonus. Không thể khóa hoặc xóa Quản lý hoạt động cuối cùng."
                    }
                  </span>
                </div>
              </main>
            </div>
          </div>
          {"\n"}
          {v.hasSel ? (
            <>
              <div
                onClick={v.closeSel}
                style={styleOf(
                  "position: absolute; inset: 0; z-index: 60; background: rgba(53, 38, 55, 0.28)",
                )}
              ></div>
              <aside
                className="staff-sidebar"
                role={"dialog"}
                aria-modal={"true"}
                aria-label={"Chi tiết người dùng"}
                style={styleOf(
                  "position: absolute; top: 0; right: 0; bottom: 0; z-index: 70; width: 480px; max-width: 100%; box-sizing: border-box; background: #FFFFFF; border-left: 1.5px solid #D6D4D0; box-shadow: -12px 0 32px rgba(53, 38, 55, 0.12); display: flex; flex-direction: column; animation: is-drawer-in 0.2s ease-out",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 24px; border-bottom: 1.5px solid #D6D4D0",
                  )}
                >
                  <span
                    style={styleOf(
                      "font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #706473",
                    )}
                  >
                    {"Chi tiết người dùng"}
                  </span>
                  <a
                    href={"#"}
                    onClick={v.closeSel}
                    aria-label={"Đóng"}
                    style={styleOf(
                      "width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; color: #352637",
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
                    "flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 22px",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; gap: 14px; align-items: center",
                    )}
                  >
                    <span
                      style={styleOf(
                        "flex: none; width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: " +
                          v.sel.av +
                          "; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px",
                      )}
                    >
                      {v.sel.ini}
                    </span>
                    <div
                      style={styleOf(
                        "min-width: 0; display: flex; flex-direction: column; gap: 6px",
                      )}
                    >
                      <div>
                        <div
                          style={styleOf(
                            "font-weight: 600; font-size: 19px; font-family: 'IBM Plex Serif', Georgia, serif",
                          )}
                        >
                          {v.sel.name}
                        </div>
                        <div
                          style={styleOf("font-size: 13.5px; color: #6A5D6C")}
                        >
                          {v.sel.email}
                        </div>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 6px; flex-wrap: wrap",
                        )}
                      >
                        <span style={styleOf(v.sel.roleStyle)}>
                          {v.sel.roleLabel}
                        </span>
                        <span style={styleOf(v.sel.statusStyle)}>
                          {v.sel.statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div
                      style={styleOf(
                        "font-size: 14px; font-weight: 600; margin-bottom: 4px",
                      )}
                    >
                      {"Tài khoản"}
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                      )}
                    >
                      <span style={styleOf("color: #6A5D6C")}>
                        {"Ngày tạo"}
                      </span>
                      <span
                        style={styleOf("font-weight: 600; text-align: right")}
                      >
                        {v.sel.created}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                      )}
                    >
                      <span style={styleOf("color: #6A5D6C")}>
                        {"Tạo bằng"}
                      </span>
                      <span
                        style={styleOf("font-weight: 600; text-align: right")}
                      >
                        {v.sel.via}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                      )}
                    >
                      <span style={styleOf("color: #6A5D6C")}>
                        {"Xác minh email"}
                      </span>
                      <span
                        style={styleOf("font-weight: 600; text-align: right")}
                      >
                        {v.sel.verified}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                      )}
                    >
                      <span style={styleOf("color: #6A5D6C")}>
                        {"Đăng nhập gần nhất"}
                      </span>
                      <span
                        style={styleOf("font-weight: 600; text-align: right")}
                      >
                        {v.sel.last}
                      </span>
                    </div>
                  </div>
                  {v.sel.isLearner ? (
                    <>
                      <div>
                        <div
                          style={styleOf(
                            "font-size: 14px; font-weight: 600; margin-bottom: 4px",
                          )}
                        >
                          {"Học tập"}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                          )}
                        >
                          <span style={styleOf("color: #6A5D6C")}>
                            {"Bài đã hoàn thành"}
                          </span>
                          <span
                            style={styleOf(
                              "font-weight: 600; text-align: right",
                            )}
                          >
                            {v.sel.done}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                          )}
                        >
                          <span style={styleOf("color: #6A5D6C")}>
                            {"Bonus chấm còn lại"}
                          </span>
                          <span
                            style={styleOf(
                              "font-weight: 600; text-align: right",
                            )}
                          >
                            {v.sel.bonus}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                          )}
                        >
                          <span style={styleOf("color: #6A5D6C")}>
                            {"Yêu cầu chấm chưa có kết quả"}
                          </span>
                          <span
                            style={styleOf(
                              "font-weight: 600; text-align: right",
                            )}
                          >
                            {v.sel.pending}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : null}
                  {v.sel.isTeacher ? (
                    <>
                      <div>
                        <div
                          style={styleOf(
                            "font-size: 14px; font-weight: 600; margin-bottom: 4px",
                          )}
                        >
                          {"Quyền chấm và giới hạn nhận bài"}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                          )}
                        >
                          <span style={styleOf("color: #6A5D6C")}>
                            {"Writing"}
                          </span>
                          <span
                            style={styleOf(
                              "font-weight: 600; text-align: right",
                            )}
                          >
                            <span style={styleOf(v.sel.wStyle)}>
                              {v.sel.wLabel}
                            </span>
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                          )}
                        >
                          <span style={styleOf("color: #6A5D6C")}>
                            {"Speaking"}
                          </span>
                          <span
                            style={styleOf(
                              "font-weight: 600; text-align: right",
                            )}
                          >
                            <span style={styleOf(v.sel.sStyle)}>
                              {v.sel.sLabel}
                            </span>
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                          )}
                        >
                          <span style={styleOf("color: #6A5D6C")}>
                            {"Bài chưa chấm / giới hạn"}
                          </span>
                          <span
                            style={styleOf(
                              "font-weight: 600; text-align: right",
                            )}
                          >
                            {v.sel.load}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : null}
                  {v.sel.isBao ? (
                    <>
                      <div
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 10px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FBEDBF; border: 1.5px solid #D6D4D0; font-size: 14px",
                          )}
                        >
                          <span
                            style={styleOf("flex: 0 0 18px; margin-top: 2px")}
                          >
                            <svg
                              width={"18"}
                              height={"18"}
                              viewBox={"0 0 24 24"}
                              fill={"none"}
                              stroke={"currentColor"}
                              strokeWidth={"1.8"}
                              strokeLinecap={"round"}
                              strokeLinejoin={"round"}
                              aria-hidden={"true"}
                            >
                              <circle cx={"12"} cy={"12"} r={"9"}></circle>
                              <path d={"M12 7v5l3 2"}></path>
                            </svg>
                          </span>
                          <span>
                            {
                              "Đang ngừng nhận bài mới để thu hồi quyền Writing. Thầy chấm nốt 3 bài đã giao, hết bài thì hệ thống thu hồi quyền."
                            }
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "font-size: 14px; font-weight: 600; margin-top: 6px",
                          )}
                        >
                          {"Giáo viên không thể hoàn thành"}
                        </div>
                        <div
                          style={styleOf("font-size: 13.5px; color: #6A5D6C")}
                        >
                          {
                            "Chọn quyền cần ngừng, xem các bài bị ảnh hưởng và nhập lý do. Hệ thống hủy các yêu cầu chưa có kết quả, hoàn 1 bonus cho mỗi yêu cầu, không phân công lại và thông báo cho người học."
                          }
                        </div>
                        <table
                          style={styleOf(
                            "width: 100%; border-collapse: collapse",
                          )}
                        >
                          <thead>
                            <tr>
                              <th
                                style={styleOf(
                                  "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                                )}
                              >
                                {"Người học"}
                              </th>
                              <th
                                style={styleOf(
                                  "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                                )}
                              >
                                {"Bài"}
                              </th>
                              <th
                                style={styleOf(
                                  "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                                )}
                              >
                                {"Trạng thái"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td
                                style={styleOf(
                                  "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                                )}
                              >
                                {"Quốc Việt"}
                              </td>
                              <td
                                style={styleOf(
                                  "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                                )}
                              >
                                {"Writing Task 2"}
                              </td>
                              <td
                                style={styleOf(
                                  "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                                )}
                              >
                                <span
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                                  )}
                                >
                                  {"Chờ chấm"}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={styleOf(
                                  "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                                )}
                              >
                                {"Ngọc Lan"}
                              </td>
                              <td
                                style={styleOf(
                                  "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                                )}
                              >
                                {"Writing Task 1 General"}
                              </td>
                              <td
                                style={styleOf(
                                  "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                                )}
                              >
                                <span
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                                  )}
                                >
                                  {"Chờ chấm"}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={styleOf(
                                  "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                                )}
                              >
                                {"Hoàng Nam"}
                              </td>
                              <td
                                style={styleOf(
                                  "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                                )}
                              >
                                {"Writing Task 2"}
                              </td>
                              <td
                                style={styleOf(
                                  "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                                )}
                              >
                                <span
                                  style={styleOf(
                                    "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                                  )}
                                >
                                  {"Chờ chấm"}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <label
                          style={styleOf(
                            "display: flex; flex-direction: column; gap: 6px; flex: 1 1 0; ",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-size: 13.5px; font-weight: 600",
                            )}
                          >
                            {"Lý do hủy (bắt buộc)"}
                          </span>
                          <div
                            style={styleOf(
                              "min-height: 110px; padding: 12px 14px; box-sizing: border-box; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font-size: 14.5px; line-height: 1.6",
                            )}
                          >
                            {"Giáo viên nghỉ phép dài hạn từ 24/10"}
                          </div>
                        </label>
                        <div
                          style={styleOf(
                            "display: flex; gap: 10px; align-items: flex-start",
                          )}
                        >
                          <a
                            href={"#"}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; width: 100%; border-radius: 999px; border: 1.5px solid #F1B3A3; box-sizing: border-box; background: #FFFFFF; color: #C0412A; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                            )}
                          >
                            {"Hủy thao tác"}
                          </a>
                          <a
                            href={"#"}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; width: 100%; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                            )}
                          >
                            {"Xác nhận hủy 3 yêu cầu"}
                          </a>
                        </div>
                      </div>
                    </>
                  ) : null}
                  {v.sel.isManager ? (
                    <>
                      <div
                        style={styleOf(
                          "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #F3F0EA; border: 1.5px solid #D6D4D0; font-size: 14px",
                        )}
                      >
                        <svg
                          width={"18"}
                          height={"18"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"1.8"}
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
                        <span>
                          {
                            "Đây là Quản lý hoạt động cuối cùng nên không thể khóa hoặc xóa."
                          }
                        </span>
                      </div>
                    </>
                  ) : null}
                  <div>
                    <div
                      style={styleOf(
                        "font-size: 14px; font-weight: 600; margin-bottom: 4px",
                      )}
                    >
                      {"Đăng nhập gần đây"}
                    </div>
                    {(v.sel.logs || []).map((g, index) => (
                      <React.Fragment key={index}>
                        <div
                          style={styleOf(
                            "display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border-top: 1px solid #E6E4E0; font-size: 13.5px",
                          )}
                        >
                          <span>
                            <span
                              style={styleOf(
                                "font-family: 'IBM Plex Mono', monospace; font-size: 12.5px",
                              )}
                            >
                              {g.time}
                            </span>
                          </span>
                        </div>
                      </React.Fragment>
                    ))}
                    {v.sel.noLogs ? (
                      <>
                        <div
                          style={styleOf(
                            "padding: 8px 0; border-top: 1px solid #E6E4E0; font-size: 13.5px; color: #706473",
                          )}
                        >
                          {"Chưa có lượt đăng nhập nào."}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
                {v.sel.canAct ? (
                  <>
                    <div
                      style={styleOf(
                        "display: flex; gap: 10px; padding: 16px 24px; border-top: 1.5px solid #D6D4D0; background: #FCFBF7",
                      )}
                    >
                      <a
                        href={"#"}
                        onClick={v.sel.lockToggle}
                        style={styleOf(
                          "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap; cursor: pointer; font-family: inherit; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; flex: 1",
                        )}
                      >
                        {v.sel.lockLabel}
                      </a>
                      <a
                        href={"#"}
                        onClick={v.sel.remove}
                        style={styleOf(
                          "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap; cursor: pointer; font-family: inherit; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A; flex: 1; color: #C0412A; border-color: #F1B3A3",
                        )}
                      >
                        {"Xóa tài khoản"}
                      </a>
                    </div>
                  </>
                ) : null}
              </aside>
            </>
          ) : null}
          {v.createOpen ? (
            <>
              <div
                onClick={v.closeCreate}
                style={styleOf(
                  "position: absolute; inset: 0; z-index: 60; background: rgba(53, 38, 55, 0.32)",
                )}
              ></div>
              <div
                role={"dialog"}
                aria-modal={"true"}
                aria-labelledby={"create-title"}
                style={styleOf(
                  "position: absolute; z-index: 70; top: 96px; left: 50%; transform: translateX(-50%); width: 560px; max-width: calc(100% - 32px); box-sizing: border-box; background: #FFFFFF; border: 1.5px solid #D6D4D0; border-radius: 22px; box-shadow: 0 24px 64px rgba(53, 38, 55, 0.22); padding: 28px; display: flex; flex-direction: column; gap: 18px",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; justify-content: space-between; align-items: flex-start; gap: 12px",
                  )}
                >
                  <div>
                    <h2
                      id={"create-title"}
                      style={styleOf(
                        "margin: 0; font-size: 22px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                      )}
                    >
                      {"Tạo tài khoản Giáo viên hoặc Quản lý"}
                    </h2>
                    <div
                      style={styleOf(
                        "font-size: 14px; color: #6A5D6C; margin-top: 4px",
                      )}
                    >
                      {
                        "Người học tự đăng ký và phải xác minh email, nên không tạo ở đây."
                      }
                    </div>
                  </div>
                  <a
                    href={"#"}
                    onClick={v.closeCreate}
                    aria-label={"Đóng"}
                    style={styleOf(
                      "flex: none; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; color: #352637",
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
                <div style={styleOf("display: flex; gap: 16px")}>
                  <label
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 6px; flex: 1 1 0; min-width: 0",
                    )}
                  >
                    <span
                      style={styleOf("font-size: 13.5px; font-weight: 600")}
                    >
                      {"Họ và tên"}
                    </span>
                    <input
                      id={"nf-name"}
                      type={"text"}
                      value={v.nfName}
                      onChange={v.setNfName}
                      placeholder={"Phạm Thị Mai"}
                      style={styleOf(
                        "height: 44px; padding: 0 14px; box-sizing: border-box; width: 100%; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font: inherit; font-size: 14.5px; outline-color: #2963CC",
                      )}
                    />
                  </label>
                  <label
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 6px; flex: 1 1 0; min-width: 0",
                    )}
                  >
                    <span
                      style={styleOf("font-size: 13.5px; font-weight: 600")}
                    >
                      {"Email"}
                    </span>
                    <input
                      id={"nf-email"}
                      type={"email"}
                      value={v.nfEmail}
                      onChange={v.setNfEmail}
                      placeholder={"mai@ieltspace.vn"}
                      style={styleOf(
                        "height: 44px; padding: 0 14px; box-sizing: border-box; width: 100%; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font: inherit; font-size: 14.5px; outline-color: #2963CC",
                      )}
                    />
                  </label>
                </div>
                <div style={styleOf("display: flex; gap: 16px")}>
                  <label
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 6px; flex: 1 1 0; min-width: 0",
                    )}
                  >
                    <span
                      style={styleOf("font-size: 13.5px; font-weight: 600")}
                    >
                      {"Vai trò"}
                    </span>
                    <select
                      value={v.nfRole}
                      onChange={v.setNfRole}
                      style={styleOf(
                        "height: 44px; padding: 0 14px; box-sizing: border-box; width: 100%; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font: inherit; font-size: 14.5px; outline-color: #2963CC; cursor: pointer",
                      )}
                    >
                      <option value={"teacher"}>{"Giáo viên"}</option>
                      <option value={"manager"}>{"Quản lý"}</option>
                    </select>
                  </label>
                  {v.nfTeacher ? (
                    <>
                      <label
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 6px; flex: 1 1 0; min-width: 0",
                        )}
                      >
                        <span
                          style={styleOf("font-size: 13.5px; font-weight: 600")}
                        >
                          {"Giới hạn bài chưa chấm"}
                        </span>
                        <input
                          type={"number"}
                          min={"1"}
                          max={"50"}
                          value={v.nfLimit}
                          onChange={v.setNfLimit}
                          style={styleOf(
                            "height: 44px; padding: 0 14px; box-sizing: border-box; width: 100%; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font: inherit; font-size: 14.5px; outline-color: #2963CC",
                          )}
                        />
                      </label>
                    </>
                  ) : null}
                </div>
                {v.nfTeacher ? (
                  <>
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 8px",
                      )}
                    >
                      <span
                        style={styleOf("font-size: 13.5px; font-weight: 600")}
                      >
                        {"Quyền chấm"}
                      </span>
                      <div style={styleOf("display: flex; gap: 10px")}>
                        <label
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #D6D4D0; font-size: 14px; font-weight: 600; cursor: pointer",
                          )}
                        >
                          <input
                            type={"checkbox"}
                            checked={v.nfW}
                            onChange={v.toggleW}
                            style={styleOf(
                              "width: 16px; height: 16px; accent-color: #2963CC; margin: 0",
                            )}
                          />
                          {"Chấm Writing"}
                        </label>
                        <label
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #D6D4D0; font-size: 14px; font-weight: 600; cursor: pointer",
                          )}
                        >
                          <input
                            type={"checkbox"}
                            checked={v.nfS}
                            onChange={v.toggleS}
                            style={styleOf(
                              "width: 16px; height: 16px; accent-color: #2963CC; margin: 0",
                            )}
                          />
                          {"Chấm Speaking"}
                        </label>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.nfShowErr ? (
                  <>
                    <div
                      role={"alert"}
                      style={styleOf(
                        "padding: 10px 14px; border-radius: 12px; background: #FBDCD3; border: 1.5px solid #F1B3A3; color: #B23A24; font-size: 14px",
                      )}
                    >
                      {v.nfErr}
                    </div>
                  </>
                ) : null}
                <div style={styleOf("font-size: 13px; color: #706473")}>
                  {
                    "Hệ thống gửi email mời đặt mật khẩu, không dùng mật khẩu tạm. Tài khoản ở trạng thái Chờ kích hoạt cho đến khi người được mời đặt mật khẩu."
                  }
                </div>
                <div
                  style={styleOf(
                    "display: flex; gap: 10px; justify-content: flex-end",
                  )}
                >
                  <a
                    href={"#"}
                    onClick={v.closeCreate}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap; cursor: pointer; font-family: inherit; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A",
                    )}
                  >
                    {"Hủy"}
                  </a>
                  <a
                    href={"#"}
                    onClick={v.submitCreate}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap; cursor: pointer; font-family: inherit; border: 1.5px solid #352637; background: #352637; color: #FFFFFF",
                    )}
                  >
                    {"Tạo và gửi email mời"}
                  </a>
                </div>
              </div>
            </>
          ) : null}
        </div>
        {"\n"}
      </>
    );
  }
}

export default AdminUsers;
