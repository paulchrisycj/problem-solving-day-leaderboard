import { NextRequest, NextResponse } from 'next/server';
import { getTimer, updateTimer, resetTimer } from '@/lib/data';
import { validateTimer } from '@/lib/validation';
import { datetimeLocalToGMT8ISO } from '@/lib/timezone';
import type { ApiResponse, TimerState } from '@/types';

// GET /api/timer - Get current timer state
export async function GET(): Promise<NextResponse<ApiResponse<TimerState>>> {
  try {
    const timer = await getTimer();
    return NextResponse.json({
      success: true,
      data: timer,
    });
  } catch (error) {
    console.error('Error fetching timer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timer' },
      { status: 500 }
    );
  }
}

// PUT /api/timer - Update timer state
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<TimerState>>> {
  try {
    const body = await request.json();
    const { action } = body;

    // Handle timer actions
    if (action === 'start') {
      // Start the timer (requires endTime to be set)
      const currentTimer = await getTimer();
      if (!currentTimer.endTime) {
        return NextResponse.json(
          { success: false, error: 'End time must be set before starting the timer' },
          { status: 400 }
        );
      }
      const timer = await updateTimer({ isRunning: true });
      return NextResponse.json({ success: true, data: timer });
    }

    if (action === 'stop') {
      // Stop/pause the timer
      const timer = await updateTimer({ isRunning: false });
      return NextResponse.json({ success: true, data: timer });
    }

    if (action === 'reset') {
      // Reset the timer completely
      const timer = await resetTimer();
      return NextResponse.json({ success: true, data: timer });
    }

    if (action === 'setEndTime') {
      // Set the end time
      const validation = validateTimer(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      // Convert datetime-local to ISO string in GMT+8
      const endTimeISO = datetimeLocalToGMT8ISO(validation.data.endTime);
      const timer = await updateTimer({ endTime: endTimeISO, isRunning: false });
      return NextResponse.json({ success: true, data: timer });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Must be "start", "stop", "reset", or "setEndTime"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating timer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update timer' },
      { status: 500 }
    );
  }
}
