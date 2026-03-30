import importlib.util
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


BOT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BOT_ROOT))

from src.generator import ContentGenerator, logger as generator_logger


def load_post_tweet_module():
    module_path = BOT_ROOT / "post_tweet.py"
    spec = importlib.util.spec_from_file_location("x_bot_post_tweet", module_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class ContentGeneratorRegressionTests(unittest.TestCase):
    def setUp(self):
        self.config = {
            "site": {"url": "https://boring-math.com"},
            "generator": {
                "provider": "none",
                "model": "",
                "style": {"max_hashtags": 0},
            },
        }
        env = {"OPENAI_API_KEY": "", "ANTHROPIC_API_KEY": ""}
        with patch.dict(os.environ, env, clear=False):
            self.generator = ContentGenerator(self.config)
        self.calculator = self.generator.calculators[0]

    def test_generate_tweet_prefers_llm_path_when_llm_is_available(self):
        self.generator.pre_generated = [
            {"calculator": self.calculator["slug"], "text": "pre-generated body"}
        ]
        self.generator.provider = "openai"
        self.generator.llm = object()

        with patch.object(
            self.generator,
            "_generate_with_llm",
            return_value="llm body",
        ) as generate_with_llm:
            tweet = self.generator.generate_tweet(
                calculator_slug=self.calculator["slug"],
                template_type="question_hook",
                use_llm=True,
            )

        self.assertEqual(tweet.text, "llm body")
        self.assertEqual(tweet.template_type, "question_hook")
        generate_with_llm.assert_called_once()

    def test_generate_reply_without_llm_uses_template_without_warning(self):
        with patch.object(generator_logger, "warning") as warning:
            reply = self.generator.generate_reply(
                original_tweet="How do I work this out?",
                calculator_slug=self.calculator["slug"],
            )

        self.assertIn(
            f"https://boring-math.com/calculators/{self.calculator['slug']}",
            reply,
        )
        warning.assert_not_called()


class ScriptRegressionTests(unittest.TestCase):
    def test_parse_args_treats_dry_run_as_flag(self):
        module = load_post_tweet_module()

        calculator, dry_run = module.parse_args(["--dry-run"])

        self.assertIsNone(calculator)
        self.assertTrue(dry_run)


class RequirementsRegressionTests(unittest.TestCase):
    def test_requests_helpers_have_declared_dependencies(self):
        requirement_names = set()
        for line in (BOT_ROOT / "requirements.txt").read_text(encoding="utf-8").splitlines():
            entry = line.strip()
            if not entry or entry.startswith("#"):
                continue
            requirement_names.add(entry.split(">=")[0].split("==")[0].strip().lower())

        self.assertIn("requests", requirement_names)
        self.assertIn("requests-oauthlib", requirement_names)


if __name__ == "__main__":
    unittest.main()
