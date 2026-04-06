#!/usr/bin/env python3
"""Try different auth methods for posting."""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
import tweepy
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

KEY = os.getenv('X_API_KEY')
SECRET = os.getenv('X_API_SECRET')
TOKEN = os.getenv('X_ACCESS_TOKEN')
TSECRET = os.getenv('X_ACCESS_SECRET')

# Method 1: v2 with user auth (OAuth1.0a)
print("Method 1: v2 OAuth1.0a create_tweet")
client = tweepy.Client(
    consumer_key=KEY,
    consumer_secret=SECRET,
    access_token=TOKEN,
    access_token_secret=TSECRET,
    wait_on_rate_limit=False
)
try:
    resp = client.create_tweet(text="Testing boring-math posting")
    print(f"SUCCESS: {resp.data['id']}")
except tweepy.errors.HTTPException as e:
    print(f"HTTPException {e.response.status_code}: {e}")
except Exception as e:
    print(f"Error {type(e).__name__}: {e}")

# Method 2: Direct requests call
print("\nMethod 2: Direct requests with OAuth1")
try:
    import requests
    from requests_oauthlib import OAuth1
    auth_obj = OAuth1(KEY, SECRET, TOKEN, TSECRET)
    response = requests.post(
        'https://api.twitter.com/2/tweets',
        json={"text": "Testing boring-math direct"},
        auth=auth_obj
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:300]}")
except Exception as e:
    print(f"Error: {e}")

# Method 3: Check what X app tier we have
print("\nMethod 3: App tier check")
try:
    import urllib.request, json, base64
    creds = f"{KEY}:{SECRET}"
    b64 = base64.b64encode(creds.encode()).decode()
    req = urllib.request.Request(
        'https://api.twitter.com/2/usage/tweets',
        headers={'Authorization': f'Basic {b64}'}
    )
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())
        print(f"Usage data: {data}")
except Exception as e:
    print(f"Usage check error: {e}")
