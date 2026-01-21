'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  AppState,
  Individual,
  Group,
  Participant,
  TimerState,
} from '@/types';

// Initial state
const initialState: AppState = {
  individuals: [],
  groups: [],
  timer: {
    endTime: null,
    isRunning: false,
  },
};

// Action types
type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_INDIVIDUALS'; payload: Individual[] }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'UPDATE_PARTICIPANT'; payload: Participant }
  | { type: 'DELETE_PARTICIPANT'; payload: { id: string; type: 'individual' | 'group' } }
  | { type: 'SET_TIMER'; payload: TimerState };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'SET_INDIVIDUALS':
      return {
        ...state,
        individuals: action.payload,
      };

    case 'SET_GROUPS':
      return {
        ...state,
        groups: action.payload,
      };

    case 'ADD_PARTICIPANT':
      if (action.payload.type === 'individual') {
        return {
          ...state,
          individuals: [...state.individuals, action.payload as Individual],
        };
      }
      return {
        ...state,
        groups: [...state.groups, action.payload as Group],
      };

    case 'UPDATE_PARTICIPANT':
      if (action.payload.type === 'individual') {
        return {
          ...state,
          individuals: state.individuals.map((p) =>
            p.id === action.payload.id ? (action.payload as Individual) : p
          ),
        };
      }
      return {
        ...state,
        groups: state.groups.map((p) =>
          p.id === action.payload.id ? (action.payload as Group) : p
        ),
      };

    case 'DELETE_PARTICIPANT':
      if (action.payload.type === 'individual') {
        return {
          ...state,
          individuals: state.individuals.filter((p) => p.id !== action.payload.id),
        };
      }
      return {
        ...state,
        groups: state.groups.filter((p) => p.id !== action.payload.id),
      };

    case 'SET_TIMER':
      return {
        ...state,
        timer: action.payload,
      };

    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  setState: (state: AppState) => void;
  setIndividuals: (individuals: Individual[]) => void;
  setGroups: (groups: Group[]) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string, type: 'individual' | 'group') => void;
  setTimer: (timer: TimerState) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setState = useCallback((newState: AppState) => {
    dispatch({ type: 'SET_STATE', payload: newState });
  }, []);

  const setIndividuals = useCallback((individuals: Individual[]) => {
    dispatch({ type: 'SET_INDIVIDUALS', payload: individuals });
  }, []);

  const setGroups = useCallback((groups: Group[]) => {
    dispatch({ type: 'SET_GROUPS', payload: groups });
  }, []);

  const addParticipant = useCallback((participant: Participant) => {
    dispatch({ type: 'ADD_PARTICIPANT', payload: participant });
  }, []);

  const updateParticipant = useCallback((participant: Participant) => {
    dispatch({ type: 'UPDATE_PARTICIPANT', payload: participant });
  }, []);

  const deleteParticipant = useCallback((id: string, type: 'individual' | 'group') => {
    dispatch({ type: 'DELETE_PARTICIPANT', payload: { id, type } });
  }, []);

  const setTimer = useCallback((timer: TimerState) => {
    dispatch({ type: 'SET_TIMER', payload: timer });
  }, []);

  const value: AppContextType = {
    state,
    setState,
    setIndividuals,
    setGroups,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    setTimer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
