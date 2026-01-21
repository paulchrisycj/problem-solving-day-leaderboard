'use client';

import { useState } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSocket } from '@/hooks/useSocket';
import { useTimer } from '@/hooks/useTimer';
import { isoToDatetimeLocal } from '@/lib/timezone';

export function TimerControls() {
  const { setTimerEndTime, startTimer, stopTimer, resetTimer } = useSocket();
  const { isRunning, endTime, isFinished } = useTimer();
  const [localEndTime, setLocalEndTime] = useState<string>('');

  // Convert current end time to datetime-local format for display
  const currentEndTimeLocal = endTime ? isoToDatetimeLocal(endTime) : '';

  const handleSetEndTime = () => {
    if (localEndTime) {
      setTimerEndTime(localEndTime);
    }
  };

  const handleStartStop = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="endTime" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            End Time (GMT+8)
          </Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={localEndTime || currentEndTimeLocal}
            onChange={(e) => setLocalEndTime(e.target.value)}
            disabled={isRunning}
          />
        </div>
        <Button
          onClick={handleSetEndTime}
          disabled={!localEndTime || isRunning}
          variant="secondary"
        >
          Set
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleStartStop}
          disabled={!endTime}
          variant={isRunning ? 'destructive' : 'default'}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              {isFinished ? 'Finished' : 'Start'}
            </>
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Timer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reset the timer? This will clear the
                end time and stop the countdown.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetTimer();
                  setLocalEndTime('');
                }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {endTime && (
        <p className="text-sm text-muted-foreground">
          Timer set to end at: {new Date(endTime).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
        </p>
      )}
    </div>
  );
}
