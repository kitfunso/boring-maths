import { render, screen, act } from '@testing-library/preact';
import { h } from 'preact';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { useLocalStorage } from '../../src/hooks/useLocalStorage';

function LocalStorageHarness() {
  const [value] = useLocalStorage('test-storage-key', 'initial-value');
  return h('div', null, value);
}

interface ObjectShape {
  a: number;
  b: string;
  regions: readonly string[];
}

function defaultObject(): ObjectShape {
  return { a: 1, b: 'default', regions: [] };
}

function ObjectHarness() {
  const [value] = useLocalStorage<ObjectShape>('test-object-key', defaultObject);
  return h('pre', null, JSON.stringify(value));
}

describe('useLocalStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('resets state to initial value when storage key is removed in another tab', () => {
    render(h(LocalStorageHarness, {}));
    expect(screen.getByText('initial-value')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test-storage-key',
          newValue: JSON.stringify('saved-value'),
        })
      );
    });

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

  describe('merging persisted state over defaults', () => {
    it('merges a payload missing a newer field in with the current default for that field', () => {
      // Simulates a schema evolution: 'regions' was added after this payload was saved.
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify({ a: 2, b: 'saved' }));

      render(h(ObjectHarness, {}));

      const value = JSON.parse(screen.getByText(/.+/).textContent ?? '{}') as ObjectShape;
      expect(value).toEqual({ a: 2, b: 'saved', regions: [] });
    });

    it('passes an extra unknown field on the stored payload through untouched', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify({ a: 2, b: 'saved', regions: ['Europe'], extra: 'kept' })
      );

      render(h(ObjectHarness, {}));

      const value = JSON.parse(screen.getByText(/.+/).textContent ?? '{}') as ObjectShape & {
        extra?: string;
      };
      expect(value).toEqual({ a: 2, b: 'saved', regions: ['Europe'], extra: 'kept' });
    });

    it('returns a non-object stored value as-is without attempting a merge', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(42));

      render(h(LocalStorageHarness, {}));

      // 'initial-value' is a string default; a stored number is not a plain
      // object, so no merge is attempted and the raw parsed value is used.
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('falls back to defaults when the stored JSON is corrupt', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('{not-valid-json');

      render(h(ObjectHarness, {}));

      const value = JSON.parse(screen.getByText(/.+/).textContent ?? '{}') as ObjectShape;
      expect(value).toEqual(defaultObject());
    });
  });
});
