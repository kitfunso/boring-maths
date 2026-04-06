/**
 * useCalculatorBase Hook
 *
 * Consolidates the common boilerplate shared across all calculator components:
 * - Calculator usage tracking (useCalculatorTracking)
 * - Input state with localStorage persistence (useLocalStorage)
 * - Memoized result computation
 * - Generic updateInput helper for single-field updates
 *
 * For calculators that previously used plain useState (no persistence),
 * use useCalculatorState instead — same API but without localStorage or tracking.
 *
 * @example
 * const { inputs, result, updateInput, setInputs } = useCalculatorBase<MyInputs, MyResult>({
 *   name: 'My Calculator',
 *   slug: 'calc-my-inputs',
 *   defaults: getDefaultInputs,
 *   compute: calculateMyResult,
 * });
 */

import { useState, useMemo, useCallback } from 'preact/hooks';
import { useLocalStorage } from './useLocalStorage';
import { useCalculatorTracking } from './useCalculatorTracking';

interface UseCalculatorBaseOptions<TInputs, TResult> {
  /** Display name passed to analytics tracking. */
  readonly name: string;
  /** localStorage key for persisting inputs across sessions. */
  readonly slug: string;
  /** Default input values. Can be a value or a factory function. */
  readonly defaults: TInputs | (() => TInputs);
  /** Pure function that computes results from the current inputs. */
  readonly compute: (inputs: TInputs) => TResult;
}

interface UseCalculatorReturn<TInputs, TResult> {
  /** Current input values. */
  readonly inputs: TInputs;
  /** Memoized computation result derived from inputs. */
  readonly result: TResult;
  /** Update a single input field by key. */
  readonly updateInput: <K extends keyof TInputs>(field: K, value: TInputs[K]) => void;
  /** Full state setter for bulk updates (unit conversions, currency changes, etc.). */
  readonly setInputs: (value: TInputs | ((prev: TInputs) => TInputs)) => void;
}

/**
 * Full calculator hook with localStorage persistence and analytics tracking.
 * Use for calculators that previously used useLocalStorage + useCalculatorTracking.
 */
export function useCalculatorBase<TInputs, TResult>(
  options: UseCalculatorBaseOptions<TInputs, TResult>
): UseCalculatorReturn<TInputs, TResult> {
  const { name, slug, defaults, compute } = options;

  useCalculatorTracking(name);

  const [inputs, setInputs] = useLocalStorage<TInputs>(slug, defaults);

  const result = useMemo(() => compute(inputs), [inputs]);

  const updateInput = useCallback(
    <K extends keyof TInputs>(field: K, value: TInputs[K]): void => {
      setInputs((prev) => ({ ...prev, [field]: value }));
    },
    [setInputs]
  );

  return { inputs, result, updateInput, setInputs };
}

interface UseCalculatorStateOptions<TInputs, TResult> {
  /** Display name passed to analytics tracking. Omit to skip tracking. */
  readonly name?: string;
  /** Default input values. Can be a value or a factory function. */
  readonly defaults: TInputs | (() => TInputs);
  /** Pure function that computes results from the current inputs. */
  readonly compute: (inputs: TInputs) => TResult;
}

/**
 * Lightweight calculator hook with plain useState (no localStorage).
 * Use for calculators that previously used useState without persistence.
 * Optionally tracks usage if name is provided.
 */
export function useCalculatorState<TInputs, TResult>(
  options: UseCalculatorStateOptions<TInputs, TResult>
): UseCalculatorReturn<TInputs, TResult> {
  const { name, defaults, compute } = options;

  useCalculatorTracking(name ?? '', !!name);

  const [inputs, setInputs] = useState<TInputs>(defaults);

  const result = useMemo(() => compute(inputs), [inputs]);

  const updateInput = useCallback(
    <K extends keyof TInputs>(field: K, value: TInputs[K]): void => {
      setInputs((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return { inputs, result, updateInput, setInputs };
}

export type { UseCalculatorBaseOptions, UseCalculatorStateOptions, UseCalculatorReturn };

export default useCalculatorBase;
