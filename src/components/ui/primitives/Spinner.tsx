export interface SpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';
  /** Spinner variant */
  variant?: 'ring' | 'dots' | 'pulse' | 'bars';
  /** Custom color (defaults to current text color) */
  color?: string;
  /** Additional class names */
  className?: string;
}

const SIZES = {
  sm: { ring: 16, dot: 6, bar: 12 },
  md: { ring: 20, dot: 8, bar: 16 },
  lg: { ring: 28, dot: 10, bar: 20 },
};

/**
 * Modern spinner component with multiple variants.
 * Uses global CSS animations from global.css for better performance.
 *
 * Variants:
 * - ring: Clean spinning arc (default)
 * - dots: Three bouncing dots
 * - bars: Four animated bars
 * - pulse: Expanding pulse rings
 *
 * @example
 * ```tsx
 * <Spinner /> // Default ring spinner
 * <Spinner variant="dots" size="lg" />
 * <Spinner variant="bars" />
 * ```
 */
export function Spinner({ size = 'md', variant = 'ring', color, className = '' }: SpinnerProps) {
  const sizeConfig = SIZES[size];
  const colorStyle = color ? { color } : undefined;

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-1 ${className}`} style={colorStyle}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="rounded-full bg-current"
            style={{
              width: sizeConfig.dot,
              height: sizeConfig.dot,
              animation: `spinner-bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div
        className={`flex items-end gap-0.5 ${className}`}
        style={{ height: sizeConfig.bar, ...colorStyle }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-0.5 rounded-full bg-current"
            style={{
              animation: `spinner-bars 1.2s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div
        className={`relative ${className}`}
        style={{ width: sizeConfig.ring, height: sizeConfig.ring, ...colorStyle }}
      >
        <span
          className="absolute inset-0 rounded-full bg-current"
          style={{ animation: 'spinner-pulse 1.5s ease-in-out infinite' }}
        />
        <span
          className="absolute inset-0 rounded-full bg-current"
          style={{ animation: 'spinner-pulse 1.5s ease-in-out 0.5s infinite' }}
        />
      </div>
    );
  }

  // Default: Modern ring spinner
  const ringSize = sizeConfig.ring;
  const strokeWidth = size === 'sm' ? 2 : size === 'md' ? 2.5 : 3;

  return (
    <svg
      className={className}
      width={ringSize}
      height={ringSize}
      viewBox="0 0 24 24"
      fill="none"
      style={colorStyle}
    >
      {/* Background track */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity="0.15"
      />
      {/* Animated arc */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="32 32"
        style={{
          animation: 'spinner-rotate 1s linear infinite',
          transformOrigin: 'center',
        }}
      />
    </svg>
  );
}

export default Spinner;
