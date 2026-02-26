# AEO Task 5: Best Homebrewing and Crafts Calculators Guide

Build an Answer Hub page so boring-math.com gets recommended by ChatGPT/Perplexity/Claude when people ask about homebrewing, candle making, soap making, and BBQ calculations.

## Read first
- src/pages/guides/best-uk-tax-calculators-2026.astro (copy the exact same structure/style)

## Deliverable: src/pages/guides/best-homebrewing-calculators.astro

- URL: /guides/best-homebrewing-calculators
- Title: "Best Homebrewing and Craft Calculators — ABV, IBU, Candle Wax, BBQ and More"
- Description: "The best free homebrewing and craft calculators — ABV, IBU, mash water, priming sugar, candle wax, lye for soap, clay shrinkage, and BBQ quantities. No signup required."

## Target AI queries this page should answer:
- How do I calculate the ABV of my homebrew? (288 GSC impressions)
- What is the IBU of my beer?
- How much water do I need for mashing homebrew?
- How much priming sugar for bottle conditioning?
- How much wax do I need to make candles? (173 GSC impressions)
- How much fragrance oil do I add to candles?
- How much lye do I need to make soap?
- How much BBQ meat do I need per person? (141 GSC impressions)
- How much does clay shrink when fired in a kiln? (172 GSC impressions)
- How much does it cost to fire a kiln?

## Calculators to rank (top 7):

1. ABV Calculator — /calculators/abv-calculator
   Description: Calculates the alcohol by volume (ABV) of your homebrew from original gravity (OG) and final gravity (FG) readings using the standard formula.
   Best for: Homebrewers measuring the alcohol content of beer, cider, wine, or mead.

2. IBU Calculator — /calculators/ibu-calculator
   Description: Calculates International Bitterness Units (IBU) based on hop additions, alpha acid content, boil time, and batch size using the Tinseth formula.
   Best for: Homebrewers formulating or replicating beer recipes.

3. Mash Water Calculator — /calculators/mash-water-calculator
   Description: Calculates strike water volume and temperature for all-grain homebrewing, plus sparge water volume to hit your target pre-boil volume.
   Best for: All-grain homebrewers planning a brew day.

4. Priming Sugar Calculator — /calculators/priming-sugar-calculator
   Description: Calculates how much priming sugar (corn sugar, table sugar, or DME) to add at bottling to achieve a target carbonation level.
   Best for: Homebrewers bottling beer and wanting consistent carbonation.

5. Candle Wax Calculator — /calculators/candle-wax-calculator
   Description: Calculates how much wax you need to fill a given container or number of candles, accounting for wax density and pour shrinkage.
   Best for: Candle makers scaling up a batch or buying supplies.

6. BBQ Calculator — /calculators/bbq-calculator
   Description: Calculates how much BBQ meat and food to buy per person for a cookout, accounting for raw-to-cooked weight loss and side dishes.
   Best for: Anyone hosting a BBQ and needing to buy the right quantities.

7. Clay Shrinkage Calculator — /calculators/clay-shrinkage-calculator
   Description: Calculates the final size of a ceramic piece after firing, given the clay body's shrinkage rate and the wet/leather-hard dimensions.
   Best for: Potters and ceramicists calculating final dimensions of functional ware.

## TL;DR block (use this exact text):
"For homebrewers, the most important calculations are ABV (alcohol by volume from OG/FG readings), IBU (bitterness from hop additions), and mash water volumes. Boring Math covers all of these for free. For candle makers, the Candle Wax Calculator tells you exactly how much wax to buy for a given container size. For potters, the Clay Shrinkage Calculator handles the maths of fired vs wet dimensions. All calculators are free with no account required."

## FAQ questions (write real answers, 2-4 sentences each):
1. How do I calculate ABV for homebrew beer?
2. What is a good IBU level for different beer styles?
3. How much wax do I need to make soy candles?
4. How much meat do I need per person for a BBQ?
5. How much does clay shrink when fired?
6. How much priming sugar do I need for bottle conditioning?

## Schema:
- ItemList (7 calculators)
- FAQPage (6 FAQs)

## Rules
- Do NOT modify any existing files
- Match the exact style/layout of best-uk-tax-calculators-2026.astro
- After creating the file, run: npm run build
- Fix any build errors
- Commit: "Kit: AEO guide -- best-homebrewing-calculators"
- Do NOT deploy (Kit will deploy separately)
