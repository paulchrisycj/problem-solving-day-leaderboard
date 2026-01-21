import { NextRequest, NextResponse } from 'next/server';
import {
  getAllParticipants,
  createIndividual,
  createGroup,
} from '@/lib/data';
import { validateIndividual, validateGroup } from '@/lib/validation';
import type { ApiResponse, Individual, Group } from '@/types';

// GET /api/participants - Get all participants
export async function GET(): Promise<NextResponse<ApiResponse<{ individuals: Individual[]; groups: Group[] }>>> {
  try {
    const participants = await getAllParticipants();
    return NextResponse.json({
      success: true,
      data: participants,
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

// POST /api/participants - Create a new participant
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Individual | Group>>> {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'individual') {
      const validation = validateIndividual(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      const individual = await createIndividual(validation.data.name);
      return NextResponse.json({
        success: true,
        data: individual,
      }, { status: 201 });
    }

    if (type === 'group') {
      const validation = validateGroup(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      const group = await createGroup(validation.data.name, validation.data.members);
      return NextResponse.json({
        success: true,
        data: group,
      }, { status: 201 });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid participant type. Must be "individual" or "group"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error creating participant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}
