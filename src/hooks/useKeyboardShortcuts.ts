/**
 * useKeyboardShortcuts Hook
 *
 * Pure logic hook for keyboard shortcut registration and handling.
 * No DOM manipulation -- UI rendering is handled by KeyboardShortcutOverlay.
 *
 * Shortcuts:
 * - Ctrl/Cmd + C: Copy results to clipboard (when no text selected)
 * - Ctrl/Cmd + R: Reset calculator (prevented default refresh)
 * - ?: Show keyboard shortcuts help
 */

import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

interface KeyboardShortcutsOptions {
  /** Function to get the result text to copy */
  onCopy?: () => string | null;
  /** Function to reset the calculator */
  onReset?: () => void;
  /** Calculator name for the help tooltip */
  calculatorName?: string;
}

interface ToastState {
  readonly message: string;
  readonly color: 'green' | 'blue';
}

interface KeyboardShortcutsState {
  /** Whether the help overlay is currently visible */
  readonly isHelpOpen: boolean;
  /** Current toast notification, or null if none */
  readonly toast: ToastState | null;
  /** Calculator name passed through for the overlay */
  readonly calculatorName: string;
  /** Dismiss the help overlay */
  readonly dismissHelp: () => void;
  /** Dismiss the toast notification */
  readonly dismissToast: () => void;
}

/**
 * Register keyboard shortcuts for a calculator.
 * Returns state for the UI layer to render overlay and toast components.
 */
export function useKeyboardShortcuts({
  onCopy,
  onReset,
  calculatorName = 'Calculator',
}: KeyboardShortcutsOptions = {}): KeyboardShortcutsState {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const helpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissHelp = useCallback(() => {
    setIsHelpOpen(false);
    if (helpTimerRef.current !== null) {
      clearTimeout(helpTimerRef.current);
      helpTimerRef.current = null;
    }
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showHelp = useCallback(() => {
    setIsHelpOpen((prev) => {
      if (prev) {
        // Closing: clear any pending auto-dismiss
        if (helpTimerRef.current !== null) {
          clearTimeout(helpTimerRef.current);
          helpTimerRef.current = null;
        }
        return false;
      }
      // Opening: auto-dismiss after 8s
      helpTimerRef.current = setTimeout(() => {
        setIsHelpOpen(false);
        helpTimerRef.current = null;
      }, 8000);
      return true;
    });
  }, []);

  const showToast = useCallback(
    (message: string, color: 'green' | 'blue') => {
      // Clear any existing toast timer
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
      setToast({ message, color });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, 2000);
    },
    []
  );

  const copyToClipboard = useCallback(async () => {
    if (!onCopy) return;

    const text = onCopy();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'green');
    } catch {
      // Clipboard API not available
    }
  }, [onCopy, showToast]);

  const resetCalculator = useCallback(() => {
    if (!onReset) return;

    onReset();
    showToast('Calculator reset!', 'blue');
  }, [onReset, showToast]);

  // Register keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'r') {
          return;
        }
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        showHelp();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          e.preventDefault();
          copyToClipboard();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        if (!onReset) return;
        e.preventDefault();
        resetCalculator();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showHelp, copyToClipboard, resetCalculator, onReset]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (helpTimerRef.current !== null) clearTimeout(helpTimerRef.current);
      if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return {
    isHelpOpen,
    toast,
    calculatorName,
    dismissHelp,
    dismissToast,
  };
}

export type { KeyboardShortcutsOptions, KeyboardShortcutsState, ToastState };
export default useKeyboardShortcuts;
