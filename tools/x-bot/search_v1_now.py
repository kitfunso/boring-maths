#!/usr/bin/env python3
"""Search using v1.1 API and post via v2."""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

import tweepy
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

auth = tweepy.OAuthHandler(os.getenv('X_API_KEY'), os.getenv('X_API_SECRET'))
auth.set_access_token(os.getenv('X_ACCESS_TOKEN'), os.getenv('X_ACCESS_SECRET'))
api = tweepy.API(auth, wait_on_rate_limit=False)

# Read dedup list
dedup_path = r'C:\Users\skf_s\clawd\tasks\state\x-replied-posts.txt'
with open(dedup_path, 'r') as f:
    already_replied = set(line.strip() for line in f if line.strip())

queries = [
    '(pension OR HMRC OR "national insurance" OR "take home" OR "personal allowance") -is:reply lang:en',
    '("compound interest" OR compounding OR savings OR mortgage OR freelance OR "day rate") -is:reply lang:en',
    '("inheritance tax" OR "capital gains" OR dividend OR ISA OR "salary sacrifice") -is:reply lang:en',
]

found = []
for query in queries:
    try:
        results = api.search_tweets(q=query, result_type='popular', count=50, tweet_mode='extended', lang='en')
        for t in results:
            if hasattr(t, 'retweeted_status'):
                continue
            if t.favorite_count >= 100:
                username = t.author.screen_name
                url = 'https://x.com/' + username + '/status/' + str(t.id)
                if url not in already_replied:
                    found.append((t.favorite_count, url, t.full_text[:120]))
                    print('LIKES=' + str(t.favorite_count) + ' ' + url)
                    print('  ' + t.full_text[:120].replace('\n', ' '))
    except Exception as e:
        print('Error: ' + str(e))

print('\nTotal new targets: ' + str(len(found)))
