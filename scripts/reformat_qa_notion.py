"""
기존 업로드된 611개 Q&A 페이지를 콘텐츠 작성 가이드 양식으로 재작성.
방식: 기존 페이지 archive → 새 페이지 생성 (블록 개별 삭제보다 API 효율적)

구조:
  # 질문사항
  💡 callout: 질문 내용
  # 답변
  💡 callout: 답변 첫 단락 (요약)
  나머지 답변 본문 (paragraph/heading/list 블록)
"""

import csv
import json
import os
import re
import time
import sys
from pathlib import Path

from dotenv import load_dotenv
import requests

env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(env_path)

NOTION_API_KEY = os.environ["NOTION_API_KEY"]
MAIN_QA_DB = os.environ["NOTION_DATABASE_ID"]
PLUGIN_DB = "ddc8b180-7f6c-439a-ac53-3f51868d34db"

CSV_PATH = Path(__file__).resolve().parent.parent / "AI_learning source" / "qa_cleansed.csv"
PROGRESS_PATH = Path(__file__).resolve().parent / "qa_reformat_progress2.json"

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


def load_progress() -> set:
    if PROGRESS_PATH.exists():
        with open(PROGRESS_PATH) as f:
            return set(json.load(f))
    return set()


def save_progress(done_ids: set):
    with open(PROGRESS_PATH, "w") as f:
        json.dump(sorted(done_ids), f)


def read_csv() -> list[dict]:
    rows = []
    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("question") and row.get("answer"):
                rows.append(row)
    return rows


def parse_categories(raw: str) -> list[dict]:
    cats = [c.strip() for c in raw.split(",")]
    result = []
    seen = set()
    for cat in cats:
        kr = CATEGORY_MAP.get(cat, cat)
        if kr not in seen:
            result.append({"name": kr})
            seen.add(kr)
    return result


def query_all_pages(db_id: str, author_field: str) -> list[dict]:
    pages = []
    start_cursor = None
    while True:
        body = {
            "filter": {
                "property": author_field,
                "rich_text": {"equals": "AI 커뮤니티"},
            },
            "page_size": 100,
        }
        if start_cursor:
            body["start_cursor"] = start_cursor
        resp = requests.post(
            f"https://api.notion.com/v1/databases/{db_id}/query",
            headers=HEADERS, json=body,
        )
        resp.raise_for_status()
        data = resp.json()
        pages.extend(data["results"])
        if not data.get("has_more"):
            break
        start_cursor = data["next_cursor"]
        time.sleep(0.35)
    return pages


def archive_page(page_id: str):
    resp = requests.patch(
        f"https://api.notion.com/v1/pages/{page_id}",
        headers=HEADERS,
        json={"archived": True},
    )
    resp.raise_for_status()


def build_formatted_blocks(question: str, answer: str) -> list[dict]:
    blocks = []

    # ── H1: 질문사항 ──
    blocks.append({
        "object": "block", "type": "heading_1",
        "heading_1": {"rich_text": [{"type": "text", "text": {"content": "질문사항"}}]}
    })

    # 💡 callout: 질문
    blocks.append({
        "object": "block", "type": "callout",
        "callout": {
            "icon": {"type": "emoji", "emoji": "💡"},
            "rich_text": [{"type": "text", "text": {"content": question[:2000]}}],
        }
    })

    # ── H1: 답변 ──
    blocks.append({
        "object": "block", "type": "heading_1",
        "heading_1": {"rich_text": [{"type": "text", "text": {"content": "답변"}}]}
    })

    # 답변 파싱
    paragraphs = [p for p in answer.split("\n") if p.strip()]
    if not paragraphs:
        return blocks

    # 💡 callout: 첫 단락 (요약)
    first = paragraphs[0].strip().lstrip("#").strip()
    blocks.append({
        "object": "block", "type": "callout",
        "callout": {
            "icon": {"type": "emoji", "emoji": "💡"},
            "rich_text": [{"type": "text", "text": {"content": first[:2000]}}],
        }
    })

    # 나머지 → Notion 블록
    for para in paragraphs[1:]:
        text = para.strip()
        if not text:
            continue

        if text.startswith("### "):
            blocks.append({"object": "block", "type": "heading_3",
                "heading_3": {"rich_text": [{"type": "text", "text": {"content": text[4:][:2000]}}]}})
        elif text.startswith("## "):
            blocks.append({"object": "block", "type": "heading_2",
                "heading_2": {"rich_text": [{"type": "text", "text": {"content": text[3:][:2000]}}]}})
        elif text.startswith("> "):
            blocks.append({"object": "block", "type": "quote",
                "quote": {"rich_text": [{"type": "text", "text": {"content": text[2:][:2000]}}]}})
        elif text.startswith("- ") or text.startswith("* "):
            blocks.append({"object": "block", "type": "bulleted_list_item",
                "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": text[2:][:2000]}}]}})
        else:
            m = re.match(r'^\d+[.)]\s*', text)
            if m:
                blocks.append({"object": "block", "type": "numbered_list_item",
                    "numbered_list_item": {"rich_text": [{"type": "text", "text": {"content": text[m.end():][:2000]}}]}})
            else:
                chunks = [text[i:i+2000] for i in range(0, len(text), 2000)]
                for chunk in chunks:
                    blocks.append({"object": "block", "type": "paragraph",
                        "paragraph": {"rich_text": [{"type": "text", "text": {"content": chunk}}]}})

    return blocks[:100]


def create_page(db_id: str, title_field: str, title: str,
                cats: list[dict], author_field: str, row: dict) -> str:
    properties = {
        title_field: {"title": [{"text": {"content": title[:2000]}}]},
        author_field: {"rich_text": [{"text": {"content": "AI 커뮤니티"}}]},
    }

    if db_id == MAIN_QA_DB:
        properties["질문 카테고리"] = {"multi_select": cats}
        properties["글 작성일"] = {"date": {"start": TODAY}}
    else:
        properties["진행일자"] = {"date": {"start": TODAY}}

    children = build_formatted_blocks(row["question"], row["answer"])

    body = {"parent": {"database_id": db_id}, "properties": properties, "children": children}
    resp = requests.post("https://api.notion.com/v1/pages", headers=HEADERS, json=body)
    resp.raise_for_status()
    return resp.json()["id"]


def main():
    csv_rows = read_csv()
    print(f"CSV loaded: {len(csv_rows)} Q&A pairs", flush=True)

    done_ids = load_progress()
    print(f"Already done: {len(done_ids)}", flush=True)

    # Step 1: 기존 페이지 archive
    print("\n[Step 1] Archiving old pages...", flush=True)

    main_pages = query_all_pages(MAIN_QA_DB, "해결자 닉네임")
    plugin_pages = query_all_pages(PLUGIN_DB, "작성자")
    old_pages = main_pages + plugin_pages
    print(f"  Found {len(old_pages)} old pages to archive", flush=True)

    for i, page in enumerate(old_pages):
        try:
            archive_page(page["id"])
            time.sleep(0.15)
        except Exception as e:
            if "429" in str(e):
                time.sleep(10)
                archive_page(page["id"])
            else:
                print(f"  Archive error: {e}", flush=True)

        if (i + 1) % 50 == 0:
            print(f"  Archived {i+1}/{len(old_pages)}", flush=True)

    print(f"  Archive complete: {len(old_pages)} pages", flush=True)

    # Step 2: 새 페이지 생성 (양식 적용)
    print("\n[Step 2] Creating reformatted pages...", flush=True)

    remaining = [r for r in csv_rows if r["id"] not in done_ids]
    print(f"  Remaining: {len(remaining)}", flush=True)

    for i, row in enumerate(remaining):
        cats_raw = row["category"].strip()
        cats = parse_categories(cats_raw)
        is_plugin = any(c["name"] == "플러그인" for c in cats)

        if is_plugin:
            db_id = PLUGIN_DB
            title_field = "\uFEFF테마별 플러그인"
            author_field = "작성자"
        else:
            db_id = MAIN_QA_DB
            title_field = "글 제목 "
            author_field = "해결자 닉네임"

        try:
            create_page(db_id, title_field, row["question"], cats, author_field, row)
            done_ids.add(row["id"])

            if (i + 1) % 10 == 0:
                save_progress(done_ids)
                print(f"  [{i+1}/{len(remaining)}] created", flush=True)

            time.sleep(0.35)
        except Exception as e:
            print(f"  [{i+1}] ERROR (ID {row['id']}): {e}", flush=True)
            save_progress(done_ids)
            if "429" in str(e):
                print("  Rate limited, waiting 30s...", flush=True)
                time.sleep(30)
            else:
                time.sleep(1)

    save_progress(done_ids)
    print(f"\nComplete! {len(done_ids)}/{len(csv_rows)} pages reformatted.", flush=True)


if __name__ == "__main__":
    main()
