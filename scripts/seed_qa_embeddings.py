"""
Supabase embeddings 테이블에 Q&A 611개 업로드.
- Gemini gemini-embedding-001로 768차원 벡터 생성
- ID: qa-{num} (Notion ID와 충돌 방지)
- section: "피그마 Q&A (커뮤니티)"
"""

import csv
import json
import os
import time
from pathlib import Path

from dotenv import load_dotenv

# .env.local 로드
env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(env_path)

from google import genai
from google.genai import types
from supabase import create_client

# ── Config ──
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMS = 768
SECTION = "피그마 Q&A (커뮤니티)"
BATCH_SIZE = 20
CSV_PATH = Path(__file__).resolve().parent.parent / "AI_learning source" / "qa_cleansed.csv"
PROGRESS_PATH = Path(__file__).resolve().parent / "qa_embed_progress.json"

# ── Init clients ──
client = genai.Client(api_key=GEMINI_API_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


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


def build_text(row: dict) -> str:
    parts = [SECTION, row["category"], row["question"], row["answer"][:4000]]
    return " | ".join(parts)


def embed_batch(texts: list[str]) -> list[list[float]]:
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=EMBEDDING_DIMS,
        ),
    )
    return [e.values for e in result.embeddings]


def upsert_rows(rows_with_embeddings: list[dict]):
    data = []
    for item in rows_with_embeddings:
        data.append({
            "id": item["id"],
            "section": SECTION,
            "title": item["title"],
            "categories": item["categories"],
            "full_text": item["full_text"],
            "embedding": json.dumps(item["embedding"]),
            "last_edited_time": "2026-03-07T00:00:00.000Z",
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        })
    supabase.table("embeddings").upsert(data, on_conflict="id").execute()


def main():
    rows = read_csv()
    print(f"CSV loaded: {len(rows)} Q&A pairs")

    done_ids = load_progress()
    print(f"Already uploaded: {len(done_ids)}")

    remaining = [r for r in rows if f"qa-{r['id']}" not in done_ids]
    print(f"Remaining: {len(remaining)}")

    if not remaining:
        print("All done!")
        return

    total = len(remaining)
    for i in range(0, total, BATCH_SIZE):
        batch = remaining[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

        texts = [build_text(r) for r in batch]

        try:
            embeddings = embed_batch(texts)
        except Exception as e:
            print(f"  Embedding error at batch {batch_num}: {e}")
            print("  Waiting 10s and retrying...")
            time.sleep(10)
            try:
                embeddings = embed_batch(texts)
            except Exception as e2:
                print(f"  Retry failed: {e2}. Skipping batch.")
                continue

        upsert_data = []
        for row, emb in zip(batch, embeddings):
            qa_id = f"qa-{row['id']}"
            upsert_data.append({
                "id": qa_id,
                "title": row["question"][:500],
                "categories": [row["category"]],
                "full_text": row["answer"][:8000],
                "embedding": emb,
            })

        try:
            upsert_rows(upsert_data)
        except Exception as e:
            print(f"  Supabase error at batch {batch_num}: {e}")
            continue

        for item in upsert_data:
            done_ids.add(item["id"])
        save_progress(done_ids)

        print(f"  Batch {batch_num}/{total_batches} done ({len(done_ids)}/{len(rows)} total)")

        if i + BATCH_SIZE < total:
            time.sleep(1)

    print(f"\nComplete! {len(done_ids)} embeddings uploaded to Supabase.")


if __name__ == "__main__":
    main()
