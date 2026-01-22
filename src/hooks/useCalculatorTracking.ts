/**
 * useCalculatorTracking Hook
 *
 * Tracks calculator usage for analytics.
 * Fires once per session to avoid spamming analytics.
 */

import { useEffect, useRef } from 'preact/hooks';

/**
 * Track calculator usage when the user interacts with the calculator.
 * Fires once per calculator per session.
 *
 * @param calculatorName - Display name of the calculator (e.g., "Tip Calculator")
 * @param hasInteracted - Whether the user has changed any inputs (optional, defaults to true)
 */
export function useCalculatorTracking(calculatorName: string, hasInteracted: boolean = true): void {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per session and when user has interacted
    if (hasTracked.current || !hasInteracted) return;

    // Small delay to ensure the page has loaded and analytics is ready
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.trackCalculatorUse === 'function') {
        window.trackCalculatorUse(calculatorName);
        hasTracked.current = true;
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [calculatorName, hasInteracted]);
}

// Type declaration for the global tracking function
declare global {
  interface Window {
    trackCalculatorUse?: (calculatorName: string) => void;
    trackEvent?: (eventName: string, params: Record<string, unknown>) => void;
    trackAffiliateClick?: (partner: string, calculator: string, position?: string) => void;
  }
}

export default useCalculatorTracking;
