'use client';

import { useTimer, type TimerColor } from '@/hooks/useTimer';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses: Record<TimerColor, string> = {
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  flashing: 'text-red-600 animate-pulse',
};

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
};

export function TimerDisplay({ className, size = 'lg' }: TimerDisplayProps) {
  const { formattedTime, color, isRunning, endTime } = useTimer();

  // Show placeholder when no end time is set
  if (!endTime) {
    return (
      <div
        className={cn(
          'font-mono font-bold text-gray-400',
          sizeClasses[size],
          className
        )}
      >
        --:--
      </div>
    );
  }

  return (
    <div
      className={cn(
        'font-mono font-bold tabular-nums',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    >
      {formattedTime}
    </div>
  );
}
