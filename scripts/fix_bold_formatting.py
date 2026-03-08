"""
Notion 페이지 블록에서 **텍스트** 마크다운을 실제 볼드 서식으로 변환.
- AI 커뮤니티 작성 페이지만 대상
- ** 포함된 블록만 찾아서 rich_text를 파싱 후 업데이트
"""

import json
import os
import re
import time
from pathlib import Path

from dotenv import load_dotenv
import requests

env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(env_path)

NOTION_API_KEY = os.environ["NOTION_API_KEY"]
MAIN_QA_DB = os.environ["NOTION_DATABASE_ID"]
PLUGIN_DB = "ddc8b180-7f6c-439a-ac53-3f51868d34db"

HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}

PROGRESS_PATH = Path(__file__).resolve().parent / "qa_bold_progress.json"


def load_progress() -> set:
    if PROGRESS_PATH.exists():
        with open(PROGRESS_PATH) as f:
            return set(json.load(f))
    return set()


def save_progress(done_ids: set):
    with open(PROGRESS_PATH, "w") as f:
        json.dump(sorted(done_ids), f)


def query_all_pages(db_id: str, author_field: str) -> list[dict]:
    pages = []
    start_cursor = None
    while True:
        body = {
            "filter": {"property": author_field, "rich_text": {"equals": "AI 커뮤니티"}},
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


def get_block_children(page_id: str) -> list[dict]:
    blocks = []
    start_cursor = None
    while True:
        url = f"https://api.notion.com/v1/blocks/{page_id}/children?page_size=100"
        if start_cursor:
            url += f"&start_cursor={start_cursor}"
        resp = requests.get(url, headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        blocks.extend(data["results"])
        if not data.get("has_more"):
            break
        start_cursor = data["next_cursor"]
        time.sleep(0.35)
    return blocks


def parse_markdown_bold(text: str) -> list[dict]:
    """**텍스트**를 Notion rich_text 배열로 변환.

    예: "이것은 **볼드** 텍스트입니다"
    → [
        {"type":"text","text":{"content":"이것은 "},"annotations":{"bold":false,...}},
        {"type":"text","text":{"content":"볼드"},"annotations":{"bold":true,...}},
        {"type":"text","text":{"content":" 텍스트입니다"},"annotations":{"bold":false,...}},
    ]
    """
    parts = re.split(r'\*\*(.+?)\*\*', text)
    rich_text = []

    for i, part in enumerate(parts):
        if not part:
            continue
        is_bold = (i % 2 == 1)  # 홀수 인덱스 = ** 안의 텍스트
        rich_text.append({
            "type": "text",
            "text": {"content": part},
            "annotations": {
                "bold": is_bold,
                "italic": False,
                "strikethrough": False,
                "underline": False,
                "code": False,
                "color": "default",
            }
        })

    return rich_text


def block_has_bold_markdown(block: dict) -> bool:
    """블록의 텍스트에 **...**가 있는지 확인."""
    btype = block["type"]
    data = block.get(btype, {})
    rich_text = data.get("rich_text", [])
    full_text = "".join(rt.get("plain_text", "") for rt in rich_text)
    return "**" in full_text


def get_block_text(block: dict) -> str:
    btype = block["type"]
    data = block.get(btype, {})
    rich_text = data.get("rich_text", [])
    return "".join(rt.get("plain_text", "") for rt in rich_text)


# rich_text를 지원하는 블록 타입
RICH_TEXT_BLOCK_TYPES = {
    "paragraph", "heading_1", "heading_2", "heading_3",
    "bulleted_list_item", "numbered_list_item",
    "quote", "callout", "to_do", "toggle",
}


def update_block_bold(block_id: str, block_type: str, new_rich_text: list[dict], block: dict):
    """블록의 rich_text를 업데이트."""
    update_data = {block_type: {"rich_text": new_rich_text}}

    # callout은 icon 유지 필요
    if block_type == "callout":
        icon = block.get("callout", {}).get("icon")
        if icon:
            update_data["callout"]["icon"] = icon

    resp = requests.patch(
        f"https://api.notion.com/v1/blocks/{block_id}",
        headers=HEADERS,
        json=update_data,
    )
    resp.raise_for_status()


def process_page(page_id: str) -> int:
    """페이지의 블록 중 **볼드** 마크다운을 실제 볼드로 변환. 수정된 블록 수 반환."""
    blocks = get_block_children(page_id)
    updated = 0

    for block in blocks:
        btype = block["type"]
        if btype not in RICH_TEXT_BLOCK_TYPES:
            continue

        if not block_has_bold_markdown(block):
            continue

        full_text = get_block_text(block)
        new_rich_text = parse_markdown_bold(full_text)

        try:
            update_block_bold(block["id"], btype, new_rich_text, block)
            updated += 1
            time.sleep(0.15)
        except Exception as e:
            print(f"    Block update error: {e}", flush=True)
            if "429" in str(e):
                time.sleep(10)

    return updated


def main():
    done_ids = load_progress()
    print(f"Already processed: {len(done_ids)} pages", flush=True)

    # 페이지 조회
    print("Querying pages...", flush=True)
    main_pages = query_all_pages(MAIN_QA_DB, "해결자 닉네임")
    plugin_pages = query_all_pages(PLUGIN_DB, "작성자")
    all_pages = main_pages + plugin_pages
    print(f"Total pages: {len(all_pages)}", flush=True)

    remaining = [p for p in all_pages if p["id"] not in done_ids]
    print(f"Remaining: {len(remaining)}", flush=True)

    total_blocks_updated = 0

    for i, page in enumerate(remaining):
        try:
            updated = process_page(page["id"])
            total_blocks_updated += updated
            done_ids.add(page["id"])

            if (i + 1) % 20 == 0:
                save_progress(done_ids)
                print(f"  [{i+1}/{len(remaining)}] processed (total bold fixes: {total_blocks_updated})", flush=True)

            time.sleep(0.15)
        except Exception as e:
            print(f"  [{i+1}] ERROR: {e}", flush=True)
            save_progress(done_ids)
            if "429" in str(e):
                time.sleep(30)
            else:
                time.sleep(1)

    save_progress(done_ids)
    print(f"\nComplete! {len(done_ids)}/{len(all_pages)} pages processed.", flush=True)
    print(f"Total bold-formatted blocks: {total_blocks_updated}", flush=True)


if __name__ == "__main__":
    main()
