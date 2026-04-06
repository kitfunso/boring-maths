#!/usr/bin/env python3
"""Check what API endpoints work."""
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

# Test create_tweet (write access)
print("Testing create_tweet with very short test...")
try:
    # Don't actually post - just check what error we get
    # by using an invalid ID
    resp = client.get_tweet(id='1234567890')
    print(f'get_tweet: {resp}')
except tweepy.errors.NotFound:
    print('get_tweet: OK (404 = endpoint accessible, tweet not found)')
except tweepy.errors.Unauthorized as e:
    print(f'get_tweet: UNAUTHORIZED - {e}')
except Exception as e:
    print(f'get_tweet: Error {type(e).__name__}: {e}')

# Check get_home_timeline
try:
    resp = client.get_home_timeline(max_results=5)
    print(f'home_timeline: {len(resp.data) if resp.data else 0} tweets')
except tweepy.errors.Unauthorized as e:
    print(f'home_timeline: UNAUTHORIZED')
except tweepy.errors.Forbidden as e:
    print(f'home_timeline: FORBIDDEN - {e}')
except Exception as e:
    print(f'home_timeline: {type(e).__name__}: {e}')

# Test v1.1 - get user timeline (different endpoint)
auth = tweepy.OAuth1UserHandler(
    os.getenv('X_API_KEY'),
    os.getenv('X_API_SECRET'),
    os.getenv('X_ACCESS_TOKEN'),
    os.getenv('X_ACCESS_SECRET')
)
api = tweepy.API(auth)

print("\nTesting v1.1 endpoints...")
try:
    tweets = api.user_timeline(screen_name='MartinSLewis', count=3, tweet_mode='extended')
    print(f'v1.1 user_timeline: OK - {len(tweets)} tweets')
    for t in tweets:
        print(f'  {t.favorite_count} likes: {t.full_text[:80]}')
except tweepy.errors.Forbidden as e:
    print(f'v1.1 user_timeline: FORBIDDEN - {e}')
except Exception as e:
    print(f'v1.1 user_timeline: {type(e).__name__}: {e}')

try:
    tweets = api.home_timeline(count=5, tweet_mode='extended')
    print(f'v1.1 home_timeline: OK - {len(tweets)} tweets')
except Exception as e:
    print(f'v1.1 home_timeline: {type(e).__name__}: {e}')
