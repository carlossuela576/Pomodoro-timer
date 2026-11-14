import React from 'react';
import { Bell, X } from 'lucide-react';

export type SessionMode = 'work' | 'break';

interface TimerNotificationProps {
  completedMode: SessionMode | null;
  onStartNext: (nextMode: SessionMode) => void;
  onDismiss: () => void;
}

export const TimerNotification: React.FC<TimerNotificationProps> = ({
  completedMode,
  onStartNext,
  onDismiss,
}) => {
  if (!completedMode) {
    return null;
  }

  const nextMode: SessionMode = completedMode === 'work' ? 'break' : 'work';
  const message =
    completedMode === 'work' ? 'Work session complete.' : 'Break session complete.';
  const actionLabel = nextMode === 'break' ? 'Start break' : 'Start work';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50"
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#D9D9D9] text-[#212121] px-4 py-2.5 shadow-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <Bell className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium truncate">{message}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onStartNext(nextMode)}
            className="min-h-[44px] px-3 rounded-xl text-sm font-semibold text-[#212121] hover:bg-[#212121]/10 active:scale-[0.98] transition-all duration-150 whitespace-nowrap"
          >
            {actionLabel}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#212121]/80 hover:text-[#212121] hover:bg-[#212121]/10 transition-colors duration-150"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
