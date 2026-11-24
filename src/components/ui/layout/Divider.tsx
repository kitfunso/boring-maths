import type { HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SPACING_CLASSES = {
  sm: 'my-4',
  md: 'my-6',
  lg: 'my-8',
};

export function Divider({ spacing = 'lg', className = '', ...props }: DividerProps) {
  return (
    <div
      className={`border-t border-white/10 ${SPACING_CLASSES[spacing]} ${className}`}
      role="separator"
      {...props}
    />
  );
}
