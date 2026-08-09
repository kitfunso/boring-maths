"""
Video Creator for Boring Math Calculators
Creates short-form vertical videos (9:16) with AI narration and real calculator screenshots.

Uses: edge-tts, playwright, ffmpeg, Pillow
"""

import asyncio
import json
import os
import subprocess
import sys
import textwrap
from dataclasses import dataclass
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

VIDEOS_DIR = Path(__file__).parent.parent / "videos"
SITE_URL = "https://boring-math.com"
WIDTH = 1080  # 9:16 vertical
HEIGHT = 1920
FONT = "Space Grotesk"
FONT_FILE = ""  # ffmpeg will use system font

# Try to find Space Grotesk font file
for candidate in [
    Path(__file__).parent.parent / "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2",
    Path("C:/Windows/Fonts/SpaceGrotesk-Medium.ttf"),
]:
    if candidate.exists():
        FONT_FILE = str(candidate)
        break


@dataclass
class VideoSegment:
    """One segment of a video: text to narrate + what to show."""
    narration: str
    screenshot_url: str | None = None  # URL to screenshot, or None for text-only slide
    screenshot_actions: list[dict] | None = None  # Actions to perform before screenshot
    overlay_text: str | None = None  # Large text overlay on dark bg (no screenshot)
    pause_after: float = 0.3  # seconds of pause after this segment


@dataclass
class VideoConfig:
    title: str
    slug: str
    voice: str
    segments: list[VideoSegment]
    outro_url: str  # calculator URL shown at end


# ---------------------------------------------------------------------------
# Video definitions
# ---------------------------------------------------------------------------

UK_TAX_TRAP = VideoConfig(
    title="UK £100k Tax Trap Explained",
    slug="uk-tax-trap",
    voice="en-GB-RyanNeural",
    outro_url=f"{SITE_URL}/calculators/uk-100k-tax-trap-calculator",
    segments=[
        VideoSegment(
            narration="If you earn between 100 and 125 thousand pounds, you're paying a 60 percent tax rate. Here's how.",
            overlay_text="60% TAX RATE\non £100k-£125k",
            pause_after=0.8,
        ),
        VideoSegment(
            narration="For every 2 pounds you earn over 100k, you lose 1 pound of personal allowance. That means income tax plus the lost allowance stacks to 60 percent.",
            overlay_text="£2 earned\n= £1 allowance lost\n= 60% effective rate",
            pause_after=0.6,
        ),
        VideoSegment(
            narration="Let's run the numbers. Someone earning 110 thousand pounds.",
            screenshot_url=f"{SITE_URL}/calculators/uk-100k-tax-trap-calculator",
            pause_after=0.4,
        ),
        VideoSegment(
            narration="They lose 5 thousand of personal allowance. That's an extra 2 thousand in tax compared to what they'd expect.",
            screenshot_url=f"{SITE_URL}/calculators/uk-100k-tax-trap-calculator",
            pause_after=0.5,
        ),
        VideoSegment(
            narration="The fix? Pension contributions. Put enough in to bring your adjusted income below 100k, and you get the full allowance back.",
            overlay_text="The fix:\nPension contributions\nbelow £100k adjusted",
            pause_after=0.6,
        ),
        VideoSegment(
            narration="Link in bio to run your own numbers. Free calculator, no sign up.",
            overlay_text="boring-math.com\n/calculators/\nuk-100k-tax-trap-calculator",
            pause_after=0.5,
        ),
    ],
)

MORTGAGE = VideoConfig(
    title="What a £350k Mortgage Actually Costs",
    slug="mortgage",
    voice="en-GB-RyanNeural",
    outro_url=f"{SITE_URL}/calculators/mortgage-calculator",
    segments=[
        VideoSegment(
            narration="A 350 thousand pound house doesn't cost 350 thousand pounds. Here's what you actually pay.",
            overlay_text="£350k house\n≠ £350k cost",
            pause_after=0.8,
        ),
        VideoSegment(
            narration="With a 10 percent deposit and a 4.5 percent rate over 25 years, your monthly payment is about 1,750 pounds.",
            screenshot_url=f"{SITE_URL}/calculators/mortgage-calculator",
            pause_after=0.5,
        ),
        VideoSegment(
            narration="But the total interest? Over 210 thousand pounds. You're paying 560 thousand for a 350 thousand house.",
            overlay_text="Total cost: £560k\nInterest: £210k\nfor a £350k house",
            pause_after=0.8,
        ),
        VideoSegment(
            narration="Now here's what overpaying does. An extra 200 pounds a month saves you 45 thousand in interest and clears the mortgage 5 years early.",
            overlay_text="Overpay £200/month\n→ Save £45k interest\n→ 5 years early",
            pause_after=0.6,
        ),
        VideoSegment(
            narration="Run your own numbers. Link in bio, free mortgage calculator.",
            overlay_text="boring-math.com\n/calculators/\nmortgage-calculator",
            pause_after=0.5,
        ),
    ],
)

GRADUATION = VideoConfig(
    title="How Much Food for a Graduation Party",
    slug="graduation-party",
    voice="en-GB-RyanNeural",
    outro_url=f"{SITE_URL}/calculators/graduation-party-calculator",
    segments=[
        VideoSegment(
            narration="Planning a graduation party? Here's exactly how much food and drink you need so you don't run out or waste money.",
            overlay_text="Graduation Party\nFood & Drink Guide",
            pause_after=0.6,
        ),
        VideoSegment(
            narration="For 50 guests at a 4 hour party, you need roughly 200 savoury pieces, 150 sweet items, and about 100 drinks.",
            overlay_text="50 guests, 4 hours:\n200 savoury pieces\n150 sweet items\n100 drinks",
            pause_after=0.6,
        ),
        VideoSegment(
            narration="The rule is 4 savoury pieces and 3 sweet per person for a buffet. 2 drinks per person for the first hour, then 1 per hour after that.",
            overlay_text="Per person:\n4 savoury + 3 sweet\n2 drinks/hr first hour\n1 drink/hr after",
            pause_after=0.6,
        ),
        VideoSegment(
            narration="Budget? Expect 8 to 15 pounds per head for a home party, or 20 to 35 if you're catering.",
            overlay_text="Budget per head:\nHome: £8-15\nCatered: £20-35",
            pause_after=0.5,
        ),
        VideoSegment(
            narration="Get the exact numbers for your guest count. Free calculator, link in bio.",
            overlay_text="boring-math.com\n/calculators/\ngraduation-party-calculator",
            pause_after=0.5,
        ),
    ],
)

VIDEOS = [UK_TAX_TRAP, MORTGAGE, GRADUATION]


# ---------------------------------------------------------------------------
# TTS generation
# ---------------------------------------------------------------------------

async def generate_tts(text: str, voice: str, output_path: Path) -> None:
    """Generate TTS audio file using edge-tts."""
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate="-5%", pitch="+0Hz")
    await communicate.save(str(output_path))
    print(f"  TTS: {output_path.name}")


async def generate_all_audio(video: VideoConfig) -> list[Path]:
    """Generate audio for all segments, return list of audio file paths."""
    audio_dir = VIDEOS_DIR / video.slug / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    paths = []
    for i, seg in enumerate(video.segments):
        path = audio_dir / f"seg_{i:02d}.mp3"
        if not path.exists():
            await generate_tts(seg.narration, video.voice, path)
        else:
            print(f"  TTS: {path.name} (cached)")
        paths.append(path)

    return paths


# ---------------------------------------------------------------------------
# Screenshot capture
# ---------------------------------------------------------------------------

async def capture_screenshots(video: VideoConfig) -> list[Path | None]:
    """Capture calculator screenshots using Playwright async API."""
    from playwright.async_api import async_playwright

    shot_dir = VIDEOS_DIR / video.slug / "shots"
    shot_dir.mkdir(parents=True, exist_ok=True)

    paths: list[Path | None] = []
    urls_to_capture = []

    for i, seg in enumerate(video.segments):
        path = shot_dir / f"seg_{i:02d}.png"
        if seg.screenshot_url and not path.exists():
            urls_to_capture.append((i, seg.screenshot_url, path))
            paths.append(path)
        elif seg.screenshot_url and path.exists():
            print(f"  Screenshot: {path.name} (cached)")
            paths.append(path)
        else:
            paths.append(None)

    if not urls_to_capture:
        return paths

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 420, "height": 900},
            device_scale_factor=2,
        )
        page = await context.new_page()

        for idx, url, path in urls_to_capture:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)

            # Dismiss cookie consent if present
            for selector in [
                "button:has-text('Consent')",
                "button:has-text('Accept')",
                "button:has-text('OK')",
                "[aria-label='Consent']",
                ".fc-cta-consent",
            ]:
                try:
                    btn = await page.query_selector(selector)
                    if btn and await btn.is_visible():
                        await btn.click()
                        await page.wait_for_timeout(1000)
                        break
                except Exception:
                    pass

            calc_section = await page.query_selector('[aria-label="Calculator"]')
            if calc_section:
                await calc_section.scroll_into_view_if_needed()
                await page.wait_for_timeout(500)

            await page.screenshot(path=str(path), full_page=False)
            print(f"  Screenshot: {path.name}")

        await browser.close()

    return paths


# ---------------------------------------------------------------------------
# Image generation (text slides + compositing)
# ---------------------------------------------------------------------------

def create_text_slide(text: str, output_path: Path, font_size: int = 72) -> None:
    """Create a dark background slide with large text."""
    from PIL import Image, ImageDraw, ImageFont

    img = Image.new("RGB", (WIDTH, HEIGHT), color=(7, 7, 10))
    draw = ImageDraw.Draw(img)

    # Try to load a good font
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", font_size)
        small_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 36)
    except (OSError, IOError):
        font = ImageFont.load_default()
        small_font = font

    # Draw the text centered
    lines = text.split("\n")
    total_height = len(lines) * (font_size + 20)
    y_start = (HEIGHT - total_height) // 2

    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (WIDTH - text_width) // 2
        y = y_start + i * (font_size + 20)

        # Accent color for numbers/symbols, cream for text
        if any(c.isdigit() or c in "£$%€→≠/" for c in line):
            color = (196, 255, 0)  # accent green
        else:
            color = (243, 240, 235)  # cream

        draw.text((x, y), line, fill=color, font=font)

    # Watermark
    wm = "boring-math.com"
    bbox = draw.textbbox((0, 0), wm, font=small_font)
    wm_x = (WIDTH - (bbox[2] - bbox[0])) // 2
    draw.text((wm_x, HEIGHT - 100), wm, fill=(100, 100, 100), font=small_font)

    img.save(str(output_path), quality=95)
    print(f"  Slide: {output_path.name}")


def create_screenshot_slide(screenshot_path: Path, output_path: Path) -> None:
    """Composite a calculator screenshot onto a dark 9:16 background."""
    from PIL import Image

    bg = Image.new("RGB", (WIDTH, HEIGHT), color=(7, 7, 10))
    screenshot = Image.open(screenshot_path)

    # Scale screenshot to fit width with padding
    target_w = WIDTH - 80  # 40px padding each side
    scale = target_w / screenshot.width
    new_h = int(screenshot.height * scale)
    screenshot = screenshot.resize((target_w, new_h), Image.LANCZOS)

    # Center vertically
    y_offset = (HEIGHT - new_h) // 2
    bg.paste(screenshot, (40, y_offset))

    bg.save(str(output_path), quality=95)
    print(f"  Composite: {output_path.name}")


# ---------------------------------------------------------------------------
# Audio duration detection
# ---------------------------------------------------------------------------

def get_audio_duration(path: Path) -> float:
    """Get duration of audio file in seconds using ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "json", str(path)],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    return float(data["format"]["duration"])


# ---------------------------------------------------------------------------
# Final video assembly
# ---------------------------------------------------------------------------

def assemble_video(video: VideoConfig, audio_paths: list[Path],
                   screenshot_paths: list[Path | None]) -> Path:
    """Assemble final video from slides + audio using ffmpeg."""
    work_dir = VIDEOS_DIR / video.slug
    frames_dir = work_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    # 1. Create visual frames for each segment
    frame_paths: list[Path] = []
    for i, seg in enumerate(video.segments):
        frame_path = frames_dir / f"frame_{i:02d}.png"
        if seg.overlay_text:
            create_text_slide(seg.overlay_text, frame_path)
        elif screenshot_paths[i]:
            create_screenshot_slide(screenshot_paths[i], frame_path)
        else:
            create_text_slide(seg.narration, frame_path, font_size=48)
        frame_paths.append(frame_path)

    # 2. Get audio durations
    durations = [get_audio_duration(p) + seg.pause_after
                 for p, seg in zip(audio_paths, video.segments)]

    # 3. Build ffmpeg concat file
    # Create individual segment videos first, then concat
    segment_videos: list[Path] = []
    for i, (frame, audio, dur) in enumerate(zip(frame_paths, audio_paths, durations)):
        seg_video = work_dir / f"seg_{i:02d}.mp4"
        subprocess.run([
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(frame),
            "-i", str(audio),
            "-c:v", "libx264", "-tune", "stillimage",
            "-c:a", "aac", "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-t", str(dur),
            "-vf", f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease,pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=07070a",
            "-shortest",
            str(seg_video)
        ], capture_output=True, check=True)
        segment_videos.append(seg_video)
        print(f"  Segment video: seg_{i:02d}.mp4")

    # 4. Concat all segments
    concat_file = work_dir / "concat.txt"
    with open(concat_file, "w") as f:
        for sv in segment_videos:
            f.write(f"file '{sv.name}'\n")

    output = work_dir / f"{video.slug}.mp4"
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264", "-crf", "23",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        str(output)
    ], capture_output=True, check=True, cwd=str(work_dir))

    # 5. Clean up segment videos
    for sv in segment_videos:
        sv.unlink(missing_ok=True)
    concat_file.unlink(missing_ok=True)

    print(f"\n  DONE: {output}")
    return output


# ---------------------------------------------------------------------------
# Video metadata
# ---------------------------------------------------------------------------

def write_metadata(video: VideoConfig, output_dir: Path) -> None:
    """Write title, description, tags for upload."""
    meta = {
        "title": video.title,
        "description": (
            f"{video.segments[0].narration}\n\n"
            f"Free calculator: {video.outro_url}\n\n"
            f"boring-math.com — 149 free calculators for everyday math.\n\n"
            f"#calculator #math #finance #personalfinance #money"
        ),
        "tags": ["calculator", "math", "finance", "money", "personalfinance",
                 "uk", "tax", "mortgage", "budgeting"],
        "calculator_url": video.outro_url,
    }

    meta_path = output_dir / "metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    # Also write a human-readable version
    txt_path = output_dir / "upload-info.txt"
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(f"TITLE: {meta['title']}\n\n")
        f.write(f"DESCRIPTION:\n{meta['description']}\n\n")
        f.write(f"TAGS: {', '.join(meta['tags'])}\n\n")
        f.write(f"CALCULATOR URL: {video.outro_url}\n")

    print(f"  Metadata: {meta_path.name}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def create_video(video: VideoConfig) -> Path:
    """Create a complete video for one calculator."""
    print(f"\n{'='*60}")
    print(f"Creating: {video.title}")
    print(f"{'='*60}")

    # Check for Pillow
    try:
        from PIL import Image
    except ImportError:
        print("Installing Pillow...")
        subprocess.run([sys.executable, "-m", "pip", "install", "Pillow"],
                      capture_output=True, check=True)

    # Check for playwright
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Installing playwright...")
        subprocess.run([sys.executable, "-m", "pip", "install", "playwright"],
                      capture_output=True, check=True)
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"],
                      capture_output=True, check=True)

    print("\n[1/4] Generating audio...")
    audio_paths = await generate_all_audio(video)

    print("\n[2/4] Capturing screenshots...")
    screenshot_paths = await capture_screenshots(video)

    print("\n[3/4] Assembling video...")
    output = assemble_video(video, audio_paths, screenshot_paths)

    print("\n[4/4] Writing metadata...")
    write_metadata(video, VIDEOS_DIR / video.slug)

    return output


async def main():
    """Create all videos."""
    # Check dependencies
    for cmd in ["ffmpeg", "ffprobe"]:
        if not subprocess.run(["which", cmd], capture_output=True).returncode == 0:
            print(f"ERROR: {cmd} not found")
            sys.exit(1)

    videos_to_create = VIDEOS
    if len(sys.argv) > 1:
        slug = sys.argv[1]
        videos_to_create = [v for v in VIDEOS if v.slug == slug]
        if not videos_to_create:
            print(f"Unknown video slug: {slug}")
            print(f"Available: {', '.join(v.slug for v in VIDEOS)}")
            sys.exit(1)

    outputs = []
    for video in videos_to_create:
        output = await create_video(video)
        outputs.append(output)

    print(f"\n{'='*60}")
    print(f"All done! {len(outputs)} video(s) created:")
    for o in outputs:
        size_mb = o.stat().st_size / (1024 * 1024)
        print(f"  {o} ({size_mb:.1f} MB)")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
