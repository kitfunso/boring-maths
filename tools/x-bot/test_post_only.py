#!/usr/bin/env python3
"""Test if we can post tweets."""
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

# Test by posting to get me
try:
    me = client.get_me(user_fields=['username'])
    print(f'get_me: @{me.data.username} (id={me.data.id})')
except Exception as e:
    print(f'get_me failed: {e}')
    
# Can we create a tweet?
print("\nChecking create_tweet availability...")
print("(Not actually posting - checking plan)")
# Check plan via API
import urllib.request, json, base64

key = os.getenv('X_API_KEY')
secret = os.getenv('X_API_SECRET')
creds = f"{key}:{secret}"
b64 = base64.b64encode(creds.encode()).decode()

try:
    req = urllib.request.Request(
        'https://api.twitter.com/2/tweets',
        method='POST',
        data=json.dumps({"text": "test123"}).encode(),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Basic {b64}'
        }
    )
    # Don't actually send - just check it
    print("Would use basic auth - but we have OAuth1")
except Exception as e:
    print(f"Error: {e}")
