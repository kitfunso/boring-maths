import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from .client import XClient, get_client
from .generator import ContentGenerator, GeneratedTweet, get_generator

logger = logging.getLogger(__name__)
STATE_FILE = Path(__file__).parent.parent / "data" / "poster_state.json"


class Poster:
    def __init__(self, config: dict, client: Optional[XClient] = None, generator: Optional[ContentGenerator] = None):
        self.config = config
        self.client = client or get_client()
        self.generator = generator or get_generator(config)
        
        poster_config = config.get("poster", {})
        self.min_hours_between = poster_config.get("min_hours_between_posts", 4)
        self.schedule = poster_config.get("schedule", ["09:00", "14:00", "19:00"])
        self.days = poster_config.get("days", [0, 1, 2, 3, 4])
        
        rate_config = config.get("rate_limits", {})
        self.max_posts_per_day = rate_config.get("max_posts_per_day", 10)
        
        self.state = self._load_state()
        
        logger.info("Poster initialized")
    
    def _load_state(self) -> dict:
        if STATE_FILE.exists():
            try:
                with open(STATE_FILE) as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load state: {e}")
        
        return {
            "last_post_time": None,
            "posts_today": 0,
            "today_date": None,
            "posted_calculators": [],
            "history": []
        }
    
    def _save_state(self):
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(STATE_FILE, "w") as f:
            json.dump(self.state, f, indent=2, default=str)
    
    def _reset_daily_counters(self):
        today = datetime.now().strftime("%Y-%m-%d")
        if self.state.get("today_date") != today:
            self.state["today_date"] = today
            self.state["posts_today"] = 0
            self.state["posted_calculators"] = []
            self._save_state()
    
    def can_post(self) -> tuple[bool, str]:
        self._reset_daily_counters()
        
        if self.state["posts_today"] >= self.max_posts_per_day:
            return False, f"Daily limit reached ({self.max_posts_per_day} posts)"
        
        last_post = self.state.get("last_post_time")
        if last_post:
            last_dt = datetime.fromisoformat(last_post)
            hours_since = (datetime.now() - last_dt).total_seconds() / 3600
            if hours_since < self.min_hours_between:
                wait_mins = int((self.min_hours_between - hours_since) * 60)
                return False, f"Too soon since last post (wait {wait_mins} minutes)"
        
        today_dow = datetime.now().weekday()
        if today_dow not in self.days:
            return False, f"Not a posting day (today is {today_dow})"
        
        return True, "OK"
    
    def post_tweet(
        self,
        tweet: Optional[GeneratedTweet] = None,
        text: Optional[str] = None,
        force: bool = False
    ) -> dict:
        if not force:
            can_post, reason = self.can_post()
            if not can_post:
                return {"success": False, "error": reason}
        
        if tweet:
            tweet_text = tweet.text
            calculator_slug = tweet.calculator_slug
        elif text:
            tweet_text = text
            calculator_slug = None
        else:
            tweet = self.generator.generate_tweet()
            tweet_text = tweet.text
            calculator_slug = tweet.calculator_slug
        
        try:
            result = self.client.post_tweet(tweet_text)
            
            self.state["last_post_time"] = datetime.now().isoformat()
            self.state["posts_today"] += 1
            if calculator_slug:
                self.state["posted_calculators"].append(calculator_slug)
            
            self.state["history"].append({
                "tweet_id": result["id"],
                "text": tweet_text,
                "calculator": calculator_slug,
                "posted_at": datetime.now().isoformat()
            })
            
            self.state["history"] = self.state["history"][-100:]
            
            self._save_state()
            
            logger.info(f"Posted tweet: {result['id']}")
            return {
                "success": True,
                "tweet_id": result["id"],
                "text": tweet_text
            }
            
        except Exception as e:
            logger.error(f"Failed to post: {e}")
            return {"success": False, "error": str(e)}
    
    def post_reply(self, reply_to_id: str, text: str, force: bool = False) -> dict:
        if not force:
            can_post, reason = self.can_post()
            if not can_post:
                return {"success": False, "error": reason}
        
        try:
            result = self.client.post_tweet(text, reply_to=reply_to_id)
            
            self.state["last_post_time"] = datetime.now().isoformat()
            self.state["posts_today"] += 1
            self._save_state()
            
            logger.info(f"Posted reply: {result['id']}")
            return {
                "success": True,
                "tweet_id": result["id"],
                "text": text,
                "reply_to": reply_to_id
            }
            
        except Exception as e:
            logger.error(f"Failed to post reply: {e}")
            return {"success": False, "error": str(e)}
    
    def get_status(self) -> dict:
        self._reset_daily_counters()
        can_post, reason = self.can_post()
        
        return {
            "can_post": can_post,
            "reason": reason,
            "posts_today": self.state["posts_today"],
            "max_posts_per_day": self.max_posts_per_day,
            "last_post_time": self.state.get("last_post_time"),
            "posted_calculators_today": self.state.get("posted_calculators", [])
        }
    
    def preview_next(self, count: int = 3) -> list[GeneratedTweet]:
        exclude = set(self.state.get("posted_calculators", []))
        
        tweets = []
        for _ in range(count):
            available = [
                c for c in self.generator.calculators 
                if c["slug"] not in exclude
            ]
            
            if not available:
                exclude = set()
                available = self.generator.calculators
            
            calc = available[0] if available else None
            if calc:
                tweet = self.generator.generate_tweet(calculator_slug=calc["slug"])
                tweets.append(tweet)
                exclude.add(calc["slug"])
        
        return tweets


def get_poster(config: dict) -> Poster:
    return Poster(config)
