import { useState, useEffect } from 'preact/hooks';

/**
 * Debounce a value - returns the value after it stops changing for `delay` ms.
 * Useful for expensive calculations that shouldn't run on every keystroke.
 *
 * @example
 * const debouncedInputs = useDebounce(inputs, 150);
 * const result = useMemo(() => calculate(debouncedInputs), [debouncedInputs]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
