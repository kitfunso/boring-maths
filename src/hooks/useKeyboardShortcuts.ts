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

const HELP_ID = 'keyboard-shortcuts-help';
const TOAST_CLASS = 'keyboard-shortcuts-toast';

function applyStyles(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

function createShortcutRow(label: string, shortcut: string): HTMLDivElement {
  const row = document.createElement('div');
  applyStyles(row, {
    display: 'flex',
    'justify-content': 'space-between',
    'align-items': 'center',
  });

  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;
  applyStyles(labelSpan, { color: '#c8c8d4' });

  const kbd = document.createElement('kbd');
  kbd.textContent = shortcut;
  applyStyles(kbd, {
    background: 'rgba(255,255,255,0.1)',
    padding: '4px 8px',
    'border-radius': '6px',
    'font-size': '12px',
    color: '#c4ff00',
  });

  row.appendChild(labelSpan);
  row.appendChild(kbd);
  return row;
}

function createToast(message: string, color: 'green' | 'blue'): HTMLDivElement {
  const toast = document.createElement('div');
  toast.className = TOAST_CLASS;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  applyStyles(toast, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background:
      color === 'green'
        ? 'linear-gradient(145deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.98) 100%)'
        : 'linear-gradient(145deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.98) 100%)',
    'border-radius': '12px',
    padding: '12px 20px',
    color: 'white',
    'font-family': "'Space Grotesk', system-ui, sans-serif",
    'font-size': '14px',
    'font-weight': '500',
    'z-index': '9999',
    'box-shadow': '0 10px 30px rgba(0,0,0,0.3)',
    display: 'flex',
    'align-items': 'center',
    gap: '8px',
  });

  const icon = document.createElement('span');
  icon.textContent = color === 'green' ? '✓' : '↻';
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);

  return toast;
}

function createHelpOverlay(calculatorName: string): HTMLDivElement {
  const help = document.createElement('div');
  help.id = HELP_ID;
  help.setAttribute('role', 'dialog');
  help.setAttribute('aria-label', 'Keyboard shortcuts');

  const panel = document.createElement('div');
  applyStyles(panel, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95) 0%, rgba(20, 20, 32, 0.98) 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    'border-radius': '16px',
    padding: '20px 24px',
    color: '#f5f2eb',
    'font-family': "'Space Grotesk', system-ui, sans-serif",
    'font-size': '14px',
    'z-index': '9999',
    'box-shadow': '0 20px 40px rgba(0,0,0,0.4)',
    'max-width': '300px',
    'backdrop-filter': 'blur(10px)',
  });

  const header = document.createElement('div');
  applyStyles(header, {
    display: 'flex',
    'justify-content': 'space-between',
    'align-items': 'center',
    'margin-bottom': '16px',
  });

  const title = document.createElement('span');
  title.textContent = '⌨️ Keyboard Shortcuts';
  applyStyles(title, {
    'font-weight': '600',
    color: '#c4ff00',
  });

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close');
  applyStyles(closeBtn, {
    background: 'none',
    border: 'none',
    color: '#9898a8',
    cursor: 'pointer',
    'font-size': '18px',
    padding: '0',
    'line-height': '1',
  });
  closeBtn.addEventListener('click', () => help.remove());

  header.appendChild(title);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  applyStyles(body, {
    display: 'flex',
    'flex-direction': 'column',
    gap: '12px',
  });

  body.appendChild(createShortcutRow('Copy results', 'Ctrl+C'));
  body.appendChild(createShortcutRow('Reset calculator', 'Ctrl+R'));
  body.appendChild(createShortcutRow('Toggle this help', '?'));

  const footer = document.createElement('div');
  footer.textContent = calculatorName;
  applyStyles(footer, {
    'margin-top': '16px',
    'padding-top': '12px',
    'border-top': '1px solid rgba(255,255,255,0.1)',
    color: '#9898a8',
    'font-size': '12px',
  });

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);
  help.appendChild(panel);

  return help;
}

/**
 * Add keyboard shortcuts to a calculator.
 */
export function useKeyboardShortcuts({
  onCopy,
  onReset,
  calculatorName = 'Calculator',
}: KeyboardShortcutsOptions = {}): void {
  const showHelp = useCallback(() => {
    const existing = document.getElementById(HELP_ID);
    if (existing) {
      existing.remove();
      return;
    }

    const help = createHelpOverlay(calculatorName);
    document.body.appendChild(help);

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
      const toast = createToast('Copied to clipboard!', 'green');
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [onCopy]);

  const resetCalculator = useCallback(() => {
    if (!onReset) return;

    onReset();

    const toast = createToast('Calculator reset!', 'blue');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }, [onReset]);

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
}

export default useKeyboardShortcuts;
