/* global React, I, Badge, Avatar, Kbd, DATA */
const { useState, useEffect, useRef } = React;

/* ─── Bold Prompt — playground style ──────────────────────────────── */
function BoldPrompt() {
  const [selected, setSelected] = useState(DATA.PROMPTS[0]);
  const [tab, setTab] = useState("전체");
  const [vars, setVars] = useState({
    브랜드명: "Linear",
    톤: "차분하고 신뢰감 있게",
    primary: "#5e6ad2",
  });
  const tabs = [
    "전체",
    "한글자연어",
    "영문자연어",
    "JSON",
    "파라미터형",
    "코드",
  ];
  const [copied, setCopied] = useState(false);

  // Replace {var} placeholders
  const interpolated = useMemo(() => {
    let s = selected.body;
    Object.entries(vars).forEach(([k, v]) => {
      s = s.replaceAll("{" + k + "}", v);
    });
    return s;
  }, [selected.body, vars]);
  const hasParams = selected.cat === "파라미터형";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        height: "calc(100vh - 32px)",
        overflow: "hidden",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid var(--fp-border-1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{ padding: 18, borderBottom: "1px solid var(--fp-border-1)" }}
        >
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            프롬프트 페디아
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            <span
              className="fp-display-italic"
              style={{ color: "var(--fp-fg-2)" }}
            >
              플레이
            </span>
            그라운드
          </h2>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}
          >
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "4px 10px",
                  fontSize: 11,
                  borderRadius: 9999,
                  background: tab === t ? "var(--fp-glass-5)" : "transparent",
                  color: tab === t ? "var(--fp-fg-1)" : "var(--fp-fg-3)",
                  border: "1px solid var(--fp-border-1)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {DATA.PROMPTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: 12,
                borderRadius: 9,
                marginBottom: 4,
                background:
                  selected.id === p.id ? "var(--fp-glass-4)" : "transparent",
                border:
                  "1px solid " +
                  (selected.id === p.id ? "var(--fp-border-3)" : "transparent"),
                color: "var(--fp-fg-1)",
              }}
            >
              <Badge label={p.cat} size="sm" />
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 6 }}>
                {p.title}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main style={{ padding: "32px 40px", overflowY: "auto" }}>
        <div style={{ marginBottom: 18 }}>
          <Badge label={selected.cat} />
          <h1
            style={{
              fontSize: 30,
              fontWeight: 600,
              margin: "10px 0 0",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              textWrap: "balance",
            }}
          >
            {selected.title}
          </h1>
        </div>

        {hasParams && (
          <div
            style={{
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              파라미터
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
                gap: 10,
              }}
            >
              {Object.entries(vars).map(([k, v]) => (
                <label key={k} style={{ display: "block" }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--fp-fg-4)",
                      marginBottom: 4,
                      fontFamily: "var(--fp-font-mono)",
                    }}
                  >
                    {"{" + k + "}"}
                  </div>
                  <input
                    value={v}
                    onChange={(e) =>
                      setVars((s) => ({ ...s, [k]: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      height: 34,
                      borderRadius: 8,
                      padding: "0 10px",
                      background: "var(--fp-glass-3)",
                      border: "1px solid var(--fp-border-1)",
                      color: "var(--fp-fg-1)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div className="eyebrow">PROMPT</div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(interpolated);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 7,
                  background: copied
                    ? "var(--fp-success-bg)"
                    : "var(--fp-glass-3)",
                  border:
                    "1px solid " +
                    (copied
                      ? "var(--fp-success-border)"
                      : "var(--fp-border-1)"),
                  color: copied ? "var(--fp-success)" : "var(--fp-fg-2)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {copied ? I.check : I.copy} {copied ? "복사됨!" : "복사"}
              </button>
            </div>
            <pre
              style={{
                background: "var(--fp-bg-sunken)",
                border: "1px solid var(--fp-border-1)",
                borderRadius: 10,
                padding: 16,
                margin: 0,
                fontSize: 12,
                lineHeight: 1.7,
                color: "var(--fp-fg-2)",
                fontFamily: "var(--fp-font-mono)",
                whiteSpace: "pre-wrap",
                maxHeight: 360,
                overflow: "auto",
              }}
            >
              {interpolated}
            </pre>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              예상 결과 미리보기
            </div>
            <div
              style={{
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                borderRadius: 10,
                padding: 16,
                minHeight: 260,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--fp-fg-4)",
                  fontFamily: "var(--fp-font-mono)",
                  marginBottom: 10,
                }}
              >
                FIGMA MAKE · GENERATED
              </div>
              <div
                style={{
                  aspectRatio: "9/12",
                  borderRadius: 8,
                  background: `linear-gradient(180deg, ${vars.primary || "#536DFE"}33 0%, var(--fp-glass-3) 50%)`,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: 6,
                    width: 30,
                    background: "rgba(255,255,255,0.4)",
                    borderRadius: 3,
                    marginBottom: 12,
                  }}
                />
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 8,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Welcome to {vars["브랜드명"] || "Brand"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.5,
                    marginBottom: "auto",
                  }}
                >
                  {vars["톤"] || "Tone"}…
                </div>
                <div
                  style={{
                    height: 38,
                    borderRadius: 8,
                    background: vars.primary || "#536DFE",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  시작하기
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
          <button
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 10,
              background: "var(--fp-brand-blue-accent)",
              color: "#fff",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {I.sparkles} Make에서 열기
          </button>
          <button
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 10,
              background: "var(--fp-glass-3)",
              border: "1px solid var(--fp-border-1)",
              color: "var(--fp-fg-1)",
              fontSize: 13,
            }}
          >
            v0에서 열기
          </button>
          <button
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 10,
              background: "var(--fp-glass-3)",
              border: "1px solid var(--fp-border-1)",
              color: "var(--fp-fg-1)",
              fontSize: 13,
            }}
          >
            {I.bookmark} 저장
          </button>
        </div>
      </main>
    </div>
  );
}
const { useMemo } = React;

/* ─── Bold Kiosk — masonry & filterable ──────────────────────────── */
function BoldKiosk() {
  const [tab, setTab] = useState("전체");
  const tabs = [
    "전체",
    "식음료",
    "계산기&포스",
    "뷰티",
    "안내&검색",
    "프렌차이즈",
    "모빌리티",
    "금융",
  ];
  const filtered =
    tab === "전체" ? DATA.KIOSKS : DATA.KIOSKS.filter((k) => k.cat === tab);

  return (
    <div style={{ padding: "40px 32px 60px" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            키오스크 갤러리
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            실제 운영 중인
            <br />
            키오스크 110+ 화면
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: 3,
            borderRadius: 9,
            border: "1px solid var(--fp-border-1)",
          }}
        >
          <button
            style={{
              padding: "6px 10px",
              fontSize: 12,
              borderRadius: 6,
              background: "var(--fp-glass-5)",
              border: "none",
              color: "var(--fp-fg-1)",
            }}
          >
            {I.grid} 그리드
          </button>
          <button
            style={{
              padding: "6px 10px",
              fontSize: 12,
              borderRadius: 6,
              background: "transparent",
              border: "none",
              color: "var(--fp-fg-4)",
            }}
          >
            {I.list} 목록
          </button>
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              fontSize: 13,
              background: tab === t ? "#fff" : "var(--fp-glass-2)",
              color: tab === t ? "#111" : "var(--fp-fg-3)",
              border:
                "1px solid " + (tab === t ? "#fff" : "var(--fp-border-1)"),
              fontWeight: tab === t ? 600 : 500,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ columnCount: 4, columnGap: 14 }}>
        {filtered.concat(filtered).map((k, i) => (
          <div
            key={i}
            style={{
              breakInside: "avoid",
              marginBottom: 14,
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid var(--fp-border-1)",
              background: "var(--fp-glass-2)",
              transition: "transform 200ms var(--fp-ease)",
            }}
          >
            <div
              style={{
                aspectRatio: i % 3 === 0 ? "9/16" : i % 5 === 0 ? "4/5" : "3/4",
                background: `linear-gradient(${135 + i * 7}deg, hsl(${k.hue}, 60%, 24%), hsl(${k.hue}, 70%, 12%))`,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "var(--fp-font-mono)",
                }}
              >
                {k.cat.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  textShadow: `0 0 30px hsl(${k.hue}, 100%, 60%, 0.5)`,
                }}
              >
                {k.brand}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 12,
                  right: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "var(--fp-font-mono)",
                }}
              >
                <span>{k.screens} screens</span>
                <span>{I.arrowUpRight}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Bold Community — feed with quick reactions ─────────────────── */
function BoldCommunity() {
  const [tab, setTab] = useState("전체");
  const tabs = ["전체", "소소한 꿀팁", "이벤트", "피그마버즈", "데일리콘텐츠"];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        height: "calc(100vh - 32px)",
        overflow: "hidden",
      }}
    >
      <main style={{ overflowY: "auto", padding: "32px 40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              커뮤니티
            </div>
            <h1
              style={{
                fontSize: 40,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              같이{" "}
              <span
                className="fp-display-italic"
                style={{ color: "var(--fp-fg-2)" }}
              >
                디자인
              </span>
              하는 공간
            </h1>
          </div>
          <button
            style={{
              height: 44,
              padding: "0 18px",
              borderRadius: 10,
              background: "#fff",
              color: "#111",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {I.pencil} 글쓰기
          </button>
        </div>

        {/* Inline composer */}
        <div
          style={{
            background: "var(--fp-glass-2)",
            border: "1px solid var(--fp-border-1)",
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
            display: "flex",
            gap: 12,
          }}
        >
          <Avatar name="K" size={36} />
          <div
            style={{
              flex: 1,
              padding: "10px 0",
              color: "var(--fp-fg-4)",
              fontSize: 14,
            }}
          >
            오늘 마주친 디자인 이슈를 공유해보세요…
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {["이미지", "코드", "링크"].map((t) => (
              <button
                key={t}
                style={{
                  padding: "6px 10px",
                  fontSize: 11,
                  borderRadius: 7,
                  background: "var(--fp-glass-3)",
                  border: "1px solid var(--fp-border-1)",
                  color: "var(--fp-fg-3)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "6px 12px",
                borderRadius: 9999,
                fontSize: 12,
                background: tab === t ? "var(--fp-glass-5)" : "transparent",
                color: tab === t ? "var(--fp-fg-1)" : "var(--fp-fg-3)",
                border:
                  "1px solid " +
                  (tab === t ? "var(--fp-border-3)" : "var(--fp-border-1)"),
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {DATA.POSTS.concat(DATA.POSTS).map((p, i) => (
            <article
              key={i}
              style={{
                padding: 18,
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                borderRadius: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                  lineHeight: "1.4",
                }}
              >
                <Avatar name={p.author} size={32} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {p.author}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--fp-fg-4)" }}>
                    {p.date} · <Badge label={p.cat} size="sm" />
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.45,
                  marginBottom: 12,
                }}
              >
                {p.title}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  fontSize: 12,
                  color: "var(--fp-fg-4)",
                }}
              >
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--fp-fg-3)",
                    padding: "4px 8px",
                    borderRadius: 7,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                  }}
                >
                  {I.thumbsUp} {p.likes}
                </button>
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--fp-fg-3)",
                    padding: "4px 8px",
                    borderRadius: 7,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                  }}
                >
                  {I.message} {p.replies}
                </button>
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--fp-fg-3)",
                    padding: "4px 8px",
                    borderRadius: 7,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                  }}
                >
                  {I.bookmark}
                </button>
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--fp-fg-3)",
                    padding: "4px 8px",
                    borderRadius: 7,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    marginLeft: "auto",
                  }}
                >
                  {I.sparkles} AI 요약
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      <aside
        style={{
          borderLeft: "1px solid var(--fp-border-1)",
          padding: 20,
          overflow: "auto",
        }}
      >
        <div style={{ marginBottom: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            이번 주 활발한 디자이너
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "@figma_tutor",
              "@bibibi_designer",
              "@kimdae",
              "@siwon_designer",
            ].map((u, i) => (
              <div
                key={u}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <Avatar name={u} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u}</div>
                  <div style={{ fontSize: 11, color: "var(--fp-fg-4)" }}>
                    {12 - i * 2}개 글 · {45 - i * 8}개 답글
                  </div>
                </div>
                <button
                  style={{
                    padding: "5px 11px",
                    fontSize: 11,
                    borderRadius: 9999,
                    background: "var(--fp-glass-3)",
                    border: "1px solid var(--fp-border-1)",
                    color: "var(--fp-fg-2)",
                  }}
                >
                  팔로우
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            오픈 이벤트
          </div>
          <div
            style={{
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <Badge label="이벤트" size="sm" />
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginTop: 8,
                lineHeight: 1.4,
              }}
            >
              4월 디자인 시스템 스터디 — 모집 중
            </div>
            <div
              style={{ fontSize: 12, color: "var(--fp-fg-3)", marginTop: 6 }}
            >
              주 1회, 줌 · 정원 12명
            </div>
            <button
              style={{
                width: "100%",
                marginTop: 12,
                height: 36,
                borderRadius: 9,
                background: "var(--fp-brand-blue-accent)",
                color: "#fff",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              참여하기
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ─── Bold UXUI — magazine layout ─────────────────────────────────── */
function BoldUXUI() {
  return (
    <div
      style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 60px" }}
    >
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div
          className="eyebrow fp-rise"
          style={{
            marginBottom: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{ width: 24, height: 1, background: "var(--fp-border-3)" }}
          />
          UXUI · EDITORIAL
          <span
            style={{ width: 24, height: 1, background: "var(--fp-border-3)" }}
          />
        </div>
        <h1
          style={{
            fontSize: "clamp(40px, 5.5vw, 64px)",
            fontWeight: 600,
            letterSpacing: "-0.035em",
            margin: 0,
            lineHeight: 1.05,
            textWrap: "balance",
          }}
        >
          디자이너의{" "}
          <span
            className="fp-display-italic"
            style={{ color: "var(--fp-fg-2)" }}
          >
            사고법
          </span>
          ,<br />
          <span className="fp-aurora-text">지식으로부터</span>.
        </h1>
      </div>

      {/* Hero feature */}
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            aspectRatio: "21/9",
            borderRadius: 18,
            background: "linear-gradient(135deg, #1f3dbc 0%, #050510 70%)",
            position: "relative",
            overflow: "hidden",
            border: "1px solid var(--fp-border-2)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 25% 50%, rgba(83,109,254,0.5), transparent 50%), radial-gradient(circle at 75% 30%, rgba(168,85,247,0.4), transparent 50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "clamp(24px, 4vw, 60px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                fontFamily: "var(--fp-font-mono)",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 12,
              }}
            >
              FEATURED · 26.03.15 · 18분
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.025em",
                margin: 0,
                lineHeight: 1.1,
                maxWidth: 700,
              }}
            >
              Variables 2.0 — 토큰 설계의 모든 것
            </h2>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                marginTop: 12,
                maxWidth: 500,
              }}
            >
              모드, 별칭, 컬렉션 그리고 라이브러리 게시까지.
            </div>
          </div>
        </div>
      </a>

      {/* Article grid - asymmetric */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}
      >
        {DATA.ARTICLES.concat(DATA.ARTICLES).map((a, i) => (
          <a
            key={i}
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              padding: 20,
              borderRadius: 16,
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
            }}
          >
            <div
              style={{
                aspectRatio: "16/9",
                borderRadius: 10,
                background: `linear-gradient(${135 + i * 30}deg, ${["#536DFE", "#a855f7", "#22c55e", "#f97316", "#ec4899", "#06b6d4"][i % 6]}55, var(--fp-glass-3))`,
                marginBottom: 14,
              }}
            />
            <div
              style={{
                fontFamily: "var(--fp-font-mono)",
                fontSize: 11,
                color: "var(--fp-fg-4)",
                letterSpacing: "0.05em",
              }}
            >
              {(i + 1).toString().padStart(2, "0")} · {a.cat.toUpperCase()}
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.35,
                margin: "8px 0 8px",
                letterSpacing: "-0.015em",
              }}
            >
              {a.title}
            </h3>
            <div style={{ fontSize: 12, color: "var(--fp-fg-4)" }}>
              {a.date} · {a.read} 읽기
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─── Bold Resources — bento ──────────────────────────────────────── */
function BoldResources() {
  return (
    <div
      style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 60px" }}
    >
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          피그마 리소스
        </div>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          바로 받아 쓰는{" "}
          <span
            className="fp-display-italic"
            style={{ color: "var(--fp-fg-2)" }}
          >
            템플릿
          </span>
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gridAutoRows: "minmax(180px, auto)",
          gap: 14,
        }}
      >
        {DATA.RESOURCES.map((r, i) => {
          const big = i === 0;
          const c = ["#536DFE", "#a855f7", "#10b981", "#f97316"][i % 4];
          return (
            <a
              key={r.id}
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                gridColumn: big ? "span 2" : "span 1",
                gridRow: big ? "span 2" : "span 1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: big ? 32 : 20,
                borderRadius: 18,
                background: `linear-gradient(135deg, ${c}33, ${c}08), var(--fp-glass-2)`,
                border: "1px solid " + c + "33",
                textDecoration: "none",
                color: "inherit",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: c + "33",
                  filter: "blur(40px)",
                }}
              />
              <div style={{ position: "relative" }}>
                <Badge label={r.cat} size="sm" />
                <div
                  style={{
                    fontSize: big ? 28 : 18,
                    fontWeight: 700,
                    marginTop: 12,
                    lineHeight: 1.25,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {r.title}
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 16,
                  fontSize: 12,
                  color: "var(--fp-fg-3)",
                }}
              >
                <span>
                  {I.download} {r.downloads}회
                </span>
                <span style={{ fontSize: 16 }}>{I.arrowUpRight}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, {
  BoldPrompt,
  BoldKiosk,
  BoldCommunity,
  BoldUXUI,
  BoldResources,
});
