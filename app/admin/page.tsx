'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { IndividualForm } from '@/components/admin/IndividualForm';
import { GroupForm } from '@/components/admin/GroupForm';
import { ScoreEntryForm } from '@/components/admin/ScoreEntryForm';
import { ParticipantList } from '@/components/admin/ParticipantList';
import { useSocket } from '@/hooks/useSocket';

export default function AdminPage() {
  const { isConnected } = useSocket();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Problem Solving Day</h1>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>

            <div className="flex items-center gap-4">
              <TimerDisplay size="md" />
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">Connected</span>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Timer Controls Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Timer Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <TimerControls />
          </CardContent>
        </Card>

        {/* Main Grid - Registration Forms & Participant Lists */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Left Column - Registration Forms */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Register Individual</CardTitle>
              </CardHeader>
              <CardContent>
                <IndividualForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Register Group</CardTitle>
              </CardHeader>
              <CardContent>
                <GroupForm />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Participant Lists */}
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <ParticipantList />
            </CardContent>
          </Card>
        </div>

        {/* Score Entry Section */}
        <Card>
          <CardHeader>
            <CardTitle>Score Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <ScoreEntryForm />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
