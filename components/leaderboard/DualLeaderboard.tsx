'use client';

import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardPanel } from './LeaderboardPanel';

export function DualLeaderboard() {
  const { individuals, groups, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Connecting...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <LeaderboardPanel
        title="Individual Challenge"
        entries={individuals}
        showMembers={false}
      />
      <LeaderboardPanel
        title="Group Challenge"
        entries={groups}
        showMembers={true}
      />
    </div>
  );
}
