"""Przygotowanie ilustracji z Canvy: przezroczystość z jasności, jeden kolor tuszu, przycięcie, WebP."""
import sys, os, glob
from PIL import Image, ImageOps, features
INK = (0x7A, 0x24, 0x34)
MAXW = {'09_ceremonia': 1000, '10_stodola': 1000, '07_ramka': 900, '11_bus': 600}
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for f in sorted(glob.glob(os.path.join(src, '*.png'))):
    name = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert('RGBA')
    r, g, b, a = im.split()
    lum = Image.merge('RGB', (r, g, b)).convert('L')
    dark = ImageOps.invert(lum)                       # 0 = biel, 255 = tusz
    dark = dark.point(lambda v: 0 if v < 18 else min(255, int((v - 18) * 255 / 150)))
    alpha = Image.fromarray(__import__('numpy').minimum(__import__('numpy').array(dark), __import__('numpy').array(a)))
    out = Image.new('RGBA', im.size, INK + (0,)); out.putalpha(alpha)
    bbox = alpha.point(lambda v: 255 if v > 24 else 0).getbbox()
    pad = int(max(im.size) * 0.01)
    bbox = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(im.width, bbox[2]+pad), min(im.height, bbox[3]+pad))
    out = out.crop(bbox)
    mw = MAXW.get(name, 520)
    if out.width > mw: out = out.resize((mw, round(out.height * mw / out.width)), Image.LANCZOS)
    p = os.path.join(dst, name + '.webp'); out.save(p, 'WEBP', quality=(70 if name in ('09_ceremonia','10_stodola') else 85), method=6)
    print(name, out.size, os.path.getsize(p)//1024, 'KB')
# kokardka (lewy górny róg ramki) — ozdobnik do separatorów
fr = Image.open(os.path.join(dst, '07_ramka.webp'))
bow = fr.crop((0, 0, int(fr.width * 0.165), int(fr.height * 0.115)))
bow = bow.crop(bow.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())
bow.save(os.path.join(dst, 'kokardka.webp'), 'WEBP', quality=90, method=6); print('kokardka', bow.size)
