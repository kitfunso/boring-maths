#!/usr/bin/env python3
"""Search for reply targets using tweepy v2 API."""
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

# Read dedup list
dedup_path = r'C:\Users\skf_s\clawd\tasks\state\x-replied-posts.txt'
with open(dedup_path, 'r') as f:
    already_replied = set(line.strip() for line in f if line.strip())

queries = [
    '(pension OR HMRC OR "national insurance" OR "take home" OR "personal allowance") min_faves:100 -is:reply -is:retweet lang:en',
    '("compound interest" OR compounding OR savings OR mortgage OR freelance OR "day rate" OR IR35) min_faves:100 -is:reply -is:retweet lang:en',
    '("inheritance tax" OR "capital gains" OR dividend OR ISA OR "salary sacrifice") min_faves:100 -is:reply -is:retweet lang:en',
]

found = []
for query in queries:
    try:
        results = client.search_recent_tweets(
            query=query,
            max_results=100,
            tweet_fields=['public_metrics','created_at','author_id'],
            expansions=['author_id'],
            user_fields=['username']
        )
        if results.data:
            users = {u.id: u.username for u in (results.includes.get('users') or [])}
            for t in results.data:
                m = t.public_metrics
                if m['like_count'] >= 100:
                    username = users.get(t.author_id, 'unknown')
                    url = 'https://x.com/' + username + '/status/' + str(t.id)
                    if url not in already_replied:
                        found.append((m['like_count'], url, t.text[:120]))
                        print('LIKES=' + str(m['like_count']) + ' ' + url)
                        print('  ' + t.text[:120].replace('\n', ' '))
    except Exception as e:
        print('Error: ' + str(e))

print('\nTotal new targets: ' + str(len(found)))
