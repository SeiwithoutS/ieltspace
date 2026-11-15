import NotificationBadge from "../../components/notifications/NotificationBadge";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class SampleSpeaking extends React.Component {
  componentDidMount() {
    var self = this;
    this._sp = function () {
      if (self._lock && Date.now() < self._lock) {
        return;
      }
      var ids = self._ids || [],
        act = ids[0],
        el,
        y = 120;
      for (var i = 0; i < ids.length; i++) {
        el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= y) {
          act = ids[i];
        }
      }
      var de = document.documentElement,
        sh = de.scrollHeight - window.innerHeight,
        pct =
          sh > 0
            ? Math.min(
                100,
                Math.round(
                  (100 * (window.pageYOffset || de.scrollTop || 0)) / sh,
                ),
              )
            : 0;
      if (
        sh > 0 &&
        (window.pageYOffset || de.scrollTop || 0) >= sh - 4 &&
        ids.length
      ) {
        act = ids[ids.length - 1];
      }
      if (act !== (self.state || {}).sec || pct !== (self.state || {}).pct) {
        self.setState({ sec: act, pct: pct });
      }
    };
    window.addEventListener("scroll", this._sp, { passive: true });
    window.addEventListener("resize", this._sp);
    setTimeout(this._sp, 50);
  }
  componentWillUnmount() {
    if (this._tm) {
      clearInterval(this._tm);
    }
    window.removeEventListener("scroll", this._sp);
    window.removeEventListener("resize", this._sp);
  }
  renderVals() {
    var me = this,
      PR = me.props || {},
      s = me.state || {};
    var accent = PR.accent || "#2963CC",
      h = String(accent).replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    var nn = parseInt(h, 16),
      lum =
        (0.299 * ((nn >> 16) & 255) +
          0.587 * ((nn >> 8) & 255) +
          0.114 * (nn & 255)) /
        255;
    var KEYS = {
        "Part 1 · Websites": "s1",
        "Part 2 · Describe a law on environmental protection": "s3",
        "Part 3 · Laws to protect the environment": "s5",
      },
      DATA = {
        s1: {
          id: "s1",
          part: 1,
          title: "Websites",
          topic: "Technology",
          source: "Q3/2026",
          band: "8.0",
          cover: null,
          outlineIntro: "",
          outline: "",
          items: [
            {
              q: "Do you prefer getting information from websites or books?",
              a: "Honestly, I'm more of a **website person**. Whenever I need to look something up, I can **get the answer within seconds** and I can compare several sources. That said, I still pick up a book when I want to understand a topic in depth, because it feels **more reliable and less distracting**.",
              audio: { name: "websites-q1.mp3", size: "380 KB" },
            },
            {
              q: "How often do you visit websites to find information?",
              a: "Pretty much every day. I use the internet to **check the news in the morning**, and I often **look up unfamiliar words** while studying. On a busy day I might open dozens of pages without even noticing.",
              audio: { name: "websites-q2.mp3", size: "470 KB" },
            },
            {
              q: "Is there a website that you visit regularly?",
              a: "Yes, there's an English-learning site that I **go back to on a daily basis**. It's well organised, so I can **pick up new vocabulary** in just ten minutes before bed.",
              audio: { name: "websites-q3.mp3", size: "560 KB" },
            },
          ],
          status: "pub",
        },
        s3: {
          id: "s3",
          part: 2,
          title: "Describe a law on environmental protection",
          topic: "Environment",
          source: "Q3/2026",
          band: "8.0",
          cover: null,
          outlineIntro:
            "Với đề này, ta chọn luật cấm túi nilon dùng một lần: dễ kể, dễ giải thích ảnh hưởng và dễ nêu quan điểm.",
          outline:
            "## Giới thiệu luật\n- Cấm túi nilon dùng một lần trên toàn quốc\n- Cửa hàng không được phát túi miễn phí\n## Ảnh hưởng\n- Người dân mang túi vải, ít rác thải hơn\n## Quan điểm\n- Đây là luật tốt vì thay đổi thói quen",
          items: [
            {
              q: "Describe a law on environmental protection\nYou should say:\n- what the law is\n- when it was introduced\n- how it affects people\nand explain whether you think it is a good law.",
              a: "There are a few laws that I can think of, but the one that comes to mind is the **nationwide ban on single-use plastic bags**, which was introduced in my country a few years ago.\n\nIn short, shops and supermarkets are no longer allowed to **give away free plastic bags**, and customers have to pay a small fee or bring their own. I first heard about it on the news, and at the beginning a lot of people complained because it felt **inconvenient**.\n\nPersonally, I think it is a **really good law**. It has changed our habits: I now keep a **reusable tote bag** in my backpack, and I see far fewer bags floating in rivers. It also made people more **aware of the environmental impact** of everyday choices.",
              audio: { name: "law-environment-part2.mp3", size: "2,4 MB" },
            },
          ],
          status: "pub",
        },
        s5: {
          id: "s5",
          part: 3,
          title: "Laws to protect the environment",
          topic: "Environment",
          source: "Q3/2026",
          band: "8.0",
          cover: null,
          outlineIntro: "",
          outline: "",
          items: [
            {
              q: "Why do some people not follow rules?",
              a: "I think there are **two main reasons**. Some people simply don't see the point, especially when a rule seems **unreasonable**. Others know the rule but believe nobody will **notice or punish** them.",
              audio: { name: "laws-q1.mp3", size: "640 KB" },
            },
            {
              q: "What is the purpose of punishment?",
              a: "Mainly to **discourage bad behaviour**. If people know there are **real consequences**, they will think twice before breaking the law. It also protects people who follow the rules.",
              audio: { name: "laws-q2.mp3", size: "640 KB" },
            },
            {
              q: "How can parents and teachers help children follow rules?",
              a: "By **setting a good example** and explaining the reasons behind each rule instead of just giving orders. Praise also helps, because children **repeat what gets rewarded**.",
              audio: null,
            },
            {
              q: "What kinds of rules do schools in Vietnam have?",
              a: "Most schools require students to **wear uniforms**, arrive on time and respect their teachers. Some also have rules about **mobile phones** in class.",
              audio: null,
            },
          ],
          status: "pub",
        },
      };
    var ex = DATA[KEYS[PR.mau || "Part 1 · Websites"] || "s1"],
      items = ex.items || [],
      isP2 = ex.part === 2;
    function lines(t) {
      return String(t || "").split("\n");
    }
    function segsOf(l) {
      var segs = [];
      String(l)
        .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
        .forEach(function (t) {
          if (!t) {
            return;
          }
          if (/^\*\*[^*]+\*\*$/.test(t)) {
            segs.push({
              t: t.slice(2, -2),
              st: "font-weight: 700; background: #FFF1B8; border-radius: 3px; padding: 0 2px",
            });
          } else if (/^\*[^*]+\*$/.test(t)) {
            segs.push({ t: t.slice(1, -1), st: "font-style: italic" });
          } else {
            segs.push({ t: t, st: "" });
          }
        });
      return segs;
    }
    function mdLines(text) {
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
              ? "font-weight: 700; font-size: 16px; margin-top: 6px"
              : kind === "li"
                ? "padding-left: 4px"
                : ""),
        };
      });
    }
    function pars(t) {
      return String(t || "")
        .split(/\n\s*\n/)
        .map(function (p) {
          return p.trim();
        })
        .filter(Boolean)
        .map(function (p) {
          return { segs: segsOf(p) };
        });
    }
    function words(t) {
      var x = String(t || "")
        .replace(/[*#]/g, " ")
        .replace(/^\s*- /gm, " ")
        .trim();
      return x ? x.split(/\s+/).length : 0;
    }
    var nW = items.reduce(function (n, it) {
      return n + words(it.a);
    }, 0);
    var hasIntro = !!String(ex.outlineIntro || "").trim(),
      hasBox = !!String(ex.outline || "").trim();
    var secs = [["de-bai", "Đề bài"]]
      .concat(hasIntro || hasBox ? [["dan-y", "Dàn ý"]] : [])
      .concat([["bai-mau", "Bài mẫu"]]);
    me._ids = secs.map(function (x) {
      return x[0];
    });
    var act = s.sec && me._ids.indexOf(s.sec) >= 0 ? s.sec : me._ids[0];
    var self = me;
    var crumbs = [
      { text: "Trang chủ", href: "StudentLanding.dc.html", link: true },
      { text: "Thư viện bài mẫu", href: "SampleLibrary.dc.html", link: true },
      {
        text: "Speaking Part " + ex.part,
        href: "SampleLibrary.dc.html",
        link: true,
      },
      { text: ex.title, cur: true },
    ];
    crumbs.forEach(function (c, i) {
      c.sep = i > 0;
      c.link = !!c.link;
      c.cur = !!c.cur;
    });
    var LEN = 65,
      pIdx = s.playIdx == null ? -1 : s.playIdx,
      t = s.t || 0;
    if (pIdx >= 0 && !me._tm) {
      me._tm = setInterval(function () {
        var n = (self.state.t || 0) + 1;
        if (n >= LEN) {
          clearInterval(self._tm);
          self._tm = null;
          self.setState({ playIdx: null, t: 0 });
        } else {
          self.setState({ t: n });
        }
      }, 1000);
    }
    if (pIdx < 0 && me._tm) {
      clearInterval(me._tm);
      me._tm = null;
    }
    function fmt(x) {
      var m = Math.floor(x / 60),
        sec = x % 60;
      return "0" + m + ":" + (sec < 10 ? "0" : "") + sec;
    }
    return {
      accent: accent,
      onAccent: lum > 0.6 ? "#1A1A1A" : "#FFFFFF",
      crumbs: crumbs,
      partChip: "Part " + ex.part,
      hasTopic: !!String(ex.topic || "").trim(),
      topic: ex.topic,
      title: ex.title,
      metaLine: [
        ex.source,
        items.length > 1 || !isP2 ? items.length + " câu hỏi" : "",
        nW + " từ bài mẫu",
      ]
        .filter(Boolean)
        .join(" · "),
      isP2: isP2,
      notP2: !isP2,
      pvCue: mdLines(items[0] ? items[0].q : ""),
      pvQs: items.map(function (it, i) {
        return { n: i + 1, q: it.q };
      }),
      hasOutline: hasIntro || hasBox,
      hasIntro: hasIntro,
      hasBox: hasBox,
      introText: ex.outlineIntro || "",
      pvOutline: mdLines(ex.outline),
      band: ex.band,
      bandChip: "Band " + ex.band + "+",
      practiceBtn: "Luyện Speaking Part " + ex.part,
      pvItems: items.map(function (it, i) {
        var on = pIdx === i;
        return {
          hasQ: !isP2,
          n: i + 1,
          q: it.q,
          a: pars(it.a),
          wc: words(it.a) + " từ",
          hasAudio: !!it.audio,
          playLabel: on ? "Tạm dừng" : "Phát",
          playIcon: on ? "❚❚" : "▶",
          audioNow: fmt(on ? t : 0),
          audioLen: fmt(LEN),
          audioBar:
            "height: 100%; border-radius: 3px; background: #5543B0; width: " +
            (on ? Math.round((100 * t) / LEN) : 0) +
            "%",
          toggle: function (e) {
            if (e && e.preventDefault) {
              e.preventDefault();
            }
            self.setState(on ? { playIdx: null, t: 0 } : { playIdx: i, t: 0 });
          },
        };
      }),
      toc: secs.map(function (x) {
        var on = x[0] === act;
        return {
          id: x[0],
          text: x[1],
          on: on,
          go: function (e) {
            if (e && e.preventDefault) {
              e.preventDefault();
            }
            var el = document.getElementById(x[0]);
            if (el && el.scrollIntoView) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            self._lock = Date.now() + 900;
            self.setState({ sec: x[0] });
            setTimeout(self._sp, 1000);
          },
          st:
            "display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; text-decoration: none; font-size: 14px; transition: background .15s; " +
            (on
              ? "background: #E3ECFD; color: #2257B8; font-weight: 600"
              : "color: #4B3D4D; font-weight: 500"),
          dot:
            "flex: none; width: 8px; height: 8px; border-radius: 50%; " +
            (on ? "background: #2963CC" : "background: #D6D4D0"),
        };
      }),
      pct: s.pct || 0,
      barSt:
        "height: 100%; border-radius: 2px; background: #2963CC; transition: width .15s; width: " +
        (s.pct || 0) +
        "%",
    };
  }

  static defaultProps = { accent: "#2963CC", mau: "Part 1 · Websites" };
  render() {
    const v = this.renderVals();
    return (
      <>
        {"\n"}
        {"\n"}
        <style>
          {cssText(
            "\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\nbody{background:#FCFBF7}.bu-dd-menu{display:none}.bu-dd:hover .bu-dd-menu,.bu-dd:focus-within .bu-dd-menu{display:block}.bu-dd:hover > a{background:#F3F0EA}.crumb:hover{text-decoration:underline !important;color:#2257B8 !important}html{scroll-behavior:smooth}\n",
          )}
        </style>
        {"\n"}
        {"\n"}
        <div
          style={styleOf(
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 900px",
          )}
        >
          {"\n"}
          <LearnerHeader active="samples" />
          <div style={styleOf("background: #FCFBF7")}>
            <main
              style={styleOf(
                "max-width: 1200px; margin: 0 auto; padding: 28px 24px 72px; display: flex; flex-direction: column; gap: 28px",
              )}
            >
              <nav aria-label={"Breadcrumb"}>
                <ol
                  style={styleOf(
                    "list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: 13px; color: #706473",
                  )}
                >
                  {(v.crumbs || []).map((c, index) => (
                    <React.Fragment key={index}>
                      <li
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; min-width: 0",
                        )}
                      >
                        {c.sep ? (
                          <>
                            <span
                              aria-hidden={"true"}
                              style={styleOf("display: flex; color: #706473")}
                            >
                              <svg
                                width={"14"}
                                height={"14"}
                                viewBox={"0 0 24 24"}
                                fill={"none"}
                                stroke={"currentColor"}
                                strokeWidth={"2"}
                                strokeLinecap={"round"}
                                strokeLinejoin={"round"}
                              >
                                <path d={"M9 6l6 6-6 6"}></path>
                              </svg>
                            </span>
                          </>
                        ) : null}
                        {c.link ? (
                          <>
                            <a
                              className={"crumb"}
                              href={c.href}
                              style={styleOf(
                                "color: #706473; text-decoration: none; border-radius: 6px; padding: 2px 4px",
                              )}
                            >
                              {c.text}
                            </a>
                          </>
                        ) : null}
                        {c.cur ? (
                          <>
                            <span
                              aria-current={"page"}
                              style={styleOf(
                                "color: #352637; font-weight: 600; padding: 2px 4px",
                              )}
                            >
                              {c.text}
                            </span>
                          </>
                        ) : null}
                      </li>
                    </React.Fragment>
                  ))}
                </ol>
              </nav>
              <div
                style={styleOf(
                  "display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start",
                )}
              >
                <div
                  style={styleOf(
                    "flex: 3 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 40px",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 12px",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; gap: 8px; flex-wrap: wrap",
                      )}
                    >
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; background: #E8E4FA; color: #5543B0",
                        )}
                      >
                        {"Speaking"}
                      </span>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637",
                        )}
                      >
                        {v.partChip}
                      </span>
                      {v.hasTopic ? (
                        <>
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; background: #F3F0EA; color: #4B3D4D",
                            )}
                          >
                            {v.topic}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h1
                      style={styleOf(
                        "margin: 0; font-family: 'IBM Plex Serif', Georgia, serif; font-size: 36px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2",
                      )}
                    >
                      {v.title}
                    </h1>
                    <div style={styleOf("font-size: 14px; color: #706473")}>
                      {v.metaLine}
                    </div>
                  </div>
                  <section
                    id={"de-bai"}
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 16px; scroll-margin-top: 24px",
                    )}
                  >
                    <h2
                      style={styleOf(
                        "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 28px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.25; margin: 0; scroll-margin-top: 24px; color: #352637",
                      )}
                    >
                      {"Đề bài"}
                    </h2>
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 12px; padding: 20px 24px; border-radius: 12px; background: #E8F0FE; border: 1.5px solid #C5D6F7; border-left: 5px solid #2963CC; font-size: 16px; line-height: 1.7; color: #352637",
                      )}
                    >
                      {v.isP2 ? (
                        <>
                          <div
                            style={styleOf(
                              "display: flex; flex-direction: column; gap: 4px; ",
                            )}
                          >
                            {(v.pvCue || []).map((ln, index) => (
                              <React.Fragment key={index}>
                                <div style={styleOf(ln.st)}>
                                  {ln.li ? (
                                    <>
                                      <span
                                        style={styleOf(
                                          "flex: none; width: 14px",
                                        )}
                                      >
                                        {"•"}
                                      </span>
                                    </>
                                  ) : null}
                                  <span>
                                    {(ln.segs || []).map((sg, index) => (
                                      <React.Fragment key={index}>
                                        <span style={styleOf(sg.st)}>
                                          {sg.t}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </span>
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </>
                      ) : null}
                      {v.notP2 ? (
                        <>
                          {(v.pvQs || []).map((qq, index) => (
                            <React.Fragment key={index}>
                              <div style={styleOf("display: flex; gap: 10px")}>
                                <span
                                  style={styleOf(
                                    "flex: none; min-width: 22px; font-weight: 700; color: #2257B8",
                                  )}
                                >
                                  {qq.n + "."}
                                </span>
                                <span>{qq.q}</span>
                              </div>
                            </React.Fragment>
                          ))}
                        </>
                      ) : null}
                    </div>
                  </section>
                  {v.hasOutline ? (
                    <>
                      <section
                        id={"dan-y"}
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 16px; scroll-margin-top: 24px",
                        )}
                      >
                        <h2
                          style={styleOf(
                            "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 28px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.25; margin: 0; scroll-margin-top: 24px; color: #352637",
                          )}
                        >
                          {"Dàn ý"}
                        </h2>
                        {v.hasIntro ? (
                          <>
                            <p
                              style={styleOf(
                                "margin: 0; font-size: 16px; line-height: 1.8; color: #352637",
                              )}
                            >
                              {v.introText}
                            </p>
                          </>
                        ) : null}
                        {v.hasBox ? (
                          <>
                            <div
                              style={styleOf(
                                "padding: 22px 26px; border-radius: 16px; background: #FFFFFF; border: 1.5px solid #D6D4D0; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.05); font-size: 15px; line-height: 1.7",
                              )}
                            >
                              <div
                                style={styleOf(
                                  "display: flex; flex-direction: column; gap: 4px; ",
                                )}
                              >
                                {(v.pvOutline || []).map((ln, index) => (
                                  <React.Fragment key={index}>
                                    <div style={styleOf(ln.st)}>
                                      {ln.li ? (
                                        <>
                                          <span
                                            style={styleOf(
                                              "flex: none; width: 14px",
                                            )}
                                          >
                                            {"•"}
                                          </span>
                                        </>
                                      ) : null}
                                      <span>
                                        {(ln.segs || []).map((sg, index) => (
                                          <React.Fragment key={index}>
                                            <span style={styleOf(sg.st)}>
                                              {sg.t}
                                            </span>
                                          </React.Fragment>
                                        ))}
                                      </span>
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : null}
                      </section>
                    </>
                  ) : null}
                  <section
                    id={"bai-mau"}
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 16px; scroll-margin-top: 24px",
                    )}
                  >
                    <h2
                      style={styleOf(
                        "font-family: 'IBM Plex Serif', Georgia, serif; font-size: 28px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.25; margin: 0; scroll-margin-top: 24px; color: #352637",
                      )}
                    >
                      {"Bài mẫu"}
                    </h2>
                    <div
                      style={styleOf(
                        "display: flex; gap: 8px; flex-wrap: wrap; align-items: center",
                      )}
                    >
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; background: #DCEDE2; color: #2E6A48",
                        )}
                      >
                        {v.bandChip}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 24px",
                      )}
                    >
                      {(v.pvItems || []).map((pv, index) => (
                        <React.Fragment key={index}>
                          <div
                            style={styleOf(
                              "display: flex; flex-direction: column; gap: 10px",
                            )}
                          >
                            {pv.hasQ ? (
                              <>
                                <div
                                  style={styleOf(
                                    "display: flex; gap: 10px; font-weight: 700; font-size: 18px; line-height: 1.5",
                                  )}
                                >
                                  <span
                                    style={styleOf(
                                      "flex: none; color: #2257B8",
                                    )}
                                  >
                                    {pv.n + "."}
                                  </span>
                                  <span>{pv.q}</span>
                                </div>
                              </>
                            ) : null}
                            <div
                              style={styleOf(
                                "padding: 22px 26px; border-radius: 16px; background: #FFFFFF; border: 1.5px solid #D6D4D0; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.05); display: flex; flex-direction: column; gap: 16px",
                              )}
                            >
                              {pv.hasAudio ? (
                                <>
                                  <div
                                    style={styleOf(
                                      "display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; background: #E8E4FA; border: 1.5px solid #D6D0F2",
                                    )}
                                  >
                                    <a
                                      href={"#"}
                                      onClick={pv.toggle}
                                      aria-label={pv.playLabel}
                                      style={styleOf(
                                        "flex: none; width: 40px; height: 40px; border-radius: 50%; background: #352637; color: #FFFFFF; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 13px",
                                      )}
                                    >
                                      {pv.playIcon}
                                    </a>
                                    <div
                                      style={styleOf(
                                        "flex: 1 1 160px; min-width: 0; display: flex; flex-direction: column; gap: 6px",
                                      )}
                                    >
                                      <div
                                        style={styleOf(
                                          "height: 5px; border-radius: 3px; background: #FFFFFF; overflow: hidden",
                                        )}
                                      >
                                        <div style={styleOf(pv.audioBar)}></div>
                                      </div>
                                      <div
                                        style={styleOf(
                                          "display: flex; justify-content: space-between; font-size: 13px; color: #706473",
                                        )}
                                      >
                                        <span>{pv.audioNow}</span>
                                        <span>{pv.audioLen}</span>
                                      </div>
                                    </div>
                                    <span
                                      style={styleOf(
                                        "font-weight: 600; font-size: 14px",
                                      )}
                                    >
                                      {"Audio mẫu"}
                                    </span>
                                  </div>
                                </>
                              ) : null}
                              <div
                                style={styleOf(
                                  "display: flex; flex-direction: column; gap: 14px; font-size: 16px; line-height: 1.85; color: #352637",
                                )}
                              >
                                {(pv.a || []).map((pp, index) => (
                                  <React.Fragment key={index}>
                                    <p style={styleOf("margin: 0")}>
                                      {(pp.segs || []).map((sg, index) => (
                                        <React.Fragment key={index}>
                                          <span style={styleOf(sg.st)}>
                                            {sg.t}
                                          </span>
                                        </React.Fragment>
                                      ))}
                                    </p>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {pv.wc}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </section>
                </div>
                <aside
                  className="content-sidebar"
                  style={styleOf(
                    "flex: 1 1 280px; max-width: 340px; min-width: 240px; position: sticky; top: 24px; align-self: flex-start; display: flex; flex-direction: column; gap: 16px",
                  )}
                >
                  <nav
                    aria-label={"Trong trang này"}
                    style={styleOf(
                      "padding: 22px 26px; border-radius: 16px; background: #FFFFFF; border: 1.5px solid #D6D4D0; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.05); padding: 18px 16px; display: flex; flex-direction: column; gap: 4px",
                    )}
                  >
                    <div
                      style={styleOf(
                        "font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #706473; padding: 0 10px 6px",
                      )}
                    >
                      {"Trong trang này"}
                    </div>
                    {(v.toc || []).map((t, index) => (
                      <React.Fragment key={index}>
                        <a
                          href={"#" + t.id}
                          onClick={t.go}
                          aria-current={t.on}
                          style={styleOf(t.st)}
                        >
                          <span style={styleOf(t.dot)}></span>
                          {t.text}
                        </a>
                      </React.Fragment>
                    ))}
                    <div
                      style={styleOf(
                        "height: 4px; border-radius: 2px; background: #EEECE8; margin: 10px 10px 0; overflow: hidden",
                      )}
                    >
                      <div style={styleOf(v.barSt)}></div>
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 13px; color: #706473; padding: 4px 10px 0",
                      )}
                    >
                      {"Đã đọc " + v.pct + "%"}
                    </div>
                  </nav>
                  <div
                    style={styleOf(
                      "padding: 22px 26px; border-radius: 16px; background: #FFFFFF; border: 1.5px solid #D6D4D0; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.05); display: flex; flex-direction: column; gap: 10px",
                    )}
                  >
                    <div style={styleOf("font-size: 18px; font-weight: 600")}>
                      {v.practiceBtn}
                    </div>
                    <div style={styleOf("font-size: 14px; color: #706473")}>
                      {"Tự nói rồi nhờ giáo viên chấm, so với bài mẫu band " +
                        v.band +
                        "+."}
                    </div>
                    <a
                      href={"PracticeWS.dc.html"}
                      style={styleOf(
                        "display: inline-flex; align-items: center; justify-content: center; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none",
                      )}
                    >
                      {v.practiceBtn}
                    </a>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {
                        "Bài mẫu xem công khai, không cần đăng nhập. Muốn luyện và lưu bài thì cần đăng nhập."
                      }
                    </div>
                  </div>
                </aside>
              </div>
            </main>
          </div>
          {"\n"}
        </div>
        {"\n"}
      </>
    );
  }
}

export default SampleSpeaking;
