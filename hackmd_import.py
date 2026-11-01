#!/usr/bin/env python3
"""把 Introduction 系列的書（GitHub repo）批次匯入 HackMD。

流程：
  1. 第一輪：每個 .md 先在 HackMD 建一則空筆記，記下「檔案路徑 → 筆記 ID」。
  2. 第二輪：改寫內容後更新筆記。
       - 圖片：改成 jsDelivr 網址
       - 書內連結：改成對應的 HackMD 筆記網址
       - 其他相對連結（LICENSE、STYLE_GUIDE、issues…）：改成 GitHub 網址
       - 檔頭加 YAML：title、lang、breaks: false（和 GitHub 換行規則一致）
  3. 每種語言產生一則「書本目錄」筆記（HackMD Book mode 的格式）。

對照表存在 state 檔，重跑時只更新內容、不會重複建立筆記。
只用 Python 標準函式庫，不必安裝套件。

用法：
  # 乾跑：不呼叫 API，把轉換後的 Markdown 寫到 out/ 讓你先檢查
  python3 hackmd_import.py --repo ../Semiconductor_Manufacturing_Introduction --dry-run

  # 先試一章
  export HACKMD_TOKEN=xxxxx
  python3 hackmd_import.py --repo ../Semiconductor_Manufacturing_Introduction \
      --only zh-TW/2-process-modules/04-lithography/README.md

  # 整本（預設 zh-TW 與 en）
  python3 hackmd_import.py --repo ../Semiconductor_Manufacturing_Introduction
"""

from __future__ import annotations

import argparse
import json
import os
import posixpath
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urljoin

API_BASE = "https://api.hackmd.io/v1"
IMAGE_EXT = (".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp")
LANG_YAML = {"zh-TW": "zh-tw", "zh-CN": "zh-cn", "en": "en", "ja": "ja", "ko": "ko"}
BOOK_TITLE_SUFFIX = {
    "zh-TW": "（目錄）", "zh-CN": "（目录）", "en": " (Contents)",
    "ja": "（目次）", "ko": " (목차)",
}

# ---------------------------------------------------------------- HackMD API


class HackMD:
    def __init__(self, token: str, team: str | None, delay: float):
        self.token = token
        self.prefix = f"/teams/{team}/notes" if team else "/notes"
        self.delay = delay

    def _call(self, method: str, path: str, body: dict | None = None):
        data = json.dumps(body).encode() if body is not None else None
        for attempt in range(7):
            req = urllib.request.Request(
                API_BASE + path, data=data, method=method,
                headers={"Authorization": f"Bearer {self.token}",
                         "Content-Type": "application/json"},
            )
            try:
                with urllib.request.urlopen(req, timeout=60) as resp:
                    raw = resp.read()
                time.sleep(self.delay)
                return json.loads(raw) if raw.strip() else {}
            except urllib.error.HTTPError as e:
                if e.code == 429 or e.code >= 500:
                    wait = int(e.headers.get("Retry-After") or 0) or 2 ** (attempt + 2)
                    print(f"  ⏳ HTTP {e.code}，{wait} 秒後重試…", file=sys.stderr)
                    time.sleep(wait)
                    continue
                detail = e.read().decode(errors="replace")[:300]
                raise SystemExit(f"❌ {method} {path} 失敗：HTTP {e.code} {detail}")
        raise SystemExit(f"❌ {method} {path} 重試多次仍失敗")

    def me(self):
        return self._call("GET", "/me")

    def create(self, title: str, perms: dict) -> dict:
        return self._call("POST", self.prefix, {"title": title, "content": f"# {title}\n", **perms})

    def update(self, note_id: str, content: str, perms: dict):
        self._call("PATCH", f"{self.prefix}/{note_id}", {"content": content, **perms})


# ---------------------------------------------------------------- 內容轉換

LINK_RE = re.compile(r"(\]\()([^)\s]+)((?:\s+\"[^\"]*\")?\))")
ATTR_RE = re.compile(r"""((?:src|href)=["'])([^"']+)(["'])""")
H1_RE = re.compile(r"^#\s+(.+?)\s*$", re.M)


def first_h1(text: str, fallback: str) -> str:
    m = H1_RE.search(text)
    if not m:
        return fallback
    title = re.sub(r"[*_`]", "", m.group(1))
    return re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", title).strip()


class Converter:
    def __init__(self, owner_repo: str, ref: str, note_url):
        self.github_blob = f"https://github.com/{owner_repo}/blob/{ref}/"
        self.jsdelivr = f"https://cdn.jsdelivr.net/gh/{owner_repo}@{ref}/"
        self.note_url = note_url  # function(repo_path) -> url | None

    def rewrite_target(self, src_file: str, target: str) -> str:
        if re.match(r"^(?:[a-z][a-z0-9+.-]*:|#|//)", target, re.I):
            return target  # 外部網址、mailto、頁內錨點：不動
        path, _, anchor = target.partition("#")
        anchor = f"#{anchor}" if anchor else ""
        resolved = posixpath.normpath(posixpath.join(posixpath.dirname(src_file), path))
        if resolved.lower().endswith(IMAGE_EXT) and not resolved.startswith(".."):
            return self.jsdelivr + resolved
        url = self.note_url(resolved)
        if url:
            return url + anchor
        # 書以外的檔案或 ../../issues 這種 GitHub 相對網址，交給 GitHub 解析
        return urljoin(self.github_blob + src_file, target)

    def convert(self, src_file: str, text: str, lang: str | None) -> str:
        out, in_fence = [], False
        for line in text.splitlines(keepends=True):
            if re.match(r"^\s*(```|~~~)", line):
                in_fence = not in_fence
            if not in_fence:
                line = LINK_RE.sub(lambda m: m.group(1) + self.rewrite_target(src_file, m.group(2)) + m.group(3), line)
                line = ATTR_RE.sub(lambda m: m.group(1) + self.rewrite_target(src_file, m.group(2)) + m.group(3), line)
            out.append(line)
        body = "".join(out)
        title = first_h1(text, Path(src_file).stem)
        yaml = ["---", f"title: {json.dumps(title, ensure_ascii=False)}"]
        if lang:
            yaml.append(f"lang: {LANG_YAML.get(lang, lang.lower())}")
        yaml += ["breaks: false", "---", ""]
        return "\n".join(yaml) + body


# ---------------------------------------------------------------- 書本目錄


def collect_files(repo: Path, langs: list[str], include_root: bool) -> list[str]:
    files = ["README.md"] if include_root else []
    for lang in langs:
        if not (repo / lang).is_dir():
            raise SystemExit(f"❌ 找不到語言資料夾 {lang}/")
        files += sorted(p.relative_to(repo).as_posix() for p in (repo / lang).rglob("*.md"))
    return files


def book_index(repo: Path, lang: str, url_of) -> str:
    """產生 HackMD Book mode 格式：書名 + === ，每部一個 --- 段落，底下列連結。"""
    root = repo / lang
    home = (root / "README.md").read_text(encoding="utf-8")
    title = first_h1(home, lang)
    lines = [title, "===", "", f"- [{title}]({url_of(f'{lang}/README.md')})", ""]
    for part in sorted(p for p in root.iterdir() if p.is_dir()):
        part_readme = part / "README.md"
        rel = lambda p: p.relative_to(repo).as_posix()
        part_title = first_h1(part_readme.read_text(encoding="utf-8"), part.name) if part_readme.exists() else part.name
        lines += [part_title, "---", ""]
        if part_readme.exists():
            lines.append(f"- [{part_title}]({url_of(rel(part_readme))})")
        for md in sorted(part.rglob("*.md")):
            if md == part_readme:
                continue
            lines.append(f"- [{first_h1(md.read_text(encoding='utf-8'), md.stem)}]({url_of(rel(md))})")
        lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------- 主程式


def detect_owner_repo(repo: Path) -> str | None:
    try:
        url = subprocess.check_output(["git", "-C", str(repo), "remote", "get-url", "origin"], text=True).strip()
    except Exception:
        return None
    m = re.search(r"github\.com[:/]([^/]+/[^/]+?)(?:\.git)?$", url)
    return m.group(1) if m else None


def main():
    ap = argparse.ArgumentParser(description="把書的 repo 匯入 HackMD")
    ap.add_argument("--repo", required=True, help="本機 clone 下來的 repo 路徑")
    ap.add_argument("--langs", nargs="+", default=["zh-TW", "en"], help="要匯入的語言資料夾（預設 zh-TW en）")
    ap.add_argument("--no-root", action="store_true", help="不匯入根目錄的多語首頁 README.md")
    ap.add_argument("--github", help="owner/repo，預設從 git remote 讀")
    ap.add_argument("--ref", default="master", help="圖片與 GitHub 連結用的分支或 commit（預設 master）")
    ap.add_argument("--team", help="匯入到團隊工作區（填 team path）")
    ap.add_argument("--read", default="guest", choices=["owner", "signed_in", "guest"], help="閱讀權限（預設 guest，所有人可讀）")
    ap.add_argument("--write", default="owner", choices=["owner", "signed_in", "guest"], help="編輯權限（預設 owner）")
    ap.add_argument("--only", nargs="+", help="只處理這些檔案（相對 repo 的路徑），試跑用")
    ap.add_argument("--no-book", action="store_true", help="不產生書本目錄筆記")
    ap.add_argument("--state", default="hackmd_state.json", help="對照表檔案（預設 hackmd_state.json）")
    ap.add_argument("--delay", type=float, default=1.5, help="每次 API 呼叫後等幾秒（預設 1.5）")
    ap.add_argument("--dry-run", action="store_true", help="不呼叫 API，把結果寫到 --out")
    ap.add_argument("--out", default="out", help="乾跑輸出資料夾（預設 out）")
    args = ap.parse_args()

    repo = Path(args.repo).expanduser().resolve()
    owner_repo = args.github or detect_owner_repo(repo)
    if not owner_repo:
        raise SystemExit("❌ 讀不到 GitHub 位址，請加 --github owner/repo")

    files = collect_files(repo, args.langs, not args.no_root)
    targets = files
    if args.only:
        targets = [f for f in files if f in args.only]
        missing = set(args.only) - set(targets)
        if missing:
            raise SystemExit(f"❌ --only 的檔案不在匯入範圍：{', '.join(sorted(missing))}")

    state_path = Path(args.state)
    state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {}
    notes: dict = state.setdefault("notes", {})
    books: dict = state.setdefault("books", {})
    perms = {"readPermission": args.read, "writePermission": args.write}

    def save():
        if not args.dry_run:
            state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")

    def url_of(repo_path: str) -> str | None:
        if args.dry_run and repo_path in files:
            return f"https://hackmd.io/DRYRUN-{repo_path.replace('/', '_')}"
        n = notes.get(repo_path)
        return f"https://hackmd.io/{n['id']}" if n else None

    conv = Converter(owner_repo, args.ref, url_of)
    api = None
    if not args.dry_run:
        token = os.environ.get("HACKMD_TOKEN")
        if not token:
            raise SystemExit("❌ 請先設定環境變數 HACKMD_TOKEN（HackMD → Settings → API → Create API token）")
        api = HackMD(token, args.team, args.delay)
        print(f"👤 已登入 HackMD：{api.me().get('name', '?')}")

    # 第一輪：建立筆記
    new = [f for f in targets if f not in notes]
    if not args.dry_run and new:
        print(f"📝 第一輪：建立 {len(new)} 則筆記")
        for i, f in enumerate(new, 1):
            title = first_h1((repo / f).read_text(encoding="utf-8"), Path(f).stem)
            res = api.create(title, perms)
            notes[f] = {"id": res["id"], "title": title, "publishLink": res.get("publishLink")}
            save()
            print(f"  [{i}/{len(new)}] {f} → https://hackmd.io/{res['id']}")

    # 第二輪：改寫內容並更新
    print(f"🔗 第二輪：改寫連結並{'輸出' if args.dry_run else '更新'} {len(targets)} 則筆記")
    out_dir = Path(args.out)
    for i, f in enumerate(targets, 1):
        lang = f.split("/", 1)[0] if "/" in f else None
        content = conv.convert(f, (repo / f).read_text(encoding="utf-8"), lang)
        if args.dry_run:
            dest = out_dir / f
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(content, encoding="utf-8")
        else:
            api.update(notes[f]["id"], content, perms)
            print(f"  [{i}/{len(targets)}] {f}")

    # 書本目錄
    if not args.no_book and not args.only:
        print("📚 產生書本目錄")
        for lang in args.langs:
            def rel_url(p):
                u = url_of(p)
                return u.replace("https://hackmd.io", "") if u else conv.github_blob + p
            index = book_index(repo, lang, rel_url)
            index_title = first_h1((repo / lang / "README.md").read_text(encoding="utf-8"), lang) + BOOK_TITLE_SUFFIX.get(lang, "")
            content = f"---\ntitle: {json.dumps(index_title, ensure_ascii=False)}\nbreaks: false\n---\n\n{index}"
            if args.dry_run:
                (out_dir / f"_book_{lang}.md").write_text(content, encoding="utf-8")
                continue
            if lang not in books:
                res = api.create(index_title, perms)
                books[lang] = {"id": res["id"], "title": index_title}
                save()
            api.update(books[lang]["id"], content, perms)
            print(f"  {lang}：https://hackmd.io/{books[lang]['id']}")

    save()
    if args.dry_run:
        print(f"✅ 乾跑完成，轉換結果在 {out_dir.resolve()}")
    else:
        print(f"✅ 完成，對照表在 {state_path.resolve()}")


if __name__ == "__main__":
    main()
