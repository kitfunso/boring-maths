/**
 * Design System Color Tokens
 *
 * Maps theme colors to Tailwind CSS classes for consistent styling across components.
 */

export type ThemeColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple';

export interface ColorTokens {
  // Background colors
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
  // Gradient classes
  gradientHeader: string;
  gradientResult: string;
  // Accent (slider, checkbox)
  accent: string;
}

/**
 * Complete color token mappings for each theme color.
 * These map directly to Tailwind CSS classes.
 */
export const COLOR_TOKENS: Record<ThemeColor, ColorTokens> = {
  blue: {
    bg50: 'bg-blue-50',
    bg100: 'bg-blue-100',
    bg600: 'bg-blue-600',
    bg700: 'bg-blue-700',
    border200: 'border-blue-200',
    border500: 'border-blue-500',
    text100: 'text-blue-100',
    text600: 'text-blue-600',
    text700: 'text-blue-700',
    ring100: 'focus:ring-blue-100',
    gradientHeader: 'bg-gradient-to-r from-blue-600 to-blue-700',
    gradientResult: 'bg-gradient-to-br from-blue-50 to-blue-100',
    accent: 'accent-blue-500',
  },
  green: {
    bg50: 'bg-green-50',
    bg100: 'bg-green-100',
    bg600: 'bg-green-600',
    bg700: 'bg-green-700',
    border200: 'border-green-200',
    border500: 'border-green-500',
    text100: 'text-green-100',
    text600: 'text-green-600',
    text700: 'text-green-700',
    ring100: 'focus:ring-green-100',
    gradientHeader: 'bg-gradient-to-r from-green-600 to-green-700',
    gradientResult: 'bg-gradient-to-br from-green-50 to-green-100',
    accent: 'accent-green-500',
  },
  yellow: {
    bg50: 'bg-yellow-50',
    bg100: 'bg-yellow-100',
    bg600: 'bg-yellow-600',
    bg700: 'bg-yellow-700',
    border200: 'border-yellow-200',
    border500: 'border-yellow-500',
    text100: 'text-yellow-100',
    text600: 'text-yellow-600',
    text700: 'text-yellow-700',
    ring100: 'focus:ring-yellow-100',
    gradientHeader: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    gradientResult: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    accent: 'accent-yellow-500',
  },
  red: {
    bg50: 'bg-red-50',
    bg100: 'bg-red-100',
    bg600: 'bg-red-600',
    bg700: 'bg-red-700',
    border200: 'border-red-200',
    border500: 'border-red-500',
    text100: 'text-red-100',
    text600: 'text-red-600',
    text700: 'text-red-700',
    ring100: 'focus:ring-red-100',
    gradientHeader: 'bg-gradient-to-r from-red-600 to-red-700',
    gradientResult: 'bg-gradient-to-br from-red-50 to-red-100',
    accent: 'accent-red-500',
  },
  purple: {
    bg50: 'bg-purple-50',
    bg100: 'bg-purple-100',
    bg600: 'bg-purple-600',
    bg700: 'bg-purple-700',
    border200: 'border-purple-200',
    border500: 'border-purple-500',
    text100: 'text-purple-100',
    text600: 'text-purple-600',
    text700: 'text-purple-700',
    ring100: 'focus:ring-purple-100',
    gradientHeader: 'bg-gradient-to-r from-purple-600 to-purple-700',
    gradientResult: 'bg-gradient-to-br from-purple-50 to-purple-100',
    accent: 'accent-purple-500',
  },
};

/**
 * Semantic color mappings (not theme-dependent)
 */
export const SEMANTIC_COLORS = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: 'text-amber-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-500',
  },
};

/**
 * Get color tokens for a specific theme color.
 */
export function getColorTokens(color: ThemeColor): ColorTokens {
  return COLOR_TOKENS[color];
}
