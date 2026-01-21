'use client';

import { useMemo } from 'react';
import { useSocket } from '@/hooks/useSocket';
import type { LeaderboardEntry } from '@/types';

interface UseLeaderboardReturn {
  individuals: LeaderboardEntry[];
  groups: LeaderboardEntry[];
  isLoading: boolean;
}

export function useLeaderboard(): UseLeaderboardReturn {
  const { individualsLeaderboard, groupsLeaderboard, isConnected } = useSocket();

  // The leaderboard data is already sorted by the server
  // Just return it as-is
  const individuals = useMemo(() => individualsLeaderboard, [individualsLeaderboard]);
  const groups = useMemo(() => groupsLeaderboard, [groupsLeaderboard]);

  return {
    individuals,
    groups,
    isLoading: !isConnected,
  };
}
