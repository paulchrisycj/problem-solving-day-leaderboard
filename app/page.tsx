'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { DualLeaderboard } from '@/components/leaderboard/DualLeaderboard';
import { useSocket } from '@/hooks/useSocket';

export default function Home() {
  const { isConnected } = useSocket();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Timer */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Problem Solving Day</h1>
              <p className="text-sm text-muted-foreground">
                Leaderboard
              </p>
            </div>

            <div className="flex flex-col items-center">
              <TimerDisplay size="lg" />
              <span className="text-xs text-muted-foreground mt-1">
                Time Remaining
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Dual Leaderboard */}
      <main className="container mx-auto px-4 py-6">
        <DualLeaderboard />
      </main>
    </div>
  );
}
