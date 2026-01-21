import { z } from 'zod';

// Individual participant schema
export const individualSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
});

export type IndividualInput = z.infer<typeof individualSchema>;

// Group participant schema
export const groupSchema = z.object({
  name: z
    .string()
    .min(1, 'Group name is required')
    .max(100, 'Group name must be 100 characters or less')
    .trim(),
  members: z
    .array(
      z
        .string()
        .min(1, 'Member name cannot be empty')
        .max(100, 'Member name must be 100 characters or less')
        .trim()
    )
    .min(2, 'At least 2 members are required'),
});

export type GroupInput = z.infer<typeof groupSchema>;

// Score submission schema
export const scoreSchema = z.object({
  participantId: z.string().min(1, 'Participant is required'),
  participantType: z.enum(['individual', 'group']),
  score: z
    .number()
    .int('Score must be a whole number')
    .min(0, 'Score must be at least 0')
    .max(15, 'Score must be at most 15'),
});

export type ScoreInput = z.infer<typeof scoreSchema>;

// Timer schema
export const timerSchema = z.object({
  endTime: z.string().min(1, 'End time is required'),
});

export type TimerInput = z.infer<typeof timerSchema>;

// Participant update schema (for editing)
export const participantUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim()
    .optional(),
  members: z
    .array(
      z
        .string()
        .min(1, 'Member name cannot be empty')
        .max(100, 'Member name must be 100 characters or less')
        .trim()
    )
    .min(2, 'At least 2 members are required')
    .optional(),
});

export type ParticipantUpdateInput = z.infer<typeof participantUpdateSchema>;

// Validation helper functions
export function validateIndividual(data: unknown) {
  return individualSchema.safeParse(data);
}

export function validateGroup(data: unknown) {
  return groupSchema.safeParse(data);
}

export function validateScore(data: unknown) {
  return scoreSchema.safeParse(data);
}

export function validateTimer(data: unknown) {
  return timerSchema.safeParse(data);
}

export function validateParticipantUpdate(data: unknown) {
  return participantUpdateSchema.safeParse(data);
}
