import json, os, subprocess, time, urllib.request
from pathlib import Path

API_URL = "https://chat.aiwaves.tech/aigram/api/gen-image"
HEADERS = {"Content-Type": "application/json", "Origin": "https://aigram.app",
           "Referer": "https://aigram.app/", "User-Agent": "Mozilla/5.0"}

STYLE = ("comic book pop art, halftone dots shading, bold thick black outlines, "
         "vibrant flat pop colors, Lichtenstein retro comic style, dynamic, "
         "fills the entire square frame edge to edge, full-bleed, "
         "NO border NO panel NO letterbox, no text, no words, no letters, no speech bubble text")

# id -> scene
JOBS = {
    "1.1": "a cheerful cartoon gamer doing the same action over and over inside a big circular loop of arrows, aim then shoot then grab a coin reward then repeat, video-game core gameplay loop",
    "2.2": "a giant cartoon hand pointing finger about to tap one huge easy glowing arcade button right next to a tiny hard-to-reach button, mobile UI",
    "3.2": "a cartoon video game character landing a heavy punch on a robot, the whole scene violently shaking with bold motion speed lines and a giant explosive impact star burst",
}

def gen(prompt, timeout=360, retries=3):
    data = json.dumps({"prompt": prompt}).encode()
    last = None
    for a in range(retries):
        try:
            req = urllib.request.Request(API_URL, data=data, method="POST", headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                body = json.loads(r.read())
            if body.get("url"): return body["url"]
            raise RuntimeError(f"no url: {body}")
        except Exception as e:
            last = e; print(f"  retry {a+1}: {e}", flush=True); time.sleep(8*(a+1))
    raise last

def download(url, out):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r: data = r.read()
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    if ext and ext != ".png":
        tmp = out.with_suffix(out.suffix + ext); tmp.write_bytes(data)
        subprocess.run(["sips","-s","format","png",str(tmp),"--out",str(out)], check=True, capture_output=True)
        tmp.unlink()
    else: out.write_bytes(data)

if __name__ == "__main__":
    outdir = Path("/Users/yin/alteru-training-quiz/public/q"); outdir.mkdir(parents=True, exist_ok=True)
    for qid, scene in JOBS.items():
        print(f"[{qid}] generating…", flush=True)
        url = gen(f"{scene}, {STYLE}")
        download(url, outdir / f"{qid}.png")
        print(f"[{qid}] saved", flush=True)
        time.sleep(1.2)
    print("done")
