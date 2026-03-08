"""
Q&A 데이터 클렌징 스크립트
- Gemini 2.5 Flash로 Q&A 쌍 검증 및 정제
- 출력: CSV (id, category, question, answer)
"""

import json
import csv
import time
import os
import sys
from pathlib import Path

# Load env
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config={"temperature": 0.1},
)

INPUT = Path(__file__).resolve().parent.parent / "AI_learning source" / "qa_raw_1310.json"
OUTPUT = Path(__file__).resolve().parent.parent / "AI_learning source" / "qa_cleansed.csv"
PROGRESS = Path(__file__).resolve().parent.parent / "AI_learning source" / "qa_progress.json"

BATCH_SIZE = 15

PROMPT_TEMPLATE = """당신은 피그마(Figma) 교육 전문가입니다. 아래 Q&A 쌍들을 검증하고 정제해주세요.

각 Q&A에 대해:
1. 답변이 질문에 실제로 관련있는지 판단 (그룹채팅에서 추출하여 무관한 답변이 매칭된 경우가 많음)
2. 관련있는 Q&A만 정제하여 반환
3. 무관한 Q&A는 제외 (skip)

정제 규칙:
- category: 영어로 카테고리 분류 (아래 목록 중 선택)
  Component & Instance, Auto Layout, Typography, Variables & Design System,
  Prototyping, Style & Effect, Export & Print, Plugin, Grid & Layout,
  Publishing & Library, Dev Mode & Handoff, Collaboration & Process,
  UX/UI Design, Learning & Study, Troubleshooting, Figma Plans & Billing,
  Reference & Resource, Component Management, Design Token & Workflow
- question: 원문 유지하되 불필요한 이모지/인사말 정리, 핵심 질문만
- answer: 정확한 답변으로 보강. 원문이 정확하면 정리만, 부정확하면 수정. 마크다운 포맷 가능.

JSON 배열로만 응답. 다른 텍스트 없이:
[
  {{"id": 원본id, "category": "...", "question": "...", "answer": "..."}},
  ...
]
무관한 Q&A는 배열에서 제외.

=== Q&A 목록 ===
{qa_list}
"""


def load_progress():
    if PROGRESS.exists():
        return json.loads(PROGRESS.read_text(encoding="utf-8"))
    return {"processed": 0, "results": []}


def save_progress(data):
    PROGRESS.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def process_batch(batch, retries=2):
    qa_text = "\n\n".join(
        f"[ID:{item['id']}]\nQ: {item['question'][:400]}\nA: {item['answer'][:600]}"
        for item in batch
    )
    prompt = PROMPT_TEMPLATE.format(qa_list=qa_text)

    for attempt in range(retries + 1):
        try:
            result = model.generate_content(prompt)
            text = result.text.strip()
            # Extract JSON array
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            arr_start = text.find("[")
            arr_end = text.rfind("]") + 1
            if arr_start >= 0 and arr_end > arr_start:
                parsed = json.loads(text[arr_start:arr_end])
                return parsed
            return []
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            if attempt < retries:
                time.sleep(3)
    return []


def main():
    with open(INPUT, "r", encoding="utf-8") as f:
        all_qa = json.load(f)

    progress = load_progress()
    start_idx = progress["processed"]
    results = progress["results"]

    total = len(all_qa)
    batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

    print(f"Total Q&A: {total}, Batch size: {BATCH_SIZE}, Total batches: {batches}")
    print(f"Resuming from batch {start_idx // BATCH_SIZE + 1}")

    for i in range(start_idx, total, BATCH_SIZE):
        batch_num = i // BATCH_SIZE + 1
        batch = all_qa[i : i + BATCH_SIZE]
        print(f"  Batch {batch_num}/{batches} (items {i+1}-{min(i+BATCH_SIZE, total)})...", end=" ", flush=True)

        cleaned = process_batch(batch)
        results.extend(cleaned)
        print(f"kept {len(cleaned)}/{len(batch)}")

        # Save progress
        progress["processed"] = i + BATCH_SIZE
        progress["results"] = results
        save_progress(progress)

        # Rate limit: ~15 RPM for free tier, be safe
        time.sleep(4)

    # Write final CSV
    print(f"\nWriting CSV: {len(results)} cleansed Q&A pairs")
    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "category", "question", "answer"])
        writer.writeheader()
        for idx, item in enumerate(results):
            writer.writerow({
                "id": idx + 1,
                "category": item.get("category", ""),
                "question": item.get("question", ""),
                "answer": item.get("answer", ""),
            })

    print(f"Done! Output: {OUTPUT}")
    # Cleanup progress file
    if PROGRESS.exists():
        PROGRESS.unlink()


if __name__ == "__main__":
    main()
