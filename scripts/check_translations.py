#!/usr/bin/env python3
"""檢查翻譯是否和繁體中文原文同步。

Check whether translations are in sync with the Traditional Chinese original.

每個翻譯檔的第一行都有來源標記，記錄翻譯時原文的指紋（SHA-256 的前 12 碼）：
Every translated file starts with a source marker that records a fingerprint
(the first 12 hex digits of SHA-256) of the original at translation time:

    <!-- source: zh-TW/2-process-modules/05-lithography/README.md | sha: 1a2b3c4d5e6f -->

原文之後只要被修改，指紋就會不同，這個檔案就會被列為「過期」。
If the original changes later, the fingerprint no longer matches and the file
is reported as outdated.

用法 / Usage:
    python3 scripts/check_translations.py              # 檢查所有語言 / all languages
    python3 scripts/check_translations.py en           # 只檢查英文 / English only
    python3 scripts/check_translations.py en --strict  # 有問題時回傳 1 / exit 1 on problems

    # 同步完翻譯之後，更新標記中的指紋 / after syncing a translation, update its fingerprint
    python3 scripts/check_translations.py --stamp en/2-process-modules/05-lithography/README.md
    python3 scripts/check_translations.py --stamp en   # 整個語言 / a whole language
"""

from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_LANG = "zh-TW"
LANG_DIR_RE = re.compile(r"^[a-z]{2,3}(-[A-Za-z0-9]+)?$")
MARKER_RE = re.compile(r"<!--\s*source:\s*(\S+)\s*\|\s*sha:\s*([0-9a-f]+|pending)\s*-->")


def fingerprint(path: Path) -> str:
    data = path.read_bytes().replace(b"\r\n", b"\n")
    return hashlib.sha256(data).hexdigest()[:12]


def source_files() -> list[str]:
    base = ROOT / SOURCE_LANG
    return sorted(p.relative_to(base).as_posix() for p in base.rglob("*.md"))


def languages() -> list[str]:
    return sorted(
        p.name for p in ROOT.iterdir()
        if p.is_dir() and LANG_DIR_RE.match(p.name) and p.name != SOURCE_LANG
    )


def check_language(lang: str, sources: list[str]) -> int:
    base = ROOT / lang
    outdated, pending, invalid, missing = [], [], [], []

    for rel in sources:
        target = base / rel
        if not target.exists():
            missing.append(rel)
            continue
        match = MARKER_RE.search(target.read_text(encoding="utf-8")[:500])
        expected_source = f"{SOURCE_LANG}/{rel}"
        if not match or match.group(1) != expected_source:
            invalid.append(rel)
        elif match.group(2) == "pending":
            pending.append(rel)
        elif match.group(2) != fingerprint(ROOT / expected_source):
            outdated.append(rel)

    orphaned = []
    if base.exists():
        known = set(sources)
        orphaned = [
            p.relative_to(base).as_posix() for p in sorted(base.rglob("*.md"))
            if p.relative_to(base).as_posix() not in known
        ]

    done = len(sources) - len(missing)
    synced = done - len(outdated) - len(pending) - len(invalid)
    print(f"\n## {lang}：已翻譯 {done}/{len(sources)}，已同步 {synced}  "
          f"(translated {done}/{len(sources)}, in sync {synced})")

    def show(title: str, items: list[str], hint: str = "") -> None:
        if not items:
            return
        print(f"\n{title}（{len(items)}）：")
        for rel in items:
            print(f"  - {lang}/{rel}")
        if hint:
            print(f"  {hint}")

    show("過期 Outdated", outdated,
         f"用 git log -p -- {SOURCE_LANG}/<檔案> 查看原文改了什麼，同步後執行 --stamp。 "
         f"Use git log -p on the original to see what changed, then run --stamp.")
    show("尚未蓋上指紋 Not stamped yet", pending, "翻譯完成後執行 --stamp。 Run --stamp when done.")
    show("來源標記錯誤 Missing or invalid source marker", invalid)
    show("孤立 Orphaned (original no longer exists)", orphaned)
    show("缺少 Missing", missing)
    return len(outdated) + len(pending) + len(invalid) + len(orphaned) + len(missing)


def stamp(targets: list[str]) -> int:
    files: list[Path] = []
    for item in targets:
        path = (ROOT / item).resolve()
        files.extend(sorted(path.rglob("*.md")) if path.is_dir() else [path])

    count = 0
    for path in files:
        rel = path.relative_to(ROOT)
        lang, inner = rel.parts[0], Path(*rel.parts[1:]).as_posix()
        source = ROOT / SOURCE_LANG / inner
        if lang == SOURCE_LANG or not source.exists():
            print(f"跳過 skip: {rel.as_posix()}")
            continue
        marker = f"<!-- source: {SOURCE_LANG}/{inner} | sha: {fingerprint(source)} -->"
        text = path.read_text(encoding="utf-8")
        if MARKER_RE.search(text[:500]):
            text = MARKER_RE.sub(marker, text, count=1)
        else:
            text = marker + "\n\n" + text
        path.write_text(text, encoding="utf-8")
        count += 1
    print(f"已更新 {count} 個檔案的指紋。Stamped {count} files.")
    return 0


def main() -> int:
    args = sys.argv[1:]
    if "--stamp" in args:
        targets = [a for a in args if a != "--stamp"]
        if not targets:
            print("請指定語言或檔案。Please give a language or a file.")
            return 1
        return stamp(targets)

    strict = "--strict" in args
    langs = [a for a in args if not a.startswith("--")] or languages()
    if not langs:
        print("目前還沒有任何翻譯。No translations yet.")
        return 0

    sources = source_files()
    problems = sum(check_language(lang, sources) for lang in langs)
    return 1 if strict and problems else 0


if __name__ == "__main__":
    sys.exit(main())
