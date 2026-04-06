#!/usr/bin/env python3
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

try:
    results = client.search_recent_tweets(
        query='pension -is:reply lang:en',
        max_results=10,
        tweet_fields=['public_metrics', 'author_id'],
        expansions=['author_id'],
        user_fields=['username']
    )
    print(f'Success: {len(results.data) if results.data else 0} results')
    if results.data:
        users = {u.id: u.username for u in (results.includes.get('users') or [])}
        for t in results.data[:3]:
            uname = users.get(t.author_id, 'unknown')
            print(f'  @{uname} likes={t.public_metrics["like_count"]}')
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')
