// Base participant interface
export interface BaseParticipant {
  id: string;
  name: string;
  score: number | null;
  testCasesPassed: number | null;
  attempts: number;
  bestScoreTimestamp: string | null; // ISO 8601 string in GMT+8
  createdAt: string; // ISO 8601 string in GMT+8
}

// Individual participant
export interface Individual extends BaseParticipant {
  type: 'individual';
}

// Group participant with members
export interface Group extends BaseParticipant {
  type: 'group';
  members: string[]; // Array of member names
}

// Union type for any participant
export type Participant = Individual | Group;

// Timer state
export interface TimerState {
  endTime: string | null; // ISO 8601 string in GMT+8
  isRunning: boolean;
}

// Full application state
export interface AppState {
  individuals: Individual[];
  groups: Group[];
  timer: TimerState;
}

// Leaderboard entry with computed rank
export interface LeaderboardEntry extends BaseParticipant {
  rank: number;
  type: 'individual' | 'group';
  members?: string[];
}

// Form data types
export interface IndividualFormData {
  name: string;
}

export interface GroupFormData {
  name: string;
  members: string[];
}

export interface ScoreFormData {
  participantId: string;
  participantType: 'individual' | 'group';
  score: number;
  testCasesPassed: number;
}

export interface TimerFormData {
  endTime: string; // datetime-local input value
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Socket event payloads
export interface ParticipantCreatedPayload {
  participant: Participant;
}

export interface ParticipantUpdatedPayload {
  participant: Participant;
}

export interface ParticipantDeletedPayload {
  id: string;
  type: 'individual' | 'group';
}

export interface ScoreUpdatedPayload {
  participant: Participant;
}

export interface TimerUpdatedPayload {
  timer: TimerState;
}

export interface LeaderboardUpdatePayload {
  individuals: LeaderboardEntry[];
  groups: LeaderboardEntry[];
}

export interface StateUpdatePayload {
  state: AppState;
}

// Socket events enum for type safety
export const SocketEvents = {
  // Server to client
  STATE_UPDATE: 'state:update',
  LEADERBOARD_UPDATE: 'leaderboard:update',
  TIMER_UPDATE: 'timer:update',
  PARTICIPANT_ADDED: 'participant:added',
  PARTICIPANT_UPDATED: 'participant:updated',
  PARTICIPANT_DELETED: 'participant:deleted',
  SCORE_UPDATED: 'score:updated',

  // Client to server
  PARTICIPANT_CREATE: 'participant:create',
  PARTICIPANT_UPDATE: 'participant:update',
  PARTICIPANT_DELETE: 'participant:delete',
  SCORE_SUBMIT: 'score:submit',
  TIMER_SET: 'timer:set',
  TIMER_START: 'timer:start',
  TIMER_STOP: 'timer:stop',
  TIMER_RESET: 'timer:reset',
  REQUEST_STATE: 'request:state',
} as const;

export type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
