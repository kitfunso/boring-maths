#!/usr/bin/env python3
"""Test tweet generation."""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import yaml
from pathlib import Path

# Load config
config_path = Path(__file__).parent / "config.yaml"
with open(config_path) as f:
    config = yaml.safe_load(f)

from src.generator import get_generator

print("Testing tweet generation...\n")

generator = get_generator(config)
print(f"Loaded {len(generator.pre_generated)} pre-generated tweets\n")

# Generate 3 random tweets
for i in range(3):
    tweet = generator.generate_tweet()
    print(f"--- Tweet {i+1} ---")
    print(f"Calculator: {tweet.calculator_name}")
    print(f"Text ({len(tweet.text)} chars):")
    print(tweet.text)
    print()
