import tweepy, os
from dotenv import load_dotenv
load_dotenv('.env')

client = tweepy.Client(
    consumer_key=os.getenv('X_API_KEY'),
    consumer_secret=os.getenv('X_API_SECRET'),
    access_token=os.getenv('X_ACCESS_TOKEN'),
    access_token_secret=os.getenv('X_ACCESS_SECRET'),
    wait_on_rate_limit=False
)

queries = [
    '(pension OR HMRC OR "national insurance" OR "take home" OR "stamp duty" OR "personal allowance") -is:reply -is:retweet lang:en',
    '("compound interest" OR compounding OR savings OR mortgage OR freelance OR "day rate" OR IR35) -is:reply -is:retweet lang:en',
    '("inheritance tax" OR "capital gains" OR dividend OR ISA OR "salary sacrifice") -is:reply -is:retweet lang:en',
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
                    url = f'https://x.com/{username}/status/{t.id}'
                    found.append((m['like_count'], url, t.text[:120]))
                    print(f"LIKES={m['like_count']} {url}")
                    print(f"  {t.text[:120]}")
    except Exception as e:
        print(f"Error: {e}")

print(f"\nTotal found: {len(found)}")
