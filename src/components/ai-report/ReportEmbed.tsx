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

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== origin) return;

      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type !== HEIGHT_MESSAGE_TYPE) return;

      const next = Number(data.height);
      if (!Number.isFinite(next) || next <= 0) return;

      // 비정상적으로 큰 값 방어
      setHeight(Math.min(Math.ceil(next), 200_000));
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [origin]);

  return (
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
  );
}
