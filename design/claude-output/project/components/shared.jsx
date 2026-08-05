/* global React */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ─── Category palette ──────────────────────────────────────────────── */
const CAT_COLOR = {
  "오토 레이아웃": "amber",
  업데이트: "amber",
  "기초 인터페이스": "yellow",
  템플릿: "yellow",
  "피그마 슬라이드": "yellow",
  피그잼: "purple",
  "피그마 소식": "blue",
  피그마사이트: "blue",
  데일리콘텐츠: "violet",
  "소소한 꿀팁": "pink",
  이벤트: "pink",
  피그마버즈: "pink",
  플러그인: "green",
  프로토타이핑: "orange",
  데브모드: "orange",
  컴포넌트: "red",
  베리어블: "gray",
  피그마메이크: "gray",
  리소스: "emerald",
  수업자료: "cyan",
  "주간 라이브": "rose",
  "Figma A to Z": "indigo",
};
const CAT_HEX = {
  yellow: "#facc15",
  purple: "#a855f7",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  pink: "#ec4899",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  amber: "#f59e0b",
  gray: "#9ca3af",
  emerald: "#10b981",
  cyan: "#06b6d4",
  rose: "#f43f5e",
  indigo: "#6366f1",
};
function catStyle(name, alpha = 0.15) {
  const k = CAT_COLOR[name] || "gray";
  const hex = CAT_HEX[k];
  // hex → rgb
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return { background: `rgba(${r},${g},${b},${alpha})`, color: hex };
}

/* ─── Icons (Lucide-style outline) ──────────────────────────────────── */
const I = {
  search: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  sparkles: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M5.5 5.5l2.5 2.5M16 16l2.5 2.5M18.5 5.5L16 8M8 16l-2.5 2.5" />
    </svg>
  ),
  arrowRight: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  arrowUpRight: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  ),
  copy: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  close: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  chevronRight: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
  chevronDown: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  filter: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  ),
  bookmark: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  share: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  ),
  pencil: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  thumbsUp: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M14 9V5a3 3 0 0 0-6 0v4H4v11h13.5a2.5 2.5 0 0 0 2.45-2L21 12a2 2 0 0 0-2-2z" />
    </svg>
  ),
  message: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  send: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4z" />
    </svg>
  ),
  hash: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
    </svg>
  ),
  command: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  ),
  layers: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  grid: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  list: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  ),
  trending: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M23 6l-9.5 9.5-5-5L1 18" />
      <path d="M17 6h6v6" />
    </svg>
  ),
  clock: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  user: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  star: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  download: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  eye: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12 2l2.39 6.95L22 11l-7.61 2.05L12 20l-2.39-6.95L2 11l7.61-2.05L12 2z" />
    </svg>
  ),
  menu: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  globe: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

/* ─── Badge ─────────────────────────────────────────────────────────── */
function Badge({ label, size = "md", style = {} }) {
  const sz =
    size === "sm"
      ? { fontSize: 11, padding: "2px 6px" }
      : { fontSize: 12, padding: "3px 8px" };
  return (
    <span
      style={{
        ...catStyle(label),
        ...sz,
        borderRadius: 6,
        fontWeight: 500,
        display: "inline-flex",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {label}
    </span>
  );
}

/* ─── Avatar ────────────────────────────────────────────────────────── */
function Avatar({ name, src, size = 28 }) {
  const initial = (name || "?").trim()[0];
  const colorIdx = (name || "").length % 8;
  const palette = [
    "#536DFE",
    "#a855f7",
    "#22c55e",
    "#f97316",
    "#ec4899",
    "#06b6d4",
    "#facc15",
    "#f43f5e",
  ];
  return src ? (
    <img
      src={src}
      alt={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid var(--fp-border-2)",
      }}
    />
  ) : (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: palette[colorIdx] + "33",
        color: palette[colorIdx],
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 600,
        border: "1px solid " + palette[colorIdx] + "55",
      }}
    >
      {initial}
    </span>
  );
}

/* ─── Shortcut chip ─────────────────────────────────────────────────── */
function Kbd({ children }) {
  return (
    <span
      className="mono"
      style={{
        fontSize: 12,
        padding: "4px 9px",
        background: "var(--fp-glass-3)",
        border: "1px solid var(--fp-border-1)",
        borderRadius: 6,
        color: "var(--fp-fg-2)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Wave Hero (CSS+canvas hybrid: cheap & beautiful) ──────────────── */
function HeroWave({ height = 360, intensity = 1, hue = 230 }) {
  const ref = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf,
      t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      c.width = c.offsetWidth * dpr;
      c.height = c.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    function draw() {
      const w = c.offsetWidth,
        h = c.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const bars = 80;
      const cx = w * mouse.current.x;
      const cy = h * (0.5 + mouse.current.y * 0.1);
      for (let i = 0; i < bars; i++) {
        const a = (i / bars) * Math.PI * 2;
        const wave =
          (Math.sin(a * 3 + t * 0.8) +
            Math.sin(a * 5 - t * 0.4) +
            Math.sin(a * 7 + t * 1.2)) /
          3;
        const len = 50 + wave * 90 * intensity;
        const r1 = 80 + Math.sin(t * 0.3 + i * 0.1) * 10;
        const r2 = r1 + len;
        const x1 = cx + Math.cos(a) * r1;
        const y1 = cy + Math.sin(a) * r1 * 0.55;
        const x2 = cx + Math.cos(a) * r2;
        const y2 = cy + Math.sin(a) * r2 * 0.55;
        const lh = (hue + wave * 30) % 360;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `hsla(${lh}, 90%, 60%, 0.0)`);
        grad.addColorStop(0.5, `hsla(${lh}, 90%, 65%, 0.7)`);
        grad.addColorStop(1, `hsla(${lh}, 100%, 70%, 0.0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      // glow center
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      glow.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.35)`);
      glow.addColorStop(1, `hsla(${hue}, 100%, 65%, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      t += 0.012;
      raf = requestAnimationFrame(draw);
    }
    draw();
    function onMove(e) {
      const r = c.getBoundingClientRect();
      mouse.current.x = (e.clientX - r.left) / r.width;
      mouse.current.y = (e.clientY - r.top) / r.height;
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, [intensity, hue]);
  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height,
        pointerEvents: "none",
        filter: "blur(0.4px)",
      }}
    />
  );
}

/* ─── Suggestion typewriter (placeholder rotation) ──────────────────── */
function useTypewriter(words, speed = 90, pause = 1400) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing|holding|deleting
  useEffect(() => {
    let to;
    const word = words[idx % words.length];
    if (phase === "typing") {
      if (text.length < word.length) {
        to = setTimeout(() => setText(word.slice(0, text.length + 1)), speed);
      } else {
        to = setTimeout(() => setPhase("deleting"), pause);
      }
    } else if (phase === "deleting") {
      if (text.length > 0) {
        to = setTimeout(() => setText(text.slice(0, -1)), speed / 2);
      } else {
        setIdx((i) => i + 1);
        setPhase("typing");
      }
    }
    return () => clearTimeout(to);
  }, [text, phase, idx, words, speed, pause]);
  return text;
}

/* ─── Export to window ──────────────────────────────────────────────── */
Object.assign(window, {
  I,
  Badge,
  Avatar,
  Kbd,
  HeroWave,
  useTypewriter,
  CAT_COLOR,
  CAT_HEX,
  catStyle,
});
