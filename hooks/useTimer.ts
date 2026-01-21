'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import {
  calculateRemainingSeconds,
  formatTimeRemaining,
} from '@/lib/timezone';

export type TimerColor = 'green' | 'yellow' | 'red' | 'flashing';

interface UseTimerReturn {
  remainingSeconds: number;
  formattedTime: string;
  color: TimerColor;
  isRunning: boolean;
  isFinished: boolean;
  endTime: string | null;
}

export function useTimer(): UseTimerReturn {
  const { state } = useAppContext();
  const { timer } = state;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() =>
    calculateRemainingSeconds(timer.endTime)
  );

  // Update remaining seconds every second when timer is running
  useEffect(() => {
    if (!timer.isRunning || !timer.endTime) {
      setRemainingSeconds(calculateRemainingSeconds(timer.endTime));
      return;
    }

    // Initial calculation
    setRemainingSeconds(calculateRemainingSeconds(timer.endTime));

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds(timer.endTime);
      setRemainingSeconds(remaining);

      // Stop interval if timer finished
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.endTime]);

  // Calculate color based on remaining time
  const color = useMemo<TimerColor>(() => {
    if (remainingSeconds <= 0) {
      return 'flashing';
    }
    if (remainingSeconds < 300) {
      // < 5 minutes
      return 'red';
    }
    if (remainingSeconds < 600) {
      // 5-10 minutes
      return 'yellow';
    }
    return 'green';
  }, [remainingSeconds]);

  // Format time for display
  const formattedTime = useMemo(
    () => formatTimeRemaining(remainingSeconds),
    [remainingSeconds]
  );

  const isFinished = remainingSeconds <= 0 && timer.endTime !== null;

  return {
    remainingSeconds,
    formattedTime,
    color,
    isRunning: timer.isRunning,
    isFinished,
    endTime: timer.endTime,
  };
}
