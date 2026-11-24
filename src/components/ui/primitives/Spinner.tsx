export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ring' | 'dots' | 'pulse' | 'bars';
  color?: string;
  className?: string;
}

const SIZES = {
  sm: { ring: 16, dot: 6, bar: 12 },
  md: { ring: 20, dot: 8, bar: 16 },
  lg: { ring: 28, dot: 10, bar: 20 },
};

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
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity="0.15"
      />
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
