'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { groupSchema, type GroupInput } from '@/lib/validation';
import { toast } from 'sonner';

export function GroupForm() {
  const { createParticipant } = useSocket();
  const [memberInput, setMemberInput] = useState('');

  const form = useForm<GroupInput>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      members: [],
    },
  });

  const members = form.watch('members');

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

  const onSubmit = (data: GroupInput) => {
    createParticipant('group', data.name, data.members);
    toast.success(`Group "${data.name}" registered with ${data.members.length} members!`);
    form.reset();
    setMemberInput('');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="members"
          render={() => (
            <FormItem>
              <FormLabel>Members (min 2)</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter member name"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button type="button" variant="secondary" onClick={addMember}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
              {members.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {members.map((member, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {member}
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Register Group
        </Button>
      </form>
    </Form>
  );
}
