from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import shutil

ROOT = Path("/Users/yin/alteru-training-quiz")
SRC = ROOT / "poster-hero.png"
OUT = ROOT / "poster.png"
S = 1024
INK = (17, 17, 17)
WHITE = (255, 255, 255)
YELLOW = (255, 214, 10)
RED = (230, 57, 70)
CYAN = (33, 200, 240)

KNEWAVE = str(ROOT / "fonts/Knewave.ttf")
BANGERS = str(ROOT / "fonts/Bangers.ttf")

base = Image.open(SRC).convert("RGB").resize((S, S), Image.LANCZOS)
d = ImageDraw.Draw(base)

def font(p, sz): return ImageFont.truetype(p, sz)
def tw(f, s):
    b = f.getbbox(s); return b[2]-b[0], b[3]-b[1], b[1]

def fit(path, text, target_w, cap=300):
    sz = 40
    while sz < cap:
        f = font(path, sz); w,_,_ = tw(f, text)
        if w >= target_w: break
        sz += 4
    return font(path, sz)

# ---- bottom banner ----
BANNER_H = 215
by = S - BANNER_H
d.rectangle([0, by, S, S], fill=INK)
d.rectangle([0, by, S, by+10], fill=YELLOW)  # top accent line

title = "GAME SENSE"
f = fit(KNEWAVE, title, S-90, cap=200)
w, h, off = tw(f, title)
tx = (S - w)//2
ty = by + (BANNER_H - h)//2 - off + 6
# red comic drop shadow then white with ink stroke
d.text((tx+7, ty+7), title, font=f, fill=RED)
d.text((tx, ty), title, font=f, fill=WHITE, stroke_width=5, stroke_fill=INK)

# ---- top-left tilted sticker ----
sub = "THE GAME-DESIGN QUIZ"
sf = font(BANGERS, 40)
sw, sh, soff = tw(sf, sub)
pad = 16
chip = Image.new("RGBA", (sw+pad*2, sh+pad*2), (0,0,0,0))
cd = ImageDraw.Draw(chip)
cd.rectangle([0,0,chip.width-1,chip.height-1], fill=YELLOW+(255,), outline=INK+(255,), width=5)
cd.text((pad, pad-soff), sub, font=sf, fill=INK+(255,))
chip = chip.rotate(7, expand=True, resample=Image.BICUBIC)
# hard shadow for sticker
sh_layer = Image.new("RGBA", chip.size, (0,0,0,0))
ImageDraw.Draw(sh_layer).rectangle([0,0,sh_layer.width-1,sh_layer.height-1], fill=(0,0,0,0))
base_rgba = base.convert("RGBA")
px, py = 26, 26
# draw a black offset shadow rectangle behind sticker by pasting a darkened copy
shadow = Image.new("RGBA", chip.size, (0,0,0,0))
sd = ImageDraw.Draw(shadow)
for x in range(chip.width):
    pass
base_rgba.alpha_composite(chip, (px+6, py+6))  # crude shadow = sticker itself shifted (we'll overlay real on top)
base_rgba.alpha_composite(chip, (px, py))

final = base_rgba.convert("RGB")
final.save(OUT)
print("saved", OUT)

# distribute
pub = ROOT / "public"; pub.mkdir(exist_ok=True)
shutil.copy(OUT, pub / "poster.png")
plat = Path("/Users/yin/code/games/games/posters/game-sense.png")
if plat.parent.exists():
    shutil.copy(OUT, plat); print("copied to platform posters")
print("copied to public/poster.png")
