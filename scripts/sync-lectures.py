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
# Apply the site owner's corrections after importing the source records.
community_events = []
overrides_path = root / "src/data/lecture-overrides.json"
if overrides_path.exists():
    overrides = json.loads(overrides_path.read_text(encoding="utf-8"))
    community_events = overrides.get("communityEvents", [])
    excluded = set(overrides["excludeOrganizations"])
    lectures = [item for item in lectures if item["organization"] not in excluded]
    updates = overrides.get("updateOrganizations", {})
    lectures = [{**item, **updates.get(item["organization"], {})} for item in lectures]
    names = {item["organization"] for item in lectures}
    for item in overrides["addOrganizations"]:
        if item["organization"] not in names and item["organization"] not in excluded:
            lectures.append(item)
            names.add(item["organization"])

# This advisory engagement is explicitly described in the source. Other
# non-lecture entries are partnership meetings/content, not consulting work.
advisory = [
    {"organization": row["조직명"], "period": row["시기"], "description": row["횟수"]}
    for row in rows if row["상태"] == "강의 외" and row["횟수"] == "커리큘럼 검토 자문"
]
output = root / "src/data/lectures.json"
output.write_text(json.dumps({"lectures": lectures, "advisory": advisory, "communityEvents": community_events}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Synced {len(lectures)} lecture records and {len(advisory)} advisory record")
