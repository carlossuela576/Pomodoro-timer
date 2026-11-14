export interface DurationParts {
  hours: number;
  minutes: number;
  seconds: number;
}

export function clampPart(value: number, max: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(max, Math.floor(value)));
}

export function toTotalSeconds(parts: DurationParts): number {
  const h = clampPart(parts.hours, 99);
  const m = clampPart(parts.minutes, 59);
  const s = clampPart(parts.seconds, 59);
  return h * 3600 + m * 60 + s;
}

export function fromTotalSeconds(totalSeconds: number): DurationParts {
  const safeTotal = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeTotal / 3600);
  const minutes = Math.floor((safeTotal % 3600) / 60);
  const seconds = safeTotal % 60;
  return { hours, minutes, seconds };
}

export function padTwo(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

export function formatHMS(totalSeconds: number): { hh: string; mm: string; ss: string } {
  const { hours, minutes, seconds } = fromTotalSeconds(totalSeconds);
  return {
    hh: padTwo(hours),
    mm: padTwo(minutes),
    ss: padTwo(seconds),
  };
}
