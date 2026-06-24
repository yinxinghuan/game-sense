import json, os, subprocess, time, urllib.request, urllib.error
from pathlib import Path

API_URL = "https://chat.aiwaves.tech/aigram/api/gen-image"
HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://aigram.app",
    "Referer": "https://aigram.app/",
    "User-Agent": "Mozilla/5.0",
}

PROMPT = (
    "Neon arcade key art, dark moody background, a glowing neon arcade joystick "
    "and round arcade buttons in the center, floating glowing question-mark symbols, "
    "neon perspective grid floor receding to horizon, CRT scanline atmosphere, "
    "cyan and magenta double neon glow, electric blue and hot pink, synthwave retro, "
    "volumetric light, cinematic, high detail, vibrant, "
    "fills the entire square frame edge to edge, full-bleed, "
    "NO border NO panel NO letterbox NO matte, no text, no words, no letters, no logo"
)

def gen(prompt, timeout=360, retries=3):
    data = json.dumps({"prompt": prompt}).encode()
    last = None
    for a in range(retries):
        try:
            req = urllib.request.Request(API_URL, data=data, method="POST", headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                body = json.loads(r.read())
            if body.get("url"):
                return body["url"]
            raise RuntimeError(f"no url: {body}")
        except Exception as e:
            last = e
            print(f"  retry {a+1}/{retries}: {e}", flush=True)
            time.sleep(8 * (a + 1))
    raise last

def download(url, out):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    if ext and ext != ".png":
        tmp = out.with_suffix(out.suffix + ext)
        tmp.write_bytes(data)
        subprocess.run(["sips", "-s", "format", "png", str(tmp), "--out", str(out)],
                       check=True, capture_output=True)
        tmp.unlink()
    else:
        out.write_bytes(data)

if __name__ == "__main__":
    out = Path("/Users/yin/alteru-training-quiz/poster-art.png")
    print("generating…", flush=True)
    url = gen(PROMPT)
    print("got", url, flush=True)
    download(url, out)
    print("saved", out, flush=True)
