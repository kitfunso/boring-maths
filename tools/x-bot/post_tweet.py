#!/usr/bin/env python3
"""Post a tweet."""

import sys
from pathlib import Path

import yaml

from src.generator import get_generator
from src.poster import get_poster


CONFIG_PATH = Path(__file__).parent / "config.yaml"


def parse_args(argv: list[str]) -> tuple[str | None, bool]:
    """Parse the optional calculator slug and dry-run flag."""
    dry_run = "--dry-run" in argv
    positional = [arg for arg in argv if arg != "--dry-run"]
    calculator = positional[0] if positional else None
    return calculator, dry_run


def load_config() -> dict:
    """Load the bot configuration."""
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return yaml.safe_load(f)


def main(argv: list[str] | None = None) -> int:
    """Generate and optionally post a tweet."""
    sys.stdout.reconfigure(encoding="utf-8")
    calculator, dry_run = parse_args(list(sys.argv[1:] if argv is None else argv))

    config = load_config()
    generator = get_generator(config)
    tweet = generator.generate_tweet(calculator_slug=calculator)

    print("Generated tweet:")
    print("-" * 40)
    print(tweet.text)
    print("-" * 40)
    print(f"Calculator: {tweet.calculator_name}")
    print(f"Length: {len(tweet.text)} chars")
    print()

    if dry_run:
        print("[DRY RUN - not posting]")
        return 0

    print("Posting...")
    poster = get_poster(config)
    result = poster.post_tweet(tweet=tweet, force=True)

    if result["success"]:
        print(f"SUCCESS! Tweet ID: {result['tweet_id']}")
        print(f"URL: https://x.com/BoringMath1276/status/{result['tweet_id']}")
        return 0

    print(f"FAILED: {result['error']}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
