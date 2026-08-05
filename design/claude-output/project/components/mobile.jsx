/* global React, I, Badge, Avatar, Kbd, HeroWave, AISummary, DATA */

/* ─── Mobile shell — phone chrome shared by all screens ──────── */
function MobileChrome({ title, children, activeTab = "home" }) {
  return (
    <div className="mobile-frame">
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--fp-bg-base)",
        }}
      >
        {/* status bar */}
        <div
          style={{
            height: 28,
            padding: "8px 18px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "var(--fp-fg-2)",
            fontWeight: 600,
          }}
        >
          <span>9:41</span>
          <span style={{ display: "inline-flex", gap: 4, fontSize: 10 }}>
            ● ● ●
          </span>
        </div>
        {/* top app bar */}
        <div
          style={{
            padding: "8px 16px 10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--fp-border-1)",
          }}
        >
          <div
            style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            {title}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                color: "var(--fp-fg-3)",
                fontSize: 13,
              }}
            >
              {I.search}
            </button>
            <button
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                color: "var(--fp-fg-3)",
                fontSize: 13,
              }}
            >
              {I.user}
            </button>
          </div>
        </div>
        {/* page */}
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
        {/* bottom tab bar */}
        <div
          style={{
            padding: "8px 12px 18px",
            borderTop: "1px solid var(--fp-border-1)",
            display: "flex",
            justifyContent: "space-around",
            background: "rgba(5,5,16,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          {[
            { id: "home", i: I.spark, l: "홈" },
            { id: "info", i: I.layers, l: "정보" },
            { id: "ask", i: I.sparkles, l: "AI" },
            { id: "comm", i: I.message, l: "커뮤" },
            { id: "me", i: I.user, l: "마이" },
          ].map((t) => {
            const active = activeTab === t.id;
            const center = t.id === "ask";
            if (center)
              return (
                <button
                  key={t.id}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    marginTop: -16,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "linear-gradient(135deg,#536DFE,#a855f7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 18,
                      boxShadow: "0 10px 30px -10px rgba(83,109,254,0.7)",
                    }}
                  >
                    {I.sparkles}
                  </div>
                </button>
              );
            return (
              <button
                key={t.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  background: "transparent",
                  border: "none",
                  color: active ? "var(--fp-fg-1)" : "var(--fp-fg-4)",
                  fontSize: 9,
                  padding: "4px 6px",
                }}
              >
                <span style={{ fontSize: 17 }}>{t.i}</span>
                {t.l}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile · 정보 (Q&A reader, AI sheet) ─────────────────── */
function MobileInfo() {
  const tabs = ["Q&A", "용어", "단축키", "플러그인"];
  return (
    <MobileChrome title="AI 및 피그마 정보" activeTab="info">
      <div style={{ padding: "14px 16px 0" }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            margin: "0 0 4px",
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
        <div style={{ fontSize: 12, color: "var(--fp-fg-4)" }}>
          560+ 항목 · 매주 업데이트
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 14,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {tabs.map((t, i) => (
            <button
              key={t}
              style={{
                padding: "6px 12px",
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: i === 0 ? 600 : 500,
                background: i === 0 ? "var(--fp-fg-1)" : "var(--fp-glass-2)",
                color: i === 0 ? "var(--fp-bg-base)" : "var(--fp-fg-3)",
                border:
                  "1px solid " +
                  (i === 0 ? "var(--fp-fg-1)" : "var(--fp-border-1)"),
                whiteSpace: "nowrap",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Featured AI summary card */}
      <div style={{ padding: "16px 16px 0" }}>
        <div
          style={{
            padding: 2,
            borderRadius: 14,
            background:
              "linear-gradient(135deg, rgba(83,109,254,0.5), rgba(168,85,247,0.4))",
          }}
        >
          <div
            style={{
              borderRadius: 12,
              background: "rgba(8,8,18,0.92)",
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                fontFamily: "var(--fp-font-mono)",
                color: "var(--fp-brand-blue-accent)",
                marginBottom: 8,
              }}
            >
              <span
                className="fp-pulse-dot"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--fp-brand-blue-accent)",
                }}
              />
              AI · 오늘의 요약
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--fp-fg-2)",
                lineHeight: 1.55,
              }}
            >
              오토 레이아웃의 패딩과 갭은 독립적이며, Min/Max width와 함께 쓰면
              반응형 컴포넌트의 기반이 됩니다.
            </div>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
              }}
            >
              {["오토 레이아웃 기초", "Min/Max 패턴", "Auto Layout A→Z"].map(
                (s) => (
                  <span
                    key={s}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 9999,
                      fontSize: 10,
                      background: "var(--fp-glass-3)",
                      border: "1px solid var(--fp-border-1)",
                      color: "var(--fp-fg-3)",
                    }}
                  >
                    {s}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article list */}
      <div
        style={{
          padding: "16px 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {DATA.QA_ITEMS.slice(0, 5).map((q) => (
          <div
            key={q.id}
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <Badge label={q.cat} size="sm" />
              {q.shortcut && <Kbd>{q.shortcut}</Kbd>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
              {q.title}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--fp-fg-4)",
                marginTop: 5,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {q.author} · {q.read} 읽기
              </span>
              <span>
                {I.eye} {q.views}
              </span>
            </div>
          </div>
        ))}
      </div>
    </MobileChrome>
  );
}

/* ─── Mobile · 프롬프트 ─────────────────────────────────────── */
function MobilePrompt() {
  const p = DATA.PROMPTS[0];
  return (
    <MobileChrome title="피그마 정보" activeTab="home">
      <div style={{ padding: "16px 16px 0" }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          플레이그라운드
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          <span
            className="fp-display-italic"
            style={{ color: "var(--fp-fg-2)" }}
          >
            프롬프트
          </span>
          를<br />
          바로 실험하기
        </h2>
      </div>

      {/* horizontal categories */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "14px 16px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {["전체", "한글자연어", "영문자연어", "JSON", "파라미터형", "코드"].map(
          (t, i) => (
            <button
              key={t}
              style={{
                padding: "6px 11px",
                borderRadius: 9999,
                fontSize: 11,
                background: i === 0 ? "var(--fp-glass-5)" : "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                color: i === 0 ? "var(--fp-fg-1)" : "var(--fp-fg-3)",
                whiteSpace: "nowrap",
              }}
            >
              {t}
            </button>
          ),
        )}
      </div>

      {/* selected prompt card */}
      <div style={{ padding: "0 16px" }}>
        <div
          style={{
            borderRadius: 14,
            border: "1px solid var(--fp-border-2)",
            background: "var(--fp-glass-2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 14,
              borderBottom: "1px solid var(--fp-border-1)",
            }}
          >
            <Badge label={p.cat} size="sm" />
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginTop: 6,
                lineHeight: 1.35,
              }}
            >
              {p.title}
            </div>
          </div>
          <pre
            style={{
              margin: 0,
              padding: 14,
              fontSize: 11,
              lineHeight: 1.65,
              color: "var(--fp-fg-2)",
              fontFamily: "var(--fp-font-mono)",
              whiteSpace: "pre-wrap",
              maxHeight: 200,
              overflow: "auto",
              background: "var(--fp-bg-sunken)",
            }}
          >
            {p.body}
          </pre>
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: 10,
              borderTop: "1px solid var(--fp-border-1)",
            }}
          >
            <button
              style={{
                flex: 1,
                height: 36,
                borderRadius: 9,
                background: "var(--fp-brand-blue-accent)",
                color: "#fff",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              {I.copy} 복사
            </button>
            <button
              style={{
                flex: 1,
                height: 36,
                borderRadius: 9,
                background: "var(--fp-glass-3)",
                border: "1px solid var(--fp-border-1)",
                color: "var(--fp-fg-1)",
                fontSize: 12,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              {I.sparkles} Make
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 24px" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          비슷한 프롬프트
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DATA.PROMPTS.slice(1, 4).map((pp) => (
            <div
              key={pp.id}
              style={{
                padding: 12,
                borderRadius: 11,
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
              }}
            >
              <Badge label={pp.cat} size="sm" />
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  marginTop: 6,
                  lineHeight: 1.4,
                }}
              >
                {pp.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileChrome>
  );
}

/* ─── Mobile · 키오스크 (gallery, 2-col) ───────────────────── */
function MobileKiosk() {
  return (
    <MobileChrome title="키오스크" activeTab="home">
      <div style={{ padding: "14px 16px 0" }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          운영 중인{" "}
          <span
            className="fp-display-italic"
            style={{ color: "var(--fp-fg-2)" }}
          >
            키오스크
          </span>
        </h2>
        <div style={{ fontSize: 12, color: "var(--fp-fg-4)", marginTop: 4 }}>
          110+ 화면 · 8개 업종
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "12px 16px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {[
          "전체",
          "식음료",
          "계산기&포스",
          "뷰티",
          "안내&검색",
          "프렌차이즈",
          "모빌리티",
        ].map((t, i) => (
          <button
            key={t}
            style={{
              padding: "6px 11px",
              borderRadius: 9999,
              fontSize: 11,
              background: i === 0 ? "#fff" : "var(--fp-glass-2)",
              color: i === 0 ? "#111" : "var(--fp-fg-3)",
              border: "1px solid " + (i === 0 ? "#fff" : "var(--fp-border-1)"),
              whiteSpace: "nowrap",
              fontWeight: i === 0 ? 600 : 500,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "0 12px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {DATA.KIOSKS.concat(DATA.KIOSKS)
          .slice(0, 10)
          .map((k, i) => (
            <div
              key={i}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--fp-border-1)",
              }}
            >
              <div
                style={{
                  aspectRatio: i % 3 === 0 ? "4/5" : "3/4",
                  background: `linear-gradient(${135 + i * 23}deg, hsl(${k.hue}, 60%, 28%), hsl(${k.hue}, 70%, 12%))`,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    textShadow: `0 0 18px hsl(${k.hue}, 100%, 60%, 0.5)`,
                  }}
                >
                  {k.brand}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 6,
                    left: 8,
                    fontSize: 8,
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "var(--fp-font-mono)",
                  }}
                >
                  {k.cat.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
      </div>
    </MobileChrome>
  );
}

/* ─── Mobile · 커뮤니티 (feed) ───────────────────────────── */
function MobileCommunity() {
  return (
    <MobileChrome title="커뮤니티" activeTab="comm">
      <div style={{ padding: "14px 16px 0" }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            margin: 0,
            lineHeight: 1.15,
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
        </h2>
      </div>

      {/* compose chip */}
      <div style={{ padding: "12px 16px" }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            padding: 10,
            borderRadius: 12,
            background: "var(--fp-glass-2)",
            border: "1px solid var(--fp-border-1)",
          }}
        >
          <Avatar name="K" size={28} />
          <div style={{ flex: 1, fontSize: 12, color: "var(--fp-fg-4)" }}>
            오늘 마주친 디자인 이슈를…
          </div>
          <button
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--fp-brand-blue-accent)",
              color: "#fff",
              border: "none",
              fontSize: 13,
            }}
          >
            {I.pencil}
          </button>
        </div>
      </div>

      {/* tag chips */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "0 16px 12px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {["전체", "꿀팁", "이벤트", "피그마버즈", "데일리"].map((t, i) => (
          <button
            key={t}
            style={{
              padding: "5px 10px",
              borderRadius: 9999,
              fontSize: 11,
              background: i === 0 ? "var(--fp-glass-5)" : "transparent",
              border: "1px solid var(--fp-border-1)",
              color: i === 0 ? "var(--fp-fg-1)" : "var(--fp-fg-3)",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* posts */}
      <div
        style={{
          padding: "0 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {DATA.POSTS.slice(0, 4).map((p) => (
          <article
            key={p.id}
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Avatar name={p.author} size={26} />
              <div style={{ fontSize: 11.5, fontWeight: 600 }}>{p.author}</div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--fp-fg-4)",
                  marginLeft: "auto",
                }}
              >
                {p.date}
              </div>
            </div>
            <Badge label={p.cat} size="sm" />
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.45,
                marginTop: 6,
              }}
            >
              {p.title}
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 10,
                fontSize: 11,
                color: "var(--fp-fg-4)",
              }}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                {I.thumbsUp} {p.likes}
              </span>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                {I.message} {p.replies}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--fp-brand-blue-accent)",
                }}
              >
                {I.sparkles} 요약
              </span>
            </div>
          </article>
        ))}
      </div>
    </MobileChrome>
  );
}

/* ─── Mobile · UXUI (editorial article reader) ──────────── */
function MobileUXUI() {
  return (
    <MobileChrome title="UXUI" activeTab="home">
      {/* hero feature */}
      <div style={{ padding: "12px 16px 0" }}>
        <div
          style={{
            aspectRatio: "16/10",
            borderRadius: 14,
            background: "linear-gradient(135deg, #1f3dbc, #050510 75%)",
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
                "radial-gradient(circle at 30% 30%, rgba(83,109,254,0.5), transparent 50%), radial-gradient(circle at 80% 60%, rgba(168,85,247,0.4), transparent 50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                fontFamily: "var(--fp-font-mono)",
                fontSize: 9,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 6,
                letterSpacing: "0.06em",
              }}
            >
              FEATURED · 26.03.15
            </div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.025em",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Variables 2.0 — 토큰 설계의 모든 것
            </h2>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px 6px" }}>
        <div
          className="eyebrow"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <span
            style={{ width: 18, height: 1, background: "var(--fp-border-3)" }}
          />
          EDITORIAL
        </div>
      </div>

      {/* article list */}
      <div
        style={{
          padding: "0 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {DATA.ARTICLES.concat(DATA.ARTICLES)
          .slice(0, 5)
          .map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "14px 0",
                borderBottom: i < 4 ? "1px solid var(--fp-border-1)" : "none",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  flexShrink: 0,
                  borderRadius: 10,
                  background: `linear-gradient(${135 + i * 40}deg, ${["#536DFE", "#a855f7", "#22c55e", "#f97316", "#ec4899"][i % 5]}66, var(--fp-glass-3))`,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--fp-font-mono)",
                    fontSize: 9,
                    color: "var(--fp-fg-4)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {(i + 1).toString().padStart(2, "0")} · {a.cat.toUpperCase()}
                </div>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    margin: "5px 0 6px",
                    letterSpacing: "-0.01em",
                    textWrap: "balance",
                  }}
                >
                  {a.title}
                </h3>
                <div style={{ fontSize: 10, color: "var(--fp-fg-4)" }}>
                  {a.date} · {a.read} 읽기
                </div>
              </div>
            </div>
          ))}
      </div>
    </MobileChrome>
  );
}

/* ─── Mobile · 리소스 (Safe — 균일 카드, 다운로드 우선) ── */
function MobileResources() {
  return (
    <MobileChrome title="AI 및 피그마 정보" activeTab="home">
      <div style={{ padding: "14px 16px 0" }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          리소스
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          바로 받아 쓰는{" "}
          <span
            className="fp-display-italic"
            style={{ color: "var(--fp-fg-2)" }}
          >
            템플릿
          </span>
        </h2>
      </div>

      {/* sort row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px 8px",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <button
            style={{
              padding: "5px 10px",
              fontSize: 11,
              borderRadius: 9999,
              background: "var(--fp-glass-5)",
              border: "1px solid var(--fp-border-1)",
              color: "var(--fp-fg-1)",
            }}
          >
            전체
          </button>
          <button
            style={{
              padding: "5px 10px",
              fontSize: 11,
              borderRadius: 9999,
              background: "transparent",
              border: "1px solid var(--fp-border-1)",
              color: "var(--fp-fg-3)",
            }}
          >
            UI 키트
          </button>
          <button
            style={{
              padding: "5px 10px",
              fontSize: 11,
              borderRadius: 9999,
              background: "transparent",
              border: "1px solid var(--fp-border-1)",
              color: "var(--fp-fg-3)",
            }}
          >
            아이콘
          </button>
        </div>
        <button
          style={{
            fontSize: 11,
            color: "var(--fp-fg-3)",
            background: "transparent",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          최신순 ↓
        </button>
      </div>

      {/* uniform card list */}
      <div
        style={{
          padding: "0 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {DATA.RESOURCES.map((r) => (
          <div
            key={r.id}
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
              display: "flex",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                flexShrink: 0,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, var(--fp-brand-blue-accent), #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 20,
              }}
            >
              {I.layers}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Badge label={r.cat} size="sm" />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 4,
                  lineHeight: 1.35,
                }}
              >
                {r.title}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--fp-fg-4)",
                  marginTop: 4,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {I.download} {r.downloads}회
                </span>
                <span>{r.size || "2.4MB"}</span>
              </div>
            </div>
            <button
              style={{
                width: 32,
                height: 32,
                alignSelf: "center",
                borderRadius: 8,
                background: "var(--fp-brand-blue-accent)",
                color: "#fff",
                border: "none",
              }}
            >
              {I.download}
            </button>
          </div>
        ))}
      </div>
    </MobileChrome>
  );
}

Object.assign(window, {
  MobileChrome,
  MobileInfo,
  MobilePrompt,
  MobileKiosk,
  MobileCommunity,
  MobileUXUI,
  MobileResources,
});
