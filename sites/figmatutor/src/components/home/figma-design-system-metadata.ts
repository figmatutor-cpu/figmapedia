import type { Metadata } from "next";
import { programs } from "./programs";

const program = programs[1];
const title = `${program.title} | 피그마튜터 하이서`;
const description = "AI가 이해하는 Figma 디자인 시스템 정리, 디자인 하네스 설정, 코드화·프로토타이핑과 디자인 QA까지. 디자이너·디자인 리드를 위한 7시간·6세션 실습 교육입니다.";
const image = { url: "https://figmatutor.info/images/education/figma-design-system.png", width: 1241, height: 757, alt: "AI가 이해하는 Figma 디자인 시스템과 네이밍 규칙 강의 자료" };
export const figmaDesignSystemMetadata: Metadata = {
  title,
  description,
  alternates: { canonical: `https://figmatutor.info${program.href}` },
  openGraph: { title, description, url: `https://figmatutor.info${program.href}`, type: "website", images: [image] },
  twitter: { card: "summary_large_image", title, description, images: [image.url] },
};
