#!/usr/bin/env python3
"""Build a lightweight review.html contact sheet of the whole question bank.
Output goes to public/review.html so it deploys with the game (relative q/ image
paths) and also opens locally (public/review.html sits beside public/q/).
URL: https://yinxinghuan.github.io/game-sense/review.html"""
import json, html
from pathlib import Path

ROOT = Path(__file__).parent
Q = json.load(open(ROOT / "src/data/questions.json"))
IMGDIR = ROOT / "public/q"

CAT = {"core": "CORE DESIGN", "ixd": "INTERACTION", "feel": "GAME FEEL",
       "feed": "FEED UX", "eng": "ENGINEERING", "social": "SOCIAL"}
CATCOLOR = {"core": "#2c6df4", "ixd": "#9b59b6", "feel": "#e63946",
            "feed": "#f97316", "social": "#3fb950"}

def img_tag(qid, img):
    p = IMGDIR / img if img else None
    if p and p.exists():
        return f'<img class="qi" src="q/{html.escape(img)}" alt="" loading="lazy">'
    return '<div class="qi noimg">ART TO GENERATE</div>'

cards = []
for i, q in enumerate(Q):
    cc = CATCOLOR.get(q["cat"], "#111")
    opts = []
    qtype = q.get("type", "mcq")
    if q.get("options"):
        for j, o in enumerate(q["options"]):
            right = j in q.get("correct", [])
            cls = "opt right" if right else "opt"
            tick = "✓ " if right else ""
            opts.append(
                f'<li class="{cls}"><b>{tick}</b>{html.escape(o["en"])}'
                f'<span class="z">{html.escape(o["zh"])}</span></li>')
    elif qtype == "drag":
        for it in q["drag"]["items"]:
            b = q["drag"]["yes"]["en"] if it["correct"] else q["drag"]["no"]["en"]
            opts.append(f'<li class="opt"><b>[{html.escape(b)}]</b> {html.escape(it["label"]["en"])}'
                        f'<span class="z">{html.escape(it["label"]["zh"])}</span></li>')
    elif qtype == "lever":
        for m in q["lever"]["machines"]:
            tick = "✓ " if m["correct"] else ""
            cls = "opt right" if m["correct"] else "opt"
            opts.append(f'<li class="{cls}"><b>{tick}</b>{html.escape(m["label"]["en"])}'
                        f'<span class="z">{html.escape(m["label"]["zh"])}</span></li>')
    elif qtype in ("slider", "dial"):
        c = q[qtype]
        opts.append(f'<li class="opt right"><b>✓ </b>target {c["target"][0]}–{c["target"][1]}{c.get("unit","")} '
                    f'(range {c["min"]}–{c["max"]})</li>')
    diff = "ADVANCED" if q["diff"] == "A" else "BASIC"
    multi = '<span class="tag multi">MULTI</span>' if q.get("multi") else ""
    if qtype != "mcq":
        multi += f'<span class="tag multi">🎮 {qtype.upper()}</span>'
    cards.append(f'''
    <div class="card">
      <div class="head">
        <span class="num">#{i+1}</span>
        <span class="tag" style="background:{cc}">{CAT.get(q["cat"], q["cat"])}</span>
        <span class="tag d">{diff}</span>{multi}
        <span class="qid">{q["id"]}</span>
      </div>
      {img_tag(q["id"], q.get("img"))}
      <div class="qt">{html.escape(q["q"]["en"])}</div>
      <div class="qz">{html.escape(q["q"]["zh"])}</div>
      <ul class="opts">{"".join(opts)}</ul>
      <div class="exp"><b>WHY</b> {html.escape(q["explain"]["en"])}
        <span class="z">{html.escape(q["explain"]["zh"])}</span></div>
    </div>''')

have = sum(1 for q in Q if q.get("img") and (IMGDIR / q["img"]).exists())
doc = f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Game Sense — Question Review</title>
<link href="https://fonts.googleapis.com/css2?family=Bangers&family=Permanent+Marker&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
<style>
:root{{--paper:#f4ecd8;--ink:#111;--white:#fff;--green:#3fb950;}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);background-image:radial-gradient(circle at .5px .5px,rgba(17,17,17,.16) 1px,transparent 1.3px);background-size:8px 8px;font-family:Inter,system-ui,sans-serif;color:var(--ink);padding:24px}}
.top{{max-width:1100px;margin:0 auto 20px}}
.top h1{{font-family:Bangers,cursive;font-size:42px;letter-spacing:1px;margin:0}}
.top p{{font-family:'Permanent Marker',cursive;font-size:15px;margin:6px 0}}
.grid{{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px}}
.card{{background:var(--white);border:5px solid var(--ink);box-shadow:6px 6px 0 var(--ink);padding:12px}}
.head{{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px}}
.num{{font-family:Bangers,cursive;font-size:22px}}
.qid{{margin-left:auto;font-family:'Permanent Marker',cursive;font-size:12px;color:#777}}
.tag{{font-family:'Permanent Marker',cursive;font-size:11px;color:#fff;background:var(--ink);padding:2px 8px}}
.tag.d{{background:#fff;color:var(--ink);border:2px solid var(--ink)}}
.tag.multi{{background:#ffd60a;color:var(--ink)}}
.qi{{width:100%;aspect-ratio:16/10;object-fit:cover;border:4px solid var(--ink);display:block;margin-bottom:10px}}
.noimg{{display:flex;align-items:center;justify-content:center;font-family:Bangers,cursive;font-size:18px;color:#fff;background:repeating-linear-gradient(45deg,#bbb,#bbb 12px,#999 12px,#999 24px)}}
.qt{{font-weight:900;font-size:16px;line-height:1.3}}
.qz{{font-size:14px;color:#444;margin:3px 0 8px}}
.opts{{list-style:none;padding:0;margin:0 0 8px}}
.opt{{font-size:13.5px;padding:5px 8px;border:2px solid #ddd;margin-bottom:5px;border-radius:0}}
.opt.right{{background:var(--green);border-color:var(--ink);font-weight:700}}
.opt b{{color:var(--ink)}}
.opt .z{{display:block;font-size:12px;color:#555}}
.opt.right .z{{color:#06400f}}
.exp{{font-size:12.5px;background:var(--paper);border:3px solid var(--ink);padding:8px 10px;line-height:1.45}}
.exp b{{font-family:Bangers,cursive;font-size:16px;letter-spacing:.5px;margin-right:4px}}
.exp .z,.opt .z{{}}
.z{{display:block}}
</style></head><body>
<div class="top">
  <h1>GAME SENSE — QUESTION REVIEW</h1>
  <p>{len(Q)} questions · {have}/{len(Q)} with art · green = correct answer · EN + 中文 shown together</p>
  <p>评审用：圈出要改的题/选项/解析，或要重出的图。English 默认面向终端用户，中文为可切备选。</p>
</div>
<div class="grid">{"".join(cards)}</div>
</body></html>'''

out = ROOT / "public" / "review.html"
out.write_text(doc, encoding="utf-8")
# remove old heavy base64 version if present
old = ROOT / "review.html"
if old.exists():
    old.unlink()
print(f"wrote {out}  ({len(Q)} questions, {have} with art)")
