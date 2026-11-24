#!/usr/bin/env python3
import sys
import logging
from pathlib import Path

import click
import yaml
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Confirm, Prompt

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.client import get_client
from src.generator import get_generator
from src.poster import get_poster
from src.monitor import get_monitor

console = Console(force_terminal=True, color_system="auto")
CONFIG_FILE = Path(__file__).parent.parent / "config.yaml"


def load_config() -> dict:
    if not CONFIG_FILE.exists():
        console.print("[red]Config file not found![/red]")
        console.print(f"Create {CONFIG_FILE} from config.example.yaml")
        sys.exit(1)
    
    with open(CONFIG_FILE) as f:
        return yaml.safe_load(f)


def setup_logging(level: str = "INFO"):
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )


@click.group()
@click.option("--debug", is_flag=True, help="Enable debug logging")
def cli(debug: bool):
    """X/Twitter Bot for Boring Math Calculators"""
    setup_logging("DEBUG" if debug else "INFO")


@cli.command()
def status():
    """Check API connection and current status."""
    config = load_config()
    
    console.print("\n[bold]🔌 Checking X API connection...[/bold]\n")
    
    try:
        client = get_client()
        info = client.verify_credentials()
        
        console.print(Panel(
            f"[green]✓ Connected![/green]\n\n"
            f"Account: @{info['username']}\n"
            f"Name: {info['name']}\n"
            f"Followers: {info['followers']:,}",
            title="API Status"
        ))
        
        poster = get_poster(config)
        post_status = poster.get_status()
        
        table = Table(title="Posting Status")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("Can post now", "✓ Yes" if post_status["can_post"] else f"✗ No ({post_status['reason']})")
        table.add_row("Posts today", f"{post_status['posts_today']} / {post_status['max_posts_per_day']}")
        table.add_row("Last post", post_status["last_post_time"] or "Never")
        
        console.print(table)
        
        monitor = get_monitor(config)
        mon_stats = monitor.get_stats()
        
        table2 = Table(title="Monitor Status")
        table2.add_column("Metric", style="cyan")
        table2.add_column("Value", style="green")
        
        table2.add_row("Keywords monitored", str(mon_stats["keywords_monitored"]))
        table2.add_row("Tweets seen", str(mon_stats["tweets_seen"]))
        table2.add_row("Replies sent", str(mon_stats["tweets_replied"]))
        table2.add_row("Pending opportunities", str(mon_stats["pending_opportunities"]))
        
        console.print(table2)
        
    except Exception as e:
        console.print(f"[red]✗ Connection failed: {e}[/red]")
        console.print("\nCheck your .env file has valid X API credentials.")
        sys.exit(1)


@cli.command()
@click.option("--count", "-n", default=3, help="Number of tweets to generate")
@click.option("--calculator", "-c", default=None, help="Specific calculator slug")
@click.option("--no-llm", is_flag=True, help="Use templates only (no AI)")
def generate(count: int, calculator: str, no_llm: bool):
    """Generate tweet content (preview only, doesn't post)."""
    config = load_config()
    generator = get_generator(config)
    
    console.print(f"\n[bold]✨ Generating {count} tweets...[/bold]\n")
    
    for i in range(count):
        tweet = generator.generate_tweet(
            calculator_slug=calculator,
            use_llm=not no_llm
        )
        
        console.print(Panel(
            f"{tweet.text}\n\n"
            f"[dim]Calculator: {tweet.calculator_name}[/dim]\n"
            f"[dim]Template: {tweet.template_type}[/dim]\n"
            f"[dim]Length: {len(tweet.text)} chars[/dim]",
            title=f"Tweet {i+1}",
            border_style="blue"
        ))
        console.print()


@cli.command()
@click.option("--text", "-t", default=None, help="Custom tweet text")
@click.option("--calculator", "-c", default=None, help="Calculator to promote")
@click.option("--force", is_flag=True, help="Bypass rate limits")
@click.option("--yes", "-y", is_flag=True, help="Skip confirmation")
def post(text: str, calculator: str, force: bool, yes: bool):
    """Post a tweet."""
    config = load_config()
    poster = get_poster(config)
    
    if not force:
        status = poster.get_status()
        if not status["can_post"]:
            console.print(f"[yellow]Cannot post: {status['reason']}[/yellow]")
            console.print("Use --force to bypass")
            return
    
    if text:
        tweet_text = text
        console.print(Panel(tweet_text, title="Tweet to post"))
    else:
        tweet = poster.generator.generate_tweet(calculator_slug=calculator)
        tweet_text = tweet.text
        console.print(Panel(
            f"{tweet_text}\n\n"
            f"[dim]Calculator: {tweet.calculator_name}[/dim]",
            title="Generated Tweet"
        ))
    
    if not yes:
        if not Confirm.ask("\nPost this tweet?"):
            console.print("[yellow]Cancelled[/yellow]")
            return
    
    result = poster.post_tweet(text=tweet_text, force=force)
    
    if result["success"]:
        console.print(f"\n[green]✓ Posted![/green]")
        console.print(f"Tweet ID: {result['tweet_id']}")
        console.print(f"URL: https://x.com/i/status/{result['tweet_id']}")
    else:
        console.print(f"\n[red]✗ Failed: {result['error']}[/red]")


@cli.command()
@click.option("--keywords", "-k", multiple=True, help="Specific keywords to search")
@click.option("--limit", "-n", default=5, help="Max results per keyword")
def monitor(keywords: tuple, limit: int):
    """Search for engagement opportunities."""
    config = load_config()
    mon = get_monitor(config)
    
    kw_list = list(keywords) if keywords else None
    
    console.print("\n[bold]🔍 Searching for opportunities...[/bold]\n")
    
    opportunities = mon.search_opportunities(keywords=kw_list, max_per_keyword=limit)
    
    if not opportunities:
        console.print("[yellow]No opportunities found[/yellow]")
        return
    
    console.print(f"[green]Found {len(opportunities)} opportunities![/green]\n")
    
    for i, opp in enumerate(opportunities[:10], 1):
        console.print(Panel(
            f"[bold]@{opp.tweet.author_username}[/bold] ({opp.tweet.author_followers:,} followers)\n"
            f"[dim]{opp.tweet.created_at}[/dim]\n\n"
            f'"{opp.tweet.text}"\n\n'
            f"[cyan]💬 Likes: {opp.tweet.like_count} | RTs: {opp.tweet.retweet_count}[/cyan]\n"
            f"[green]📊 Relevance: {opp.relevance_score:.0%}[/green]\n"
            f"[blue]🎯 Calculator: {opp.suggested_calculator}[/blue]\n\n"
            f"[bold]Suggested reply:[/bold]\n{opp.suggested_reply}",
            title=f"Opportunity {i} (Keyword: {opp.matched_keyword})",
            border_style="green" if opp.relevance_score > 0.7 else "yellow"
        ))
        console.print()


@cli.command()
@click.option("--auto", is_flag=True, help="Auto-approve high-relevance opportunities")
def reply(auto: bool):
    """Interactive reply mode for pending opportunities."""
    config = load_config()
    mon = get_monitor(config)
    poster = get_poster(config)
    
    opportunities = mon.get_pending_opportunities()
    
    if not opportunities:
        console.print("[yellow]No pending opportunities. Run 'monitor' first.[/yellow]")
        return
    
    console.print(f"\n[bold]📬 {len(opportunities)} pending opportunities[/bold]\n")
    
    for opp in opportunities:
        status = poster.get_status()
        if not status["can_post"]:
            console.print(f"[yellow]Rate limit: {status['reason']}[/yellow]")
            break
        
        console.print(Panel(
            f"[bold]@{opp['author']}[/bold]\n"
            f'"{opp["tweet_text"]}"\n\n'
            f"[bold]Suggested reply:[/bold]\n{opp['suggested_reply']}",
            title=f"Relevance: {opp['relevance_score']:.0%}"
        ))
        
        if auto and opp["relevance_score"] >= 0.8:
            action = "y"
        else:
            action = Prompt.ask(
                "[y]es / [n]o / [e]dit / [s]kip all",
                choices=["y", "n", "e", "s"],
                default="n"
            )
        
        if action == "s":
            break
        elif action == "y":
            result = poster.post_reply(opp["tweet_id"], opp["suggested_reply"])
            if result["success"]:
                console.print(f"[green]✓ Replied![/green]")
                mon.mark_replied(opp["tweet_id"])
            else:
                console.print(f"[red]✗ Failed: {result['error']}[/red]")
        elif action == "e":
            edited = Prompt.ask("Enter reply", default=opp["suggested_reply"])
            result = poster.post_reply(opp["tweet_id"], edited)
            if result["success"]:
                console.print(f"[green]✓ Replied![/green]")
                mon.mark_replied(opp["tweet_id"])
            else:
                console.print(f"[red]✗ Failed: {result['error']}[/red]")
        
        console.print()


@cli.command()
def preview():
    """Preview next scheduled tweets."""
    config = load_config()
    poster = get_poster(config)
    
    console.print("\n[bold]📅 Next scheduled tweets:[/bold]\n")
    
    tweets = poster.preview_next(count=5)
    
    for i, tweet in enumerate(tweets, 1):
        console.print(Panel(
            f"{tweet.text}\n\n"
            f"[dim]Calculator: {tweet.calculator_name}[/dim]",
            title=f"Queue position {i}"
        ))
        console.print()


@cli.command()
@click.option("--dry-run", is_flag=True, help="Don't actually post")
def run(dry_run: bool):
    """Run the bot (posts + monitors on schedule)."""
    import schedule
    import time
    
    config = load_config()
    poster = get_poster(config)
    mon = get_monitor(config)
    
    def post_job():
        if dry_run:
            console.print("[dim]DRY RUN: Would post a tweet[/dim]")
            return
        
        status = poster.get_status()
        if status["can_post"]:
            tweet = poster.generator.generate_tweet()
            result = poster.post_tweet(tweet=tweet)
            if result["success"]:
                console.print(f"[green]Posted: {result['tweet_id']}[/green]")
            else:
                console.print(f"[red]Failed: {result['error']}[/red]")
    
    def monitor_job():
        opportunities = mon.search_opportunities(max_per_keyword=3)
        if opportunities:
            console.print(f"[cyan]Found {len(opportunities)} opportunities[/cyan]")
    
    post_schedule = config.get("poster", {}).get("schedule", ["09:00", "14:00", "19:00"])
    for time_str in post_schedule:
        schedule.every().day.at(time_str).do(post_job)
        console.print(f"Scheduled post at {time_str}")
    
    check_interval = config.get("monitor", {}).get("check_interval", 15)
    schedule.every(check_interval).minutes.do(monitor_job)
    console.print(f"Scheduled monitoring every {check_interval} minutes")
    
    console.print("\n[bold green]Bot running! Press Ctrl+C to stop.[/bold green]\n")
    
    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    cli()
