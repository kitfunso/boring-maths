import { render, screen, act } from '@testing-library/preact';
import { h } from 'preact';
import { describe, it, expect } from 'vitest';
import { useLocalStorage } from '../../src/hooks/useLocalStorage';

function LocalStorageHarness() {
  const [value] = useLocalStorage('test-storage-key', 'initial-value');
  return h('div', null, value);
}

describe('useLocalStorage', () => {
  it('resets state to initial value when storage key is removed in another tab', () => {
    localStorage.getItem = () => JSON.stringify('saved-value');

    render(h(LocalStorageHarness, {}));
    expect(screen.getByText('saved-value')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test-storage-key',
          newValue: null,
        })
      );
    });

    expect(screen.getByText('initial-value')).toBeInTheDocument();
  });
});
