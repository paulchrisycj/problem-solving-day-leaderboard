import { NextRequest, NextResponse } from 'next/server';
import {
  getParticipant,
  updateParticipant,
  deleteParticipant,
} from '@/lib/data';
import { validateParticipantUpdate } from '@/lib/validation';
import type { ApiResponse, Participant } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/participants/[id] - Get a single participant
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Participant>>> {
  try {
    const { id } = await params;
    const participant = await getParticipant(id);

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: participant,
    });
  } catch (error) {
    console.error('Error fetching participant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch participant' },
      { status: 500 }
    );
  }
}

// PUT /api/participants/[id] - Update a participant
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Participant>>> {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateParticipantUpdate(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const participant = await updateParticipant(id, validation.data);

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: participant,
    });
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}

// DELETE /api/participants/[id] - Delete a participant
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ id: string; type: string }>>> {
  try {
    const { id } = await params;
    const result = await deleteParticipant(id);

    if (!result.deleted) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, type: result.type! },
    });
  } catch (error) {
    console.error('Error deleting participant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete participant' },
      { status: 500 }
    );
  }
}
