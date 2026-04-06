/**
 * KeyboardShortcutOverlay Component
 *
 * Renders the keyboard shortcuts help panel and toast notifications.
 * Consumes state from useKeyboardShortcuts hook -- no shortcut logic lives here.
 */

import type { KeyboardShortcutsState } from '../../hooks/useKeyboardShortcuts';

interface ShortcutRowProps {
  readonly label: string;
  readonly shortcut: string;
}

function ShortcutRow({ label, shortcut }: ShortcutRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#c8c8d4' }}>{label}</span>
      <kbd
        style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#c4ff00',
        }}
      >
        {shortcut}
      </kbd>
    </div>
  );
}

interface ToastProps {
  readonly message: string;
  readonly color: 'green' | 'blue';
}

const TOAST_GRADIENTS = {
  green:
    'linear-gradient(145deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.98) 100%)',
  blue:
    'linear-gradient(145deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.98) 100%)',
} as const;

const TOAST_ICONS = {
  green: '\u2713',
  blue: '\u21BB',
} as const;

function Toast({ message, color }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="keyboard-shortcuts-toast"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: TOAST_GRADIENTS[color],
        borderRadius: '12px',
        padding: '12px 20px',
        color: 'white',
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 9999,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span aria-hidden="true">{TOAST_ICONS[color]}</span>
      <span>{message}</span>
    </div>
  );
}

interface HelpPanelProps {
  readonly calculatorName: string;
  readonly onClose: () => void;
}

function HelpPanel({ calculatorName, onClose }: HelpPanelProps) {
  return (
    <div
      id="keyboard-shortcuts-help"
      role="dialog"
      aria-label="Keyboard shortcuts"
    >
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background:
            'linear-gradient(145deg, rgba(30, 30, 46, 0.95) 0%, rgba(20, 20, 32, 0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '20px 24px',
          color: '#f5f2eb',
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: '14px',
          zIndex: 9999,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          maxWidth: '300px',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontWeight: '600', color: '#c4ff00' }}>
            {'\u2328\uFE0F'} Keyboard Shortcuts
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9898a8',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              lineHeight: '1',
            }}
          >
            {'\u00D7'}
          </button>
        </div>

        {/* Shortcut list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ShortcutRow label="Copy results" shortcut="Ctrl+C" />
          <ShortcutRow label="Reset calculator" shortcut="Ctrl+R" />
          <ShortcutRow label="Toggle this help" shortcut="?" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: '#9898a8',
            fontSize: '12px',
          }}
        >
          {calculatorName}
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the keyboard shortcuts help overlay and toast notifications.
 *
 * @example
 * ```tsx
 * const shortcutState = useKeyboardShortcuts({ onCopy, onReset, calculatorName: 'BMI' });
 * return (
 *   <div>
 *     {/* calculator UI *\/}
 *     <KeyboardShortcutOverlay {...shortcutState} />
 *   </div>
 * );
 * ```
 */
export default function KeyboardShortcutOverlay({
  isHelpOpen,
  toast,
  calculatorName,
  dismissHelp,
}: KeyboardShortcutsState) {
  return (
    <>
      {isHelpOpen && (
        <HelpPanel calculatorName={calculatorName} onClose={dismissHelp} />
      )}
      {toast !== null && <Toast message={toast.message} color={toast.color} />}
    </>
  );
}

export type { ShortcutRowProps, ToastProps, HelpPanelProps };
