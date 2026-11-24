import type { HTMLAttributes, ReactNode } from 'react';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
  responsive?: {
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4;
  };
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

const COL_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const SM_COL_CLASSES = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

const MD_COL_CLASSES = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

const LG_COL_CLASSES = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

const GAP_CLASSES = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

export function Grid({
  cols,
  responsive,
  gap = 'md',
  children,
  className = '',
  ...props
}: GridProps) {
  const colClasses: string[] = ['grid'];

  if (cols) {
    colClasses.push(COL_CLASSES[cols]);
  } else if (responsive) {
    colClasses.push('grid-cols-1');
    if (responsive.sm) colClasses.push(SM_COL_CLASSES[responsive.sm]);
    if (responsive.md) colClasses.push(MD_COL_CLASSES[responsive.md]);
    if (responsive.lg) colClasses.push(LG_COL_CLASSES[responsive.lg]);
  } else {
    colClasses.push('grid-cols-1');
  }

  colClasses.push(GAP_CLASSES[gap]);

  return (
    <div className={`${colClasses.join(' ')} ${className}`} {...props}>
      {children}
    </div>
  );
}
