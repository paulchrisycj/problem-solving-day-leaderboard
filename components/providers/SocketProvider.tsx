'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useAppContext } from '@/context/AppContext';
import { SocketEvents } from '@/types';
import type {
  Participant,
  TimerState,
  LeaderboardEntry,
  StateUpdatePayload,
  LeaderboardUpdatePayload,
  TimerUpdatedPayload,
  ParticipantCreatedPayload,
  ParticipantUpdatedPayload,
  ParticipantDeletedPayload,
  ScoreUpdatedPayload,
} from '@/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  // Emit functions
  createParticipant: (
    type: 'individual' | 'group',
    name: string,
    members?: string[]
  ) => void;
  updateParticipantSocket: (
    id: string,
    data: { name?: string; members?: string[] }
  ) => void;
  deleteParticipantSocket: (id: string, type: 'individual' | 'group') => void;
  submitScore: (
    participantId: string,
    participantType: 'individual' | 'group',
    score: number
  ) => void;
  setTimerEndTime: (endTime: string) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  requestState: () => void;
  // Leaderboard data (computed from socket updates)
  individualsLeaderboard: LeaderboardEntry[];
  groupsLeaderboard: LeaderboardEntry[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [individualsLeaderboard, setIndividualsLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [groupsLeaderboard, setGroupsLeaderboard] = useState<LeaderboardEntry[]>(
    []
  );

  const {
    setState,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    setTimer,
  } = useAppContext();

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    function onConnect() {
      console.log('Socket connected');
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log('Socket disconnected');
      setIsConnected(false);
    }

    function onStateUpdate(payload: StateUpdatePayload) {
      setState(payload.state);
    }

    function onLeaderboardUpdate(payload: LeaderboardUpdatePayload) {
      setIndividualsLeaderboard(payload.individuals);
      setGroupsLeaderboard(payload.groups);
    }

    function onTimerUpdate(payload: TimerUpdatedPayload | TimerState) {
      const timer = 'timer' in payload ? payload.timer : payload;
      setTimer(timer);
    }

    function onParticipantAdded(payload: ParticipantCreatedPayload) {
      addParticipant(payload.participant);
    }

    function onParticipantUpdated(payload: ParticipantUpdatedPayload) {
      updateParticipant(payload.participant);
    }

    function onParticipantDeleted(payload: ParticipantDeletedPayload) {
      deleteParticipant(payload.id, payload.type);
    }

    function onScoreUpdated(payload: ScoreUpdatedPayload) {
      updateParticipant(payload.participant);
    }

    function onError(error: { message: string }) {
      console.error('Socket error:', error.message);
    }

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on(SocketEvents.STATE_UPDATE, onStateUpdate);
    socketInstance.on(SocketEvents.LEADERBOARD_UPDATE, onLeaderboardUpdate);
    socketInstance.on(SocketEvents.TIMER_UPDATE, onTimerUpdate);
    socketInstance.on(SocketEvents.PARTICIPANT_ADDED, onParticipantAdded);
    socketInstance.on(SocketEvents.PARTICIPANT_UPDATED, onParticipantUpdated);
    socketInstance.on(SocketEvents.PARTICIPANT_DELETED, onParticipantDeleted);
    socketInstance.on(SocketEvents.SCORE_UPDATED, onScoreUpdated);
    socketInstance.on('error', onError);

    // Check if already connected
    if (socketInstance.connected) {
      setIsConnected(true);
    }

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off(SocketEvents.STATE_UPDATE, onStateUpdate);
      socketInstance.off(SocketEvents.LEADERBOARD_UPDATE, onLeaderboardUpdate);
      socketInstance.off(SocketEvents.TIMER_UPDATE, onTimerUpdate);
      socketInstance.off(SocketEvents.PARTICIPANT_ADDED, onParticipantAdded);
      socketInstance.off(SocketEvents.PARTICIPANT_UPDATED, onParticipantUpdated);
      socketInstance.off(SocketEvents.PARTICIPANT_DELETED, onParticipantDeleted);
      socketInstance.off(SocketEvents.SCORE_UPDATED, onScoreUpdated);
      socketInstance.off('error', onError);
    };
  }, [
    setState,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    setTimer,
  ]);

  // Emit functions
  const createParticipant = useCallback(
    (type: 'individual' | 'group', name: string, members?: string[]) => {
      if (!socket) return;
      if (type === 'individual') {
        socket.emit(SocketEvents.PARTICIPANT_CREATE, { type, name });
      } else {
        socket.emit(SocketEvents.PARTICIPANT_CREATE, { type, name, members });
      }
    },
    [socket]
  );

  const updateParticipantSocket = useCallback(
    (id: string, data: { name?: string; members?: string[] }) => {
      if (!socket) return;
      socket.emit(SocketEvents.PARTICIPANT_UPDATE, { id, ...data });
    },
    [socket]
  );

  const deleteParticipantSocket = useCallback(
    (id: string, type: 'individual' | 'group') => {
      if (!socket) return;
      socket.emit(SocketEvents.PARTICIPANT_DELETE, { id, type });
    },
    [socket]
  );

  const submitScore = useCallback(
    (
      participantId: string,
      participantType: 'individual' | 'group',
      score: number
    ) => {
      if (!socket) return;
      socket.emit(SocketEvents.SCORE_SUBMIT, {
        participantId,
        participantType,
        score,
      });
    },
    [socket]
  );

  const setTimerEndTime = useCallback(
    (endTime: string) => {
      if (!socket) return;
      socket.emit(SocketEvents.TIMER_SET, { endTime });
    },
    [socket]
  );

  const startTimer = useCallback(() => {
    if (!socket) return;
    socket.emit(SocketEvents.TIMER_START);
  }, [socket]);

  const stopTimer = useCallback(() => {
    if (!socket) return;
    socket.emit(SocketEvents.TIMER_STOP);
  }, [socket]);

  const resetTimer = useCallback(() => {
    if (!socket) return;
    socket.emit(SocketEvents.TIMER_RESET);
  }, [socket]);

  const requestState = useCallback(() => {
    if (!socket) return;
    socket.emit(SocketEvents.REQUEST_STATE);
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    createParticipant,
    updateParticipantSocket,
    deleteParticipantSocket,
    submitScore,
    setTimerEndTime,
    startTimer,
    stopTimer,
    resetTimer,
    requestState,
    individualsLeaderboard,
    groupsLeaderboard,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
