/* global React, I, Badge, Avatar, Kbd, HeroWave, useTypewriter, DATA, AISummary */
const { useState, useEffect, useRef, useMemo } = React;

/* ════════════════════════════════════════════════════════════════════
   BOLD — AI-first command palette interface, daring layouts
   ════════════════════════════════════════════════════════════════════ */

/* ─── Bold Sidebar (rail nav) ─────────────────────────────────────── */
function BoldRail({ active, onNav }) {
  const items = [
    { id: "home", label: "홈", icon: I.spark },
    { id: "info", label: "피그마 정보", icon: I.layers },
    { id: "prompt", label: "프롬프트", icon: I.sparkles },
    { id: "kiosk", label: "키오스크", icon: I.grid },
    { id: "community", label: "커뮤니티", icon: I.message },
    { id: "uxui", label: "UXUI", icon: I.hash },
    { id: "resources", label: "리소스", icon: I.download },
  ];

  return (
    <aside
      style={{
        position: "sticky",
        top: 16,
        height: "calc(100vh - 32px)",
        width: 76,
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        borderRight: "1px solid var(--fp-border-1)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--fp-brand-blue-accent)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 18,
          marginBottom: 12,
        }}
      >
        F
      </div>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onNav?.(it.id)}
          title={it.label}
          style={{
            width: 56,
            padding: "10px 0",
            borderRadius: 12,
            border: "none",
            background: active === it.id ? "var(--fp-glass-5)" : "transparent",
            color: active === it.id ? "var(--fp-fg-1)" : "var(--fp-fg-4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            fontWeight: 500,
            transition: "all 200ms var(--fp-ease)",
          }}
        >
          <span style={{ fontSize: 18 }}>{it.icon}</span>
          {it.label}
        </button>
      ))}
      <div style={{ marginTop: "auto" }}>
        <button
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--fp-glass-3)",
            border: "1px solid var(--fp-border-1)",
            color: "var(--fp-fg-3)",
          }}
        >
          {I.user}
        </button>
      </div>
    </aside>
  );
}

/* ─── Bold Home — Conversation-first hero ─────────────────────────── */
function BoldHome({ density, onNav }) {
  const [conversation, setConversation] = useState([]);
  const [query, setQuery] = useState("");
  const [thinking, setThinking] = useState(false);
  const placeholder = useTypewriter(
    [
      "오토 레이아웃 패딩과 갭 차이가 뭔가요?",
      "Variables로 다크모드 만드는 법 알려줘",
      "Component 2.0 슬롯이 뭔지 설명해줘",
    ],
    60,
    1200,
  );

  function ask(q) {
    if (!q?.trim()) return;
    setConversation((c) => [...c, { role: "user", text: q }]);
    setQuery("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setConversation((c) => [
        ...c,
        {
          role: "ai",
          text: "오토 레이아웃은 자식 요소를 자동 정렬·간격 조정합니다. 패딩(Padding)은 컨테이너의 안쪽 여백, 갭(Gap)은 자식 요소 사이의 간격이에요. 두 값은 독립적으로 조절되고, Min/Max width와 함께 쓰면 반응형 컴포넌트의 기반이 됩니다.",
          sources: [
            { title: "오토 레이아웃 기초 가이드", cat: "실무 Q&A" },
            { title: "Min/Max width 활용 패턴 5가지", cat: "실무 Q&A" },
            { title: "Auto Layout — 처음부터 끝까지", cat: "Figma A to Z" },
          ],
        },
      ]);
    }, 1100);
  }

  return (
    <div
      className="fp-grain"
      style={{
        position: "relative",
        minHeight: "calc(100vh - 32px)",
        overflow: "hidden",
      }}
    >
      <div
        className="fp-mesh"
        style={{
          position: "absolute",
          inset: 0,
          height: 720,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          height: 720,
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <HeroWave height={720} intensity={0.9} hue={235} />
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 60,
          right: -10,
          fontFamily: "var(--fp-font-display)",
          fontStyle: "italic",
          fontSize: 240,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.07)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        9,420
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: 960,
          margin: "0 auto",
          padding: "72px 24px 100px",
        }}
      >
        {conversation.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div
              className="fp-rise"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 9999,
                background: "rgba(83,109,254,0.08)",
                border: "1px solid rgba(83,109,254,0.22)",
                fontSize: 11,
                color: "var(--fp-brand-blue-accent)",
                marginBottom: 28,
                fontFamily: "var(--fp-font-mono)",
                letterSpacing: "0.08em",
              }}
            >
              <span
                className="fp-pulse-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--fp-brand-blue-accent)",
                  display: "inline-block",
                }}
              />
              FIGMAPEDIA · GEMINI 2.5 × 9,420 ANSWERS
            </div>
            <h1
              className="fp-rise fp-rise-1"
              style={{
                fontSize: "clamp(48px, 8.4vw, 92px)",
                fontWeight: 700,
                lineHeight: 0.98,
                letterSpacing: "-0.045em",
                margin: "0 0 32px",
                textWrap: "balance",
              }}
            >
              <span style={{ display: "block", color: "var(--fp-fg-1)" }}>
                디자인과 AI 팁,
              </span>
              <span style={{ display: "block", marginTop: 6 }}>
                <span
                  className="fp-display-italic"
                  style={{
                    fontSize: "1.1em",
                    letterSpacing: "-0.03em",
                    color: "var(--fp-fg-2)",
                  }}
                >
                  그냥
                </span>{" "}
                <span className="fp-aurora-text" style={{ fontWeight: 700 }}>
                  물어보세요
                </span>
                <span style={{ color: "var(--fp-fg-1)" }}>.</span>
              </span>
            </h1>
            <p
              className="fp-rise fp-rise-2"
              style={{
                fontSize: 17,
                color: "var(--fp-fg-3)",
                margin: "0 auto 40px",
                lineHeight: 1.65,
                maxWidth: 520,
                textWrap: "balance",
              }}
            >
              현직 디자이너가 검수한{" "}
              <span style={{ color: "var(--fp-fg-1)", fontWeight: 600 }}>
                9,420개 답변
              </span>
              으로 학습한 AI가 —{" "}
              <span
                className="fp-display-italic"
                style={{ color: "var(--fp-fg-2)" }}
              >
                출처와 함께
              </span>{" "}
              답변합니다.
            </p>
          </div>
        )}

        {/* Conversation thread */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            marginBottom: 30,
          }}
        >
          {conversation.map((m, i) =>
            m.role === "user" ? (
              <div
                key={i}
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "80%",
                  padding: "12px 18px",
                  borderRadius: "18px 18px 4px 18px",
                  background: "var(--fp-brand-blue-accent)",
                  color: "#fff",
                  fontSize: 15,
                  lineHeight: 1.5,
                }}
              >
                {m.text}
              </div>
            ) : (
              <div key={i} style={{ alignSelf: "stretch" }}>
                <AISummary
                  answer={m.text}
                  sources={m.sources}
                  onCopy={() => {}}
                />
              </div>
            ),
          )}
          {thinking && (
            <div
              style={{
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                borderRadius: "18px 18px 18px 4px",
                background: "var(--fp-glass-3)",
                border: "1px solid var(--fp-border-1)",
              }}
            >
              <div className="bold-typing">
                <span />
                <span />
                <span />
              </div>
              <span style={{ fontSize: 13, color: "var(--fp-fg-3)" }}>
                9,420개 답변과 결합 중…
              </span>
            </div>
          )}
        </div>

        {/* Conversational input — pinned at center initially, naturally scrolls */}
        <div
          style={{
            position: "sticky",
            bottom: 24,
            zIndex: 5,
            padding: 4,
            borderRadius: 22,
            background:
              "linear-gradient(135deg, rgba(83,109,254,0.6), rgba(168,85,247,0.4) 50%, rgba(236,72,153,0.4))",
            boxShadow:
              "0 30px 80px -20px rgba(83,109,254,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              borderRadius: 19,
              background: "rgba(8,8,18,0.92)",
              backdropFilter: "blur(20px)",
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {[
                { l: "AI 검색", a: true },
                { l: "키워드 검색" },
                { l: "이미지로 찾기" },
                { l: "코드 변환" },
              ].map((m) => (
                <button
                  key={m.l}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 9999,
                    fontSize: 12,
                    background: m.a
                      ? "rgba(83,109,254,0.20)"
                      : "var(--fp-glass-2)",
                    border:
                      "1px solid " +
                      (m.a ? "rgba(83,109,254,0.40)" : "var(--fp-border-1)"),
                    color: m.a
                      ? "var(--fp-brand-blue-accent)"
                      : "var(--fp-fg-3)",
                  }}
                >
                  {m.l}
                </button>
              ))}
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(query);
                }
              }}
              placeholder={`${placeholder}`}
              rows={1}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--fp-fg-1)",
                fontSize: 16,
                resize: "none",
                padding: "8px 0",
                fontFamily: "inherit",
                letterSpacing: "inherit",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    color: "var(--fp-fg-4)",
                  }}
                >
                  {I.command} K
                </span>
                <span style={{ fontSize: 11, color: "var(--fp-fg-4)" }}>·</span>
                <span style={{ fontSize: 11, color: "var(--fp-fg-4)" }}>
                  Shift+Enter 줄바꿈
                </span>
              </div>
              <button
                onClick={() => ask(query)}
                disabled={!query.trim()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: "none",
                  background: query.trim()
                    ? "var(--fp-brand-blue-accent)"
                    : "var(--fp-glass-3)",
                  color: query.trim() ? "#fff" : "var(--fp-fg-4)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  cursor: query.trim() ? "pointer" : "not-allowed",
                }}
              >
                {I.send}
              </button>
            </div>
          </div>
        </div>

        {/* Quick prompt chips */}
        {conversation.length === 0 && (
          <div style={{ marginTop: 28 }}>
            <div
              className="eyebrow"
              style={{ textAlign: "center", marginBottom: 14 }}
            >
              지금 사람들이 묻고 있는 질문
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 10,
              }}
            >
              {[
                {
                  q: "Variables 2.0의 모드는 어떻게 설계해야 하나요?",
                  t: "베리어블",
                },
                {
                  q: "Component 인스턴스 스왑이 갑자기 안 돼요",
                  t: "컴포넌트",
                },
                { q: "Make로 와이어프레임 한 장 만들어줘", t: "프롬프트" },
                {
                  q: "Liquid Glass 토큰을 우리 시스템에 적용하려면?",
                  t: "베리어블",
                },
                {
                  q: "Auto Layout v3와 v2의 차이가 뭔가요?",
                  t: "오토 레이아웃",
                },
                { q: "Smart Animate 끊김 현상 해결 방법", t: "프로토타이핑" },
              ].map((c) => (
                <button
                  key={c.q}
                  onClick={() => ask(c.q)}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "var(--fp-glass-2)",
                    border: "1px solid var(--fp-border-1)",
                    color: "var(--fp-fg-2)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      marginTop: 2,
                      color: "var(--fp-brand-blue-accent)",
                    }}
                  >
                    {I.sparkles}
                  </span>
                  <span style={{ flex: 1 }}>
                    {c.q}
                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: 11,
                        color: "var(--fp-fg-4)",
                      }}
                    >
                      · {c.t}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories — bento grid */}
        {conversation.length === 0 && (
          <div style={{ marginTop: 60 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              혹은 직접 둘러보기
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                gridTemplateRows: "180px 180px",
                gap: 12,
              }}
            >
              {/* Big tile - Q&A */}
              <button
                onClick={() => onNav?.("info")}
                style={{
                  gridColumn: "span 1",
                  gridRow: "span 2",
                  padding: 24,
                  borderRadius: 18,
                  background:
                    "linear-gradient(135deg, rgba(83,109,254,0.20), rgba(83,109,254,0.04))",
                  border: "1px solid rgba(83,109,254,0.30)",
                  color: "var(--fp-fg-1)",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "rgba(83,109,254,0.20)",
                    filter: "blur(40px)",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--fp-brand-blue-accent)",
                      fontFamily: "var(--fp-font-mono)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    01 / INFO
                  </div>
                  <h3
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      margin: "8px 0 4px",
                      lineHeight: 1.05,
                    }}
                  >
                    실무 Q&A
                    <br />
                    그리고 단축키
                  </h3>
                </div>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    fontSize: 12,
                    color: "var(--fp-fg-3)",
                  }}
                >
                  <span>560+ 항목 · 매주 업데이트</span>
                  <span style={{ fontSize: 22 }}>{I.arrowUpRight}</span>
                </div>
              </button>

              {[
                { id: "prompt", t: "프롬프트", n: "142", c: "#a855f7" },
                { id: "kiosk", t: "키오스크", n: "110+", c: "#f97316" },
                { id: "community", t: "커뮤니티", n: "1.2k", c: "#ec4899" },
                { id: "uxui", t: "UXUI", n: "320", c: "#22c55e" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => onNav?.(c.id)}
                  style={{
                    padding: 20,
                    borderRadius: 16,
                    background: "var(--fp-glass-2)",
                    border: "1px solid var(--fp-border-1)",
                    color: "var(--fp-fg-1)",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: c.c + "33",
                      filter: "blur(24px)",
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {c.t}
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: c.c,
                        fontFamily: "var(--fp-font-mono)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {c.n}
                    </span>
                    <span style={{ fontSize: 16, color: "var(--fp-fg-4)" }}>
                      {I.arrowRight}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Bold Info — Three-pane: list/details/sidekick ─────────────── */
function BoldInfo({ density }) {
  const [tab, setTab] = useState("qa");
  const [selected, setSelected] = useState(DATA.QA_ITEMS[0]);
  const [filter, setFilter] = useState("");

  const tabs = [
    { id: "qa", label: "Q&A", n: 214 },
    { id: "term", label: "용어", n: 132 },
    { id: "shortcut", label: "단축키", n: 86 },
    { id: "plugin", label: "플러그인", n: 42 },
  ];

  const filtered = DATA.QA_ITEMS.filter(
    (q) => !filter || q.title.includes(filter) || q.cat.includes(filter),
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 280px",
        height: "calc(100vh - 32px)",
        overflow: "hidden",
      }}
    >
      {/* Pane 1 — list */}
      <div
        style={{
          borderRight: "1px solid var(--fp-border-1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 18px 14px",
            borderBottom: "1px solid var(--fp-border-1)",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            피그마 정보
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            실무에서 막히는{" "}
            <span
              className="fp-display-italic"
              style={{ color: "var(--fp-fg-2)" }}
            >
              모든 것
            </span>
          </h2>
          <div style={{ position: "relative", marginTop: 12 }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--fp-fg-4)",
                fontSize: 14,
              }}
            >
              {I.search}
            </span>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="필터…"
              style={{
                width: "100%",
                height: 38,
                borderRadius: 9,
                padding: "0 12px 0 36px",
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                color: "var(--fp-fg-1)",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: "6px 4px",
                  fontSize: 12,
                  borderRadius: 7,
                  background:
                    tab === t.id ? "var(--fp-glass-5)" : "transparent",
                  color: tab === t.id ? "var(--fp-fg-1)" : "var(--fp-fg-3)",
                  border:
                    "1px solid " +
                    (tab === t.id ? "var(--fp-border-3)" : "transparent"),
                }}
              >
                {t.label}
                <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>
                  {t.n}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {filtered.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelected(q)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 9,
                marginBottom: 4,
                background:
                  selected.id === q.id ? "var(--fp-glass-4)" : "transparent",
                border: "none",
                color: "var(--fp-fg-1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <Badge label={q.cat} size="sm" />
                {q.shortcut && <Kbd>{q.shortcut}</Kbd>}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: "var(--fp-fg-1)",
                }}
              >
                {q.title}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--fp-fg-4)", marginTop: 4 }}
              >
                {q.author} · {q.views || "—"} 조회
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pane 2 — detail */}
      <div style={{ overflowY: "auto", padding: "32px 40px" }}>
        <div style={{ marginBottom: 20 }}>
          <Badge label={selected.cat} />
          <h1
            style={{
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: "10px 0 16px",
              lineHeight: 1.15,
              textWrap: "balance",
            }}
          >
            {selected.title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: "var(--fp-fg-4)",
            }}
          >
            <Avatar name={selected.author} size={20} />
            <span>{selected.author}</span>
            <span>·</span>
            <span>{selected.date}</span>
            <span>·</span>
            <span>{selected.read} 읽기</span>
            <span>·</span>
            <span>
              {I.eye} {selected.views}
            </span>
          </div>
        </div>

        <AISummary
          answer={`${selected.title} 핵심 요약 — ${selected.preview || "패딩과 갭은 독립적으로 조절되며, 함께 쓰면 반응형 컴포넌트의 기반이 됩니다."}`}
          sources={[
            { title: "본문 1~3단락", cat: "이 문서" },
            { title: "관련 Q&A", cat: "추천" },
          ]}
          onCopy={() => {}}
        />

        <div
          style={{
            marginTop: 24,
            fontSize: 15,
            lineHeight: 1.8,
            color: "var(--fp-fg-2)",
          }}
        >
          <p>
            {selected.preview ||
              "오토 레이아웃은 자식 요소를 자동 정렬·간격 조정하는 컨테이너 기능입니다."}
          </p>
          <h2
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: "var(--fp-fg-1)",
              margin: "28px 0 10px",
              letterSpacing: "-0.015em",
            }}
          >
            핵심 한 장
          </h2>
          <div
            style={{
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
              borderRadius: 12,
              padding: 24,
              display: "flex",
              justifyContent: "center",
              margin: "12px 0",
            }}
          >
            <svg viewBox="0 0 320 180" style={{ width: "100%", maxWidth: 380 }}>
              <rect
                x="10"
                y="20"
                width="300"
                height="140"
                rx="8"
                fill="none"
                stroke="var(--fp-brand-blue-accent)"
                strokeDasharray="4 4"
              />
              <rect
                x="40"
                y="50"
                width="70"
                height="80"
                rx="4"
                fill="rgba(83,109,254,0.18)"
                stroke="var(--fp-brand-blue-accent)"
              />
              <rect
                x="125"
                y="50"
                width="70"
                height="80"
                rx="4"
                fill="rgba(83,109,254,0.18)"
                stroke="var(--fp-brand-blue-accent)"
              />
              <rect
                x="210"
                y="50"
                width="70"
                height="80"
                rx="4"
                fill="rgba(83,109,254,0.18)"
                stroke="var(--fp-brand-blue-accent)"
              />
            </svg>
          </div>
          <h2
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: "var(--fp-fg-1)",
              margin: "28px 0 10px",
            }}
          >
            실무 팁
          </h2>
          <ul style={{ paddingLeft: 20 }}>
            <li>음수 갭이 안 될 때는 Negative spacing 토글</li>
            <li>스트로크 외부 정렬은 시각적 간격을 만든다</li>
          </ul>
        </div>
      </div>

      {/* Pane 3 — AI sidekick */}
      <div
        style={{
          borderLeft: "1px solid var(--fp-border-1)",
          padding: "20px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          overflow: "auto",
          background: "rgba(83,109,254,0.02)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--fp-brand-blue-accent)",
              marginBottom: 10,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {I.sparkles} 이 문서로 묻기
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "한 줄로 요약해줘",
              "초보자에게 설명해줘",
              "비슷한 케이스가 있나요?",
              "실수하기 쉬운 점은?",
            ].map((p) => (
              <button
                key={p}
                style={{
                  textAlign: "left",
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: "var(--fp-glass-2)",
                  border: "1px solid var(--fp-border-1)",
                  color: "var(--fp-fg-2)",
                  fontSize: 12,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            관련 문서
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DATA.QA_ITEMS.slice(2, 6).map((q) => (
              <button
                key={q.id}
                onClick={() => setSelected(q)}
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderRadius: 8,
                  background: "transparent",
                  border: "1px solid var(--fp-border-1)",
                  color: "var(--fp-fg-2)",
                  fontSize: 12,
                  lineHeight: 1.4,
                }}
              >
                {q.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            이 문서를 읽은 사람
          </div>
          <div style={{ display: "flex", marginLeft: 4 }}>
            {DATA.QA_ITEMS.slice(0, 5).map((_, i) => (
              <span key={i} style={{ marginLeft: -6 }}>
                <Avatar name={"abcde"[i]} size={26} />
              </span>
            ))}
            <span
              style={{
                marginLeft: 6,
                fontSize: 12,
                color: "var(--fp-fg-4)",
                alignSelf: "center",
              }}
            >
              + 432명
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BoldRail, BoldHome, BoldInfo });
