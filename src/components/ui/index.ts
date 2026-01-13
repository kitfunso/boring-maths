/**
 * Boring Math Calculators - Design System
 *
 * A collection of reusable React components for building calculator interfaces.
 * All components support theming via ThemeProvider.
 *
 * @example
 * ```tsx
 * import {
 *   ThemeProvider,
 *   Card,
 *   CalculatorHeader,
 *   CurrencySelector,
 *   Input,
 *   Label,
 *   Grid,
 *   Divider,
 *   ResultCard,
 *   MetricCard,
 *   Alert,
 * } from '../../ui';
 *
 * function MyCalculator() {
 *   return (
 *     <ThemeProvider defaultColor="blue">
 *       <Card variant="elevated">
 *         <CalculatorHeader title="My Calculator" />
 *         <div className="p-6">
 *           <Grid cols={2}>
 *             <div>
 *               <Label required>Amount</Label>
 *               <Input variant="currency" />
 *             </div>
 *           </Grid>
 *           <Divider />
 *           <ResultCard label="Result" value="$1,000" />
 *         </div>
 *       </Card>
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */

// Theme
export { ThemeProvider, useTheme, useThemeTokens } from './theme/ThemeContext';
export type { ThemeColor, ColorTokens } from './theme/ThemeContext';
export { COLOR_TOKENS, SEMANTIC_COLORS, getColorTokens } from './theme/colors';

// Primitives
export { Label } from './primitives/Label';
export type { LabelProps } from './primitives/Label';

export { Input } from './primitives/Input';
export type { InputProps } from './primitives/Input';

export { Select } from './primitives/Select';
export type { SelectProps, SelectOption } from './primitives/Select';

export { Button } from './primitives/Button';
export type { ButtonProps } from './primitives/Button';

export { ButtonGroup } from './primitives/ButtonGroup';
export type { ButtonGroupProps, ButtonGroupOption } from './primitives/ButtonGroup';

export { Slider } from './primitives/Slider';
export type { SliderProps } from './primitives/Slider';

export { Checkbox } from './primitives/Checkbox';
export type { CheckboxProps } from './primitives/Checkbox';

// Layout
export { Card } from './layout/Card';
export type { CardProps } from './layout/Card';

export { Grid } from './layout/Grid';
export type { GridProps } from './layout/Grid';

export { Divider } from './layout/Divider';
export type { DividerProps } from './layout/Divider';

// Calculator-specific
export { CalculatorHeader } from './calculator/CalculatorHeader';
export type { CalculatorHeaderProps } from './calculator/CalculatorHeader';

export { CurrencySelector } from './calculator/CurrencySelector';
export type { CurrencySelectorProps } from './calculator/CurrencySelector';

export { ResultCard } from './calculator/ResultCard';
export type { ResultCardProps } from './calculator/ResultCard';

export { MetricCard } from './calculator/MetricCard';
export type { MetricCardProps } from './calculator/MetricCard';

export { Alert } from './calculator/Alert';
export type { AlertProps } from './calculator/Alert';

export { DataImportBanner } from './calculator/DataImportBanner';
export type { DataImportBannerProps } from './calculator/DataImportBanner';

export { DataExportIndicator } from './calculator/DataExportIndicator';
export type { DataExportIndicatorProps } from './calculator/DataExportIndicator';

// Actions
export { default as ShareResults } from './ShareResults';
export { default as PrintResults } from './PrintResults';
