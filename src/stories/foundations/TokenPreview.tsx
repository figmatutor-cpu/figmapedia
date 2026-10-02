"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** 렌더된 요소의 computed style 값을 읽어 표시 — 토큰 값을 하드코딩하지 않기 위함 */
export function useComputedStyle<T extends HTMLElement>(
  property: keyof CSSStyleDeclaration,
) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (ref.current) {
      setValue(String(getComputedStyle(ref.current)[property]));
    }
  }, [property]);

  return { ref, value };
}

export interface ColorToken {
  /** Tailwind 유틸리티 이름 (bg-* 접두사 제외) */
  name: string;
  /** 스캐너가 인식하도록 리터럴 클래스명으로 작성 */
  className: string;
  usage: string;
}

export function ColorSwatch({ token }: { token: ColorToken }) {
  const { ref, value } = useComputedStyle<HTMLDivElement>("backgroundColor");

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={ref}
        className={`h-16 rounded-lg border border-white/10 ${token.className}`}
      />
      <div className="flex flex-col gap-0.5">
        <code className="font-mono text-xs text-white">{token.name}</code>
        <span className="font-mono text-xxs text-gray-500">{value}</span>
        <span className="text-xs text-gray-400">{token.usage}</span>
      </div>
    </div>
  );
}

export function TokenSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 mb-10">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
