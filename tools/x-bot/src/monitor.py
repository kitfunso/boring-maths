"""
X/Twitter Monitoring

Watches for relevant tweets and suggests replies.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, asdict

from .client import XClient, Tweet, get_client
from .generator import ContentGenerator, get_generator

logger = logging.getLogger(__name__)
STATE_FILE = Path(__file__).parent.parent / "data" / "monitor_state.json"


@dataclass
class Opportunity:
    """A tweet that's an opportunity to reply."""
    tweet: Tweet
    matched_keyword: str
    suggested_calculator: str
    suggested_reply: str
    relevance_score: float
    
    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "tweet_id": self.tweet.id,
            "tweet_text": self.tweet.text,
            "author": self.tweet.author_username,
            "author_followers": self.tweet.author_followers,
            "likes": self.tweet.like_count,
            "retweets": self.tweet.retweet_count,
            "matched_keyword": self.matched_keyword,
            "suggested_calculator": self.suggested_calculator,
            "suggested_reply": self.suggested_reply,
            "relevance_score": self.relevance_score,
            "created_at": self.tweet.created_at
        }


class Monitor:
    """Monitors X for opportunities to engage."""
    
    # Map keywords to calculators
    KEYWORD_CALCULATOR_MAP = {
        "fire calculator": "fire-calculator",
        "retirement calculator": "fire-calculator",
        "financial independence": "fire-calculator",
        "compound interest": "compound-interest-calculator",
        "mortgage calculator": "mortgage-calculator",
        "home loan": "mortgage-calculator",
        "tip calculator": "tip-calculator",
        "split the bill": "tip-calculator",
        "how much paint": "paint-calculator",
        "paint calculator": "paint-calculator",
        "bmi calculator": "bmi-calculator",
        "body mass index": "bmi-calculator",
        "uk tax trap": "uk-100k-tax-trap-calculator",
        "100k tax": "uk-100k-tax-trap-calculator",
        "student loan calculator": "uk-student-loan-calculator",
        "student loan repayment": "uk-student-loan-calculator",
        "baby cost": "baby-cost-calculator",
        "how much does a baby cost": "baby-cost-calculator",
        "wedding alcohol": "wedding-alcohol-calculator",
        "how much alcohol wedding": "wedding-alcohol-calculator",
        "bbq calculator": "bbq-calculator",
        "how much meat bbq": "bbq-calculator",
        "freelance rate": "freelance-day-rate-calculator",
        "day rate": "freelance-day-rate-calculator",
        "calorie calculator": "calorie-calculator",
        "tdee calculator": "calorie-calculator",
        "debt payoff": "debt-payoff-calculator",
        "snowball vs avalanche": "debt-payoff-calculator",
        "side hustle profit": "side-hustle-calculator",
    }
    
    def __init__(self, config: dict, client: Optional[XClient] = None, generator: Optional[ContentGenerator] = None):
        """
        Initialize the monitor.
        
        Args:
            config: Full config from config.yaml
            client: Optional X client
            generator: Optional content generator
        """
        self.config = config
        self.client = client or get_client()
        self.generator = generator or get_generator(config)
        
        # Load settings
        monitor_config = config.get("monitor", {})
        self.keywords = monitor_config.get("keywords", list(self.KEYWORD_CALCULATOR_MAP.keys()))
        self.min_likes = monitor_config.get("min_likes", 0)
        self.min_retweets = monitor_config.get("min_retweets", 0)
        self.min_followers = monitor_config.get("min_follower_count", 10)
        self.blacklist = set(monitor_config.get("blacklist", []))
        
        rate_config = config.get("rate_limits", {})
        self.max_searches = rate_config.get("max_searches_per_15min", 15)
        
        # Load state
        self.state = self._load_state()
        
        logger.info(f"Monitor initialized with {len(self.keywords)} keywords")
    
    def _load_state(self) -> dict:
        """Load monitor state from file."""
        if STATE_FILE.exists():
            try:
                with open(STATE_FILE) as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load state: {e}")
        
        return {
            "seen_tweets": [],
            "replied_tweets": [],
            "last_search": {},
            "opportunities": []
        }
    
    def _save_state(self):
        """Save monitor state to file."""
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        # Keep only recent entries
        self.state["seen_tweets"] = self.state["seen_tweets"][-500:]
        self.state["replied_tweets"] = self.state["replied_tweets"][-200:]
        self.state["opportunities"] = self.state["opportunities"][-50:]
        
        with open(STATE_FILE, "w") as f:
            json.dump(self.state, f, indent=2, default=str)
    
    def _get_calculator_for_keyword(self, keyword: str) -> Optional[str]:
        """Get the best calculator for a keyword."""
        # Exact match
        if keyword.lower() in self.KEYWORD_CALCULATOR_MAP:
            return self.KEYWORD_CALCULATOR_MAP[keyword.lower()]
        
        # Partial match
        for kw, calc in self.KEYWORD_CALCULATOR_MAP.items():
            if kw in keyword.lower() or keyword.lower() in kw:
                return calc
        
        return None
    
    def _calculate_relevance(self, tweet: Tweet, keyword: str) -> float:
        """
        Calculate relevance score for a tweet (0-1).
        
        Higher scores = better opportunities.
        """
        score = 0.5  # Base score
        
        # Question marks indicate someone asking for help
        if "?" in tweet.text:
            score += 0.2
        
        # Engagement signals interest
        if tweet.like_count > 0:
            score += min(0.1, tweet.like_count * 0.01)
        if tweet.reply_count > 0:
            score += min(0.1, tweet.reply_count * 0.02)
        
        # Author followers (reach)
        if tweet.author_followers > 1000:
            score += 0.1
        if tweet.author_followers > 10000:
            score += 0.1
        
        # Keyword match quality
        if keyword.lower() in tweet.text.lower():
            score += 0.1
        
        return min(1.0, score)
    
    def _is_valid_opportunity(self, tweet: Tweet) -> tuple[bool, str]:
        """Check if a tweet is a valid opportunity."""
        # Already seen/replied
        if tweet.id in self.state["seen_tweets"]:
            return False, "Already seen"
        if tweet.id in self.state["replied_tweets"]:
            return False, "Already replied"
        
        # Blacklisted author
        if tweet.author_username.lower() in {b.lower() for b in self.blacklist}:
            return False, "Blacklisted author"
        
        # Minimum followers
        if tweet.author_followers < self.min_followers:
            return False, f"Too few followers ({tweet.author_followers})"
        
        # Minimum engagement
        if tweet.like_count < self.min_likes:
            return False, f"Too few likes ({tweet.like_count})"
        if tweet.retweet_count < self.min_retweets:
            return False, f"Too few retweets ({tweet.retweet_count})"
        
        return True, "OK"
    
    def search_opportunities(self, keywords: Optional[list[str]] = None, max_per_keyword: int = 5) -> list[Opportunity]:
        """
        Search for engagement opportunities.
        
        Args:
            keywords: Specific keywords (uses config if None)
            max_per_keyword: Max results per keyword
            
        Returns:
            List of Opportunity objects
        """
        keywords = keywords or self.keywords
        opportunities = []
        
        for keyword in keywords:
            calculator = self._get_calculator_for_keyword(keyword)
            if not calculator:
                logger.warning(f"No calculator mapped for keyword: {keyword}")
                continue
            
            try:
                tweets = self.client.search_recent(
                    query=keyword,
                    max_results=max_per_keyword * 2,  # Extra to account for filtering
                    min_likes=self.min_likes,
                    min_retweets=self.min_retweets
                )
                
                for tweet in tweets[:max_per_keyword]:
                    valid, reason = self._is_valid_opportunity(tweet)
                    if not valid:
                        logger.debug(f"Skipping tweet {tweet.id}: {reason}")
                        continue
                    
                    # Generate suggested reply
                    suggested_reply = self.generator.generate_reply(
                        original_tweet=tweet.text,
                        calculator_slug=calculator
                    )
                    
                    relevance = self._calculate_relevance(tweet, keyword)
                    
                    opportunity = Opportunity(
                        tweet=tweet,
                        matched_keyword=keyword,
                        suggested_calculator=calculator,
                        suggested_reply=suggested_reply,
                        relevance_score=relevance
                    )
                    
                    opportunities.append(opportunity)
                    
                    # Mark as seen
                    self.state["seen_tweets"].append(tweet.id)
                
                # Update last search time for this keyword
                self.state["last_search"][keyword] = datetime.now().isoformat()
                
            except Exception as e:
                logger.error(f"Search failed for '{keyword}': {e}")
                continue
        
        # Sort by relevance
        opportunities.sort(key=lambda x: x.relevance_score, reverse=True)
        
        # Store opportunities
        self.state["opportunities"] = [o.to_dict() for o in opportunities]
        self._save_state()
        
        logger.info(f"Found {len(opportunities)} opportunities")
        return opportunities
    
    def mark_replied(self, tweet_id: str):
        """Mark a tweet as replied to."""
        self.state["replied_tweets"].append(tweet_id)
        self._save_state()
    
    def get_pending_opportunities(self) -> list[dict]:
        """Get stored opportunities that haven't been replied to."""
        replied = set(self.state["replied_tweets"])
        return [
            o for o in self.state["opportunities"]
            if o["tweet_id"] not in replied
        ]
    
    def get_stats(self) -> dict:
        """Get monitoring statistics."""
        return {
            "keywords_monitored": len(self.keywords),
            "tweets_seen": len(self.state["seen_tweets"]),
            "tweets_replied": len(self.state["replied_tweets"]),
            "pending_opportunities": len(self.get_pending_opportunities()),
            "last_searches": self.state.get("last_search", {})
        }


def get_monitor(config: dict) -> Monitor:
    """Factory function to get a monitor instance."""
    return Monitor(config)
