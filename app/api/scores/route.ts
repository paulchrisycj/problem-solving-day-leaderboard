import { NextRequest, NextResponse } from 'next/server';
import { submitScore } from '@/lib/data';
import { validateScore } from '@/lib/validation';
import type { ApiResponse, Participant } from '@/types';

// POST /api/scores - Submit a score for a participant
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Participant>>> {
  try {
    const body = await request.json();

    const validation = validateScore(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { participantId, participantType, score } = validation.data;
    const result = await submitScore(participantId, participantType, score);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.participant,
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}
