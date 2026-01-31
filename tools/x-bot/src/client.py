"""
X/Twitter API Client Wrapper

Handles authentication and provides a clean interface for X API operations.
"""

import os
import logging
from typing import Optional
from dataclasses import dataclass

import tweepy
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


@dataclass
class Tweet:
    """Represents a tweet."""
    id: str
    text: str
    author_id: str
    author_username: str
    author_followers: int
    like_count: int
    retweet_count: int
    reply_count: int
    created_at: str
    conversation_id: Optional[str] = None


class XClient:
    """Wrapper around Tweepy for X API operations."""
    
    def __init__(self):
        """Initialize the X client with credentials from environment."""
        self.api_key = os.getenv("X_API_KEY")
        self.api_secret = os.getenv("X_API_SECRET")
        self.access_token = os.getenv("X_ACCESS_TOKEN")
        self.access_secret = os.getenv("X_ACCESS_SECRET")
        self.bearer_token = os.getenv("X_BEARER_TOKEN")
        
        if not all([self.api_key, self.api_secret, self.access_token, self.access_secret]):
            raise ValueError(
                "Missing X API credentials. "
                "Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET in .env"
            )
        
        # OAuth 1.0a client for posting
        self.auth = tweepy.OAuthHandler(self.api_key, self.api_secret)
        self.auth.set_access_token(self.access_token, self.access_secret)
        self.api = tweepy.API(self.auth)
        
        # OAuth 2.0 client for v2 API (search, etc.)
        self.client = tweepy.Client(
            bearer_token=self.bearer_token,
            consumer_key=self.api_key,
            consumer_secret=self.api_secret,
            access_token=self.access_token,
            access_token_secret=self.access_secret,
            wait_on_rate_limit=True
        )
        
        logger.info("X client initialized successfully")
    
    def verify_credentials(self) -> dict:
        """Verify API credentials and return account info."""
        try:
            me = self.client.get_me(user_fields=["public_metrics", "description"])
            return {
                "id": me.data.id,
                "username": me.data.username,
                "name": me.data.name,
                "followers": me.data.public_metrics.get("followers_count", 0)
            }
        except Exception as e:
            logger.error(f"Failed to verify credentials: {e}")
            raise
    
    def post_tweet(self, text: str, reply_to: Optional[str] = None) -> dict:
        """
        Post a tweet.
        
        Args:
            text: Tweet text (max 280 chars)
            reply_to: Optional tweet ID to reply to
            
        Returns:
            Dict with tweet id and text
        """
        if len(text) > 280:
            raise ValueError(f"Tweet too long: {len(text)} chars (max 280)")
        
        try:
            if reply_to:
                response = self.client.create_tweet(
                    text=text,
                    in_reply_to_tweet_id=reply_to
                )
            else:
                response = self.client.create_tweet(text=text)
            
            logger.info(f"Posted tweet: {response.data['id']}")
            return {
                "id": response.data["id"],
                "text": text
            }
        except Exception as e:
            logger.error(f"Failed to post tweet: {e}")
            raise
    
    def search_recent(
        self,
        query: str,
        max_results: int = 10,
        min_likes: int = 0,
        min_retweets: int = 0
    ) -> list[Tweet]:
        """
        Search recent tweets (last 7 days).
        
        Args:
            query: Search query
            max_results: Maximum results (10-100)
            min_likes: Minimum likes filter
            min_retweets: Minimum retweets filter
            
        Returns:
            List of Tweet objects
        """
        try:
            # Add filters to exclude replies and retweets
            full_query = f"{query} -is:retweet -is:reply lang:en"
            
            response = self.client.search_recent_tweets(
                query=full_query,
                max_results=min(max_results, 100),
                tweet_fields=["public_metrics", "created_at", "conversation_id"],
                user_fields=["public_metrics", "username"],
                expansions=["author_id"]
            )
            
            if not response.data:
                return []
            
            # Build user lookup
            users = {u.id: u for u in (response.includes.get("users", []))}
            
            tweets = []
            for tweet in response.data:
                metrics = tweet.public_metrics or {}
                author = users.get(tweet.author_id)
                author_metrics = author.public_metrics if author else {}
                
                # Apply filters
                if metrics.get("like_count", 0) < min_likes:
                    continue
                if metrics.get("retweet_count", 0) < min_retweets:
                    continue
                
                tweets.append(Tweet(
                    id=tweet.id,
                    text=tweet.text,
                    author_id=tweet.author_id,
                    author_username=author.username if author else "unknown",
                    author_followers=author_metrics.get("followers_count", 0),
                    like_count=metrics.get("like_count", 0),
                    retweet_count=metrics.get("retweet_count", 0),
                    reply_count=metrics.get("reply_count", 0),
                    created_at=str(tweet.created_at),
                    conversation_id=tweet.conversation_id
                ))
            
            logger.info(f"Found {len(tweets)} tweets for query: {query}")
            return tweets
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise
    
    def get_my_recent_tweets(self, max_results: int = 10) -> list[Tweet]:
        """Get our own recent tweets to avoid duplicates."""
        try:
            me = self.client.get_me()
            response = self.client.get_users_tweets(
                me.data.id,
                max_results=max_results,
                tweet_fields=["created_at", "public_metrics"]
            )
            
            if not response.data:
                return []
            
            return [
                Tweet(
                    id=t.id,
                    text=t.text,
                    author_id=me.data.id,
                    author_username=me.data.username,
                    author_followers=0,
                    like_count=t.public_metrics.get("like_count", 0) if t.public_metrics else 0,
                    retweet_count=t.public_metrics.get("retweet_count", 0) if t.public_metrics else 0,
                    reply_count=t.public_metrics.get("reply_count", 0) if t.public_metrics else 0,
                    created_at=str(t.created_at)
                )
                for t in response.data
            ]
        except Exception as e:
            logger.error(f"Failed to get recent tweets: {e}")
            return []


def get_client() -> XClient:
    """Factory function to get an X client instance."""
    return XClient()
