"""
Notion DB에 Q&A 611개 업로드.
- Plugin 카테고리 → 플러그인 DB (ddc8b180-7f6c-439a-ac53-3f51868d34db)
- 나머지 → 메인 Q&A DB (NOTION_DATABASE_ID)

메인 Q&A DB 속성:
  - "글 제목 " (title) — 질문
  - "질문 카테고리" (multi_select) — 카테고리
  - "해결자 닉네임" (rich_text) — "AI 커뮤니티"
  - "글 작성일" (date) — 오늘 날짜

플러그인 DB 속성:
  - "\uFEFF테마별 플러그인" (title, BOM prefix) — 질문
  - "작성자" (rich_text) — "AI 커뮤니티"
  - "진행일자" (date) — 오늘 날짜

각 페이지 본문에 답변 텍스트를 paragraph 블록으로 추가.
"""

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

# 카테고리 영→한 매핑
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


def text_to_blocks(text: str) -> list[dict]:
    """답변 텍스트를 Notion paragraph 블록으로 변환.
    Notion API는 블록당 rich_text 2000자 제한이 있으므로 분할."""
    blocks = []
    # 줄바꿈 기준 단락 분리
    paragraphs = text.split("\n")

    for para in paragraphs:
        if not para.strip():
            continue
        # 2000자 제한
        chunks = [para[i:i+2000] for i in range(0, len(para), 2000)]
        for chunk in chunks:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": chunk}}]
                }
            })

    # Notion API는 한 번에 최대 100 블록
    return blocks[:100]


def create_main_qa_page(row: dict) -> str:
    """메인 Q&A DB에 페이지 생성"""
    cat_en = row["category"].strip()
    cat_kr = CATEGORY_MAP.get(cat_en, cat_en)

    body = {
        "parent": {"database_id": MAIN_QA_DB},
        "properties": {
            "글 제목 ": {
                "title": [{"text": {"content": row["question"][:2000]}}]
            },
            "질문 카테고리": {
                "multi_select": [{"name": cat_kr}]
            },
            "해결자 닉네임": {
                "rich_text": [{"text": {"content": "AI 커뮤니티"}}]
            },
            "글 작성일": {
                "date": {"start": TODAY}
            },
        },
        "children": text_to_blocks(row["answer"]),
    }

    resp = requests.post(
        "https://api.notion.com/v1/pages",
        headers=HEADERS,
        json=body,
    )
    resp.raise_for_status()
    return resp.json()["id"]


def create_plugin_page(row: dict) -> str:
    """플러그인 DB에 페이지 생성"""
    body = {
        "parent": {"database_id": PLUGIN_DB},
        "properties": {
            "\uFEFF테마별 플러그인": {
                "title": [{"text": {"content": row["question"][:2000]}}]
            },
            "작성자": {
                "rich_text": [{"text": {"content": "AI 커뮤니티"}}]
            },
            "진행일자": {
                "date": {"start": TODAY}
            },
        },
        "children": text_to_blocks(row["answer"]),
    }

    resp = requests.post(
        "https://api.notion.com/v1/pages",
        headers=HEADERS,
        json=body,
    )
    resp.raise_for_status()
    return resp.json()["id"]


def main():
    rows = read_csv()
    print(f"CSV loaded: {len(rows)} Q&A pairs")

    plugin_rows = [r for r in rows if r["category"].strip() == "Plugin"]
    main_rows = [r for r in rows if r["category"].strip() != "Plugin"]
    print(f"  Main Q&A: {len(main_rows)}, Plugin: {len(plugin_rows)}")

    done_ids = load_progress()
    print(f"Already uploaded: {len(done_ids)}")

    # Upload main Q&A
    main_remaining = [r for r in main_rows if r["id"] not in done_ids]
    print(f"\nUploading Main Q&A ({len(main_remaining)} remaining)...")

    for i, row in enumerate(main_remaining):
        try:
            page_id = create_main_qa_page(row)
            done_ids.add(row["id"])
            if (i + 1) % 10 == 0:
                save_progress(done_ids)
                print(f"  {i+1}/{len(main_remaining)} done")
            # Notion rate limit: ~3 requests/second
            time.sleep(0.35)
        except Exception as e:
            print(f"  Error at row {row['id']}: {e}")
            save_progress(done_ids)
            if "rate" in str(e).lower() or "429" in str(e):
                print("  Rate limited. Waiting 30s...")
                time.sleep(30)
            else:
                time.sleep(1)

    save_progress(done_ids)
    print(f"Main Q&A upload complete: {len([r for r in main_rows if r['id'] in done_ids])}/{len(main_rows)}")

    # Upload plugins
    plugin_remaining = [r for r in plugin_rows if r["id"] not in done_ids]
    print(f"\nUploading Plugins ({len(plugin_remaining)} remaining)...")

    for i, row in enumerate(plugin_remaining):
        try:
            page_id = create_plugin_page(row)
            done_ids.add(row["id"])
            if (i + 1) % 10 == 0:
                save_progress(done_ids)
                print(f"  {i+1}/{len(plugin_remaining)} done")
            time.sleep(0.35)
        except Exception as e:
            print(f"  Error at row {row['id']}: {e}")
            save_progress(done_ids)
            if "rate" in str(e).lower() or "429" in str(e):
                print("  Rate limited. Waiting 30s...")
                time.sleep(30)
            else:
                time.sleep(1)

    save_progress(done_ids)
    print(f"\nAll done! Total uploaded: {len(done_ids)}/{len(rows)}")


if __name__ == "__main__":
    main()
