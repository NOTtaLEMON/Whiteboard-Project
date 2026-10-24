"""Slide 2 GIF: the same lesson example checked the old way (IDE) and with Boardroom, side by side."""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets2')
INK, PAPER, WHITE, CORAL, YELLOW, BLUE, MUTE, HAIR, ICE = '#0E1330', '#F6F4EE', '#FFFFFF', '#FF5A4E', '#FFC531', '#3355FF', '#5B6075', '#D6D3C8', '#DCE4FF'
W, H = 960, 500
SANS = 'C:/Windows/Fonts/arialbd.ttf'
F_ROW, F_HEAD, F_TAG, F_BIG = (ImageFont.truetype(SANS, s) for s in (25, 22, 15, 21))

LEFT = [('Write on the board', False), ('Open the IDE', True), ('Paste the code', False), ('Run it', False), ('Back to the board', True)]
RIGHT = [('Write on the board', False), ('Select the code', False), ('Run: answer on the board', False)]
TICKS_PER_STEP = 3


def tick_mark(d, x, y, s, fill):
    d.line((x, y + s * 0.55, x + s * 0.38, y + s, x + s, y), fill=fill, width=5)


def column(d, x0, title, head_fill, head_color, rows, tick, accent, counter):
    x1 = x0 + 440
    d.rectangle((x0, 24, x1, 460), fill=WHITE, outline=HAIR, width=2)
    d.rectangle((x0, 24, x1, 70), fill=head_fill)
    d.text((x0 + 20, 36), title, font=F_HEAD, fill=head_color)
    done_at = len(rows) * TICKS_PER_STEP
    for i, (text, switch) in enumerate(rows):
        y = 92 + i * 62
        step_start = i * TICKS_PER_STEP
        state = 'done' if tick >= step_start + TICKS_PER_STEP else ('active' if tick >= step_start else 'todo')
        d.rectangle((x0 + 16, y, x1 - 16, y + 50), fill=ICE if state == 'active' else (PAPER if state == 'done' else WHITE),
                    outline=accent if state == 'active' else HAIR, width=3 if state == 'active' else 2)
        box_fill = accent if state == 'done' else WHITE
        d.rectangle((x0 + 28, y + 11, x0 + 56, y + 39), fill=box_fill, outline=accent if state != 'todo' else HAIR, width=2)
        if state == 'done':
            tick_mark(d, x0 + 34, y + 17, 16, WHITE)
        else:
            d.text((x0 + 36, y + 12), str(i + 1), font=F_TAG, fill=MUTE if state == 'todo' else INK)
        d.text((x0 + 72, y + 11), text, font=F_ROW, fill=INK if state != 'todo' else MUTE)
        if switch:
            tw = d.textlength('APP SWITCH', font=F_TAG)
            d.rectangle((x1 - 40 - tw, y + 12, x1 - 24, y + 38), fill=CORAL)
            d.text((x1 - 32 - tw, y + 14), 'APP SWITCH', font=F_TAG, fill=WHITE)
        if state == 'active':
            frac = ((tick - step_start) + 1) / TICKS_PER_STEP
            d.rectangle((x0 + 16, y + 46, x0 + 16 + int((x1 - x0 - 32) * min(frac, 1)), y + 50), fill=accent)
    d.rectangle((x0, 400, x1, 460), fill=PAPER)
    d.text((x0 + 20, 420), counter, font=F_BIG, fill=INK)
    if tick >= done_at:
        d.rectangle((x1 - 96, 414, x1 - 16, 446), fill=accent)
        d.text((x1 - 80, 420), 'DONE', font=F_TAG, fill=WHITE)


frames, durations = [], []
LAST = 5 * TICKS_PER_STEP
for tick in list(range(0, LAST + 1)) + [LAST] * 5:
    img = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(img)
    column(d, 20, 'THE OLD WAY', HAIR, INK, LEFT, tick, MUTE, '5 steps, 2 app switches')
    column(d, 500, 'WITH BOARDROOM', BLUE, WHITE, RIGHT, tick, BLUE, '3 steps, 0 app switches')
    frames.append(img)
    durations.append(600 if tick < LAST else 500)
durations[-1] = 1800
frames[0].save(os.path.join(OUT, 'sim-compare.gif'), save_all=True, append_images=frames[1:], duration=durations, loop=0, disposal=2, optimize=False)
frames[-1].save(os.path.join(os.path.dirname(__file__), 'preview', 'compare.png'))
print('frames', len(frames), os.path.getsize(os.path.join(OUT, 'sim-compare.gif')) // 1024, 'KB')
