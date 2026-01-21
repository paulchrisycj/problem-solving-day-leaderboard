'use client';

import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: number;
  className?: string;
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  if (rank === 0) {
    // Unranked (no score yet)
    return (
      <span className={cn('text-gray-400 font-medium', className)}>-</span>
    );
  }

  if (rank === 1) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold',
          className
        )}
        title="1st Place"
      >
        1
      </span>
    );
  }

  if (rank === 2) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold',
          className
        )}
        title="2nd Place"
      >
        2
      </span>
    );
  }

  if (rank === 3) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 font-bold',
          className
        )}
        title="3rd Place"
      >
        3
      </span>
    );
  }

  return (
    <span className={cn('font-medium text-gray-600', className)}>{rank}</span>
  );
}
