import React, { useId, useState } from 'react';
import { clampPart, DurationParts, padTwo } from '../utils/time';

interface DurationInputProps {
  label: string;
  value: DurationParts;
  disabled?: boolean;
  onChange: (next: DurationParts) => void;
}

interface TimeSegmentInputProps {
  id: string;
  unitLabel: string;
  ariaLabel: string;
  value: number;
  max: number;
  disabled: boolean;
  onCommit: (nextValue: number) => void;
}

const TimeSegmentInput: React.FC<TimeSegmentInputProps> = ({
  id,
  unitLabel,
  ariaLabel,
  value,
  max,
  disabled,
  onCommit,
}) => {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    setDraft(String(value));
    e.currentTarget.select();
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = draft === '' ? 0 : clampPart(Number(draft), max);
    onCommit(parsed);
    setDraft('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDraft(digits);
    const parsed = digits === '' ? 0 : clampPart(Number(digits), max);
    onCommit(parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = value >= max ? 0 : value + 1;
      setDraft(String(next));
      onCommit(next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = value <= 0 ? max : value - 1;
      setDraft(String(next));
      onCommit(next);
    } else if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        disabled={disabled}
        aria-label={ariaLabel}
        value={focused ? draft : padTwo(value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full min-h-[48px] rounded-xl bg-[#2B2B2B] border border-[#D9D9D9]/15 text-center text-base sm:text-lg font-semibold tabular-nums text-[#D9D9D9] transition-colors duration-150 hover:border-[#D9D9D9]/35 focus:border-[#D9D9D9] focus:bg-[#303030] disabled:cursor-not-allowed"
      />
      <label
        htmlFor={id}
        className="text-[11px] font-medium text-[#D9D9D9]/55 select-none"
      >
        {unitLabel}
      </label>
    </div>
  );
};

export const DurationInput: React.FC<DurationInputProps> = ({
  label,
  value,
  disabled = false,
  onChange,
}) => {
  const groupId = useId();

  return (
    <fieldset
      disabled={disabled}
      aria-labelledby={`${groupId}-legend`}
      className={`flex flex-col gap-2.5 transition-opacity duration-150 ${
        disabled ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <legend
        id={`${groupId}-legend`}
        className="text-xs font-medium tracking-wide text-[#D9D9D9]/75"
      >
        {label}
      </legend>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <TimeSegmentInput
          id={`${groupId}-hh`}
          unitLabel="HH"
          ariaLabel={`${label} hours`}
          value={value.hours}
          max={99}
          disabled={disabled}
          onCommit={(hours) => onChange({ ...value, hours })}
        />

        <span
          aria-hidden="true"
          className="text-lg font-semibold text-[#D9D9D9]/45 pb-5 select-none"
        >
          :
        </span>

        <TimeSegmentInput
          id={`${groupId}-mm`}
          unitLabel="MM"
          ariaLabel={`${label} minutes`}
          value={value.minutes}
          max={59}
          disabled={disabled}
          onCommit={(minutes) => onChange({ ...value, minutes })}
        />

        <span
          aria-hidden="true"
          className="text-lg font-semibold text-[#D9D9D9]/45 pb-5 select-none"
        >
          :
        </span>

        <TimeSegmentInput
          id={`${groupId}-ss`}
          unitLabel="SS"
          ariaLabel={`${label} seconds`}
          value={value.seconds}
          max={59}
          disabled={disabled}
          onCommit={(seconds) => onChange({ ...value, seconds })}
        />
      </div>
    </fieldset>
  );
};
