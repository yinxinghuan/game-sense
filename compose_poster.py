from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import shutil

SRC = Path("/Users/yin/alteru-training-quiz/poster-art.png")
OUT = Path("/Users/yin/alteru-training-quiz/poster.png")
S = 1024
CYAN = (33, 243, 255)
MAG = (255, 43, 214)
YEL = (255, 232, 59)

base = Image.open(SRC).convert("RGB").resize((S, S), Image.LANCZOS)

# top gradient for title contrast
grad = Image.new("L", (1, S), 0)
for y in range(S):
    if y < 300:
        grad.putpixel((0, y), int(190 * (1 - y / 300)))
grad = grad.resize((S, S))
shade = Image.new("RGB", (S, S), (3, 2, 12))
base = Image.composite(shade, base, grad)

# bottom subtle shade for subtitle
grad2 = Image.new("L", (1, S), 0)
for y in range(S):
    if y > S - 200:
        grad2.putpixel((0, y), int(150 * ((y - (S - 200)) / 200)))
grad2 = grad2.resize((S, S))
base = Image.composite(shade, base, grad2)

draw_base = base.convert("RGBA")

def font(path, size):
    return ImageFont.truetype(path, size)

ARIAL_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"

def text_w(f, s):
    b = f.getbbox(s)
    return b[2] - b[0], b[3] - b[1]

def draw_neon(canvas, text, cy, fpath, target_w, fill, glow, pad_size=200):
    # find size to fit target_w
    size = 20
    while True:
        f = font(fpath, size)
        w, h = text_w(f, text)
        if w >= target_w or size > 400:
            break
        size += 4
    f = font(fpath, size)
    w, h = text_w(f, text)
    x = (S - w) // 2
    bb = f.getbbox(text)
    y = cy - h // 2 - bb[1]
    # glow layer
    glow_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.text((x, y), text, font=f, fill=glow + (255,))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(18))
    canvas.alpha_composite(glow_layer)
    glow_layer2 = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd2 = ImageDraw.Draw(glow_layer2)
    gd2.text((x, y), text, font=f, fill=glow + (255,))
    glow_layer2 = glow_layer2.filter(ImageFilter.GaussianBlur(6))
    canvas.alpha_composite(glow_layer2)
    # crisp text with dark outline
    d = ImageDraw.Draw(canvas)
    d.text((x, y), text, font=f, fill=fill + (255,),
           stroke_width=3, stroke_fill=(7, 6, 15, 255))

# GAME SENSE — two stacked lines, big
draw_neon(draw_base, "GAME", 150, ARIAL_BLACK, 560, CYAN, MAG)
draw_neon(draw_base, "SENSE", 300, ARIAL_BLACK, 640, MAG, CYAN)

# subtitle bottom
fsub = font(IMPACT, 52)
sub = "ARCADE  KNOWLEDGE  TEST"
w, h = text_w(fsub, sub)
xs = (S - w) // 2
ys = S - 120
sub_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
sd = ImageDraw.Draw(sub_layer)
sd.text((xs, ys), sub, font=fsub, fill=YEL + (255,))
sub_layer = sub_layer.filter(ImageFilter.GaussianBlur(8))
draw_base.alpha_composite(sub_layer)
ImageDraw.Draw(draw_base).text((xs, ys), sub, font=fsub, fill=YEL + (255,),
                               stroke_width=2, stroke_fill=(7, 6, 15, 255))

final = draw_base.convert("RGB")
final.save(OUT)
print("saved", OUT)

# copy to repo public/ and platform posters dir
repo_pub = Path("/Users/yin/alteru-training-quiz/public")
repo_pub.mkdir(exist_ok=True)
shutil.copy(OUT, repo_pub / "poster.png")
plat = Path("/Users/yin/code/games/games/posters/game-sense.png")
if plat.parent.exists():
    shutil.copy(OUT, plat)
    print("copied to platform posters:", plat)
print("copied to repo public/poster.png")
