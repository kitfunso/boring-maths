"""
AI-Powered Content Generator for X/Twitter

Generates engaging tweets about calculators using LLMs.
"""

import os
import json
import random
import logging
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"


@dataclass
class GeneratedTweet:
    """A generated tweet with metadata."""
    text: str
    calculator_slug: str
    calculator_name: str
    template_type: str
    hashtags: list[str]


class ContentGenerator:
    """Generates tweet content using templates and LLMs."""
    
    def __init__(self, config: dict):
        """
        Initialize the content generator.
        
        Args:
            config: Generator config from config.yaml
        """
        self.config = config
        self.site_url = config.get("site", {}).get("url", "https://boring-math.com")
        self.style = config.get("generator", {}).get("style", {})
        
        # Load calculator and template data
        self.calculators = self._load_json("calculators.json")["calculators"]
        self.templates = self._load_json("templates.json")
        
        # Initialize LLM client
        provider = config.get("generator", {}).get("provider", "openai")
        if provider == "openai":
            self.llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            self.model = config.get("generator", {}).get("model", "gpt-4o-mini")
        else:
            raise ValueError(f"Unsupported provider: {provider}")
        
        logger.info(f"Content generator initialized with {len(self.calculators)} calculators")
    
    def _load_json(self, filename: str) -> dict:
        """Load a JSON file from the data directory."""
        path = DATA_DIR / filename
        with open(path) as f:
            return json.load(f)
    
    def _get_calculator_url(self, slug: str) -> str:
        """Get the full URL for a calculator."""
        return f"{self.site_url}/calculators/{slug}"
    
    def generate_tweet(
        self,
        calculator_slug: Optional[str] = None,
        template_type: Optional[str] = None,
        use_llm: bool = True
    ) -> GeneratedTweet:
        """
        Generate a tweet for a calculator.
        
        Args:
            calculator_slug: Specific calculator (random if None)
            template_type: Specific template type (random if None)
            use_llm: Whether to use LLM for enhancement
            
        Returns:
            GeneratedTweet object
        """
        # Select calculator
        if calculator_slug:
            calc = next((c for c in self.calculators if c["slug"] == calculator_slug), None)
            if not calc:
                raise ValueError(f"Calculator not found: {calculator_slug}")
        else:
            calc = random.choice(self.calculators)
        
        # Select template type
        template_types = list(self.templates["tweet_templates"].keys())
        if template_type and template_type in template_types:
            ttype = template_type
        else:
            ttype = random.choice(template_types)
        
        url = self._get_calculator_url(calc["slug"])
        
        if use_llm:
            tweet_text = self._generate_with_llm(calc, ttype, url)
        else:
            tweet_text = self._generate_from_template(calc, ttype, url)
        
        # Add hashtags
        hashtags = self._select_hashtags(calc["category"])
        
        # Ensure tweet fits in 280 chars
        tweet_text = self._fit_to_limit(tweet_text, hashtags)
        
        return GeneratedTweet(
            text=tweet_text,
            calculator_slug=calc["slug"],
            calculator_name=calc["name"],
            template_type=ttype,
            hashtags=hashtags
        )
    
    def _generate_from_template(self, calc: dict, template_type: str, url: str) -> str:
        """Generate tweet using a template (no LLM)."""
        templates = self.templates["tweet_templates"][template_type]
        template = random.choice(templates)
        
        # Get a random hook
        hook = random.choice(calc.get("hooks", [calc["name"]]))
        
        # Fill in template
        tweet = template.format(
            name=calc["name"],
            url=url,
            hook=hook,
            topic=calc["name"].replace(" Calculator", "").lower(),
            problem="guessing at the numbers",
            fact=f"Most people get their {calc['name'].replace(' Calculator', '').lower()} wrong",
            event="summer BBQ"
        )
        
        return tweet
    
    def _generate_with_llm(self, calc: dict, template_type: str, url: str) -> str:
        """Generate tweet using LLM for better quality."""
        tone = self.style.get("tone", "helpful and slightly witty")
        include_emoji = self.style.get("include_emoji", True)
        
        prompt = f"""Generate a tweet promoting a calculator tool.

Calculator: {calc['name']}
URL: {url}
Category: {calc['category']}
Keywords: {', '.join(calc.get('keywords', []))}
Example hooks: {', '.join(calc.get('hooks', []))}
Target audience: {', '.join(calc.get('target_audience', []))}

Tweet style: {template_type.replace('_', ' ')}
Tone: {tone}
Include emoji: {include_emoji}

Requirements:
- Must be under 260 characters (leave room for hashtags)
- Must include the URL: {url}
- Be engaging and encourage clicks
- Don't be spammy or overly salesy
- No hashtags in the tweet itself (added separately)

Generate ONLY the tweet text, nothing else."""

        try:
            response = self.llm.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.8
            )
            
            tweet = response.choices[0].message.content.strip()
            
            # Remove any quotes the LLM might have added
            tweet = tweet.strip('"\'')
            
            # Ensure URL is present
            if url not in tweet:
                tweet = f"{tweet}\n\n{url}"
            
            return tweet
            
        except Exception as e:
            logger.warning(f"LLM generation failed, using template: {e}")
            return self._generate_from_template(calc, template_type, url)
    
    def _select_hashtags(self, category: str) -> list[str]:
        """Select appropriate hashtags for the category."""
        max_hashtags = self.style.get("max_hashtags", 2)
        pools = self.templates.get("hashtag_pools", {})
        
        # Get category-specific hashtags
        category_tags = pools.get(category, [])
        
        # Mix with general tags
        general_tags = pools.get("everyday", [])
        
        available = list(set(category_tags + general_tags))
        
        if not available:
            return []
        
        return random.sample(available, min(max_hashtags, len(available)))
    
    def _fit_to_limit(self, text: str, hashtags: list[str]) -> str:
        """Ensure tweet fits within 280 character limit."""
        hashtag_str = " " + " ".join(hashtags) if hashtags else ""
        
        max_text_len = 280 - len(hashtag_str)
        
        if len(text) > max_text_len:
            # Truncate text, keeping URL intact
            lines = text.split("\n")
            url_line = next((l for l in lines if "http" in l), "")
            other_lines = [l for l in lines if "http" not in l]
            
            # Shorten other content
            other_text = "\n".join(other_lines)
            available = max_text_len - len(url_line) - 2  # -2 for newlines
            
            if len(other_text) > available:
                other_text = other_text[:available-3] + "..."
            
            text = f"{other_text}\n\n{url_line}".strip()
        
        return f"{text}{hashtag_str}"
    
    def generate_reply(self, original_tweet: str, calculator_slug: str) -> str:
        """
        Generate a helpful reply to a tweet.
        
        Args:
            original_tweet: The tweet we're replying to
            calculator_slug: Calculator that's relevant
            
        Returns:
            Reply text
        """
        calc = next((c for c in self.calculators if c["slug"] == calculator_slug), None)
        if not calc:
            raise ValueError(f"Calculator not found: {calculator_slug}")
        
        url = self._get_calculator_url(calc["slug"])
        
        prompt = f"""Generate a helpful, non-spammy reply to this tweet.

Original tweet: "{original_tweet}"

You want to helpfully mention this relevant tool:
Calculator: {calc['name']}
URL: {url}

Requirements:
- Be genuinely helpful, not salesy
- Keep it short (under 200 chars ideal)
- Include the URL naturally
- Don't use hashtags
- Sound human and conversational

Generate ONLY the reply text, nothing else."""

        try:
            response = self.llm.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0.7
            )
            
            reply = response.choices[0].message.content.strip().strip('"\'')
            
            # Ensure URL is present
            if url not in reply:
                reply = f"{reply} {url}"
            
            return reply
            
        except Exception as e:
            logger.warning(f"LLM reply generation failed: {e}")
            # Fallback to template
            templates = self.templates.get("reply_templates", {}).get("helpful", [])
            template = random.choice(templates) if templates else "Check this out: {url}"
            return template.format(name=calc["name"], url=url)
    
    def generate_batch(self, count: int = 5, unique_calculators: bool = True) -> list[GeneratedTweet]:
        """
        Generate multiple tweets.
        
        Args:
            count: Number of tweets to generate
            unique_calculators: Whether to use different calculators for each
            
        Returns:
            List of GeneratedTweet objects
        """
        tweets = []
        used_slugs = set()
        
        for _ in range(count):
            if unique_calculators:
                available = [c for c in self.calculators if c["slug"] not in used_slugs]
                if not available:
                    available = self.calculators  # Reset if exhausted
                calc = random.choice(available)
                used_slugs.add(calc["slug"])
                tweet = self.generate_tweet(calculator_slug=calc["slug"])
            else:
                tweet = self.generate_tweet()
            
            tweets.append(tweet)
        
        return tweets


def get_generator(config: dict) -> ContentGenerator:
    """Factory function to get a content generator instance."""
    return ContentGenerator(config)
