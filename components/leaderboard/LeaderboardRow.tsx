'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { RankBadge } from './RankBadge';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  showMembers?: boolean;
}

export function LeaderboardRow({ entry, showMembers = true }: LeaderboardRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasMembers = entry.type === 'group' && entry.members && entry.members.length > 0;

  // Format attempts display
  const attemptsDisplay = entry.score !== null
    ? `${entry.attempts}/2`
    : `${entry.attempts}/2`;

  // Format score display
  const scoreDisplay = entry.score !== null ? entry.score : '-';

  if (hasMembers && showMembers) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
        <>
          <TableRow
            className={cn(
              'cursor-pointer hover:bg-muted/50 transition-colors',
              entry.rank === 1 && 'bg-yellow-50',
              entry.rank === 2 && 'bg-gray-50',
              entry.rank === 3 && 'bg-orange-50'
            )}
          >
            <TableCell className="w-16 text-center">
              <RankBadge rank={entry.rank} />
            </TableCell>
            <TableCell>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{entry.name}</span>
                <Users className="h-4 w-4 text-muted-foreground ml-1" />
                <span className="text-xs text-muted-foreground">
                  ({entry.members!.length})
                </span>
              </CollapsibleTrigger>
            </TableCell>
            <TableCell className="text-center font-mono">{scoreDisplay}</TableCell>
            <TableCell className="text-center text-muted-foreground">
              {attemptsDisplay}
            </TableCell>
          </TableRow>
          <CollapsibleContent asChild>
            <TableRow className="bg-muted/30">
              <TableCell colSpan={4} className="py-2 pl-12">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Members: </span>
                  {entry.members!.join(', ')}
                </div>
              </TableCell>
            </TableRow>
          </CollapsibleContent>
        </>
      </Collapsible>
    );
  }

  return (
    <TableRow
      className={cn(
        entry.rank === 1 && 'bg-yellow-50',
        entry.rank === 2 && 'bg-gray-50',
        entry.rank === 3 && 'bg-orange-50'
      )}
    >
      <TableCell className="w-16 text-center">
        <RankBadge rank={entry.rank} />
      </TableCell>
      <TableCell>
        <span className="font-medium">{entry.name}</span>
      </TableCell>
      <TableCell className="text-center font-mono">{scoreDisplay}</TableCell>
      <TableCell className="text-center text-muted-foreground">
        {attemptsDisplay}
      </TableCell>
    </TableRow>
  );
}
