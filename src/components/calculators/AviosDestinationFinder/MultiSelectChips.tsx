/**
 * MultiSelectChips - toggleable chip group for multi-select filters.
 * Empty selection means "all" by convention of this calculator.
 * Local to this calculator per YAGNI - promote to ui/ only when a second
 * calculator needs it.
 */
import { useTheme } from '../../ui/theme/ThemeContext';

interface ChipOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface MultiSelectChipsProps<T extends string> {
  readonly options: readonly ChipOption<T>[];
  readonly selected: readonly T[];
  readonly onChange: (next: T[]) => void;
  readonly ariaLabel: string;
}

export default function MultiSelectChips<T extends string>({
  options,
  selected,
  onChange,
  ariaLabel,
}: MultiSelectChipsProps<T>) {
  const { tokens } = useTheme();

  const toggle = (value: T) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 ${tokens.ring100} ${
              active
                ? `${tokens.bg600} text-white`
                : 'bg-white/5 text-[var(--color-muted)] hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
