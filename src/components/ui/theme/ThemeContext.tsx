import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { COLOR_TOKENS, type ThemeColor, type ColorTokens } from './colors';

interface ThemeContextValue {
  /** Current theme color */
  color: ThemeColor;
  /** Color tokens for the current theme */
  tokens: ColorTokens;
  /** Update the theme color */
  setColor: (color: ThemeColor) => void;
  /** Get a specific token class */
  getToken: <K extends keyof ColorTokens>(key: K) => ColorTokens[K];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  /** Child components */
  children: ReactNode;
  /** Default theme color */
  defaultColor?: ThemeColor;
}

/**
 * ThemeProvider wraps calculator components to provide consistent theming.
 *
 * @example
 * ```tsx
 * <ThemeProvider defaultColor="blue">
 *   <CalculatorHeader title="My Calculator" />
 *   <Input variant="currency" />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, defaultColor = 'blue' }: ThemeProviderProps) {
  const [color, setColor] = useState<ThemeColor>(defaultColor);

  const value = useMemo<ThemeContextValue>(
    () => ({
      color,
      tokens: COLOR_TOKENS[color],
      setColor,
      getToken: (key) => COLOR_TOKENS[color][key],
    }),
    [color]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access the current theme context.
 * Must be used within a ThemeProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { tokens, color } = useTheme();
 *   return <div className={tokens.bg50}>Themed background</div>;
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context || !context.tokens) {
    // Return fallback values for SSR or when context is not properly initialized
    return {
      color: 'blue',
      tokens: COLOR_TOKENS['blue'],
      setColor: () => {},
      getToken: (key) => COLOR_TOKENS['blue'][key],
    };
  }
  return context;
}

/**
 * Hook to get just the color tokens (convenience wrapper).
 */
export function useThemeTokens(): ColorTokens {
  return useTheme().tokens;
}

export type { ThemeColor, ColorTokens };
