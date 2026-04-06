#!/usr/bin/env python3
"""Search for reply targets in AWAKE_MODE."""
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

# AWAKE_MODE queries
queries = [
    '(pension OR HMRC OR "national insurance" OR "take home" OR "stamp duty" OR "personal allowance" OR PAYE) -is:reply -is:quote lang:en',
    '("compound interest" OR compounding OR savings OR mortgage OR freelance OR "day rate" OR IR35) -is:reply -is:quote lang:en',
    '("inheritance tax" OR "capital gains" OR dividend OR ISA OR "salary sacrifice") -is:reply -is:quote lang:en',
]

# Load dedup file
dedup_path = r'C:\Users\skf_s\clawd\tasks\state\x-replied-posts.txt'
already_replied = set()
try:
    with open(dedup_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                already_replied.add(line)
except:
    pass

found = []
seen_ids = set()

for q in queries:
    try:
        results = client.search_recent_tweets(
            query=q,
            max_results=100,
            tweet_fields=['public_metrics', 'created_at', 'author_id'],
            expansions=['author_id'],
            user_fields=['username']
        )
        if results.data:
            users = {u.id: u.username for u in (results.includes.get('users') or [])}
            for t in results.data:
                m = t.public_metrics
                if m['like_count'] >= 100 and t.id not in seen_ids:
                    username = users.get(t.author_id, 'unknown')
                    url = f'https://x.com/{username}/status/{t.id}'
                    if url not in already_replied:
                        found.append((m['like_count'], url, t.text[:200], str(t.id)))
                        seen_ids.add(t.id)
    except Exception as e:
        print(f'Error on query: {e}')

# Sort by likes desc
found.sort(key=lambda x: x[0], reverse=True)
print(f'Found {len(found)} new targets:')
for likes, url, text, tid in found[:10]:
    print(f'\nLIKES={likes} | {url}')
    print(f'  {text[:200]}')
