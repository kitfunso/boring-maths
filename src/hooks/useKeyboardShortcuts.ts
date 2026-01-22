/**
 * useKeyboardShortcuts Hook
 *
 * Adds keyboard shortcuts for calculator power users.
 * - Ctrl/Cmd + C: Copy results to clipboard
 * - Ctrl/Cmd + R: Reset calculator (prevented default refresh)
 * - ?: Show keyboard shortcuts help
 */

import { useEffect, useCallback } from 'preact/hooks';

interface KeyboardShortcutsOptions {
  /** Function to get the result text to copy */
  onCopy?: () => string | null;
  /** Function to reset the calculator */
  onReset?: () => void;
  /** Calculator name for the help tooltip */
  calculatorName?: string;
}

/**
 * Add keyboard shortcuts to a calculator.
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   onCopy: () => `Result: ${result.total}`,
 *   onReset: () => setInputs(getDefaultInputs()),
 *   calculatorName: 'Tip Calculator'
 * });
 * ```
 */
export function useKeyboardShortcuts({
  onCopy,
  onReset,
  calculatorName = 'Calculator',
}: KeyboardShortcutsOptions = {}): void {
  const showHelp = useCallback(() => {
    // Create and show a toast-style help overlay
    const existing = document.getElementById('keyboard-shortcuts-help');
    if (existing) {
      existing.remove();
      return;
    }

    const help = document.createElement('div');
    help.id = 'keyboard-shortcuts-help';
    help.setAttribute('role', 'dialog');
    help.setAttribute('aria-label', 'Keyboard shortcuts');
    help.innerHTML = `
      <div style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: linear-gradient(145deg, rgba(30, 30, 46, 0.95) 0%, rgba(20, 20, 32, 0.98) 100%);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 20px 24px;
        color: #f5f2eb;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        max-width: 300px;
        backdrop-filter: blur(10px);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="font-weight: 600; color: #c4ff00;">⌨️ Keyboard Shortcuts</span>
          <button onclick="this.closest('#keyboard-shortcuts-help').remove()" style="
            background: none;
            border: none;
            color: #9898a8;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            line-height: 1;
          " aria-label="Close">×</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #c8c8d4;">Copy results</span>
            <kbd style="
              background: rgba(255,255,255,0.1);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              color: #c4ff00;
            ">Ctrl+C</kbd>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #c8c8d4;">Reset calculator</span>
            <kbd style="
              background: rgba(255,255,255,0.1);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              color: #c4ff00;
            ">Ctrl+R</kbd>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #c8c8d4;">Toggle this help</span>
            <kbd style="
              background: rgba(255,255,255,0.1);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              color: #c4ff00;
            ">?</kbd>
          </div>
        </div>
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); color: #9898a8; font-size: 12px;">
          ${calculatorName}
        </div>
      </div>
    `;
    document.body.appendChild(help);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      help.remove();
    }, 8000);
  }, [calculatorName]);

  const copyToClipboard = useCallback(async () => {
    if (!onCopy) return;

    const text = onCopy();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      // Show toast notification
      const toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.innerHTML = `
        <div style="
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(145deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.98) 100%);
          border-radius: 12px;
          padding: 12px 20px;
          color: white;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          z-index: 9999;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Copied to clipboard!
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [onCopy]);

  const resetCalculator = useCallback(() => {
    if (!onReset) return;

    onReset();

    // Show toast notification
    const toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <div style="
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(145deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.98) 100%);
        border-radius: 12px;
        padding: 12px 20px;
        color: white;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        Calculator reset!
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }, [onReset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Ctrl+R even in inputs
        if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'r') {
          return;
        }
      }

      // ? - Show help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        showHelp();
        return;
      }

      // Ctrl/Cmd + C - Copy (only when nothing is selected)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          e.preventDefault();
          copyToClipboard();
        }
        return;
      }

      // Ctrl/Cmd + R - Reset (prevent browser refresh)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetCalculator();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showHelp, copyToClipboard, resetCalculator]);
}

export default useKeyboardShortcuts;
