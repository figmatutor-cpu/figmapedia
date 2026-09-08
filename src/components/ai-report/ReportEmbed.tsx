"use client";

import { useEffect, useState } from "react";

interface ReportEmbedProps {
  /** 리포트 본문 URL (리포트 앱, ?embed=1 포함) */
  src: string;
  /** postMessage 검증용 origin */
  origin: string;
  title: string;
}

/** 리포트 앱이 보내는 높이 메시지 타입 */
const HEIGHT_MESSAGE_TYPE = "huddling-report:height";
/** 리포트 앱이 보내는 이미지 확대 팝업 요청 메시지 타입 */
const LIGHTBOX_MESSAGE_TYPE = "huddling-report:lightbox";

/**
 * 리포트 본문 iframe.
 *
 * 리포트 앱은 Tailwind v4 전체 빌드 + Figma Make 리셋 CSS(약 105KB)를
 * document.head에 런타임 주입하고 MutationObserver로 전역 DOM을 조작한다.
 * 같은 문서에 넣으면 이 사이트의 스타일이 깨지므로 iframe으로 격리한다.
 *
 * 리포트 앱이 높이를 postMessage로 보내주면 iframe을 그 높이로 늘려
 * 내부 스크롤 없이 페이지 스크롤만으로 읽히게 한다.
 * 메시지가 오지 않으면 뷰포트 높이로 두고 내부 스크롤에 맡긴다(graceful degradation).
 */
export function ReportEmbed({ src, origin, title }: ReportEmbedProps) {
  const [height, setHeight] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null,
  );

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== origin) return;

      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === HEIGHT_MESSAGE_TYPE) {
        const next = Number(data.height);
        if (!Number.isFinite(next) || next <= 0) return;

        // 비정상적으로 큰 값 방어
        setHeight(Math.min(Math.ceil(next), 200_000));
        return;
      }

      if (data.type === LIGHTBOX_MESSAGE_TYPE) {
        // 리포트 본문 iframe은 콘텐츠 전체 높이만큼 늘어나 있어(위 높이
        // 핸드셰이크 참고) 그 안에서는 position:fixed로 브라우저 화면
        // 기준 오버레이를 만들 수 없다. 그래서 팝업은 부모(이 컴포넌트)
        // 가 실제 뷰포트 기준으로 렌더링한다.
        const nextSrc = typeof data.src === "string" ? data.src : "";
        if (!nextSrc) return;
        setLightbox({
          src: nextSrc,
          alt: typeof data.alt === "string" ? data.alt : "",
        });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [origin]);

  useEffect(() => {
    if (!lightbox) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(null);
    }

    document.addEventListener("keydown", handleKeydown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox]);

  return (
    <>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        // 리포트 본문은 우리가 관리하는 앱이지만 최소 권한만 허용
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        // 리포트 본문이 다크라 테두리 없이 페이지 배경과 이어 붙인다.
        // bg는 로드 전 흰 화면이 번쩍이지 않도록 사이트 배경색으로 둔다.
        className={`w-full rounded-xl bg-bg-base ${
          height === null ? "h-[calc(100vh-8rem)]" : ""
        }`}
        style={height === null ? undefined : { height }}
      />
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 원격 서명 URL, next/image 최적화 대상 아님 */}
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full rounded-xl shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="닫기"
            className="absolute top-4 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white hover:bg-white/20"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
