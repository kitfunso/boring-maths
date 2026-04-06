#!/usr/bin/env python3
"""Post a tweet using v1.1 API."""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

import tweepy
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

auth = tweepy.OAuth1UserHandler(
    os.getenv('X_API_KEY'),
    os.getenv('X_API_SECRET'),
    os.getenv('X_ACCESS_TOKEN'),
    os.getenv('X_ACCESS_SECRET')
)
api = tweepy.API(auth)

text = sys.argv[1]
reply_to = sys.argv[2] if len(sys.argv) > 2 else None

try:
    if reply_to:
        result = api.update_status(status=text, in_reply_to_status_id=reply_to, auto_populate_reply_metadata=True)
    else:
        result = api.update_status(status=text)
    print(f"SUCCESS: https://x.com/BoringMath1276/status/{result.id}")
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
