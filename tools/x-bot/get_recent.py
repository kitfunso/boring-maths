#!/usr/bin/env python3
"""Get recent tweets from BoringMath1276."""
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
    me = client.get_me()
    resp = client.get_users_tweets(
        me.data.id,
        max_results=20,
        tweet_fields=['created_at', 'text']
    )
    if resp.data:
        for t in resp.data:
            print(str(t.created_at)[:10] + ' | ' + t.text[:120].replace('\n', ' '))
    else:
        print('No tweets found')
except Exception as e:
    print('Error: ' + str(e))
