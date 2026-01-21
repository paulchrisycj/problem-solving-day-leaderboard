'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LeaderboardRow } from './LeaderboardRow';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardPanelProps {
  title: string;
  entries: LeaderboardEntry[];
  showMembers?: boolean;
  className?: string;
}

export function LeaderboardPanel({
  title,
  entries,
  showMembers = true,
  className,
}: LeaderboardPanelProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-20 text-center">Score</TableHead>
                <TableHead className="w-24 text-center">Attempts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No participants yet
                  </td>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <LeaderboardRow
                    key={entry.id}
                    entry={entry}
                    showMembers={showMembers}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
