/**
 * Design System Color Tokens - Dark Theme
 *
 * Maps theme colors to Tailwind CSS classes for consistent styling across components.
 */

export type ThemeColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple';

export interface ColorTokens {
  // Background colors (dark theme)
  bg50: string;
  bg100: string;
  bg600: string;
  bg700: string;
  // Border colors
  border200: string;
  border500: string;
  // Text colors
  text100: string;
  text600: string;
  text700: string;
  // Focus ring
  ring100: string;
  // Gradient classes (dark theme)
  gradientHeader: string;
  gradientResult: string;
  // Accent (slider, checkbox)
  accent: string;
}

/**
 * Complete color token mappings for each theme color.
 * Updated for dark theme.
 */
export const COLOR_TOKENS: Record<ThemeColor, ColorTokens> = {
  blue: {
    bg50: 'bg-blue-950/30',
    bg100: 'bg-blue-900/40',
    bg600: 'bg-blue-600',
    bg700: 'bg-blue-700',
    border200: 'border-blue-500/30',
    border500: 'border-blue-500',
    text100: 'text-blue-200',
    text600: 'text-blue-400',
    text700: 'text-blue-300',
    ring100: 'focus:ring-blue-500/30',
    gradientHeader: 'bg-gradient-to-r from-blue-600 to-blue-700',
    gradientResult: 'bg-gradient-to-br from-blue-950/50 to-blue-900/30',
    accent: 'accent-blue-500',
  },
  green: {
    bg50: 'bg-emerald-950/30',
    bg100: 'bg-emerald-900/40',
    bg600: 'bg-emerald-600',
    bg700: 'bg-emerald-700',
    border200: 'border-emerald-500/30',
    border500: 'border-emerald-500',
    text100: 'text-emerald-200',
    text600: 'text-emerald-400',
    text700: 'text-emerald-300',
    ring100: 'focus:ring-emerald-500/30',
    gradientHeader: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
    gradientResult: 'bg-gradient-to-br from-emerald-950/50 to-emerald-900/30',
    accent: 'accent-emerald-500',
  },
  yellow: {
    bg50: 'bg-amber-950/30',
    bg100: 'bg-amber-900/40',
    bg600: 'bg-amber-600',
    bg700: 'bg-amber-700',
    border200: 'border-amber-500/30',
    border500: 'border-amber-500',
    text100: 'text-amber-200',
    text600: 'text-amber-400',
    text700: 'text-amber-300',
    ring100: 'focus:ring-amber-500/30',
    gradientHeader: 'bg-gradient-to-r from-amber-500 to-amber-600',
    gradientResult: 'bg-gradient-to-br from-amber-950/50 to-amber-900/30',
    accent: 'accent-amber-500',
  },
  red: {
    bg50: 'bg-rose-950/30',
    bg100: 'bg-rose-900/40',
    bg600: 'bg-rose-600',
    bg700: 'bg-rose-700',
    border200: 'border-rose-500/30',
    border500: 'border-rose-500',
    text100: 'text-rose-200',
    text600: 'text-rose-400',
    text700: 'text-rose-300',
    ring100: 'focus:ring-rose-500/30',
    gradientHeader: 'bg-gradient-to-r from-rose-600 to-rose-700',
    gradientResult: 'bg-gradient-to-br from-rose-950/50 to-rose-900/30',
    accent: 'accent-rose-500',
  },
  purple: {
    bg50: 'bg-violet-950/30',
    bg100: 'bg-violet-900/40',
    bg600: 'bg-violet-600',
    bg700: 'bg-violet-700',
    border200: 'border-violet-500/30',
    border500: 'border-violet-500',
    text100: 'text-violet-200',
    text600: 'text-violet-400',
    text700: 'text-violet-300',
    ring100: 'focus:ring-violet-500/30',
    gradientHeader: 'bg-gradient-to-r from-violet-600 to-violet-700',
    gradientResult: 'bg-gradient-to-br from-violet-950/50 to-violet-900/30',
    accent: 'accent-violet-500',
  },
};

/**
 * Semantic color mappings (dark theme)
 */
export const SEMANTIC_COLORS = {
  success: {
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    icon: 'text-emerald-400',
  },
  error: {
    bg: 'bg-rose-950/30',
    border: 'border-rose-500/30',
    text: 'text-rose-300',
    icon: 'text-rose-400',
  },
  warning: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    icon: 'text-amber-400',
  },
  info: {
    bg: 'bg-blue-950/30',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    icon: 'text-blue-400',
  },
};

/**
 * Get color tokens for a specific theme color.
 */
export function getColorTokens(color: ThemeColor): ColorTokens {
  return COLOR_TOKENS[color];
}
