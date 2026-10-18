# Composes Chrome Web Store screenshots (1280x800) and promo tiles from raw captures.
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
REG = '/System/Library/Fonts/Supplemental/Arial.ttf'


def gradient(size, top, bottom):
    w, h = size
    img = Image.new('RGB', size, top)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / (h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)))
    return img


def rounded(img, radius):
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.width - 1, img.height - 1], radius, fill=255)
    out = img.convert('RGBA')
    out.putalpha(mask)
    return out


def paste_card(canvas, shot, xy, radius=18):
    card = rounded(shot, radius)
    shadow = Image.new('RGBA', (card.width + 80, card.height + 80), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([40, 52, 40 + card.width, 52 + card.height], radius, fill=(30, 27, 75, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    canvas.alpha_composite(shadow, (xy[0] - 40, xy[1] - 40))
    canvas.alpha_composite(card, xy)


def text_block(d, x, y, title, subtitle, width, dark=False):
    tf = ImageFont.truetype(BOLD, 44)
    sf = ImageFont.truetype(REG, 22)
    color = (250, 250, 250) if dark else (24, 24, 27)
    sub = (161, 161, 170) if dark else (82, 82, 91)
    for line in title.split('\n'):
        d.text((x, y), line, font=tf, fill=color)
        y += 54
    y += 14
    words, line = subtitle.split(), ''
    for word in words:
        trial = f'{line} {word}'.strip()
        if d.textlength(trial, font=sf) > width:
            d.text((x, y), line, font=sf, fill=sub)
            y += 32
            line = word
        else:
            line = trial
    d.text((x, y), line, font=sf, fill=sub)


def screenshot(raw, out, title, subtitle, dark=False, scale=1.1):
    bg = gradient((1280, 800), (24, 24, 32), (9, 9, 11)) if dark else gradient((1280, 800), (238, 242, 255), (250, 250, 250))
    canvas = bg.convert('RGBA')
    shot = Image.open(raw).convert('RGB')
    w = int(620 * scale)
    shot = shot.resize((w, int(shot.height * w / shot.width)), Image.LANCZOS)
    paste_card(canvas, shot, (1280 - w - 60, (800 - shot.height) // 2))
    text_block(ImageDraw.Draw(canvas), 64, 250, title, subtitle, 1280 - w - 60 - 64 - 40, dark)
    canvas.convert('RGB').save(out)


def full(raw, out):
    Image.open(raw).convert('RGB').resize((1280, 800), Image.LANCZOS).save(out)


def promo(out, size, tagline):
    w, h = size
    canvas = gradient(size, (79, 70, 229), (55, 48, 163)).convert('RGBA')
    icon_size = int(h * 0.42)
    icon = Image.open('../public/images/icon_128.png').convert('RGBA').resize((icon_size, icon_size), Image.LANCZOS)
    d = ImageDraw.Draw(canvas)
    name_font = ImageFont.truetype(BOLD, int(h * 0.2))
    tag_font = ImageFont.truetype(REG, int(h * 0.075))
    block_w = icon_size + int(h * 0.08) + d.textlength('Mody', font=name_font)
    x = (w - block_w) // 2 if w < 1000 else int(w * 0.1)
    y = (h - icon_size) // 2 - int(h * 0.06)
    canvas.alpha_composite(icon, (int(x), y))
    tx = int(x + icon_size + h * 0.08)
    d.text((tx, y + icon_size * 0.08), 'Mody', font=name_font, fill='white')
    d.text((tx, y + icon_size * 0.72), tagline, font=tag_font, fill=(224, 231, 255))
    canvas.convert('RGB').save(out)


screenshot('raw/popup-light.png', 'assets/screenshot-1.png', 'Modify HTTP headers\nin one click',
           'Override, append or remove request and response headers, redirect URLs and edit CSP — per profile.')
screenshot('raw/popup-menu.png', 'assets/screenshot-2.png', 'Profiles for every\nenvironment',
           'Switch between local, staging and production setups. Keep some always on, clone, sort and undo.')
screenshot('raw/popup-add-dark.png', 'assets/screenshot-3.png', 'Fine-grained\nfilters',
           'Limit changes by URL, domain, method, resource type, tab, window or an auto-off timer.', dark=True)
full('raw/options-light.png', 'assets/screenshot-4.png')
promo('assets/promo-small.png', (440, 280), 'HTTP header modifier')
promo('assets/promo-marquee.png', (1400, 560), 'Headers, redirects & CSP — no tracking.')
