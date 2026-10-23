"""Ilustracje z Canvy -> WebP dla strony.
Użycie: python przygotuj_ilustracje.py <folder z PNG z Canvy (1.png, 2.png...)> <assets/img>
Każda grafika: przezroczystość z jasności, jeden kolor tuszu, przycięcie do treści, zmniejszenie."""
import sys, os
import numpy as np
from PIL import Image
INK = (0x7A, 0x24, 0x34)
# numer strony w Canvie -> (nazwa pliku, maks. szerokość, jakość)
# Sceny są „spłaszczane” na białe tło (3x mniejsze pliki niż z przezroczystością);
# na stronie mają mix-blend-mode: multiply, więc biel znika na papierze.
MAP = {
    9:  ('ceremonia', 1000, 70), 10: ('stodola', 1000, 70), 11: ('bus', 640, 75),
    12: ('bar', 720, 70), 13: ('wrota', 1000, 70), 14: ('sala_lampki', 720, 70),
    15: ('kwiaty_beczka', 640, 70), 16: ('kwiaty_skrzynia', 640, 70), 17: ('kurtyna', 720, 70),
    18: ('sala', 1100, 70),
    20: ('monogram', 640, 90), 21: ('wieza_wisnie', 640, 72), 22: ('tort', 640, 72),
    23: ('bukiet_1', 640, 70), 24: ('bukiet_2', 640, 70),
}
ONLY = {int(x) for x in sys.argv[3:]}  # opcjonalnie: tylko wybrane numery
KEEP_ALPHA = {'monogram'}
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)

def ink(im):
    a = np.asarray(im.convert('RGBA')).astype(np.float32)
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    dark = np.clip((255 - lum - 18) * 255 / 150, 0, 255)
    alpha = np.minimum(dark, a[..., 3]).astype(np.uint8)
    out = np.zeros(a.shape, np.uint8); out[..., 0], out[..., 1], out[..., 2] = INK; out[..., 3] = alpha
    return Image.fromarray(out, 'RGBA')

def trim(im, pad=0.01):
    bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    p = int(max(im.size) * pad)
    return im.crop((max(0, bb[0]-p), max(0, bb[1]-p), min(im.width, bb[2]+p), min(im.height, bb[3]+p)))

for num, (name, mw, q) in MAP.items():
    if ONLY and num not in ONLY: continue
    f = os.path.join(src, f'{num}.png')
    if not os.path.exists(f): print('brak', f); continue
    out = trim(ink(Image.open(f)))
    if out.width > mw: out = out.resize((mw, round(out.height * mw / out.width)), Image.LANCZOS)
    if name not in KEEP_ALPHA:
        bg = Image.new('RGB', out.size, (255, 255, 255)); bg.paste(out, (0, 0), out); out = bg
    p = os.path.join(dst, name + '.webp'); out.save(p, 'WEBP', quality=q, method=4)
    print(f'{name:16s} {out.size}  {os.path.getsize(p)//1024} KB')
