/* global React, I, Badge, Avatar, Kbd, HeroWave, useTypewriter, Navbar, HeroSearch, QACard, AISummary, Sponsor, DATA */
const { useState, useEffect, useRef, useMemo } = React;

/* ════════════════════════════════════════════════════════════════════
   SAFE — refined version of current Figmapedia tone
   ════════════════════════════════════════════════════════════════════ */

/* ─── Page: Home ────────────────────────────────────────────────────── */
function SafeHome({ density, onNav }) {
  const [aiMode, setAiMode] = useState(false);
  const [query, setQuery] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [copied, setCopied] = useState(false);
  const placeholder = useTypewriter(DATA.SUGGESTIONS, 80, 1500);
  const compact = density === "compact";

  const handleAi = () => {
    if (aiMode) {
      setAiMode(false);
      return;
    }
    if (!query) {
      setQuery("오토 레이아웃 패딩과 갭");
    }
    setAiMode(true);
    setTimeout(() => {
      setShowAI(true);
      setAiMode(false);
    }, 1200);
  };

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          padding: "70px 16px 40px",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, height: 480 }}>
          <HeroWave height={480} intensity={0.7} hue={230} />
        </div>
        <div
          style={{
            position: "relative",
            maxWidth: 800,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 9999,
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
              fontSize: 12,
              color: "var(--fp-fg-3)",
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px #22c55e",
              }}
            ></span>
            월간 조회수 9만회 · 활성 유저 2.5만명
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 50px)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              margin: "0 0 16px",
              color: "var(--fp-fg-1)",
              textWrap: "balance",
            }}
          >
            AI로 검색해도 잘 나오지 않는
            <br />
            실무 디자인 정보를{" "}
            <span
              style={{
                color: "var(--fp-brand-blue-accent)",
                textShadow: "0 0 24px rgba(83,109,254,0.4)",
              }}
            >
              한곳에서
            </span>
            .
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--fp-fg-3)",
              margin: "0 0 32px",
              lineHeight: 1.6,
            }}
          >
            단축키 · 용어 · 플러그인 · 프롬프트 · 템플릿 — 디자인과 피그마 실무
            정보
          </p>
          <HeroSearch
            aiMode={aiMode}
            onAi={handleAi}
            value={query}
            onChange={setQuery}
            placeholder={`검색어를 입력하세요  ${placeholder}`}
            onSubmit={() => setShowAI(true)}
          />
          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {DATA.SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 9999,
                  background: "var(--fp-glass-2)",
                  border: "1px solid var(--fp-border-1)",
                  color: "var(--fp-fg-3)",
                  fontSize: 12,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI summary */}
      <section
        style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px" }}
      >
        {showAI && (
          <AISummary
            query={query}
            answer={`오토 레이아웃은 자식 요소를 자동으로 정렬·간격 조정하는 기능입니다. Frame 단위에 적용되며 Shift+A로 빠르게 켤 수 있어요. 패딩(Padding)은 컨테이너 안쪽 여백, 갭(Gap)은 자식 요소 사이의 간격을 의미합니다. 두 값은 독립적으로 조절되며, Min/Max width와 함께 쓰면 반응형 컴포넌트의 기반이 됩니다.`}
            sources={[
              { title: "오토 레이아웃 기초 가이드", cat: "피그마 실무 Q&A" },
              { title: "Figma A to Z — Auto Layout", cat: "용어정리" },
              { title: "Min/Max width 활용 패턴 5가지", cat: "Q&A" },
            ]}
            copied={copied}
            onCopy={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          />
        )}
      </section>

      {/* Categories grid */}
      <section
        style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 18,
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              둘러보기
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              카테고리
            </h2>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              id: "info",
              label: "피그마 정보",
              desc: "Q&A · 용어 · 단축키 · 플러그인",
              count: 560,
              hue: "#facc15",
            },
            {
              id: "prompt",
              label: "프롬프트 페디아",
              desc: "한글·영문·JSON·파라미터",
              count: 142,
              hue: "#536DFE",
            },
            {
              id: "kiosk",
              label: "키오스크 갤러리",
              desc: "8개 산업, 110+ 화면",
              count: 110,
              hue: "#f97316",
            },
            {
              id: "community",
              label: "커뮤니티",
              desc: "글쓰기 · 토론 · 이벤트",
              count: 1240,
              hue: "#ec4899",
            },
            {
              id: "uxui",
              label: "UXUI 디자인",
              desc: "아티클 · 블로그 · 용어",
              count: 320,
              hue: "#8b5cf6",
            },
            {
              id: "resources",
              label: "피그마 리소스",
              desc: "템플릿 · 튜토리얼 · A to Z",
              count: 86,
              hue: "#10b981",
            },
          ].map((c) => (
            <a
              key={c.id}
              onClick={(e) => {
                e.preventDefault();
                onNav?.(c.id);
              }}
              href="#"
              style={{
                display: "block",
                padding: 20,
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                borderRadius: 14,
                textDecoration: "none",
                color: "inherit",
                position: "relative",
                overflow: "hidden",
                transition: "all 200ms var(--fp-ease)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--fp-glass-4)";
                e.currentTarget.style.borderColor = "var(--fp-border-3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--fp-glass-2)";
                e.currentTarget.style.borderColor = "var(--fp-border-1)";
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
                  background: c.hue + "22",
                  filter: "blur(20px)",
                }}
              />
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: c.hue + "22",
                    color: c.hue,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  {I.layers}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--fp-fg-3)" }}>
                  {c.desc}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--fp-fg-4)",
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{c.count.toLocaleString()}건</span>
                  <span>{I.arrowRight}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Trending Q&A */}
      <section
        style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 60px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 28,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 16,
              }}
            >
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  이번 주 인기
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                  실무 Q&A
                </h2>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNav?.("info");
                }}
                style={{
                  fontSize: 13,
                  color: "var(--fp-fg-3)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                전체 보기 {I.chevronRight}
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DATA.QA_ITEMS.slice(0, 5).map((q) => (
                <QACard key={q.id} item={q} compact={compact} />
              ))}
            </div>
          </div>
          <aside
            style={{
              position: "sticky",
              top: 100,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div
                className="eyebrow"
                style={{
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {I.trending} 급상승 키워드
              </div>
              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {[
                  "Variables 2.0",
                  "Auto Layout Min Width",
                  "Dev Mode 26",
                  "Liquid Glass 토큰",
                  "Make AI 프롬프트",
                ].map((k, i) => (
                  <li
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        color:
                          i < 2
                            ? "var(--fp-brand-blue-accent)"
                            : "var(--fp-fg-4)",
                        width: 16,
                        fontWeight: 600,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: "var(--fp-fg-2)", flex: 1 }}>
                      {k}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: i < 3 ? "#22c55e" : "var(--fp-fg-4)",
                      }}
                    >
                      {i < 3 ? "▲ " : "—"}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div
              style={{
                background: "rgba(83,109,254,0.06)",
                border: "1px solid rgba(83,109,254,0.20)",
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--fp-brand-blue-accent)",
                  marginBottom: 10,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {I.sparkles} 오늘의 추천
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--fp-fg-1)",
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                Variables로 다크모드 30분 만에 완성하기
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--fp-fg-3)",
                  lineHeight: 1.6,
                }}
              >
                최근 검색하신 "베리어블"과 관련된 실무 가이드입니다.
              </div>
            </div>
            <Sponsor />
          </aside>
        </div>
      </section>
    </div>
  );
}

/* ─── Page: 피그마 정보 (Q&A · 용어 · 단축키 · 플러그인) ─────────────── */
function SafeInfo({ density, onOpen }) {
  const [tab, setTab] = useState("qa");
  const [activeCat, setActiveCat] = useState("전체");
  const compact = density === "compact";

  const tabs = [
    { id: "qa", label: "실무 Q&A", count: 214 },
    { id: "term", label: "피그마 용어", count: 132 },
    { id: "mac", label: "Mac 단축키", count: 86 },
    { id: "win", label: "Win 단축키", count: 86 },
    { id: "plugin", label: "플러그인", count: 42 },
  ];
  const cats = [
    "전체",
    "오토 레이아웃",
    "컴포넌트",
    "베리어블",
    "프로토타이핑",
    "데브모드",
    "플러그인",
    "기초 인터페이스",
  ];

  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px 60px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          피그마 정보
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          실무에서 막히는 모든 것
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--fp-fg-3)",
            marginTop: 8,
            lineHeight: 1.6,
          }}
        >
          총 560건 · 매주 업데이트 · 한국 디자이너가 직접 검수
        </p>
      </div>

      {/* Search bar slim */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--fp-fg-4)",
            fontSize: 18,
          }}
        >
          {I.search}
        </span>
        <input
          placeholder="이 카테고리 안에서 검색…"
          style={{
            width: "100%",
            height: 50,
            borderRadius: 12,
            border: "1px solid var(--fp-border-1)",
            background: "var(--fp-glass-2)",
            color: "var(--fp-fg-1)",
            padding: "0 100px 0 44px",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            height: 38,
            padding: "0 14px",
            borderRadius: 9,
            background: "var(--fp-brand-blue-light)",
            color: "#111",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {I.sparkles} AI
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: "1px solid var(--fp-border-1)",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 9999,
              border:
                "1px solid " +
                (tab === t.id
                  ? "var(--fp-brand-blue-accent)"
                  : "var(--fp-border-1)"),
              background:
                tab === t.id
                  ? "var(--fp-brand-blue-accent)"
                  : "var(--fp-glass-2)",
              color: tab === t.id ? "#fff" : "var(--fp-fg-2)",
              fontSize: 13,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {t.label}{" "}
            <span style={{ fontSize: 11, opacity: 0.7 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 18,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "var(--fp-fg-4)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {I.filter} 카테고리
        </span>
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            style={{
              padding: "5px 11px",
              borderRadius: 9999,
              fontSize: 12,
              border:
                "1px solid " +
                (activeCat === c ? "var(--fp-border-3)" : "var(--fp-border-1)"),
              background: activeCat === c ? "var(--fp-glass-5)" : "transparent",
              color: activeCat === c ? "var(--fp-fg-1)" : "var(--fp-fg-3)",
            }}
          >
            {c}
          </button>
        ))}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 4,
            padding: 3,
            background: "var(--fp-glass-2)",
            borderRadius: 9,
          }}
        >
          <button
            style={{
              padding: "5px 9px",
              borderRadius: 6,
              background: "var(--fp-glass-5)",
              border: "none",
              color: "var(--fp-fg-1)",
              fontSize: 13,
            }}
          >
            {I.list}
          </button>
          <button
            style={{
              padding: "5px 9px",
              borderRadius: 6,
              background: "transparent",
              border: "none",
              color: "var(--fp-fg-4)",
              fontSize: 13,
            }}
          >
            {I.grid}
          </button>
        </div>
      </div>

      {/* Body — Q&A list */}
      {tab === "qa" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DATA.QA_ITEMS.map((q) => (
            <QACard key={q.id} item={q} compact={compact} onOpen={onOpen} />
          ))}
        </div>
      )}

      {/* Body — Mac shortcuts (table-like) */}
      {tab === "mac" && (
        <div
          style={{
            background: "var(--fp-glass-2)",
            border: "1px solid var(--fp-border-1)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {[
            {
              cat: "기초 인터페이스",
              title: "선택한 레이어 그룹화",
              keys: "⌘ + G",
            },
            { cat: "기초 인터페이스", title: "그룹 해제", keys: "⇧ + ⌘ + G" },
            { cat: "컴포넌트", title: "컴포넌트로 변환", keys: "⌥ + ⌘ + K" },
            {
              cat: "컴포넌트",
              title: "메인 컴포넌트로 이동",
              keys: "⌥ + ⌘ + ↵",
            },
            {
              cat: "오토 레이아웃",
              title: "오토 레이아웃 켜기",
              keys: "⇧ + A",
            },
            {
              cat: "프로토타이핑",
              title: "프로토타입 미리보기",
              keys: "⌥ + ⌘ + ↵",
            },
            { cat: "데브모드", title: "Dev Mode 토글", keys: "⇧ + D" },
            { cat: "기초 인터페이스", title: "복제(In place)", keys: "⌘ + D" },
          ].map((r, i, arr) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr auto",
                alignItems: "center",
                padding: "14px 18px",
                gap: 16,
                borderBottom:
                  i < arr.length - 1 ? "1px solid var(--fp-border-1)" : "none",
              }}
            >
              <Badge label={r.cat} size="sm" />
              <div style={{ fontSize: 14, color: "var(--fp-fg-1)" }}>
                {r.title}
              </div>
              <Kbd>{r.keys}</Kbd>
            </div>
          ))}
        </div>
      )}

      {/* Body — Plugins (cards) */}
      {tab === "plugin" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
            gap: 14,
          }}
        >
          {[
            {
              name: "Lorem Ipsum 한글",
              author: "minki.kim",
              installs: "12,400",
              desc: "한국어 더미 텍스트를 빠르게 생성",
              cat: "플러그인",
            },
            {
              name: "Iconify",
              author: "iconify.dev",
              installs: "1.2M",
              desc: "200,000+ 오픈소스 아이콘 검색·삽입",
              cat: "플러그인",
            },
            {
              name: "Unsplash",
              author: "Unsplash",
              installs: "3.4M",
              desc: "고화질 사진을 직접 캔버스에 드롭",
              cat: "플러그인",
            },
            {
              name: "Content Reel",
              author: "Microsoft",
              installs: "2.1M",
              desc: "더미 사진·아바타·텍스트 한꺼번에",
              cat: "플러그인",
            },
          ].map((p) => (
            <div
              key={p.name}
              style={{
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "var(--fp-glass-4)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {I.spark}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--fp-fg-4)" }}>
                    by {p.author}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--fp-fg-3)",
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                {p.desc}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "var(--fp-fg-4)" }}>
                  {I.download} {p.installs} 설치
                </span>
                <button
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    background: "var(--fp-glass-4)",
                    border: "1px solid var(--fp-border-2)",
                    color: "var(--fp-fg-1)",
                  }}
                >
                  설치
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Body — terms */}
      {tab === "term" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              term: "Auto Layout",
              ko: "오토 레이아웃",
              desc: "자식 요소를 자동 정렬·간격 조정하는 컨테이너 기능",
            },
            {
              term: "Component",
              ko: "컴포넌트",
              desc: "재사용 가능한 디자인 단위. 메인과 인스턴스로 구성",
            },
            {
              term: "Variable",
              ko: "베리어블",
              desc: "디자인 토큰으로, 모드별로 다른 값을 가질 수 있음",
            },
            {
              term: "Dev Mode",
              ko: "데브모드",
              desc: "개발자가 디자인을 코드와 함께 검토하는 전용 모드",
            },
            {
              term: "Smart Animate",
              ko: "스마트 애니메이트",
              desc: "프레임 간 동일 이름 레이어를 자동 보간",
            },
          ].map((t) => (
            <div
              key={t.term}
              style={{
                background: "var(--fp-glass-2)",
                border: "1px solid var(--fp-border-1)",
                borderRadius: 12,
                padding: 18,
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: 24,
                alignItems: "baseline",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{t.term}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--fp-fg-4)",
                    marginTop: 2,
                  }}
                >
                  {t.ko}
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--fp-fg-2)",
                  lineHeight: 1.6,
                }}
              >
                {t.desc}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Page: Q&A detail (article view) ──────────────────────────────── */
function SafeQADetail({ item, onBack }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px 60px" }}>
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "var(--fp-fg-3)",
          background: "transparent",
          border: "none",
          padding: 0,
          marginBottom: 20,
        }}
      >
        <span style={{ transform: "rotate(180deg)" }}>{I.chevronRight}</span>{" "}
        목록으로
      </button>
      <Badge label={item?.cat || "오토 레이아웃"} />
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          margin: "12px 0 16px",
          lineHeight: 1.25,
        }}
      >
        {item?.title || "오토 레이아웃에서 패딩과 갭의 차이는 무엇인가요?"}
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
          color: "var(--fp-fg-4)",
          marginBottom: 24,
        }}
      >
        <Avatar name={item?.author || "@figma_tutor"} size={20} />
        <span>{item?.author || "@figma_tutor"}</span>
        <span>·</span>
        <span>{item?.date || "2026.03.12"}</span>
        <span>·</span>
        <span>{item?.read || "4분 읽기"}</span>
        <span>·</span>
        <span>{I.eye} 2.3k</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            style={{
              padding: 6,
              borderRadius: 8,
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
              color: "var(--fp-fg-3)",
            }}
          >
            {I.bookmark}
          </button>
          <button
            style={{
              padding: 6,
              borderRadius: 8,
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
              color: "var(--fp-fg-3)",
            }}
          >
            {I.share}
          </button>
        </div>
      </div>

      <AISummary
        answer="패딩(Padding)은 컨테이너의 안쪽 여백, 갭(Gap)은 자식 요소들 사이의 간격입니다. 두 값은 독립적으로 조절되며 함께 쓰면 반응형 컴포넌트의 기반이 됩니다."
        sources={[{ title: "본문 1~3단락 요약", cat: "이 문서" }]}
        onCopy={() => {}}
      />

      <div
        style={{
          marginTop: 28,
          fontSize: 16,
          lineHeight: 1.8,
          color: "var(--fp-fg-2)",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--fp-fg-1)",
            margin: "32px 0 12px",
          }}
        >
          1. 시작하기 전에
        </h2>
        <p>
          오토 레이아웃은 Frame에만 적용됩니다. 그룹(Group)은 변환되지 않으니
          먼저 <Kbd>⌘ + ⌥ + G</Kbd>로 프레임으로 만들어 주세요.
        </p>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--fp-fg-1)",
            margin: "32px 0 12px",
          }}
        >
          2. 패딩과 갭, 한 장으로 정리
        </h2>
        <div
          style={{
            background: "var(--fp-glass-2)",
            border: "1px solid var(--fp-border-1)",
            borderRadius: 12,
            padding: 24,
            margin: "12px 0",
            display: "flex",
            justifyContent: "center",
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
            <text
              x="160"
              y="14"
              textAnchor="middle"
              fontSize="10"
              fill="var(--fp-fg-3)"
              fontFamily="Geist Mono"
            >
              Frame · padding 30
            </text>
            <text
              x="118"
              y="95"
              textAnchor="middle"
              fontSize="9"
              fill="var(--fp-fg-4)"
              fontFamily="Geist Mono"
            >
              gap 15
            </text>
          </svg>
        </div>
        <p>
          핵심은:{" "}
          <strong style={{ color: "#fff" }}>
            패딩 = 안쪽 여백, 갭 = 자식 간 간격
          </strong>
          . 둘은 따로 조절합니다.
        </p>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--fp-fg-1)",
            margin: "32px 0 12px",
          }}
        >
          3. 자주 묻는 질문
        </h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>
            Q. 갭이 0인데 시각적으로 떨어져 보여요 → 자식의 stroke 외부 정렬
            때문일 수 있어요.
          </li>
          <li>
            Q. 음수 갭이 안 돼요 → 음수 간격(Negative spacing) 토글을 켜야
            합니다.
          </li>
        </ul>
      </div>

      {/* Reactions */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 36,
          padding: "16px 0",
          borderTop: "1px solid var(--fp-border-1)",
          borderBottom: "1px solid var(--fp-border-1)",
        }}
      >
        <button
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--fp-glass-2)",
            border: "1px solid var(--fp-border-1)",
            color: "var(--fp-fg-1)",
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {I.thumbsUp} 도움됐어요 · 142
        </button>
        <button
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--fp-glass-2)",
            border: "1px solid var(--fp-border-1)",
            color: "var(--fp-fg-1)",
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {I.bookmark} 북마크
        </button>
        <button
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--fp-glass-2)",
            border: "1px solid var(--fp-border-1)",
            color: "var(--fp-fg-1)",
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {I.share} 공유
        </button>
      </div>

      {/* Related */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          관련 문서
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DATA.QA_ITEMS.slice(1, 4).map((q) => (
            <QACard key={q.id} item={q} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page: 프롬프트 페디아 ─────────────────────────────────────────── */
function SafePrompt() {
  const [tab, setTab] = useState("전체");
  const [selected, setSelected] = useState(DATA.PROMPTS[0]);
  const [copied, setCopied] = useState(false);
  const tabs = [
    "전체",
    "한글자연어",
    "영문자연어",
    "JSON",
    "파라미터형",
    "코드",
  ];

  return (
    <div
      style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 16px 60px" }}
    >
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          프롬프트 페디아
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          Figma Make에서 바로 쓰는 프롬프트
        </h1>
        <p style={{ fontSize: 14, color: "var(--fp-fg-3)", marginTop: 8 }}>
          총 142개 · 한글·영문·JSON·파라미터·코드
        </p>
      </div>

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 9999,
              fontSize: 13,
              background:
                tab === t ? "var(--fp-brand-blue-accent)" : "var(--fp-glass-2)",
              color: tab === t ? "#fff" : "var(--fp-fg-2)",
              border:
                "1px solid " +
                (tab === t
                  ? "var(--fp-brand-blue-accent)"
                  : "var(--fp-border-1)"),
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DATA.PROMPTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                textAlign: "left",
                padding: 16,
                borderRadius: 12,
                background:
                  selected.id === p.id
                    ? "var(--fp-glass-4)"
                    : "var(--fp-glass-2)",
                border:
                  "1px solid " +
                  (selected.id === p.id
                    ? "var(--fp-border-3)"
                    : "var(--fp-border-1)"),
                color: "var(--fp-fg-1)",
              }}
            >
              <div style={{ marginBottom: 6 }}>
                <Badge label={p.cat} size="sm" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.title}</div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--fp-fg-4)",
                  marginTop: 6,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {p.body}
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div
          style={{
            position: "sticky",
            top: 100,
            background: "var(--fp-glass-2)",
            border: "1px solid var(--fp-border-1)",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <div>
              <Badge label={selected.cat} />
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginTop: 10,
                  marginBottom: 0,
                }}
              >
                {selected.title}
              </h2>
            </div>
          </div>
          <div
            style={{ fontSize: 13, color: "var(--fp-fg-3)", marginBottom: 14 }}
          >
            이 프롬프트는 Figma Make · v0 · Cursor에서 바로 쓸 수 있어요.
          </div>
          <pre
            style={{
              background: "var(--fp-bg-sunken)",
              border: "1px solid var(--fp-border-1)",
              borderRadius: 10,
              padding: 18,
              margin: 0,
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--fp-fg-2)",
              fontFamily: "var(--fp-font-mono)",
              whiteSpace: "pre-wrap",
              maxHeight: 360,
              overflow: "auto",
            }}
          >
            {selected.body}
          </pre>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                background: copied
                  ? "var(--fp-success-bg)"
                  : "var(--fp-brand-blue-light)",
                color: copied ? "var(--fp-success)" : "#111",
                border: copied ? "1px solid var(--fp-success-border)" : "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {copied ? I.check : I.copy} {copied ? "복사됨!" : "프롬프트 복사"}
            </button>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--fp-glass-3)",
                border: "1px solid var(--fp-border-1)",
                color: "var(--fp-fg-2)",
              }}
            >
              {I.bookmark}
            </button>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--fp-glass-3)",
                border: "1px solid var(--fp-border-1)",
                color: "var(--fp-fg-2)",
              }}
            >
              {I.share}
            </button>
          </div>
          <div
            style={{
              marginTop: 18,
              paddingTop: 18,
              borderTop: "1px solid var(--fp-border-1)",
              fontSize: 12,
              color: "var(--fp-fg-4)",
            }}
          >
            예상 결과 미리보기 · 생성 사례 8건 · 평균 만족도 ★4.6
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SafeHome, SafeInfo, SafeQADetail, SafePrompt });
