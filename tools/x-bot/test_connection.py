#!/usr/bin/env python3
"""Quick test of X API connection."""

import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
load_dotenv()

from src.client import get_client

print("Testing X API connection...")
print()

try:
    client = get_client()
    info = client.verify_credentials()
    print("SUCCESS! Connected to X API")
    print()
    print(f"  Account: @{info['username']}")
    print(f"  Name: {info['name']}")
    print(f"  Followers: {info['followers']:,}")
except Exception as e:
    print(f"FAILED: {e}")
    sys.exit(1)
