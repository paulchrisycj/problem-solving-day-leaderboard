'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/hooks/useSocket';
import {
  individualSchema,
  groupSchema,
  type IndividualInput,
  type GroupInput,
} from '@/lib/validation';
import { toast } from 'sonner';
import type { Participant } from '@/types';

interface ParticipantEditDialogProps {
  participant: Participant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParticipantEditDialog({
  participant,
  open,
  onOpenChange,
}: ParticipantEditDialogProps) {
  const { updateParticipantSocket } = useSocket();
  const [memberInput, setMemberInput] = useState('');

  const isGroup = participant?.type === 'group';
  const schema = isGroup ? groupSchema : individualSchema;

  const form = useForm<IndividualInput | GroupInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      ...(isGroup && { members: [] }),
    },
  });

  // Reset form when participant changes
  useEffect(() => {
    if (participant) {
      if (participant.type === 'group') {
        form.reset({
          name: participant.name,
          members: participant.members,
        });
      } else {
        form.reset({
          name: participant.name,
        });
      }
    }
  }, [participant, form]);

  const members = isGroup ? (form.watch('members') as string[]) : [];

  const addMember = () => {
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed)) {
      form.setValue('members', [...members, trimmed]);
      setMemberInput('');
    }
  };

  const removeMember = (index: number) => {
    form.setValue(
      'members',
      members.filter((_, i) => i !== index)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMember();
    }
  };

  const onSubmit = (data: IndividualInput | GroupInput) => {
    if (!participant) return;

    const updates: { name?: string; members?: string[] } = {
      name: data.name,
    };

    // Only include members if it's a group and no score has been recorded
    if (isGroup && participant.score === null && 'members' in data) {
      updates.members = data.members;
    }

    updateParticipantSocket(participant.id, updates);
    toast.success(`"${data.name}" updated!`);
    onOpenChange(false);
  };

  if (!participant) return null;

  const canEditMembers = isGroup && participant.score === null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit {isGroup ? 'Group' : 'Individual'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isGroup && (
              <FormField
                control={form.control}
                name="members"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Members
                      {!canEditMembers && (
                        <span className="text-muted-foreground text-xs ml-2">
                          (locked after first score)
                        </span>
                      )}
                    </FormLabel>
                    {canEditMembers && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter member name"
                          value={memberInput}
                          onChange={(e) => setMemberInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addMember}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <FormMessage />
                    {members.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {members.map((member, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {member}
                            {canEditMembers && (
                              <button
                                type="button"
                                onClick={() => removeMember(index)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
