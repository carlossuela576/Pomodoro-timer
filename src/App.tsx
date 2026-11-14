import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { DurationInput } from './components/DurationInput';
import { SessionMode, TimerNotification } from './components/TimerNotification';
import { playCompletionChime } from './utils/sound';
import { DurationParts, formatHMS, toTotalSeconds } from './utils/time';

const DEFAULT_WORK: DurationParts = { hours: 0, minutes: 25, seconds: 0 };
const DEFAULT_BREAK: DurationParts = { hours: 0, minutes: 5, seconds: 0 };
const STORAGE_KEY = 'minimal_pomodoro_settings_v1';

interface StoredSettings {
  workDuration: DurationParts;
  breakDuration: DurationParts;
  soundEnabled: boolean;
}

function loadSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        workDuration: DEFAULT_WORK,
        breakDuration: DEFAULT_BREAK,
        soundEnabled: true,
      };
    }
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    return {
      workDuration: parsed.workDuration ?? DEFAULT_WORK,
      breakDuration: parsed.breakDuration ?? DEFAULT_BREAK,
      soundEnabled: parsed.soundEnabled ?? true,
    };
  } catch {
    return {
      workDuration: DEFAULT_WORK,
      breakDuration: DEFAULT_BREAK,
      soundEnabled: true,
    };
  }
}

export default function App() {
  const initialSettings = useRef<StoredSettings>(loadSettings()).current;

  const [mode, setMode] = useState<SessionMode>('work');
  const [workDuration, setWorkDuration] = useState<DurationParts>(initialSettings.workDuration);
  const [breakDuration, setBreakDuration] = useState<DurationParts>(initialSettings.breakDuration);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialSettings.soundEnabled);

  const activeDurationSeconds =
    mode === 'work' ? toTotalSeconds(workDuration) : toTotalSeconds(breakDuration);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    toTotalSeconds(initialSettings.workDuration)
  );
  const [sessionTotalSeconds, setSessionTotalSeconds] = useState<number>(
    toTotalSeconds(initialSettings.workDuration)
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [completedMode, setCompletedMode] = useState<SessionMode | null>(null);

  const endTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const payload: StoredSettings = {
        workDuration,
        breakDuration,
        soundEnabled,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota or privacy mode errors
    }
  }, [workDuration, breakDuration, soundEnabled]);

  const triggerEndNotification = useCallback(
    (finishedMode: SessionMode) => {
      setCompletedMode(finishedMode);

      if (soundEnabled) {
        playCompletionChime();
      }

      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const title =
            finishedMode === 'work' ? 'Work session complete' : 'Break session complete';
          const body =
            finishedMode === 'work'
              ? 'Time to take a break.'
              : 'Ready for your next work session.';
          try {
            new Notification(title, { body });
          } catch {
            // Ignore notification errors in restricted contexts
          }
        }
      }
    },
    [soundEnabled]
  );

  useEffect(() => {
    if (!isRunning) {
      endTimestampRef.current = null;
      return;
    }

    endTimestampRef.current = Date.now() + remainingSeconds * 1000;

    const tick = () => {
      if (endTimestampRef.current === null) return;
      const msLeft = endTimestampRef.current - Date.now();
      const nextSeconds = Math.max(0, Math.ceil(msLeft / 1000));

      setRemainingSeconds(nextSeconds);

      if (nextSeconds <= 0) {
        endTimestampRef.current = null;
        setIsRunning(false);
        triggerEndNotification(mode);
      }
    };

    const intervalId = window.setInterval(tick, 200);
    return () => window.clearInterval(intervalId);
  }, [isRunning, mode, triggerEndNotification]);

  useEffect(() => {
    const { hh, mm, ss } = formatHMS(remainingSeconds);
    if (isRunning) {
      const label = mode === 'work' ? 'Work' : 'Break';
      document.title = `${hh}:${mm}:${ss} · ${label}`;
    } else if (completedMode) {
      document.title = 'Session complete · Minimal Pomodoro';
    } else {
      document.title = 'Minimal Pomodoro';
    }
  }, [remainingSeconds, isRunning, mode, completedMode]);

  const requestNotificationPermissionIfNeeded = () => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      void Notification.requestPermission().catch(() => {});
    }
  };

  const handleSelectMode = (nextMode: SessionMode) => {
    if (nextMode === mode) return;
    const nextSeconds =
      nextMode === 'work' ? toTotalSeconds(workDuration) : toTotalSeconds(breakDuration);
    setIsRunning(false);
    setHasStarted(false);
    setCompletedMode(null);
    setMode(nextMode);
    setSessionTotalSeconds(nextSeconds);
    setRemainingSeconds(nextSeconds);
  };

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    requestNotificationPermissionIfNeeded();
    setCompletedMode(null);

    if (remainingSeconds <= 0) {
      if (activeDurationSeconds <= 0) return;
      setSessionTotalSeconds(activeDurationSeconds);
      setRemainingSeconds(activeDurationSeconds);
    } else if (!hasStarted) {
      setSessionTotalSeconds(activeDurationSeconds);
      setRemainingSeconds(activeDurationSeconds);
    }

    setHasStarted(true);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasStarted(false);
    setCompletedMode(null);
    setSessionTotalSeconds(activeDurationSeconds);
    setRemainingSeconds(activeDurationSeconds);
  };

  const handleStartNextFromNotification = (nextMode: SessionMode) => {
    const nextSeconds =
      nextMode === 'work' ? toTotalSeconds(workDuration) : toTotalSeconds(breakDuration);
    setCompletedMode(null);
    setMode(nextMode);
    setSessionTotalSeconds(nextSeconds);
    setRemainingSeconds(nextSeconds);
    if (nextSeconds > 0) {
      setHasStarted(true);
      setIsRunning(true);
    } else {
      setHasStarted(false);
      setIsRunning(false);
    }
  };

  const handleWorkDurationChange = (next: DurationParts) => {
    setWorkDuration(next);
    if (mode === 'work' && !isRunning) {
      const nextSeconds = toTotalSeconds(next);
      setHasStarted(false);
      setCompletedMode(null);
      setSessionTotalSeconds(nextSeconds);
      setRemainingSeconds(nextSeconds);
    }
  };

  const handleBreakDurationChange = (next: DurationParts) => {
    setBreakDuration(next);
    if (mode === 'break' && !isRunning) {
      const nextSeconds = toTotalSeconds(next);
      setHasStarted(false);
      setCompletedMode(null);
      setSessionTotalSeconds(nextSeconds);
      setRemainingSeconds(nextSeconds);
    }
  };

  const { hh, mm, ss } = formatHMS(remainingSeconds);
  const progressRatio =
    sessionTotalSeconds > 0
      ? Math.min(1, Math.max(0, (sessionTotalSeconds - remainingSeconds) / sessionTotalSeconds))
      : 0;
  const progressPercent = Math.round(progressRatio * 100);
  const canStart = isRunning || remainingSeconds > 0 || activeDurationSeconds > 0;

  return (
    <div className="min-h-dvh w-full bg-[#212121] text-[#D9D9D9] flex flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
      <main className="w-full max-w-lg flex flex-col gap-8 sm:gap-10">
        {/* Top Mode Switcher & Sound Toggle */}
        <header className="flex items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Timer session type"
            className="inline-flex items-center p-1 rounded-xl bg-[#2B2B2B] border border-[#D9D9D9]/12"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'work'}
              onClick={() => handleSelectMode('work')}
              className={`min-h-[44px] px-4 sm:px-5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                mode === 'work'
                  ? 'bg-[#D9D9D9] text-[#212121]'
                  : 'text-[#D9D9D9]/75 hover:text-[#D9D9D9]'
              }`}
            >
              Work
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'break'}
              onClick={() => handleSelectMode('break')}
              className={`min-h-[44px] px-4 sm:px-5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                mode === 'break'
                  ? 'bg-[#D9D9D9] text-[#212121]'
                  : 'text-[#D9D9D9]/75 hover:text-[#D9D9D9]'
              }`}
            >
              Break
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            aria-label={soundEnabled ? 'Mute completion chime' : 'Unmute completion chime'}
            aria-pressed={soundEnabled}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-[#2B2B2B] border border-[#D9D9D9]/12 text-[#D9D9D9]/80 hover:text-[#D9D9D9] hover:border-[#D9D9D9]/30 transition-colors duration-150 shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <VolumeX className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </header>

        {/* Primary Timer Display & Progress */}
        <section aria-label="Countdown timer" className="flex flex-col items-center gap-6 py-2">
          <div
            aria-live="off"
            aria-label={`${hh} hours ${mm} minutes ${ss} seconds remaining`}
            className="text-[clamp(2.5rem,12vw,5.25rem)] leading-none font-bold tracking-tight tabular-nums text-[#D9D9D9] select-none whitespace-nowrap"
          >
            <span>{hh}</span>
            <span className="text-[#D9D9D9]/45 mx-1.5 sm:mx-2.5">:</span>
            <span>{mm}</span>
            <span className="text-[#D9D9D9]/45 mx-1.5 sm:mx-2.5">:</span>
            <span>{ss}</span>
          </div>

          {hasStarted && (
            <div className="w-full flex flex-col gap-1.5">
              <div
                role="progressbar"
                aria-label="Session progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
                className="w-full h-1.5 rounded-full bg-[#D9D9D9]/15 overflow-hidden"
              >
                <div
                  className="h-full w-full bg-[#D9D9D9] origin-left transition-transform duration-200 ease-out"
                  style={{ transform: `scaleX(${progressRatio})` }}
                />
              </div>
              <span className="sr-only">{progressPercent}% complete</span>
            </div>
          )}

          {/* Primary Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              type="button"
              onClick={handleStartPause}
              disabled={!canStart}
              className="min-h-[48px] min-w-[140px] flex-1 sm:flex-none px-8 rounded-xl bg-[#D9D9D9] text-[#212121] text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#D9D9D9]/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>{hasStarted && remainingSeconds > 0 ? 'Resume' : 'Start'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset timer"
              className="min-h-[48px] px-5 rounded-xl bg-[#2B2B2B] border border-[#D9D9D9]/15 text-[#D9D9D9] text-sm sm:text-base font-medium inline-flex items-center justify-center gap-2 hover:border-[#D9D9D9]/35 active:scale-[0.98] transition-all duration-150 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </section>

        {/* Session Length Customization (HH : MM : SS) */}
        <section
          aria-label="Session durations"
          className="pt-6 border-t border-[#D9D9D9]/12 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <DurationInput
            label="Work"
            value={workDuration}
            disabled={isRunning && mode === 'work'}
            onChange={handleWorkDurationChange}
          />
          <DurationInput
            label="Break"
            value={breakDuration}
            disabled={isRunning && mode === 'break'}
            onChange={handleBreakDurationChange}
          />
        </section>
      </main>

      <TimerNotification
        completedMode={completedMode}
        onStartNext={handleStartNextFromNotification}
        onDismiss={() => setCompletedMode(null)}
      />
    </div>
  );
}
