#!/usr/bin/env python3
"""Post a tweet or reply using v2 API."""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

import tweepy
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

client = tweepy.Client(
    consumer_key=os.getenv('X_API_KEY'),
    consumer_secret=os.getenv('X_API_SECRET'),
    access_token=os.getenv('X_ACCESS_TOKEN'),
    access_token_secret=os.getenv('X_ACCESS_SECRET'),
    wait_on_rate_limit=False
)

text = sys.argv[1]
reply_to = sys.argv[2] if len(sys.argv) > 2 else None

try:
    if reply_to:
        resp = client.create_tweet(text=text, in_reply_to_tweet_id=reply_to)
    else:
        resp = client.create_tweet(text=text)
    print(f"SUCCESS: https://x.com/BoringMath1276/status/{resp.data['id']}")
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
