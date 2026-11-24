export interface DataExportIndicatorProps {
  visible: boolean;
  className?: string;
}

export function DataExportIndicator({ visible, className = '' }: DataExportIndicatorProps) {
  if (!visible) return null;

  return (
    <div
      className={`flex items-center gap-2 text-xs text-emerald-400 animate-pulse ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>Saved for other calculators</span>
    </div>
  );
}
