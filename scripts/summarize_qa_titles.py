"""
611개 Q&A 제목을 Gemini로 간결하게 요약 + Notion 업데이트 + Supabase 임베딩 ID 갱신.

Phase 1: Notion에서 "피그마 오픈카톡방" 작성 페이지 fetch → Gemini로 제목 요약 → Notion 제목 업데이트
Phase 2: qa-{num} 임베딩을 Notion page ID로 교체 (검색 인덱스 ID와 일치시킴)

DB 분포:
- 메인 Q&A DB: 567개 (title prop: "글 제목 ", author prop: "해결자 닉네임")
- 플러그인 DB: 44개 (title prop: "\uFEFF테마별 플러그인", author prop: "작성자")

사용법:
  pip install python-dotenv google-genai supabase
  python scripts/summarize_qa_titles.py          # Phase 1+2 전체
  python scripts/summarize_qa_titles.py --phase1  # 제목 요약만
  python scripts/summarize_qa_titles.py --phase2  # 임베딩 ID 갱신만
"""

import csv
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
import requests

env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(env_path)

NOTION_API_KEY = os.environ["NOTION_API_KEY"]
MAIN_QA_DB = os.environ["NOTION_DATABASE_ID"]
PLUGIN_DB = "ddc8b180-7f6c-439a-ac53-3f51868d34db"
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

AUTHOR_NAME = "피그마 오픈카톡방"

HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}

CSV_PATH = Path(__file__).resolve().parent.parent / "AI_learning source" / "qa_cleansed.csv"
PROGRESS_PATH = Path(__file__).resolve().parent / "qa_title_progress.json"

# ── Notion helpers ──

def _query_all(db_id: str, author_prop: str) -> list[dict]:
    """Paginate through a Notion DB filtered by author."""
    pages = []
    cursor = None
    while True:
        body = {
            "filter": {"property": author_prop, "rich_text": {"equals": AUTHOR_NAME}},
            "page_size": 100,
        }
        if cursor:
            body["start_cursor"] = cursor
        resp = requests.post(
            f"https://api.notion.com/v1/databases/{db_id}/query",
            headers=HEADERS,
            json=body,
        )
        resp.raise_for_status()
        data = resp.json()
        pages.extend(data["results"])
        if not data.get("has_more"):
            break
        cursor = data["next_cursor"]
    return pages


def fetch_all_qa_pages() -> list[dict]:
    """메인 DB + 플러그인 DB에서 Q&A 페이지 fetch. 각 페이지에 _db 태그 추가."""
    main_pages = _query_all(MAIN_QA_DB, "해결자 닉네임")
    for p in main_pages:
        p["_db"] = "main"

    plugin_pages = _query_all(PLUGIN_DB, "작성자")
    for p in plugin_pages:
        p["_db"] = "plugin"

    return main_pages + plugin_pages


def get_page_title(page: dict) -> str:
    if page.get("_db") == "plugin":
        # Plugin DB: title prop has BOM prefix
        title_prop = page["properties"].get("\uFEFF테마별 플러그인", {})
        if not title_prop:
            title_prop = page["properties"].get("테마별 플러그인", {})
    else:
        title_prop = page["properties"].get("글 제목 ", {})
    title_arr = title_prop.get("title", [])
    return "".join(t["plain_text"] for t in title_arr)


def update_page_title(page: dict, new_title: str):
    page_id = page["id"]
    if page.get("_db") == "plugin":
        prop_name = "\uFEFF테마별 플러그인"
    else:
        prop_name = "글 제목 "

    body = {
        "properties": {
            prop_name: {
                "title": [{"text": {"content": new_title}}]
            }
        }
    }
    resp = requests.patch(
        f"https://api.notion.com/v1/pages/{page_id}",
        headers=HEADERS,
        json=body,
    )
    resp.raise_for_status()


# ── Gemini summarization ──

def summarize_titles_batch(titles: list[str]) -> list[str]:
    """Gemini로 제목 배치 요약. 각 제목을 15~30자 내외로 간결하게."""
    from google import genai

    client = genai.Client(api_key=GEMINI_API_KEY)

    numbered = "\n".join(f"{i+1}. {t}" for i, t in enumerate(titles))
    prompt = f"""아래 피그마 Q&A 제목들을 각각 15~30자 내외로 간결하게 요약해주세요.

규칙:
- 핵심 키워드만 남기고 불필요한 표현 제거
- "~할 수 있나요?", "~방법이 있을까요?" 같은 질문형 어미 제거
- 피그마 용어는 그대로 유지 (오토 레이아웃, 컴포넌트, 베리어블 등)
- 각 줄에 번호와 요약만 출력 (다른 텍스트 없이)
- 반드시 입력과 동일한 개수({len(titles)}개)를 출력

입력:
{numbered}

출력 형식 (번호. 요약된 제목):
1. 인스턴스 일괄 분리 방법
2. 퍼블리싱 후 인스턴스 미업데이트 문제
..."""

    result = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={"thinking_config": {"thinking_budget": 0}},
    )

    text = result.text.strip()
    lines = text.strip().split("\n")

    summaries = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # "1. 요약된 제목" 형식 파싱
        parts = line.split(". ", 1)
        if len(parts) == 2 and parts[0].strip().isdigit():
            summaries.append(parts[1].strip())
        else:
            summaries.append(line)

    return summaries


# ── Progress ──

def load_progress() -> dict:
    """Returns {page_id: new_title}"""
    if PROGRESS_PATH.exists():
        with open(PROGRESS_PATH) as f:
            return json.load(f)
    return {}


def save_progress(data: dict):
    with open(PROGRESS_PATH, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ── Phase 1: Summarize + Update Notion ──

def phase1():
    print("=== Phase 1: Gemini 제목 요약 + Notion 업데이트 ===\n")

    pages = fetch_all_qa_pages()
    print(f"Notion에서 {len(pages)}개 Q&A 페이지 로드됨 (메인: {sum(1 for p in pages if p['_db']=='main')}, 플러그인: {sum(1 for p in pages if p['_db']=='plugin')})")

    progress = load_progress()
    done_ids = set(progress.keys())
    print(f"이미 완료: {len(done_ids)}개\n")

    # Filter out already done
    todo = [(p, get_page_title(p)) for p in pages if p["id"] not in done_ids]
    # Filter out pages with empty titles
    todo = [(p, t) for p, t in todo if t.strip()]
    print(f"남은 작업: {len(todo)}개\n")

    if not todo:
        print("모든 제목 요약 완료!")
        return

    BATCH = 30
    for i in range(0, len(todo), BATCH):
        batch = todo[i:i + BATCH]
        titles = [t for _, t in batch]
        batch_num = i // BATCH + 1
        total_batches = (len(todo) + BATCH - 1) // BATCH

        print(f"Batch {batch_num}/{total_batches}: {len(batch)}개 요약 중...")

        try:
            summaries = summarize_titles_batch(titles)
        except Exception as e:
            print(f"  Gemini 오류: {e}, 10초 후 재시도...")
            time.sleep(10)
            try:
                summaries = summarize_titles_batch(titles)
            except Exception as e2:
                print(f"  재시도 실패: {e2}. 배치 스킵.")
                continue

        if len(summaries) != len(batch):
            print(f"  경고: 입력 {len(batch)}개 vs 출력 {len(summaries)}개 불일치. 배치 스킵.")
            continue

        for (page, old_title), new_title in zip(batch, summaries):
            page_id = page["id"]
            try:
                update_page_title(page, new_title)
                progress[page_id] = new_title
                print(f"  ✓ {old_title[:40]}... → {new_title}")
            except Exception as e:
                print(f"  ✗ {old_title[:40]}...: {e}")
            time.sleep(0.35)  # Notion rate limit

        save_progress(progress)
        print(f"  Batch {batch_num} 완료 ({len(progress)}/{len(pages)} total)\n")

        if i + BATCH < len(todo):
            time.sleep(2)  # Gemini rate limit

    print(f"\nPhase 1 완료! {len(progress)}개 제목 업데이트됨.")


# ── Phase 2: Supabase 임베딩 ID 갱신 ──

def phase2():
    print("\n=== Phase 2: Supabase 임베딩 ID를 Notion 페이지 ID로 갱신 ===\n")

    from google import genai
    from google.genai import types
    from supabase import create_client

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    gemini = genai.Client(api_key=GEMINI_API_KEY)

    # 1. Notion 페이지 fetch + 생성 시간순 정렬
    pages = fetch_all_qa_pages()
    main_pages = sorted([p for p in pages if p["_db"] == "main"], key=lambda p: p["created_time"])
    plugin_pages = sorted([p for p in pages if p["_db"] == "plugin"], key=lambda p: p["created_time"])
    print(f"Notion 페이지: main={len(main_pages)}, plugin={len(plugin_pages)}")

    # 2. CSV 읽기 + main/plugin 분리 (업로드 스크립트와 동일 로직)
    rows = []
    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("question"):
                rows.append(row)

    main_rows = [r for r in rows if "Plugin" not in r["category"]]
    plugin_rows = [r for r in rows if "Plugin" in r["category"]]
    print(f"CSV: main={len(main_rows)}, plugin={len(plugin_rows)}")

    # Verify counts match
    if len(main_pages) != len(main_rows):
        print(f"  경고: main 개수 불일치 ({len(main_pages)} vs {len(main_rows)})")
    if len(plugin_pages) != len(plugin_rows):
        print(f"  경고: plugin 개수 불일치 ({len(plugin_pages)} vs {len(plugin_rows)})")

    # 3. 생성 시간순으로 1:1 매핑: qa-{csv_id} → Notion page ID
    qa_to_notion = {}
    for row, page in zip(main_rows, main_pages):
        qa_to_notion[f"qa-{row['id']}"] = page["id"]
    for row, page in zip(plugin_rows, plugin_pages):
        qa_to_notion[f"qa-{row['id']}"] = page["id"]
    print(f"매칭: {len(qa_to_notion)}개")

    # 4. 기존 qa-{num} 임베딩 조회
    existing = sb.table("embeddings").select("id, title, full_text, categories").like("id", "qa-%").execute()
    qa_embeddings = {r["id"]: r for r in existing.data}
    print(f"기존 qa-* 임베딩: {len(qa_embeddings)}개")

    if not qa_embeddings:
        print("qa-* 임베딩이 없습니다. Phase 2 스킵.")
        return

    # 5. 임베딩 재생성 목록 구성
    page_map = {p["id"]: p for p in pages}
    items_to_process = []
    for qa_id, notion_id in qa_to_notion.items():
        if qa_id not in qa_embeddings:
            continue
        old = qa_embeddings[qa_id]
        page = page_map.get(notion_id)
        new_title = get_page_title(page) if page else old["title"]
        items_to_process.append({
            "qa_id": qa_id,
            "notion_id": notion_id,
            "title": new_title,
            "categories": old["categories"],
            "full_text": old["full_text"],
        })

    print(f"임베딩 재생성 대상: {len(items_to_process)}개")

    # Skip Notion IDs that already have embeddings
    existing_notion_ids = set()
    for i in range(0, len(items_to_process), 50):
        chunk_ids = [it["notion_id"] for it in items_to_process[i:i + 50]]
        check = sb.table("embeddings").select("id").in_("id", chunk_ids).execute()
        existing_notion_ids.update(r["id"] for r in check.data)

    items_to_process = [it for it in items_to_process if it["notion_id"] not in existing_notion_ids]
    print(f"이미 존재하는 Notion ID 제외 후: {len(items_to_process)}개")

    if not items_to_process:
        print("모든 임베딩 갱신 완료!")
        cleanup_old_qa_embeddings(sb, qa_to_notion)
        return

    EMBED_MODEL = "gemini-embedding-001"
    EMBED_DIMS = 768
    BATCH_SIZE = 20

    total = len(items_to_process)
    for i in range(0, total, BATCH_SIZE):
        batch = items_to_process[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

        texts = []
        for item in batch:
            text = f"피그마 Q&A | {', '.join(item['categories'])} | {item['title']} | {item['full_text'][:4000]}"
            texts.append(text)

        try:
            result = gemini.models.embed_content(
                model=EMBED_MODEL,
                contents=texts,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_DOCUMENT",
                    output_dimensionality=EMBED_DIMS,
                ),
            )
            embeddings = [e.values for e in result.embeddings]
        except Exception as e:
            print(f"  Embedding 오류 batch {batch_num}: {e}")
            time.sleep(10)
            try:
                result = gemini.models.embed_content(
                    model=EMBED_MODEL,
                    contents=texts,
                    config=types.EmbedContentConfig(
                        task_type="RETRIEVAL_DOCUMENT",
                        output_dimensionality=EMBED_DIMS,
                    ),
                )
                embeddings = [e.values for e in result.embeddings]
            except Exception as e2:
                print(f"  재시도 실패: {e2}. 배치 스킵.")
                continue

        upsert_data = []
        for item, emb in zip(batch, embeddings):
            upsert_data.append({
                "id": item["notion_id"],
                "section": "피그마 Q&A",
                "title": item["title"],
                "categories": item["categories"],
                "full_text": item["full_text"][:8000],
                "embedding": json.dumps(emb),
                "last_edited_time": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "updated_at": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            })

        try:
            sb.table("embeddings").upsert(upsert_data, on_conflict="id").execute()
        except Exception as e:
            print(f"  Supabase upsert 오류: {e}")
            continue

        print(f"  Batch {batch_num}/{total_batches} 완료")
        if i + BATCH_SIZE < total:
            time.sleep(1)

    cleanup_old_qa_embeddings(sb, qa_to_notion)
    print(f"\nPhase 2 완료!")


def cleanup_old_qa_embeddings(sb, qa_to_notion: dict):
    """성공적으로 마이그레이션된 qa-* 임베딩 삭제."""
    if not qa_to_notion:
        return

    old_ids = list(qa_to_notion.keys())
    print(f"\n구 qa-* 임베딩 {len(old_ids)}개 삭제 중...")

    for i in range(0, len(old_ids), 50):
        chunk = old_ids[i:i + 50]
        try:
            sb.table("embeddings").delete().in_("id", chunk).execute()
        except Exception as e:
            print(f"  삭제 오류: {e}")

    print("  구 임베딩 삭제 완료.")


# ── Main ──

def main():
    args = sys.argv[1:]

    if "--phase1" in args:
        phase1()
    elif "--phase2" in args:
        phase2()
    else:
        phase1()
        phase2()


if __name__ == "__main__":
    main()
