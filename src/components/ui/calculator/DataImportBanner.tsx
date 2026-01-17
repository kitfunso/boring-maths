/**
 * DataImportBanner Component
 *
 * Shows when data from another calculator is available for import.
 * Allows users to accept or dismiss the import prompt.
 */

import type { AvailableImport } from '../../../lib/sharedData';
import { formatTimeAgo } from '../../../lib/sharedData';

export interface DataImportBannerProps {
  /** Available data that can be imported */
  availableImports: AvailableImport[];
  /** Callback when user accepts all imports */
  onImportAll: () => void;
  /** Callback when user dismisses the banner */
  onDismiss: () => void;
  /** Optional formatter for displaying values */
  formatValue?: (key: string, value: unknown) => string;
  /** Additional class names */
  className?: string;
}

/**
 * Banner component prompting users to import data from other calculators.
 *
 * @example
 * ```tsx
 * {sharedData.showImportBanner && (
 *   <DataImportBanner
 *     availableImports={sharedData.availableImports}
 *     onImportAll={sharedData.importAll}
 *     onDismiss={sharedData.dismissImportBanner}
 *     formatValue={(key, value) => {
 *       if (key === 'annualIncome') return formatCurrency(value, 'USD');
 *       return String(value);
 *     }}
 *   />
 * )}
 * ```
 */
export function DataImportBanner({
  availableImports,
  onImportAll,
  onDismiss,
  formatValue,
  className = '',
}: DataImportBannerProps) {
  if (availableImports.length === 0) return null;

  const firstEntry = availableImports[0].entry;
  const sourceCalculator = firstEntry.sourceName;
  const timeAgo = formatTimeAgo(firstEntry.savedAt);

  // Determine what to show based on number of imports
  const isSingleImport = availableImports.length === 1;

  return (
    <div
      className={`bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-xl p-4 mb-6 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Lightning bolt icon */}
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-[var(--color-accent)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-cream)]">
            Use data from {sourceCalculator}?
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            {isSingleImport ? (
              <>
                {availableImports[0].friendlyLabel}:{' '}
                <span className="text-[var(--color-subtle)]">
                  {formatValue
                    ? formatValue(availableImports[0].sharedKey, availableImports[0].entry.value)
                    : String(availableImports[0].entry.value)}
                </span>{' '}
                saved {timeAgo}
              </>
            ) : (
              <>
                {availableImports.length} values available from {timeAgo}
              </>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onImportAll}
            className="px-3 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-[var(--color-night)] rounded-lg hover:opacity-90 transition-opacity"
          >
            Use {isSingleImport ? 'Value' : 'Values'}
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-cream)] transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
