import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppState,
  Individual,
  Group,
  Participant,
  TimerState,
} from '@/types';
import { getCurrentGMT8ISO } from './timezone';

// Data file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');

// Default state
const DEFAULT_STATE: AppState = {
  individuals: [],
  groups: [],
  timer: {
    endTime: null,
    isRunning: false,
  },
};

/**
 * Ensure data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Load application state from JSON file
 */
export async function loadState(): Promise<AppState> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data) as AppState;
  } catch (error) {
    // If file doesn't exist or is invalid, return default state
    console.log('Creating new state file with default values');
    await saveState(DEFAULT_STATE);
    return DEFAULT_STATE;
  }
}

/**
 * Save application state to JSON file
 */
export async function saveState(state: AppState): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Get all participants (both individuals and groups)
 */
export async function getAllParticipants(): Promise<{
  individuals: Individual[];
  groups: Group[];
}> {
  const state = await loadState();
  return {
    individuals: state.individuals,
    groups: state.groups,
  };
}

/**
 * Get a single participant by ID
 */
export async function getParticipant(
  id: string
): Promise<Participant | null> {
  const state = await loadState();

  const individual = state.individuals.find((p) => p.id === id);
  if (individual) return individual;

  const group = state.groups.find((p) => p.id === id);
  if (group) return group;

  return null;
}

/**
 * Create a new individual participant
 */
export async function createIndividual(name: string): Promise<Individual> {
  const state = await loadState();
  const now = getCurrentGMT8ISO();

  const individual: Individual = {
    id: uuidv4(),
    type: 'individual',
    name: name.trim(),
    score: null,
    attempts: 0,
    bestScoreTimestamp: null,
    createdAt: now,
  };

  state.individuals.push(individual);
  await saveState(state);

  return individual;
}

/**
 * Create a new group participant
 */
export async function createGroup(
  name: string,
  members: string[]
): Promise<Group> {
  const state = await loadState();
  const now = getCurrentGMT8ISO();

  const group: Group = {
    id: uuidv4(),
    type: 'group',
    name: name.trim(),
    members: members.map((m) => m.trim()),
    score: null,
    attempts: 0,
    bestScoreTimestamp: null,
    createdAt: now,
  };

  state.groups.push(group);
  await saveState(state);

  return group;
}

/**
 * Update a participant (name or members for groups)
 */
export async function updateParticipant(
  id: string,
  updates: { name?: string; members?: string[] }
): Promise<Participant | null> {
  const state = await loadState();

  // Check individuals
  const individualIndex = state.individuals.findIndex((p) => p.id === id);
  if (individualIndex !== -1) {
    if (updates.name) {
      state.individuals[individualIndex].name = updates.name.trim();
    }
    await saveState(state);
    return state.individuals[individualIndex];
  }

  // Check groups
  const groupIndex = state.groups.findIndex((p) => p.id === id);
  if (groupIndex !== -1) {
    const group = state.groups[groupIndex];

    // Only allow member changes if no score has been recorded yet
    if (updates.members && group.score === null) {
      group.members = updates.members.map((m) => m.trim());
    }
    if (updates.name) {
      group.name = updates.name.trim();
    }

    await saveState(state);
    return state.groups[groupIndex];
  }

  return null;
}

/**
 * Delete a participant
 */
export async function deleteParticipant(
  id: string
): Promise<{ deleted: boolean; type?: 'individual' | 'group' }> {
  const state = await loadState();

  // Check individuals
  const individualIndex = state.individuals.findIndex((p) => p.id === id);
  if (individualIndex !== -1) {
    state.individuals.splice(individualIndex, 1);
    await saveState(state);
    return { deleted: true, type: 'individual' };
  }

  // Check groups
  const groupIndex = state.groups.findIndex((p) => p.id === id);
  if (groupIndex !== -1) {
    state.groups.splice(groupIndex, 1);
    await saveState(state);
    return { deleted: true, type: 'group' };
  }

  return { deleted: false };
}

/**
 * Submit a score for a participant
 * Returns error if max attempts reached or other validation fails
 */
export async function submitScore(
  id: string,
  participantType: 'individual' | 'group',
  score: number
): Promise<{ success: boolean; participant?: Participant; error?: string }> {
  const state = await loadState();
  const now = getCurrentGMT8ISO();

  // Validate score
  if (score < 0 || score > 15 || !Number.isInteger(score)) {
    return { success: false, error: 'Score must be an integer between 0 and 15' };
  }

  let participant: Individual | Group | undefined;
  let index: number;

  if (participantType === 'individual') {
    index = state.individuals.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Individual not found' };
    }
    participant = state.individuals[index];
  } else {
    index = state.groups.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Group not found' };
    }
    participant = state.groups[index];
  }

  // Check attempt limit (hard block)
  if (participant.attempts >= 2) {
    return { success: false, error: 'Maximum 2 attempts reached' };
  }

  // Update attempts count
  participant.attempts += 1;

  // Update score if better or first attempt
  const shouldUpdateScore =
    participant.score === null || score > participant.score;

  if (shouldUpdateScore) {
    participant.score = score;
    participant.bestScoreTimestamp = now;
  }

  // Save back to state
  if (participantType === 'individual') {
    state.individuals[index] = participant as Individual;
  } else {
    state.groups[index] = participant as Group;
  }

  await saveState(state);

  return { success: true, participant };
}

/**
 * Get timer state
 */
export async function getTimer(): Promise<TimerState> {
  const state = await loadState();
  return state.timer;
}

/**
 * Update timer state
 */
export async function updateTimer(
  updates: Partial<TimerState>
): Promise<TimerState> {
  const state = await loadState();

  state.timer = {
    ...state.timer,
    ...updates,
  };

  await saveState(state);
  return state.timer;
}

/**
 * Reset timer to initial state
 */
export async function resetTimer(): Promise<TimerState> {
  const state = await loadState();

  state.timer = {
    endTime: null,
    isRunning: false,
  };

  await saveState(state);
  return state.timer;
}

/**
 * Clear all data (for testing/reset purposes)
 */
export async function clearAllData(): Promise<void> {
  await saveState(DEFAULT_STATE);
}
