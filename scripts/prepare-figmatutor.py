"""Copy the public landing-page assets into its independent deployment project."""
from pathlib import Path
from shutil import copy2
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
site = root / "sites/figmatutor"
subprocess.run([sys.executable, str(root / "scripts/sync-lectures.py")], check=True)
paths = [
    *[p.relative_to(root) for p in (root / "src/components/home").iterdir() if p.suffix in {".tsx", ".ts", ".css"}],
    Path("src/data/lectures.json"),
    Path("src/data/lecture-overrides.json"),
    *[p.relative_to(root) for p in (root / "public/images/footer").glob("*.svg")],
    Path("public/og-highstand.png"),
    *[p.relative_to(root) for p in (root / "public/images/approach").glob("*.png")],
    Path("public/logo.svg"),
    Path("public/gnb-logo.svg"),
    Path("public/favicon.svg"),
    Path("public/fonts/PretendardVariable.woff2"),
    Path("public/images/team/figma_tutor.png"),
]
for relative in paths:
    target = site / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    copy2(root / relative, target)
print(f"Prepared standalone Figmatutor site: {len(paths)} public source/assets copied")
