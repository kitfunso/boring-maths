import { render, fireEvent, screen } from '@testing-library/preact';
import { h } from 'preact';
import { describe, it, expect, vi } from 'vitest';
import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts';
import KeyboardShortcutOverlay from '../../src/components/ui/KeyboardShortcutOverlay';

function KeyboardHarness({ onReset }: { onReset?: () => void }) {
  const state = useKeyboardShortcuts({
    onCopy: () => 'copy me',
    onReset,
    calculatorName: 'Test Calculator',
  });

  return h('div', null, h('input', { 'aria-label': 'test-input' }), h(KeyboardShortcutOverlay, state));
}

describe('useKeyboardShortcuts', () => {
  it('does not block Ctrl/Cmd+R when onReset is not provided', () => {
    const preventDefault = vi.fn();
    render(h(KeyboardHarness, {}));

    fireEvent.keyDown(document, {
      key: 'r',
      ctrlKey: true,
      preventDefault,
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('shows help overlay with safe text content', () => {
    render(h(KeyboardHarness, {}));

    fireEvent.keyDown(document, {
      key: '?',
    });

    const help = document.getElementById('keyboard-shortcuts-help');
    expect(help).toBeTruthy();
    expect(help?.textContent).toContain('Test Calculator');
  });

  it('toggles help overlay off on second press', () => {
    render(h(KeyboardHarness, {}));

    fireEvent.keyDown(document, { key: '?' });
    expect(document.getElementById('keyboard-shortcuts-help')).toBeTruthy();

    fireEvent.keyDown(document, { key: '?' });
    expect(document.getElementById('keyboard-shortcuts-help')).toBeFalsy();
  });

  it('calls onReset and shows toast on Ctrl+R', () => {
    const onReset = vi.fn();
    render(h(KeyboardHarness, { onReset }));

    fireEvent.keyDown(document, {
      key: 'r',
      ctrlKey: true,
    });

    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByText('Calculator reset!')).toBeTruthy();
  });

  it('renders shortcut rows in help panel', () => {
    render(h(KeyboardHarness, {}));

    fireEvent.keyDown(document, { key: '?' });

    expect(screen.getByText('Copy results')).toBeTruthy();
    expect(screen.getByText('Reset calculator')).toBeTruthy();
    expect(screen.getByText('Toggle this help')).toBeTruthy();
  });
});
