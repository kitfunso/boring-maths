import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

interface KeyboardShortcutsOptions {
  onCopy?: () => string | null;
  onReset?: () => void;
  calculatorName?: string;
}

interface ToastState {
  readonly message: string;
  readonly color: 'green' | 'blue';
}

interface KeyboardShortcutsState {
  readonly isHelpOpen: boolean;
  readonly toast: ToastState | null;
  readonly calculatorName: string;
  readonly dismissHelp: () => void;
  readonly dismissToast: () => void;
}

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
        if (helpTimerRef.current !== null) {
          clearTimeout(helpTimerRef.current);
          helpTimerRef.current = null;
        }
        return false;
      }
      helpTimerRef.current = setTimeout(() => {
        setIsHelpOpen(false);
        helpTimerRef.current = null;
      }, 8000);
      return true;
    });
  }, []);

  const showToast = useCallback((message: string, color: 'green' | 'blue') => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, color });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!onCopy) return;

    const text = onCopy();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'green');
    } catch {
    }
  }, [onCopy, showToast]);

  const resetCalculator = useCallback(() => {
    if (!onReset) return;

    onReset();
    showToast('Calculator reset!', 'blue');
  }, [onReset, showToast]);

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
