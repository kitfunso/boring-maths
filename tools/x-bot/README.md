# X/Twitter Bot for Boring Math Calculators

Automated content generation, posting, and engagement monitoring for X/Twitter.

## Features

- **Content Generator**: AI-powered tweet generation using templates + LLM
- **Posting Bot**: Scheduled posting with rate limiting
- **Monitor**: Search for relevant conversations and suggest replies
- **CLI**: Full command-line interface for all operations

## Quick Start

### 1. Install Dependencies

```bash
cd tools/x-bot
pip install -r requirements.txt
```

### 2. Set Up Credentials

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

You'll need:
- **X API credentials** from [developer.twitter.com](https://developer.twitter.com/en/portal/dashboard)
  - Apply for a developer account
  - Create a project and app
  - Generate API Key, Secret, Access Token, and Access Secret
  - Enable OAuth 1.0a with Read and Write permissions
- **OpenAI API key** from [platform.openai.com](https://platform.openai.com) (for AI-generated content)

### 3. Configure

Edit `config.yaml` to customize:
- Your X handle
- Posting schedule
- Keywords to monitor
- Rate limits

### 4. Test Connection

```bash
python -m src.cli status
```

## Usage

### Check Status
```bash
python -m src.cli status
```

### Generate Tweets (Preview)
```bash
# Generate 3 random tweets
python -m src.cli generate

# Generate for specific calculator
python -m src.cli generate -c fire-calculator

# Generate without AI (templates only)
python -m src.cli generate --no-llm
```

### Post a Tweet
```bash
# Generate and post
python -m src.cli post

# Post custom text
python -m src.cli post -t "Check out our FIRE Calculator! https://boring-math.com/calculators/fire-calculator"

# Skip confirmation
python -m src.cli post -y

# Bypass rate limits (use sparingly)
python -m src.cli post --force
```

### Monitor for Opportunities
```bash
# Search default keywords
python -m src.cli monitor

# Search specific keywords
python -m src.cli monitor -k "fire calculator" -k "retirement planning"

# Limit results
python -m src.cli monitor -n 3
```

### Reply to Opportunities
```bash
# Interactive mode
python -m src.cli reply

# Auto-approve high-relevance opportunities
python -m src.cli reply --auto
```

### Preview Scheduled Tweets
```bash
python -m src.cli preview
```

### Run Scheduled Bot
```bash
# Run with scheduled posting + monitoring
python -m src.cli run

# Dry run (no actual posting)
python -m src.cli run --dry-run
```

## Configuration

### config.yaml

```yaml
# Site info
site:
  name: "Boring Math Calculators"
  url: "https://boring-math.com"
  handle: "@boringmath"

# Content generation
generator:
  provider: "openai"
  model: "gpt-4o-mini"
  style:
    tone: "helpful and slightly witty"
    include_emoji: true
    max_hashtags: 2

# Posting schedule
poster:
  min_hours_between_posts: 4
  schedule:
    - "09:00"
    - "14:00"
    - "19:00"
  days: [0, 1, 2, 3, 4]  # Weekdays

# Monitoring
monitor:
  keywords:
    - "fire calculator"
    - "mortgage calculator"
  check_interval: 15
  min_follower_count: 10

# Rate limits
rate_limits:
  max_posts_per_day: 10
  max_replies_per_hour: 5
```

## Adding New Calculators

Edit `data/calculators.json` to add calculator metadata:

```json
{
  "slug": "new-calculator",
  "name": "New Calculator",
  "category": "finance",
  "keywords": ["keyword1", "keyword2"],
  "hooks": [
    "Catchy question?",
    "Another hook"
  ],
  "target_audience": ["audience1", "audience2"]
}
```

## Best Practices

### Content
- Keep tweets under 260 chars to leave room for hashtags
- Always include the calculator URL
- Use question hooks to encourage engagement
- Vary your content types

### Engagement
- Don't spam replies - quality over quantity
- Be genuinely helpful, not salesy
- Respect rate limits
- Avoid replying to very small accounts

### Rate Limits
- X API has strict rate limits
- Don't exceed ~50 tweets/day
- Space out posts by at least 4 hours
- Monitor your API usage in the developer portal

## Troubleshooting

### "Missing X API credentials"
Check your `.env` file has all required variables.

### "Rate limit exceeded"
Wait before posting again. Check `status` command for details.

### "Failed to post tweet"
- Check API permissions (need Read + Write)
- Verify credentials are correct
- Check for duplicate content (X blocks identical tweets)

### "Search failed"
- You need Elevated access for search (Basic tier has limited search)
- Check bearer token is set

## File Structure

```
x-bot/
├── README.md
├── requirements.txt
├── config.yaml
├── .env                    # Your credentials (don't commit!)
├── src/
│   ├── __init__.py
│   ├── client.py          # X API wrapper
│   ├── generator.py       # Content generation
│   ├── poster.py          # Posting logic
│   ├── monitor.py         # Keyword monitoring
│   └── cli.py             # Command-line interface
├── data/
│   ├── calculators.json   # Calculator metadata
│   ├── templates.json     # Tweet templates
│   ├── poster_state.json  # Posting state (auto-generated)
│   └── monitor_state.json # Monitor state (auto-generated)
└── logs/
    └── x-bot.log          # Log file
```

## License

MIT
