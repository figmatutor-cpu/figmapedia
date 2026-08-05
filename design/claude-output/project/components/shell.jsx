/* global React, I, Badge, Avatar, Kbd, HeroWave, useTypewriter, catStyle */
const { useState, useEffect, useRef, useMemo } = React;

/* ─── Navbar ────────────────────────────────────────────────────────── */
function Navbar({ active = "info", variant = "safe", onNav }) {
  const items = [
    { id: "info", label: "피그마 정보" },
    { id: "prompt", label: "프롬프트" },
    { id: "kiosk", label: "키오스크" },
    { id: "community", label: "커뮤니티" },
    { id: "uxui", label: "UXUI디자인" },
    { id: "resources", label: "피그마 리소스" },
  ];
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        padding: "20px 16px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 56,
          padding: "0 8px 0 22px",
          borderRadius: 9999,
          border: "1px solid var(--fp-navbar-border)",
          background: "var(--fp-navbar-bg)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          maxWidth: "min(100%, 1100px)",
          width: "100%",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "-0.02em",
            marginRight: 14,
            color: "var(--fp-fg-1)",
          }}
        >
          Figmapedia
          <sub
            style={{
              fontSize: 9,
              color: "var(--fp-brand-blue-accent)",
              marginLeft: 4,
              fontWeight: 600,
            }}
          >
            2.0
          </sub>
        </span>
        <div style={{ display: "flex", gap: 4, flex: 1, overflow: "hidden" }}>
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => onNav?.(it.id)}
              style={{
                padding: "8px 14px",
                borderRadius: 9999,
                border: "none",
                background:
                  active === it.id ? "var(--fp-glass-5)" : "transparent",
                color: active === it.id ? "var(--fp-fg-1)" : "var(--fp-fg-3)",
                fontSize: 14,
                fontWeight: active === it.id ? 600 : 500,
                transition: "all 200ms var(--fp-ease)",
                whiteSpace: "nowrap",
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            border: "1px solid var(--fp-border-1)",
            background: "var(--fp-glass-2)",
            color: "var(--fp-fg-2)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          {I.search}
        </button>
        <button
          style={{
            height: 36,
            padding: "0 14px",
            borderRadius: 9999,
            border: "1px solid var(--fp-border-1)",
            background: "var(--fp-glass-2)",
            color: "var(--fp-fg-2)",
            fontSize: 13,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>{I.user}</span>로그인
        </button>
      </div>
    </nav>
  );
}

/* ─── Hero search input (with AI button) ────────────────────────────── */
function HeroSearch({
  aiMode,
  onAi,
  onChange,
  value,
  onSubmit,
  placeholder,
  accent = false,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      style={{
        position: "relative",
        maxWidth: 640,
        margin: "0 auto",
        padding: 2,
        borderRadius: 18,
        background: accent
          ? "linear-gradient(135deg, rgba(83,109,254,0.5), rgba(83,109,254,0.05) 30%, rgba(83,109,254,0.4))"
          : "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.18))",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.06), 0 30px 60px -30px rgba(83,109,254,0.4)",
      }}
    >
      <div
        style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}
      >
        <span
          style={{
            position: "absolute",
            left: 18,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--fp-fg-3)",
            fontSize: 20,
            pointerEvents: "none",
          }}
        >
          {I.search}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: "100%",
            height: 60,
            borderRadius: 16,
            background: "rgba(15,15,20,0.55)",
            border: "1px solid var(--fp-border-1)",
            color: "var(--fp-fg-1)",
            padding: "0 150px 0 50px",
            fontSize: 16,
            outline: "none",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        />
        <button
          type="button"
          onClick={onAi}
          style={{
            position: "absolute",
            right: 7,
            top: "50%",
            transform: "translateY(-50%)",
            height: 46,
            padding: "0 18px",
            borderRadius: 12,
            border: "none",
            background: aiMode
              ? "var(--fp-glass-5)"
              : "var(--fp-brand-blue-light)",
            color: aiMode ? "var(--fp-fg-1)" : "#111",
            fontWeight: 600,
            fontSize: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "all 200ms var(--fp-ease)",
          }}
        >
          {aiMode ? (
            <span
              style={{
                width: 9,
                height: 9,
                background: "currentColor",
                borderRadius: 1,
                display: "inline-block",
              }}
            />
          ) : (
            <span style={{ fontSize: 14 }}>{I.sparkles}</span>
          )}
          {aiMode ? "정지" : "AI 검색"}
        </button>
      </div>
    </form>
  );
}

/* ─── Card list — Q&A row ───────────────────────────────────────────── */
function QACard({ item, compact, onOpen }) {
  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        onOpen?.(item);
      }}
      href="#"
      style={{
        display: "block",
        background: "var(--fp-glass-2)",
        border: "1px solid var(--fp-border-1)",
        borderRadius: 12,
        padding: compact ? 14 : 18,
        textDecoration: "none",
        color: "inherit",
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
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Badge label={item.cat} size="sm" />
            {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
            {item.aiMatched && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "var(--fp-brand-blue-accent)",
                  padding: "2px 6px",
                  background: "rgba(83,109,254,0.10)",
                  borderRadius: 4,
                }}
              >
                <span style={{ fontSize: 11 }}>{I.sparkles}</span>AI 매칭
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: compact ? 14 : 15,
              fontWeight: 600,
              color: "var(--fp-fg-1)",
              lineHeight: 1.45,
              textWrap: "pretty",
            }}
          >
            {item.title}
          </div>
          {!compact && item.preview && (
            <div
              style={{
                fontSize: 13,
                color: "var(--fp-fg-3)",
                marginTop: 6,
                lineHeight: 1.55,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.preview}
            </div>
          )}
          <div
            style={{
              fontSize: 12,
              color: "var(--fp-fg-4)",
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {item.author && (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <Avatar name={item.author} size={16} />
                {item.author}
              </span>
            )}
            {item.date && <span>·</span>}
            {item.date && <span>{item.date}</span>}
            {item.read && <span>·</span>}
            {item.read && <span>{item.read}</span>}
            {item.views && <span>·</span>}
            {item.views && (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
              >
                {I.eye} {item.views}
              </span>
            )}
          </div>
        </div>
        <span style={{ color: "var(--fp-fg-4)", fontSize: 18, marginTop: 4 }}>
          {I.chevronRight}
        </span>
      </div>
    </a>
  );
}

/* ─── AI Summary Card ───────────────────────────────────────────────── */
function AISummary({ query, answer, sources, onCopy, copied }) {
  return (
    <div
      style={{
        background: "rgba(83,109,254,0.05)",
        border: "1px solid rgba(83,109,254,0.20)",
        borderRadius: 14,
        padding: 22,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 0% 0%, rgba(83,109,254,0.18), transparent 60%)",
        }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "rgba(83,109,254,0.18)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--fp-brand-blue-accent)",
                fontSize: 14,
              }}
            >
              {I.sparkles}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--fp-brand-blue-accent)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              AI 요약
            </span>
            {query && (
              <span style={{ fontSize: 12, color: "var(--fp-fg-4)" }}>
                · "{query}"
              </span>
            )}
          </div>
          <button
            onClick={onCopy}
            style={{
              border:
                "1px solid " +
                (copied ? "var(--fp-success-border)" : "var(--fp-border-1)"),
              background: copied ? "var(--fp-success-bg)" : "var(--fp-glass-2)",
              color: copied ? "var(--fp-success)" : "var(--fp-fg-2)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all 150ms var(--fp-ease)",
            }}
          >
            <span style={{ fontSize: 13 }}>{copied ? I.check : I.copy}</span>
            {copied ? "복사됨!" : "복사"}
          </button>
        </div>
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: "var(--fp-fg-2)",
            textWrap: "pretty",
          }}
        >
          {answer}
        </div>
        {sources && sources.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(83,109,254,0.18)",
              marginTop: 16,
              paddingTop: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--fp-fg-4)",
                marginBottom: 8,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              출처 {sources.length}건
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sources.map((s, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "rgba(108,121,255,0.95)",
                    textDecoration: "none",
                    padding: "4px 0",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--fp-font-mono)",
                      fontSize: 11,
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: "rgba(83,109,254,0.20)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ flex: 1 }}>{s.title}</span>
                  <span style={{ color: "var(--fp-fg-4)", fontSize: 12 }}>
                    · {s.cat}
                  </span>
                  <span style={{ fontSize: 12 }}>{I.arrowUpRight}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sponsor banner ────────────────────────────────────────────────── */
function Sponsor() {
  return (
    <div
      style={{
        background: "var(--fp-glass-2)",
        border: "1px solid var(--fp-border-1)",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--fp-fg-2)", lineHeight: 1.5 }}>
        <strong style={{ color: "var(--fp-fg-1)", fontWeight: 600 }}>
          월간 조회수 9만회 · 활성 유저 2.5만명!
        </strong>
        <span style={{ color: "var(--fp-fg-3)" }}>
          {" "}
          피그마피디아의 첫 광고주가 되어보세요.
        </span>
      </div>
      <a
        href="#"
        style={{
          fontSize: 12,
          padding: "8px 14px",
          borderRadius: 9999,
          background: "var(--fp-glass-4)",
          border: "1px solid var(--fp-border-2)",
          color: "var(--fp-fg-1)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        문의하기 {I.arrowUpRight}
      </a>
    </div>
  );
}

Object.assign(window, { Navbar, HeroSearch, QACard, AISummary, Sponsor });
