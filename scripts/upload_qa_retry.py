"""Retry failed Notion uploads — handles compound categories."""

import csv
import json
import os
import time
from pathlib import Path

from dotenv import load_dotenv
import requests

env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(env_path)

NOTION_API_KEY = os.environ["NOTION_API_KEY"]
MAIN_QA_DB = os.environ["NOTION_DATABASE_ID"]
PLUGIN_DB = "ddc8b180-7f6c-439a-ac53-3f51868d34db"

CSV_PATH = Path(__file__).resolve().parent.parent / "AI_learning source" / "qa_cleansed.csv"
PROGRESS_PATH = Path(__file__).resolve().parent / "qa_notion_progress.json"

HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}

TODAY = "2026-03-07"

CATEGORY_MAP = {
    "Component & Instance": "컴포넌트 & 인스턴스",
    "Prototyping": "프로토타이핑",
    "Collaboration & Process": "협업 & 프로세스",
    "Dev Mode & Handoff": "개발 모드 & 핸드오프",
    "Plugin": "플러그인",
    "UX/UI Design": "UX/UI 디자인",
    "Auto Layout": "오토 레이아웃",
    "Design System": "디자인 시스템",
    "Variables & Styles": "베리어블 & 스타일",
    "Image & Asset": "이미지 & 에셋",
    "Typography": "타이포그래피",
    "Layout & Grid": "레이아웃 & 그리드",
    "File & Project Management": "파일 & 프로젝트 관리",
    "Figma Config & Settings": "피그마 설정",
    "Shape & Vector": "도형 & 벡터",
    "Animation & Motion": "애니메이션 & 모션",
    "Accessibility": "접근성",
    "FigJam": "피그잼",
    "Learning & Study": "학습 & 스터디",
    "Design Token & Workflow": "디자인 토큰 & 워크플로우",
    "Grid & Layout": "레이아웃 & 그리드",
    "Component Management": "컴포넌트 관리",
    "Export & Print": "내보내기 & 인쇄",
    "Troubleshooting": "문제 해결",
    "Variables & Design System": "베리어블 & 디자인 시스템",
    "Publishing & Library": "퍼블리싱 & 라이브러리",
    "Figma Plans & Billing": "피그마 요금제",
    "Design System & Workflow": "디자인 시스템 & 워크플로우",
}


def parse_categories(raw: str) -> list[dict]:
    """Split compound categories and map to Korean."""
    cats = [c.strip() for c in raw.split(",")]
    result = []
    seen = set()
    for cat in cats:
        kr = CATEGORY_MAP.get(cat, cat)
        if kr not in seen:
            result.append({"name": kr})
            seen.add(kr)
    return result


def text_to_blocks(text: str) -> list[dict]:
    blocks = []
    for para in text.split("\n"):
        if not para.strip():
            continue
        chunks = [para[i:i+2000] for i in range(0, len(para), 2000)]
        for chunk in chunks:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": chunk}}]
                }
            })
    return blocks[:100]


def main():
    done = set(json.load(open(PROGRESS_PATH)))

    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        failed = [r for r in reader if r.get("question") and r.get("answer") and r["id"] not in done]

    print(f"Retrying {len(failed)} failed items...")

    for i, row in enumerate(failed):
        cats = parse_categories(row["category"])
        is_plugin = any(c["name"] == "플러그인" for c in cats)

        if is_plugin:
            body = {
                "parent": {"database_id": PLUGIN_DB},
                "properties": {
                    "\uFEFF테마별 플러그인": {
                        "title": [{"text": {"content": row["question"][:2000]}}]
                    },
                    "작성자": {
                        "rich_text": [{"text": {"content": "AI 커뮤니티"}}]
                    },
                    "진행일자": {"date": {"start": TODAY}},
                },
                "children": text_to_blocks(row["answer"]),
            }
        else:
            body = {
                "parent": {"database_id": MAIN_QA_DB},
                "properties": {
                    "글 제목 ": {
                        "title": [{"text": {"content": row["question"][:2000]}}]
                    },
                    "질문 카테고리": {"multi_select": cats},
                    "해결자 닉네임": {
                        "rich_text": [{"text": {"content": "AI 커뮤니티"}}]
                    },
                    "글 작성일": {"date": {"start": TODAY}},
                },
                "children": text_to_blocks(row["answer"]),
            }

        try:
            resp = requests.post(
                "https://api.notion.com/v1/pages",
                headers=HEADERS,
                json=body,
            )
            resp.raise_for_status()
            done.add(row["id"])
            print(f"  [{i+1}/{len(failed)}] ID {row['id']} OK")
            time.sleep(0.35)
        except Exception as e:
            print(f"  [{i+1}/{len(failed)}] ID {row['id']} FAILED: {e}")
            # Print response body for debugging
            try:
                print(f"    Response: {resp.text[:200]}")
            except:
                pass
            if "429" in str(e):
                time.sleep(30)
            else:
                time.sleep(1)

    with open(PROGRESS_PATH, "w") as f:
        json.dump(sorted(done), f)

    print(f"\nDone! Total: {len(done)}/611")


if __name__ == "__main__":
    main()
