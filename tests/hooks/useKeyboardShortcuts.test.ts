import { render, fireEvent } from '@testing-library/preact';
import { h } from 'preact';
import { describe, it, expect, vi } from 'vitest';
import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts';

function KeyboardHarness({ onReset }: { onReset?: () => void }) {
  useKeyboardShortcuts({
    onCopy: () => 'copy me',
    onReset,
    calculatorName: 'Test Calculator',
  });

  return h('input', { 'aria-label': 'test-input' });
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
});
