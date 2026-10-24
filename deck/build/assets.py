"""Generates the animated GIFs and background textures for the Boardroom deck (Neo-Brutalist palette only)."""
import math
import os
import random
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(OUT, exist_ok=True)

CREAM, BLACK, RED, YELLOW, VIOLET, WHITE = '#FFFDF5', '#000000', '#FF6B6B', '#FFD93D', '#C4B5FD', '#FFFFFF'
BLUE = '#1971C2'  # the product's stdin ink colour, used only where the product shows it
W, H = 720, 440
MONO_B = 'C:/Windows/Fonts/consolab.ttf'
SANS_B = 'C:/Windows/Fonts/arialbd.ttf'
IMPACT = 'C:/Windows/Fonts/impact.ttf'


def font(path, size):
    return ImageFont.truetype(path, size)


F_CODE = font(MONO_B, 20)
F_CODE_S = font(MONO_B, 18)
F_LABEL = font(SANS_B, 16)
F_LABEL_L = font(SANS_B, 22)
F_TINY = font(SANS_B, 15)
F_STAMP = font(IMPACT, 34)
F_STAMP_S = font(IMPACT, 28)


def canvas():
    img = Image.new('RGB', (W, H), CREAM)
    return img, ImageDraw.Draw(img)


def box(draw, xy, fill=WHITE, width=4, shadow=8, outline=BLACK):
    x0, y0, x1, y1 = xy
    if shadow:
        draw.rectangle((x0 + shadow, y0 + shadow, x1 + shadow, y1 + shadow), fill=BLACK)
    draw.rectangle(xy, fill=fill, outline=outline, width=width)


def label(draw, xy, text, fill=BLACK, fnt=F_LABEL, color=CREAM, pad=(8, 4)):
    x, y = xy
    left, top, right, bottom = draw.textbbox((0, 0), text, font=fnt)
    draw.rectangle((x, y, x + (right - left) + pad[0] * 2, y + (bottom - top) + pad[1] * 2 + 2), fill=fill)
    draw.text((x + pad[0], y + pad[1] - top + 1), text, font=fnt, fill=color)
    return right - left + pad[0] * 2


def play(d, x, y, s, fill=BLACK):
    d.polygon([(x, y), (x, y + s), (x + s * 0.9, y + s / 2)], fill=fill)


def check(d, x, y, s, fill=BLACK, w=5):
    d.line((x, y + s * 0.55, x + s * 0.38, y + s, x + s, y), fill=fill, width=w)


def cross(d, x, y, s, fill=YELLOW, w=5):
    d.line((x, y, x + s, y + s), fill=fill, width=w)
    d.line((x + s, y, x, y + s), fill=fill, width=w)


def stamp(img, text, center, fill, angle=-6, fnt=F_STAMP, color=BLACK, tick=False):
    tmp = Image.new('RGBA', (W, 100), (0, 0, 0, 0))
    d = ImageDraw.Draw(tmp)
    l, t, r, b = d.textbbox((0, 0), text, font=fnt)
    w, h = r - l + 30 + (30 if tick else 0), b - t + 20
    d.rectangle((7, 7, w + 7, h + 7), fill=BLACK)
    d.rectangle((0, 0, w, h), fill=fill, outline=BLACK, width=4)
    d.text((15, 9 - t), text, font=fnt, fill=color)
    if tick:
        check(d, w - 38, 12, h - 26, BLACK, 6)
    tmp = tmp.crop((0, 0, w + 9, h + 9)).rotate(angle, expand=True, resample=Image.BICUBIC)
    img.paste(tmp, (int(center[0] - tmp.width / 2), int(center[1] - tmp.height / 2)), tmp)


def save_gif(frames, durations, name):
    path = os.path.join(OUT, name)
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=durations, loop=0, disposal=2, optimize=False)
    print(name, len(frames), 'frames', os.path.getsize(path) // 1024, 'KB')


def ease(t):
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- GIF A: cover loop (type, input, run, output)
CODE_A = ['#include <stdio.h>', 'int main(void) {', '  int a, b;', '  scanf("%d %d", &a, &b);',
          '  printf("%d + %d = %d\\n",', '         a, b, a + b);', '}']


def frame_a(typed, stdin_on, run_state, out_chars, status):
    img, d = canvas()
    d.rectangle((0, 0, W, 42), fill=BLACK)
    for i, c in enumerate((RED, YELLOW, VIOLET)):
        d.rectangle((14 + i * 28, 12, 30 + i * 28, 28), fill=c, outline=CREAM, width=2)
    d.text((112, 11), 'BOARD 1 · INPUT & OUTPUT', font=F_LABEL, fill=CREAM)
    box(d, (20, 62, 456, 422), fill=WHITE)
    label(d, (30, 70), 'CODE · BLACK INK', fill=BLACK)
    count = 0
    cursor_row, cursor_x = None, 0
    for i, line in enumerate(CODE_A):
        shown = line[:max(0, typed - count)]
        if 0 <= typed - count <= len(line):
            cursor_row, cursor_x = i, d.textlength(shown, font=F_CODE_S)
        count += len(line) + 1
        d.text((36, 110 + i * 44), shown, font=F_CODE_S, fill=BLACK)
    if cursor_row is not None and typed < count and (typed // 3) % 2 == 0:
        d.rectangle((36 + cursor_x, 110 + cursor_row * 44, 46 + cursor_x, 132 + cursor_row * 44), fill=RED)
    box(d, (484, 62, 700, 140), fill=WHITE)
    label(d, (494, 70), 'STDIN · BLUE INK', fill=BLUE, fnt=F_TINY)
    if stdin_on:
        d.text((498, 100), '3 5', font=font(MONO_B, 28), fill=BLUE)
    pressed = run_state == 1
    o = 8 if pressed else 0
    d.rectangle((484 + 8, 160 + 8, 700 + 8, 216 + 8), fill=BLACK)
    d.rectangle((484 + o, 160 + o, 700 + o, 216 + o), fill=RED, outline=BLACK, width=4)
    play(d, 500 + o, 174 + o, 26)
    d.text((540 + o, 175 + o), 'RUN', font=F_LABEL_L, fill=BLACK)
    box(d, (484, 240, 700, 422), fill=BLACK, outline=BLACK)
    d.text((498, 250), 'OUTPUT', font=F_LABEL, fill=YELLOW)
    if run_state == 1:
        d.text((498, 306), 'compiling' + '.' * (1 + (out_chars % 3)), font=F_CODE, fill=CREAM)
    if run_state == 2:
        d.text((498, 300), '3 + 5 = 8'[:out_chars], font=font(MONO_B, 28), fill=YELLOW)
    if status:
        d.rectangle((498, 360, 690, 404), fill=YELLOW)
        check(d, 506, 372, 20, BLACK, 5)
        d.text((536, 372), 'EXIT 0', font=F_LABEL_L, fill=BLACK)
    return img


frames, durs = [], []
total = sum(len(x) + 1 for x in CODE_A)
for typed in range(0, total + 4, 5):
    frames.append(frame_a(typed, False, 0, 0, False)); durs.append(55)
frames.append(frame_a(total, False, 0, 0, False)); durs.append(300)
for _ in range(2):
    frames.append(frame_a(total, True, 0, 0, False)); durs.append(350)
for i in range(4):
    frames.append(frame_a(total, True, 1, i, False)); durs.append(160)
for n in range(1, 10):
    frames.append(frame_a(total, True, 2, n, False)); durs.append(70)
frames.append(frame_a(total, True, 2, 9, True)); durs.append(2200)
save_gif(frames, durs, 'sim-run.gif')


# ---------------------------------------------------------------- GIF B: handwriting -> review gate -> confirm
def scribble(d, y, x0, x1, color, progress, seed):
    rnd = random.Random(seed)
    pts = []
    x = x0
    while x < x1:
        pts.append((x, y + math.sin(x / 7.0 + seed) * 6 + rnd.uniform(-3, 3)))
        x += 4
    n = int(len(pts) * progress)
    if n > 1:
        d.line(pts[:n], fill=color, width=4, joint='curve')


READ = ['int main() {', '  int x = 5', '  printf("%d", x);', '}']


def frame_b(ink, reading, shown, flag, confirm):
    img, d = canvas()
    box(d, (20, 24, 270, 318), fill=WHITE)
    label(d, (30, 32), '1 WRITE', fill=BLACK, fnt=F_LABEL_L)
    for i, (xx, seed) in enumerate(((46, 1), (66, 2), (66, 3), (46, 4))):
        scribble(d, 112 + i * 50, xx, 244 if i != 3 else 96, BLACK, max(0, min(1, ink * 4 - i)), seed)
    if reading:
        y = 80 + int((reading % 1.0) * 220)
        d.rectangle((24, y, 266, y + 7), fill=RED)
    d.polygon([(284, 150), (320, 150), (320, 128), (358, 171), (320, 214), (320, 192), (284, 192)], fill=YELLOW, outline=BLACK)
    box(d, (372, 24, 700, 318), fill=WHITE)
    label(d, (382, 32), '2 READ + REVIEW', fill=VIOLET, color=BLACK, fnt=F_LABEL_L)
    for i, line in enumerate(READ):
        if i < shown:
            if i == 1 and flag:
                d.rectangle((382, 82 + i * 48, 690, 124 + i * 48), fill=YELLOW)
            d.text((392, 90 + i * 48), line, font=font(MONO_B, 22), fill=BLACK)
            if i == 1:
                label(d, (588, 90 + i * 48), 'CHECK', fill=BLACK, fnt=F_TINY, pad=(6, 3))
    d.rectangle((382, 280, 404, 302), fill=WHITE, outline=BLACK, width=3)
    if confirm >= 1:
        check(d, 386, 282, 15, BLACK, 5)
    d.text((414, 281), 'I checked it against the ink.', font=F_TINY, fill=BLACK)
    on = confirm >= 2
    d.rectangle((20 + 8, 346 + 8, 372 + 8, 418 + 8), fill=BLACK)
    d.rectangle((20, 346, 372, 418), fill=RED if on else CREAM, outline=BLACK, width=4)
    d.text((42, 368), 'USE CONFIRMED CODE', font=font(SANS_B, 26), fill=BLACK if on else '#7a7a7a')
    if on:
        stamp(img, 'NOW IT CAN RUN', (540, 382), YELLOW, angle=-4, fnt=F_STAMP_S, tick=True)
    else:
        d.text((400, 372), 'Run stays locked.', font=F_LABEL_L, fill=BLACK)
    return img


frames, durs = [], []
for i in range(0, 17):
    frames.append(frame_b(i / 16, 0, 0, False, 0)); durs.append(60)
for i in range(0, 12):
    frames.append(frame_b(1, i / 12, min(4, 1 + i // 3), False, 0)); durs.append(120)
for _ in range(3):
    frames.append(frame_b(1, 0, 4, True, 0)); durs.append(380)
frames.append(frame_b(1, 0, 4, True, 1)); durs.append(500)
frames.append(frame_b(1, 0, 4, True, 2)); durs.append(2200)
save_gif(frames, durs, 'sim-review.gif')


# ---------------------------------------------------------------- GIF C: snippet organizer (arrange only, nothing fixed)
def card(d, xy, text, fill=WHITE, fnt=F_CODE_S, shadow=5):
    box(d, xy, fill=fill, width=3, shadow=shadow)
    d.text((xy[0] + 12, xy[1] + (xy[3] - xy[1] - 22) // 2), text, font=fnt, fill=BLACK)


def lerp(a, b, t):
    return a + (b - a) * ease(t)


def frame_c(t_move, phase):
    img, d = canvas()
    label(d, (20, 14), 'YOUR SNIPPET', fill=BLACK)
    label(d, (372, 14), 'ORGANIZED, THEN COMPILED', fill=VIOLET, color=BLACK)
    card(d, (372, 52, 700, 92), '#include <stdio.h>', fill=VIOLET)
    stmt_src, help_src = (20, 100, 340, 146), (20, 172, 340, 218)
    st_dst, he_dst = (396, 210, 700, 256), (372, 104, 700, 150)
    st = tuple(lerp(a, b, t_move) for a, b in zip(stmt_src, st_dst))
    he = tuple(lerp(a, b, t_move) for a, b in zip(help_src, he_dst))
    stmt_text, help_text = 'printf("%d", sq(4));', 'int sq(int x){return x*x;}'
    if phase >= 1:
        card(d, st, stmt_text)
        card(d, he, help_text)
    else:
        card(d, stmt_src, stmt_text)
        card(d, help_src, help_text)
    if phase >= 2:
        card(d, (372, 164, 700, 204), 'int main() {', fill=RED)
        card(d, (372, 266, 700, 306), 'return 0;', fill=RED)
        card(d, (372, 312, 700, 352), '}', fill=RED)
        label(d, (590, 170), 'ADDED', fill=BLACK, fnt=F_TINY, pad=(6, 3))
    if phase >= 3:
        stamp(img, 'NOTHING ELSE CHANGED', (480, 396), YELLOW, angle=-3, fnt=F_STAMP_S, tick=True)
    if phase == 0:
        d.text((20, 260), 'Statement first,\nhelper second.\nNo main() yet.', font=F_LABEL_L, fill=BLACK)
    if phase in (1, 2):
        label(d, (20, 262), 'GEMINI: ARRANGE ONLY', fill=RED, color=BLACK, fnt=F_LABEL_L)
        d.text((20, 308), 'It never fixes errors.', font=F_LABEL, fill=BLACK)
    if phase == 4:
        d.rectangle((28, 316 + 8, 340 + 8 - 8, 380 + 8), fill=BLACK)
        d.rectangle((20, 316, 332, 380), fill=YELLOW, outline=BLACK, width=4)
        play(d, 36, 334, 26)
        d.text((76, 334), 'COMPILE', font=F_LABEL_L, fill=BLACK)
    return img


frames, durs = [], []
frames += [frame_c(0, 0)] * 2; durs += [700, 700]
for i in range(1, 11):
    frames.append(frame_c(i / 10, 1)); durs.append(60)
frames.append(frame_c(1, 1)); durs.append(300)
frames.append(frame_c(1, 2)); durs.append(700)
frames.append(frame_c(1, 3)); durs.append(900)
frames.append(frame_c(1, 4)); durs.append(2000)
save_gif(frames, durs, 'sim-snippet.gif')


# ---------------------------------------------------------------- GIF D: sandbox "try to break it"
SCENES = [
    ('sleep(10);', 'sleep', ('TIMEOUT: 5 s', RED)),
    ('100000 x printf()', 'flood', ('OUTPUT CUT: 16 KiB', YELLOW)),
    ('p[4] = 1; /* 4 ints */', 'asan', ('ASAN CAUGHT IT', RED)),
    ('s.connect(("1.1.1.1",80))', 'net', ('NO NETWORK', VIOLET)),
]


def frame_d(scene, step, steps):
    code, kind, (msg, color) = SCENES[scene]
    p = step / steps
    img, d = canvas()
    label(d, (20, 12), f'TRY {scene + 1} OF 4', fill=BLACK)
    box(d, (20, 52, 330, 128), fill=WHITE)
    d.text((34, 80), code, font=F_CODE_S, fill=BLACK)
    box(d, (20, 160, 330, 330), fill=BLACK, outline=BLACK)
    label(d, (30, 168), 'FRESH CONTAINER', fill=YELLOW, color=BLACK)
    for i, t in enumerate(('NETWORK    OFF', 'ROOT FS    READ-ONLY', 'MEMORY     512 MiB', 'PROCESSES  64')):
        d.text((34, 206 + i * 28), t, font=F_CODE_S, fill=CREAM)
    box(d, (360, 52, 700, 330), fill=BLACK, outline=BLACK)
    label(d, (370, 60), 'OUTPUT', fill=YELLOW, color=BLACK)
    if kind == 'sleep':
        d.text((374, 108), 'running…', font=F_CODE, fill=CREAM)
        d.rectangle((374, 150, 686, 186), outline=CREAM, width=3)
        d.rectangle((379, 155, 379 + int(302 * min(1, p * 1.3)), 181), fill=YELLOW)
        d.text((374, 196), f'{min(5.0, p * 6.5):.1f} s / 5 s', font=F_CODE, fill=CREAM)
    if kind == 'flood':
        for i in range(8):
            d.text((374, 104 + i * 26), f'line {int(p * 99999) - i}', font=F_CODE_S, fill=CREAM)
    if kind == 'asan':
        d.text((374, 108), 'AddressSanitizer:', font=F_CODE_S, fill=CREAM)
        if p > 0.3:
            d.text((374, 138), 'heap-buffer-overflow', font=F_CODE, fill=RED)
        if p > 0.55:
            d.text((374, 172), 'WRITE of size 4', font=F_CODE_S, fill=CREAM)
    if kind == 'net':
        d.text((374, 108), 'connecting…', font=F_CODE, fill=CREAM)
        if p > 0.5:
            d.text((374, 142), 'blocked OSError', font=F_CODE, fill=YELLOW)
    if p > 0.75:
        stamp(img, msg, (530, 262), color, angle=-5, fnt=F_STAMP_S)
    if p > 0.9:
        d.rectangle((20, 358, 700, 422), fill=BLACK)
        cross(d, 38, 376, 22, YELLOW, 5)
        d.text((74, 376), 'CONTAINER REMOVED. NEXT RUN IS CLEAN.', font=F_LABEL_L, fill=YELLOW)
    return img


frames, durs = [], []
for s in range(len(SCENES)):
    for step in range(0, 16):
        frames.append(frame_d(s, step, 15)); durs.append(120 if step < 15 else 1300)
save_gif(frames, durs, 'sim-sandbox.gif')


# ---------------------------------------------------------------- textures (transparent PNG)
def halftone(path, size=700, step=24, corner='br'):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for gy in range(0, size, step):
        for gx in range(0, size, step):
            dx = gx if corner in ('br', 'tr') else size - gx
            dy = gy if corner in ('br', 'bl') else size - gy
            dist = math.hypot(size - dx, size - dy) / (size * 1.2)
            r = max(0, (1 - dist)) * step * 0.48
            if r > 1:
                d.ellipse((gx - r, gy - r, gx + r, gy + r), fill=(0, 0, 0, 255))
    img.save(path)


def grid(path, size=1200, step=40):
    img = Image.new('RGBA', (size, int(size * 0.5625)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for x in range(0, img.width, step):
        d.line((x, 0, x, img.height), fill=(196, 181, 253, 255), width=2)
    for y in range(0, img.height, step):
        d.line((0, y, img.width, y), fill=(196, 181, 253, 255), width=2)
    img.save(path)


halftone(os.path.join(OUT, 'halftone-tr.png'), corner='tr')
halftone(os.path.join(OUT, 'halftone-bl.png'), corner='bl')
grid(os.path.join(OUT, 'grid.png'))
print('textures done')
