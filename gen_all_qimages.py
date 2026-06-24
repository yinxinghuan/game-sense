#!/usr/bin/env python3
"""Generate a comic illustration per question. Skips ids whose png already exists."""
import json, os, subprocess, time, urllib.request
from pathlib import Path

API_URL = "https://chat.aiwaves.tech/aigram/api/gen-image"
HEADERS = {"Content-Type": "application/json", "Origin": "https://aigram.app",
           "Referer": "https://aigram.app/", "User-Agent": "Mozilla/5.0"}
STYLE = ("comic book pop art, halftone dots shading, bold thick black outlines, "
         "vibrant flat pop colors, Lichtenstein retro comic style, dynamic, "
         "fills the entire square frame edge to edge, full-bleed, "
         "NO border NO panel NO letterbox, no text, no words, no letters, no readable speech bubble text")

JOBS = {
  # core
  "1.1": "a cheerful cartoon gamer doing the same action over and over inside a big circular loop of arrows, aim then shoot then grab a coin reward then repeat, video-game core gameplay loop",
  "1.2": "a person scrolling a phone video feed and instantly grinning at a tiny game, a stopwatch showing just two seconds, instant understanding",
  "1.3": "an excited cartoon character pulling a slot machine lever and a loot box bursting open with random surprise rewards, jackpot",
  "1.4": "a tiny cartoon climber struggling up a giant jagged difficulty graph line with a sudden steep cliff spike, game difficulty curve",
  "1.5": "a cartoon hand pressing a single arcade button that explodes with juicy particles, stars, splashes and sparkles, super satisfying feedback",
  "1.6": "a focused cartoon character balanced perfectly in the zone on a tightrope between a sleepy boring side and a scary too-hard side, flow state",
  "1.7": "a friendly giant hand gently guiding a small cartoon character to press their very first button and succeed, learning by doing",
  "1.8": "a split scene, on one side a shining golden victory trophy with confetti, on the other side a cartoon skull game-over, clear win versus lose",
  # ixd
  "2.1": "a big glossy three dimensional push button that obviously looks pressable, a cartoon hand reaching to press it, affordance",
  "2.2": "a giant cartoon hand pointing finger about to tap one huge easy glowing arcade button right next to a tiny hard-to-reach button, mobile UI",
  "2.3": "a cartoon character frozen and overwhelmed sweating in front of a giant wall menu with way too many choices, decision paralysis",
  "2.4": "a comfortable cartoon thumb easily tapping a big friendly rounded button, tiny buttons crossed out beside it, touch target size",
  "2.5": "a cartoon finger pressing a button with an instant bright spark, a stopwatch reading one tenth of a second, instant response",
  "2.6": "a happy cartoon user instantly comfortable using a new app because it looks familiar like apps they already know, recognition",
  "2.7": "a friendly cute cartoon error robot kindly pointing the way to fix a problem with a helpful smile, not scary, good error message",
  # feel
  "3.1": "a bouncing ball moving in a smooth graceful ease-in-out arc with motion trails, smooth natural animation versus stiff robotic, easing",
  "3.2": "a cartoon video game character landing a heavy punch on a robot, the whole scene violently shaking with bold motion speed lines and a giant explosive impact star burst",
  "3.3": "a cartoon character dramatically winding up a huge baseball swing with exaggerated anticipation and follow-through arcs, animation principle",
  "3.4": "a cartoon finger pressing a glowing button with an instant satisfying spark and pop at the moment of touch, immediate feedback",
  "3.5": "two cartoon fighters frozen mid-air at the exact moment of a heavy impact, dramatic freeze frame with a giant impact star, hit stop",
  "3.6": "a joyful burst of colorful confetti and sparkle particles exploding to celebrate an event, fireworks of game particles",
  # feed
  "4.1": "a person rapidly thumb-flicking through an endless phone feed with zero patience, blurred motion, impatient scrolling",
  "4.2": "a cartoon game interface that teaches itself with big obvious glowing visual arrows and hints, no instruction manual needed, self explanatory",
  "4.3": "a single dazzling one-time firework over a phone, one complete satisfying play session enjoyed once, one shot fun",
  "4.5": "a phone held in one hand with the thumb comfortably sweeping a reach arc over buttons at the bottom of the screen, thumb zone",
  "4.6": "a delighted cartoon person with a bright lightbulb above their head instantly getting how a game works in seconds, aha moment",
  # social
  "6.1": "people tapping a big reaction action button on someone's post and a notification flying back to the happy author, feed needs a verb",
  "6.2": "a friendly cartoon notification bell ringing as a real person's thumbs-up reaction pops over to a delighted author, healthy notification",
  "6.3": "a cartoon character standing face to face with their own glowing AI clone twin in a mirror, you versus your AI self",
  "6.4": "one happy cartoon user sharing a game outward to many new users in a spreading branching network, going viral",
  "6.5": "two cartoon rivals racing on a leaderboard ladder, one overtaking the other, a ping notification, competition",
  "6.6": "a diagram of two loops, one bringing the same happy user back again, another bringing in brand new friends, retention versus virality",
}

def gen(prompt, timeout=360, retries=3):
    data = json.dumps({"prompt": prompt}).encode(); last = None
    for a in range(retries):
        try:
            req = urllib.request.Request(API_URL, data=data, method="POST", headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                body = json.loads(r.read())
            if body.get("url"): return body["url"]
            raise RuntimeError(f"no url: {body}")
        except Exception as e:
            last = e; print(f"    retry {a+1}: {e}", flush=True); time.sleep(8*(a+1))
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
    outdir = Path(__file__).parent / "public/q"; outdir.mkdir(parents=True, exist_ok=True)
    ids = sorted(JOBS)
    done = 0
    for qid in ids:
        out = outdir / f"{qid}.png"
        if out.exists():
            print(f"[{qid}] skip (exists)", flush=True); continue
        print(f"[{qid}] generating…", flush=True)
        try:
            url = gen(f"{JOBS[qid]}, {STYLE}")
            download(url, out); done += 1
            print(f"[{qid}] saved", flush=True)
        except Exception as e:
            print(f"[{qid}] FAILED {e}", flush=True)
        time.sleep(1.2)
    print(f"done — generated {done} new images")
