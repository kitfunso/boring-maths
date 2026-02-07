#!/usr/bin/env python3
"""Post a tweet."""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import yaml
from pathlib import Path

# Load config
config_path = Path(__file__).parent / "config.yaml"
with open(config_path) as f:
    config = yaml.safe_load(f)

from src.generator import get_generator
from src.poster import get_poster

# Get calculator from command line args
calculator = sys.argv[1] if len(sys.argv) > 1 else None
dry_run = "--dry-run" in sys.argv

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
else:
    print("Posting...")
    poster = get_poster(config)
    result = poster.post_tweet(tweet=tweet, force=True)
    
    if result["success"]:
        print(f"SUCCESS! Tweet ID: {result['tweet_id']}")
        print(f"URL: https://x.com/BoringMath1276/status/{result['tweet_id']}")
    else:
        print(f"FAILED: {result['error']}")
