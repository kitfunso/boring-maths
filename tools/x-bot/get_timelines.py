#!/usr/bin/env python3
"""Get recent tweets from known UK finance accounts."""
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

# Load dedup file
dedup_path = r'C:\Users\skf_s\clawd\tasks\state\x-replied-posts.txt'
already_replied = set()
try:
    with open(dedup_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                # Extract status ID from URL
                already_replied.add(line)
                if '/status/' in line:
                    sid = line.split('/status/')[-1].strip()
                    already_replied.add(sid)
except:
    pass

# Known UK finance accounts with usernames
accounts = [
    'MartinSLewis',
    'GuyTalksFinance', 
    'marktilbury',
    'The_Money_Buddy',
    'CutMyTaxUK',
    'londonHenryGB',
    'JohnStepek',
    'BarbellFi',
    'paullewismoney',
    'TJiMTS',
    '2147mill',
    'jonbrooks',
    'premnsikka',
    'LNallalingham',
    'BrianFeroldi',
]

found = []

for username in accounts:
    try:
        # Get user ID first
        user = client.get_user(username=username)
        if not user.data:
            continue
        uid = user.data.id
        
        # Get recent tweets
        resp = client.get_users_tweets(
            id=uid,
            max_results=5,
            tweet_fields=['public_metrics', 'created_at'],
            exclude=['retweets', 'replies']
        )
        if resp.data:
            for t in resp.data:
                m = t.public_metrics
                if m['like_count'] >= 100:
                    url = f'https://x.com/{username}/status/{t.id}'
                    tid = str(t.id)
                    if url not in already_replied and tid not in already_replied:
                        found.append((m['like_count'], url, t.text[:200], tid))
                        print(f'LIKES={m["like_count"]} {url}')
                        print(f'  {t.text[:200].replace(chr(10), " ")}')
    except tweepy.errors.TweepyException as e:
        if '429' in str(e) or 'rate limit' in str(e).lower():
            print(f'Rate limited on {username}')
            import time; time.sleep(2)
        else:
            print(f'Error {username}: {e}')

found.sort(key=lambda x: x[0], reverse=True)
print(f'\nTotal: {len(found)} new targets')
for likes, url, text, _ in found[:5]:
    print(f'  {likes}: {url}')
