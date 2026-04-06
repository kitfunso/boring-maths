import tweepy, os
from dotenv import load_dotenv
load_dotenv('.env')

auth = tweepy.OAuth1UserHandler(
    os.getenv('X_API_KEY'),
    os.getenv('X_API_SECRET'),
    os.getenv('X_ACCESS_TOKEN'),
    os.getenv('X_ACCESS_SECRET')
)
api = tweepy.API(auth)

queries = [
    'pension OR HMRC lang:en min_faves:100 -filter:replies -filter:retweets',
    '"compound interest" OR "stamp duty" OR "salary sacrifice" lang:en min_faves:100 -filter:replies -filter:retweets',
    '"inheritance tax" OR "capital gains" OR ISA lang:en min_faves:100 -filter:replies -filter:retweets',
]

found = []
for query in queries:
    try:
        results = api.search_tweets(q=query, count=20, tweet_mode='extended', lang='en')
        for t in results:
            if t.favorite_count >= 100:
                url = f'https://x.com/{t.user.screen_name}/status/{t.id}'
                if not t.full_text.startswith('RT @'):
                    found.append((t.favorite_count, url, t.full_text[:120]))
                    print(f"LIKES={t.favorite_count} {url}")
                    print(f"  {t.full_text[:120]}")
    except Exception as e:
        print(f"Error for query '{query[:50]}': {e}")

print(f"\nTotal found: {len(found)}")
