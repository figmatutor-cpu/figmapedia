/* global React, I, Badge, Avatar, Kbd, DATA */
const { useState } = React;

/* ─── Page: 키오스크 갤러리 ──────────────────────────────────────── */
function SafeKiosk() {
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
    <div
      style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 16px 60px" }}
    >
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          키오스크 갤러리
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          실제 운영 중인 키오스크 화면 모음
        </h1>
        <p style={{ fontSize: 14, color: "var(--fp-fg-3)", marginTop: 8 }}>
          8개 산업군 · 110+ 화면 · 매주 추가
        </p>
      </div>

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}
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
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((k) => (
          <a
            key={k.id}
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
              borderRadius: 14,
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              transition: "all 200ms var(--fp-ease)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--fp-border-3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--fp-border-1)")
            }
          >
            <div
              style={{
                aspectRatio: "9/16",
                maxHeight: 280,
                background: `linear-gradient(135deg, hsl(${k.hue}, 60%, 25%) 0%, hsl(${k.hue}, 70%, 12%) 100%)`,
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
                  right: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "var(--fp-font-mono)",
                }}
              >
                <span>{k.cat}</span>
                <span>{k.screens} screens</span>
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  textShadow: `0 0 30px hsl(${k.hue}, 100%, 50%, 0.6)`,
                }}
              >
                {k.brand}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  background: `linear-gradient(180deg, transparent, hsl(${k.hue}, 70%, 12%))`,
                }}
              />
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {k.brand} · 메인 흐름
              </div>
              <div
                style={{ fontSize: 12, color: "var(--fp-fg-4)", marginTop: 4 }}
              >
                {k.cat} · 2026.03 업데이트
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─── Page: 커뮤니티 ───────────────────────────────────────────────── */
function SafeCommunity() {
  const [tab, setTab] = useState("전체");
  const [showCompose, setShowCompose] = useState(false);
  const tabs = ["전체", "소소한 꿀팁", "이벤트", "피그마버즈", "데일리콘텐츠"];

  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px 60px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          gap: 16,
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            커뮤니티
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            같이 디자인하는 공간
          </h1>
          <p style={{ fontSize: 14, color: "var(--fp-fg-3)", marginTop: 8 }}>
            1,240개의 글 · 4,820명 참여 중
          </p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          style={{
            height: 44,
            padding: "0 18px",
            borderRadius: 10,
            background: "#fff",
            color: "#111",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            whiteSpace: "nowrap",
          }}
        >
          {I.pencil} 글쓰기
        </button>
      </div>

      {showCompose && (
        <div
          style={{
            background: "var(--fp-glass-2)",
            border: "1px solid var(--fp-border-2)",
            borderRadius: 14,
            padding: 18,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            {tabs.slice(1).map((t) => (
              <button
                key={t}
                style={{
                  padding: "5px 11px",
                  borderRadius: 9999,
                  fontSize: 12,
                  background: "var(--fp-glass-3)",
                  border: "1px solid var(--fp-border-1)",
                  color: "var(--fp-fg-3)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            placeholder="제목을 입력하세요"
            style={{
              width: "100%",
              height: 44,
              fontSize: 16,
              fontWeight: 600,
              background: "transparent",
              border: "none",
              color: "var(--fp-fg-1)",
              outline: "none",
              marginBottom: 4,
            }}
          />
          <textarea
            placeholder="공유하고 싶은 내용을 자유롭게 적어주세요"
            rows="5"
            style={{
              width: "100%",
              fontSize: 14,
              background: "transparent",
              border: "none",
              color: "var(--fp-fg-2)",
              outline: "none",
              resize: "vertical",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid var(--fp-border-1)",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              {["이미지", "링크", "코드", "멘션"].map((t) => (
                <button
                  key={t}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    borderRadius: 8,
                    background: "var(--fp-glass-3)",
                    border: "1px solid var(--fp-border-1)",
                    color: "var(--fp-fg-3)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowCompose(false)}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  borderRadius: 9,
                  background: "transparent",
                  border: "1px solid var(--fp-border-2)",
                  color: "var(--fp-fg-2)",
                }}
              >
                취소
              </button>
              <button
                style={{
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 9,
                  background: "var(--fp-brand-blue-accent)",
                  color: "#fff",
                  border: "none",
                }}
              >
                게시
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              height: 34,
              padding: "0 12px",
              borderRadius: 9999,
              fontSize: 13,
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

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DATA.POSTS.map((p) => (
          <a
            key={p.id}
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              display: "block",
              padding: 18,
              background: "var(--fp-glass-2)",
              border: "1px solid var(--fp-border-1)",
              borderRadius: 12,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <Badge label={p.cat} size="sm" />
              <span style={{ fontSize: 11, color: "var(--fp-fg-4)" }}>
                {p.date}
              </span>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.45,
                marginBottom: 10,
              }}
            >
              {p.title}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                color: "var(--fp-fg-4)",
              }}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Avatar name={p.author} size={20} /> {p.author}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {I.message} {p.replies}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {I.thumbsUp} {p.likes}
                </span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─── Page: UXUI 디자인 (아티클) ───────────────────────────────────── */
function SafeUXUI() {
  const [tab, setTab] = useState("아티클");
  const tabs = ["아티클", "기술&디자인 블로그", "용어 정리"];

  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px 60px" }}
    >
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          UXUI 디자인
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          디자이너의 사고법, 더 깊게
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 22,
          paddingBottom: 12,
          borderBottom: "1px solid var(--fp-border-1)",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 4px",
              marginRight: 16,
              fontSize: 14,
              fontWeight: 600,
              color: tab === t ? "var(--fp-fg-1)" : "var(--fp-fg-4)",
              background: "transparent",
              border: "none",
              borderBottom:
                "2px solid " +
                (tab === t ? "var(--fp-brand-blue-accent)" : "transparent"),
              marginBottom: -13,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <div>
          {/* Featured */}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                aspectRatio: "16/9",
                borderRadius: 14,
                background: "linear-gradient(135deg, #1f3dbc 0%, #050510 80%)",
                marginBottom: 14,
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
                    "radial-gradient(circle at 30% 40%, rgba(83,109,254,0.5), transparent 50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  fontSize: 11,
                  color: "#fff",
                  fontFamily: "var(--fp-font-mono)",
                }}
              >
                FEATURED
              </div>
            </div>
            <Badge label="Figma A to Z" />
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.3,
                margin: "10px 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Variables 2.0 — 토큰 설계의 모든 것
            </h2>
            <div
              style={{
                fontSize: 13,
                color: "var(--fp-fg-3)",
                lineHeight: 1.6,
                marginBottom: 10,
              }}
            >
              모드, 별칭, 컬렉션 그리고 라이브러리에 게시까지. 실무에서 마주치는
              모든 케이스를 한 번에 정리합니다.
            </div>
            <div style={{ fontSize: 12, color: "var(--fp-fg-4)" }}>
              @figma_tutor · 2026.03.15 · 18분 읽기
            </div>
          </a>

          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {DATA.ARTICLES.map((a) => (
              <a
                key={a.id}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 14,
                  padding: 14,
                  borderRadius: 12,
                  background: "var(--fp-glass-2)",
                  border: "1px solid var(--fp-border-1)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    aspectRatio: "16/9",
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${["#536DFE", "#a855f7", "#22c55e", "#f97316"][a.id.length % 4]}33, var(--fp-glass-3))`,
                  }}
                />
                <div>
                  <Badge label={a.cat} size="sm" />
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginTop: 6,
                      lineHeight: 1.4,
                    }}
                  >
                    {a.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--fp-fg-4)",
                      marginTop: 6,
                    }}
                  >
                    {a.date} · {a.read} 읽기
                  </div>
                </div>
              </a>
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
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              이번 달 가장 많이 읽힌 글
            </div>
            {[
              "Min/Max 활용 패턴 5가지",
              "Liquid Glass 토큰 만들기",
              "Smart Animate 명명 규칙",
              "Auto Layout 마이그레이션",
            ].map((t, i) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "8px 0",
                  borderTop: i > 0 ? "1px solid var(--fp-border-1)" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--fp-fg-4)",
                    fontFamily: "var(--fp-font-mono)",
                    width: 16,
                  }}
                >
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--fp-fg-2)",
                    lineHeight: 1.5,
                  }}
                >
                  {t}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── Page: 피그마 리소스 ──────────────────────────────────────────── */
function SafeResources() {
  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px 60px" }}
    >
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          디자인 리소스
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          바로 받아 쓰는 템플릿과 리소스
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {DATA.RESOURCES.map((r, i) => (
          <a
            key={r.id}
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid var(--fp-border-1)",
              background: "var(--fp-glass-2)",
            }}
          >
            <div
              style={{
                aspectRatio: "16/10",
                background: `linear-gradient(135deg, ${["#536DFE", "#a855f7", "#10b981", "#f97316"][i % 4]}33, ${["#536DFE", "#a855f7", "#10b981", "#f97316"][i % 4]}11)`,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 12,
                  border: "1px dashed rgba(255,255,255,0.18)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {I.layers}
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <Badge label={r.cat} size="sm" />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginTop: 8,
                  lineHeight: 1.4,
                }}
              >
                {r.title}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                  fontSize: 12,
                  color: "var(--fp-fg-4)",
                }}
              >
                <span>
                  {I.download} {r.downloads}회
                </span>
                <span style={{ color: "var(--fp-fg-2)" }}>
                  받기 {I.arrowRight}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SafeKiosk, SafeCommunity, SafeUXUI, SafeResources });
