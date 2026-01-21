'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';
import type { Participant } from '@/types';

interface DeleteConfirmDialogProps {
  participant: Participant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmDialog({
  participant,
  open,
  onOpenChange,
}: DeleteConfirmDialogProps) {
  const { deleteParticipantSocket } = useSocket();

  const handleDelete = () => {
    if (!participant) return;

    deleteParticipantSocket(participant.id, participant.type);
    toast.success(`"${participant.name}" has been deleted.`);
    onOpenChange(false);
  };

  if (!participant) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {participant.type === 'group' ? 'Group' : 'Individual'}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{participant.name}"? This action
            cannot be undone.
            {participant.score !== null && (
              <span className="block mt-2 font-medium text-destructive">
                Warning: This participant has a recorded score of {participant.score}.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
