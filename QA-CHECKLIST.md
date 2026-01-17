# QA Checklist for Boring Math Calculators

Use this checklist before deploying new calculators or significant changes.

## Automated Checks (Run First)

```bash
# Run all automated checks
npm run test        # Unit tests
npm run lint        # ESLint code quality
npm run build       # Build succeeds
```

---

## Manual Testing Checklist

### 1. Currency/Region Testing

For each calculator with currency selection:

- [ ] **USD selected**: Check terminology is US-appropriate (401k, Social Security, etc.)
- [ ] **GBP selected**: Check terminology is UK-appropriate (pension, National Insurance, etc.)
- [ ] **EUR selected**: Check terminology is EU-appropriate (pension, social contributions, etc.)
- [ ] **Currency symbol correct**: $ for USD, £ for GBP, € for EUR
- [ ] **Currency persists on refresh**: Selected currency stays after page reload
- [ ] **Currency syncs across calculators**: Changing currency in one calculator affects others

### 2. Input Validation

- [ ] **Empty inputs**: Don't cause crashes or NaN results
- [ ] **Zero values**: Handle gracefully (no division by zero)
- [ ] **Negative values**: Either rejected or handled appropriately
- [ ] **Very large numbers**: Don't cause overflow or display issues
- [ ] **Decimal inputs**: Work correctly where expected
- [ ] **Typing experience**: No "snap to zero" or input jumping issues

### 3. Calculation Accuracy

- [ ] **Spot check results**: Manually verify at least 2-3 calculations
- [ ] **Edge cases**: Test minimum and maximum values
- [ ] **Rounding**: Results round appropriately (usually 2 decimal places)
- [ ] **Formula correctness**: Compare with known online calculators if unsure

### 4. Mobile Responsiveness

Test on mobile viewport (375px wide):

- [ ] **Layout**: No horizontal scrolling required
- [ ] **Text**: Not cut off or overlapping
- [ ] **Inputs**: Easy to tap and type
- [ ] **Results**: Readable without zooming
- [ ] **Buttons**: Large enough to tap accurately

### 5. Browser Compatibility

Test in at least:

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest, if on Mac/iOS)
- [ ] **Mobile Safari** (iOS)
- [ ] **Chrome Mobile** (Android)

### 6. Navigation & State

- [ ] **Back button**: Works correctly (returns to previous page)
- [ ] **Deep linking**: Direct URL to calculator works
- [ ] **View Transitions**: Smooth navigation between pages
- [ ] **State persistence**: Inputs preserved on navigation (if using localStorage)

### 7. Accessibility

- [ ] **Keyboard navigation**: Can tab through all inputs
- [ ] **Labels**: All inputs have associated labels
- [ ] **Contrast**: Text readable in light/dark modes
- [ ] **Screen reader**: Key results announced (if applicable)

### 8. Share/Print Functionality

- [ ] **ShareResults button exists**: Visible in results section
- [ ] **Copy to clipboard**: Works without errors
- [ ] **Print output**: Clean, readable format

---

## Common Bugs to Watch For

### Calculation Bugs

| Symptom | Likely Cause |
|---------|--------------|
| NaN or undefined in results | Division by zero or empty input handling |
| Results don't update | State not connected to calculation |
| Wrong currency symbol | Not using getCurrencySymbol() or hardcoded |
| Slider doesn't affect results | Value not included in calculation inputs |

### UI Bugs

| Symptom | Likely Cause |
|---------|--------------|
| Text cut off on mobile | Missing responsive classes |
| Input jumps to 0 while typing | Number("") returns 0, needs empty string handling |
| Flash of wrong currency | Not using getInitialCurrency() |
| Back button doesn't work | View Transitions issue |

### Region Bugs

| Symptom | Likely Cause |
|---------|--------------|
| US terms in UK mode | Hardcoded US terminology |
| Wrong default values | Not using getRegionDefaults() |
| Tax rates wrong for region | Missing region-specific constants |

---

## Test Commands Reference

```bash
# Run all unit tests
npm run test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run ESLint
npm run lint

# Fix auto-fixable ESLint issues
npm run lint:fix

# Full build (includes OG images)
npm run build

# Development server
npm run dev
```

---

## Adding Tests for New Calculators

When adding a new calculator, create a test file:

```
tests/calculations/{calculator-name}.test.ts
```

Minimum test coverage:

1. **Basic calculation**: Happy path with typical inputs
2. **Edge cases**: Zero, negative, very large numbers
3. **Currency handling**: Currency preserved in results
4. **Rounding**: Results have correct precision

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateXYZ } from '../../src/components/calculators/XYZ/calculations';

describe('XYZCalculator', () => {
  it('calculates correctly', () => {
    const result = calculateXYZ({ /* inputs */ });
    expect(result.value).toBe(expectedValue);
  });

  it('handles zero input', () => {
    const result = calculateXYZ({ amount: 0 });
    expect(result.value).toBe(0);
  });
});
```

---

## Pre-Deployment Checklist

Before running `git push`:

- [ ] `npm run test` passes
- [ ] `npm run lint` passes (or warnings reviewed)
- [ ] `npm run build` succeeds
- [ ] Manual spot-check on localhost
- [ ] Mobile responsiveness verified
- [ ] Currency switching tested

---

## Reporting Bugs

When a bug is found, document:

1. **Calculator name**
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Browser/device**
6. **Screenshot if applicable**
