import { useState, useMemo, useCallback } from 'preact/hooks';
import { useLocalStorage } from './useLocalStorage';

interface UseCalculatorBaseOptions<TInputs, TResult> {
  readonly slug: string;
  readonly defaults: TInputs | (() => TInputs);
  readonly compute: (inputs: TInputs) => TResult;
}

interface UseCalculatorReturn<TInputs, TResult> {
  readonly inputs: TInputs;
  readonly result: TResult;
  readonly updateInput: <K extends keyof TInputs>(field: K, value: TInputs[K]) => void;
  readonly setInputs: (value: TInputs | ((prev: TInputs) => TInputs)) => void;
}

export function useCalculatorBase<TInputs, TResult>(
  options: UseCalculatorBaseOptions<TInputs, TResult>
): UseCalculatorReturn<TInputs, TResult> {
  const { slug, defaults, compute } = options;

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
  readonly defaults: TInputs | (() => TInputs);
  readonly compute: (inputs: TInputs) => TResult;
}

export function useCalculatorState<TInputs, TResult>(
  options: UseCalculatorStateOptions<TInputs, TResult>
): UseCalculatorReturn<TInputs, TResult> {
  const { defaults, compute } = options;

  const [inputs, setInputs] = useState<TInputs>(defaults);

  const result = useMemo(() => compute(inputs), [inputs]);

  const updateInput = useCallback(<K extends keyof TInputs>(field: K, value: TInputs[K]): void => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  return { inputs, result, updateInput, setInputs };
}

export type { UseCalculatorBaseOptions, UseCalculatorStateOptions, UseCalculatorReturn };

export default useCalculatorBase;
