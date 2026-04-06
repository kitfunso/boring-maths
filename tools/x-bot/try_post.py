#!/usr/bin/env python3
"""Try different auth methods for posting."""
import sys, os, json, base64
sys.stdout.reconfigure(encoding='utf-8')
import tweepy, urllib.request, urllib.error
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

KEY = os.getenv('X_API_KEY')
SECRET = os.getenv('X_API_SECRET')
TOKEN = os.getenv('X_ACCESS_TOKEN')
TSECRET = os.getenv('X_ACCESS_SECRET')

print(f"API Key: {KEY[:10]}...")
print(f"Access Token: {TOKEN[:20]}...")

# Method 1: v2 with user auth (OAuth1.0a)
print("\n--- Method 1: v2 OAuth1.0a ---")
client = tweepy.Client(
    consumer_key=KEY,
    consumer_secret=SECRET,
    access_token=TOKEN,
    access_token_secret=TSECRET,
    wait_on_rate_limit=False
)
try:
    # Try a minimal tweet
    resp = client.create_tweet(text="Test from boring-math automation")
    print(f"SUCCESS: {resp.data['id']}")
except tweepy.errors.PaymentRequired as e:
    print(f"402 Payment Required: {e}")
except tweepy.errors.Unauthorized as e:
    print(f"401 Unauthorized: {e}")
except tweepy.errors.Forbidden as e:
    print(f"403 Forbidden: {e}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")

# Method 2: v1.1 statuses/update
print("\n--- Method 2: v1.1 update_status ---")
auth = tweepy.OAuth1UserHandler(KEY, SECRET, TOKEN, TSECRET)
api = tweepy.API(auth)
try:
    result = api.update_status("Test from boring-math automation v1.1")
    print(f"SUCCESS v1.1: {result.id}")
except tweepy.errors.Forbidden as e:
    print(f"v1.1 403: {e}")
except Exception as e:
    print(f"v1.1 Error: {type(e).__name__}: {e}")

# Method 3: Direct API call
print("\n--- Method 3: Direct API call ---")
import requests
from requests_oauthlib import OAuth1

auth_obj = OAuth1(KEY, SECRET, TOKEN, TSECRET)
response = requests.post(
    'https://api.twitter.com/2/tweets',
    json={"text": "Test direct call"},
    auth=auth_obj
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:200]}")
