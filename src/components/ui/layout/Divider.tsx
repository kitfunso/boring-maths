import type { HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Spacing around divider */
  spacing?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const SPACING_CLASSES = {
  sm: 'my-4',
  md: 'my-6',
  lg: 'my-8',
};

/**
 * Horizontal divider for separating content sections.
 *
 * @example
 * ```tsx
 * <div className="space-y-6">
 *   <InputSection />
 *   <Divider spacing="lg" />
 *   <ResultsSection />
 * </div>
 * ```
 */
export function Divider({ spacing = 'lg', className = '', ...props }: DividerProps) {
  return (
    <div
      className={`border-t border-gray-200 ${SPACING_CLASSES[spacing]} ${className}`}
      role="separator"
      {...props}
    />
  );
}
