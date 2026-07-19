/**
 * Toggle primitive - regression tests
 *
 * Locks two production bugs fixed on 2026-07-19:
 * 1. Label clicks fired the change handler twice (label onClick + native
 *    htmlFor forwarding), flipping the toggle on and straight back off.
 * 2. The checked track referenced nonexistent theme tokens (bg500/ring500),
 *    rendering literal "undefined" classes and a colourless ON state.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { Toggle } from '../../src/components/ui/primitives/Toggle';
import { ThemeProvider } from '../../src/components/ui/theme/ThemeContext';

function renderToggle(props: Partial<Parameters<typeof Toggle>[0]> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <ThemeProvider defaultColor="blue">
      <Toggle checked={false} onChange={onChange} label="Test toggle" {...props} />
    </ThemeProvider>
  );
  return { onChange, ...utils };
}

describe('Toggle', () => {
  it('clicking the label fires onChange exactly once', () => {
    const { onChange, getByText } = renderToggle();
    fireEvent.click(getByText('Test toggle'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('clicking the switch fires onChange exactly once', () => {
    const { onChange, getByRole } = renderToggle();
    fireEvent.click(getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('checked track carries a real theme colour class, never "undefined"', () => {
    const { getByRole } = renderToggle({ checked: true });
    const className = getByRole('switch').className;
    expect(className).not.toContain('undefined');
    expect(className).toContain('bg-blue-600');
  });

  it('unchecked track uses the neutral style and no "undefined" classes', () => {
    const { getByRole } = renderToggle();
    const className = getByRole('switch').className;
    expect(className).not.toContain('undefined');
    expect(className).toContain('bg-white/20');
  });

  it('carries a visible focus ring class in both states (WCAG 2.4.7)', () => {
    const unchecked = renderToggle();
    expect(unchecked.getByRole('switch').className).toContain('focus:ring-white/80');
    unchecked.unmount();
    const checked = renderToggle({ checked: true });
    expect(checked.getByRole('switch').className).toContain('focus:ring-white/80');
  });

  it('does not fire when disabled (switch and label)', () => {
    const { onChange, getByRole, getByText } = renderToggle({ disabled: true });
    fireEvent.click(getByRole('switch'));
    fireEvent.click(getByText('Test toggle'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('space and enter keys toggle once each', () => {
    const { onChange, getByRole } = renderToggle();
    fireEvent.keyDown(getByRole('switch'), { key: ' ' });
    fireEvent.keyDown(getByRole('switch'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
