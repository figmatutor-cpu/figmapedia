import type { Metadata } from "next";
import { programs } from "./programs";

const program = programs[0];
const title = "AI 업무 자동화 교육 | 반복 업무를 줄이는 AI 워크플로우 | 피그마튜터";
const description = "브랜드·경쟁사 컨텍스트 작성부터 역할별 AI 에이전트 제작, CLAUDE.md로 연결하는 자동화까지. 디자이너·PM·IT 실무자를 위한 7시간 실습 교육입니다.";
export const aiWorkflowMetadata: Metadata = {
  title,
  description,
  alternates: { canonical: `https://figmatutor.info${program.href}` },
  openGraph: { title, description, url: `https://figmatutor.info${program.href}`, type: "website", images: [{ url: "https://figmatutor.info/images/education/ai-workflow-curriculum.png", width: 1220, height: 822, alt: "AI 업무 자동화 교육의 파이프라인과 브랜드 컨텍스트 작성 강의 자료" }] },
  twitter: { card: "summary_large_image", title, description, images: ["https://figmatutor.info/images/education/ai-workflow-curriculum.png"] },
};
