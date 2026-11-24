import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { COLOR_TOKENS, type ThemeColor, type ColorTokens } from './colors';

interface ThemeContextValue {
  color: ThemeColor;
  tokens: ColorTokens;
  setColor: (color: ThemeColor) => void;
  getToken: <K extends keyof ColorTokens>(key: K) => ColorTokens[K];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultColor?: ThemeColor;
}

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

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context || !context.tokens) {
    return {
      color: 'blue',
      tokens: COLOR_TOKENS['blue'],
      setColor: () => {},
      getToken: (key) => COLOR_TOKENS['blue'][key],
    };
  }
  return context;
}

export function useThemeTokens(): ColorTokens {
  return useTheme().tokens;
}

export type { ThemeColor, ColorTokens };
