#!/usr/bin/env python3
import json
import re
import sys
from io import BytesIO
from pathlib import Path
from urllib.parse import quote

import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / 'assets' / 'images' / 'videos'
OUT_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
}

VIDEOS = {
    'xpeng-01': 'https://www.tiktok.com/@max.torstensson/video/7643811498111798550',
    'xpeng-02': 'https://www.tiktok.com/@max.torstensson/video/7634509440321850646',
    'xpeng-03': 'https://www.tiktok.com/@max.torstensson/video/7638674777049287958',
    'corsair-01': 'https://www.tiktok.com/@max.torstensson/video/7688349264216476950',
    'corsair-02': 'https://www.tiktok.com/@max.torstensson/video/7688018136720837890',
    'corsair-03': 'https://www.tiktok.com/@max.torstensson/video/7657185877621214486',
    'hyperx-01': 'https://www.tiktok.com/@max.torstensson/video/7683570033687072022',
    'hyperx-02': 'https://www.tiktok.com/@max.torstensson/video/7673422839818538262',
    'hyperx-03': 'https://www.tiktok.com/@max.torstensson/video/7660871363745402134',
    'nvidia-01': 'https://www.tiktok.com/@max.torstensson/video/7683178464802852118',
    'nvidia-02': 'https://www.tiktok.com/@max.torstensson/video/7681683474108927254',
    'nvidia-03': 'https://www.tiktok.com/@max.torstensson/video/7666041166600654102',
    'nvidia-04': 'https://www.tiktok.com/@max.torstensson/video/7663520935412124950',
    'msi-01': 'https://www.tiktok.com/@max.torstensson/video/7667158903066496278',
    'msi-02': 'https://www.tiktok.com/@max.torstensson/video/7659739208017382678',
}


def fetch_oembed_thumbnail(url: str) -> str:
    embed_url = f'https://www.tiktok.com/oembed?url={quote(url, safe="")}'
    response = requests.get(embed_url, headers=HEADERS, timeout=30)
    if response.status_code != 200:
        raise RuntimeError(f'oEmbed HTTP {response.status_code}')

    try:
        payload = response.json()
    except ValueError as exc:
        raise RuntimeError(f'oEmbed JSON invalid: {exc}') from exc

    thumbnail = payload.get('thumbnail_url')
    if not thumbnail:
        raise RuntimeError('oEmbed response missing thumbnail_url')
    return thumbnail


def fetch_html_thumbnail(url: str) -> str:
    response = requests.get(url, headers=HEADERS, timeout=30)
    if response.status_code != 200:
        raise RuntimeError(f'HTML HTTP {response.status_code}')

    html = response.text
    patterns = [
        r'<meta[^>]+(?:property|name)="(?:og:image|twitter:image|thumbnail_url)"[^>]+content="([^"]+)"',
        r'<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="(?:og:image|twitter:image|thumbnail_url)"'
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.I)
        if match:
            return match.group(1)
    raise RuntimeError('No valid og:image metadata found')


def validate_image(data: bytes, url: str) -> Image.Image:
    if not data or len(data) < 256:
        raise RuntimeError('Downloaded image is empty or too small')

    try:
        image = Image.open(BytesIO(data))
        image.load()
    except Exception as exc:
        raise RuntimeError(f'Image could not be decoded: {exc}') from exc

    width, height = image.size
    if width < 200 or height < 200:
        raise RuntimeError(f'Image dimensions too small: {width}x{height}')

    ratio = width / height if height else 0
    if ratio < 0.3 or ratio > 1.2:
        raise RuntimeError(f'Image aspect ratio looks invalid for video preview: {width}x{height}')

    try:
        image = ImageOps.exif_transpose(image)
    except Exception:
        pass

    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGB')
    elif image.mode not in ('RGB', 'L'):
        image = image.convert('RGB')

    return image


def save_thumbnail(video_slug: str, image_url: str) -> None:
    response = requests.get(image_url, headers=HEADERS, timeout=30)
    if response.status_code != 200:
        raise RuntimeError(f'Image HTTP {response.status_code}')

    content_type = response.headers.get('Content-Type', '').lower()
    if not content_type.startswith('image/'):
        raise RuntimeError(f'Content-Type {content_type!r} is not an image')

    image = validate_image(response.content, image_url)
    output_file = OUT_DIR / f'{video_slug}.webp'
    image.save(output_file, format='WEBP', quality=85, method=6)

    if output_file.stat().st_size == 0:
        raise RuntimeError('Saved image file is empty')


successes = []
failures = []

for index, (video_slug, video_url) in enumerate(VIDEOS.items(), start=1):
    try:
        thumbnail_url = fetch_oembed_thumbnail(video_url)
        save_thumbnail(video_slug, thumbnail_url)
        print(f'[{index}/{len(VIDEOS)}] {video_slug} — OK')
        successes.append(video_slug)
    except Exception as exc:
        fallback_url = None
        try:
            fallback_url = fetch_html_thumbnail(video_url)
            save_thumbnail(video_slug, fallback_url)
            print(f'[{index}/{len(VIDEOS)}] {video_slug} — OK (fallback metadata)')
            successes.append(video_slug)
        except Exception as fallback_exc:
            print(f'[{index}/{len(VIDEOS)}] {video_slug} — FAILED: {exc} | fallback: {fallback_exc}')
            failures.append((video_slug, video_url, str(exc), str(fallback_exc)))

print('\nRESULTS')
print(f'Attempted: {len(VIDEOS)}')
print(f'Successful: {len(successes)}')
print(f'Failed: {len(failures)}')
print('Created files:')
for path in sorted(OUT_DIR.glob('*.webp')):
    print(path.relative_to(ROOT))

if failures:
    print('\nFailed URLs:')
    for slug, url, reason, fallback_reason in failures:
        print(f'{slug}: {url}')
        print(f'  reason={reason}')
        print(f'  fallback_reason={fallback_reason}')

sys.exit(0)
