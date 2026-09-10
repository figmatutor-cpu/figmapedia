"""Generate public lecture data from the supplied CSV; keep private source notes out."""
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
with (root / "figmatutor_lectures.csv").open(encoding="utf-8-sig", newline="") as source:
    rows = list(csv.DictReader(source))

required = {"조직명", "분류", "상태", "시기", "횟수", "근거 소스"}
if not rows or not required.issubset(rows[0]):
    raise ValueError("Lecture CSV is empty or required columns are missing")

lectures = [
    {"organization": row["조직명"], "category": row["분류"],
     "period": row["시기"], "frequency": row["횟수"]}
    for row in rows if row["상태"] == "강의 진행"
]
# This advisory engagement is explicitly described in the source. Other
# non-lecture entries are partnership meetings/content, not consulting work.
advisory = [
    {"organization": row["조직명"], "period": row["시기"], "description": row["횟수"]}
    for row in rows if row["상태"] == "강의 외" and row["횟수"] == "커리큘럼 검토 자문"
]
output = root / "src/data/lectures.json"
output.write_text(json.dumps({"lectures": lectures, "advisory": advisory}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Synced {len(lectures)} lecture records and {len(advisory)} advisory record")
