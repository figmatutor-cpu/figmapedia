import type { Metadata } from "next";
import { programs } from "./programs";

const program = programs[2];
const title = `${program.title} | 피그마튜터 하이서`;
const description = "팀의 맥락을 기억하는 AI 에이전트 설정부터 Slack 또는 Discord·Obsidian·GitHub 지식 공유, 메일·일정·회의록 연결까지. PM·디자이너·개발자를 위한 기업 AI 협업 교육입니다.";
const url = `https://figmatutor.info${program.href}`;
const image = { url: "https://figmatutor.info/images/education/team-collaboration.png", width: 2716, height: 1376, alt: "팀 전용 AI 에이전트와 Slack 또는 Discord·Obsidian 협업 환경 강의 자료" };

export const teamCollaborationMetadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website", images: [image] },
  twitter: { card: "summary_large_image", title, description, images: [image.url] },
};
