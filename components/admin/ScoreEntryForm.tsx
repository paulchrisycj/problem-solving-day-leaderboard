'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trophy } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSocket } from '@/hooks/useSocket';
import { useAppContext } from '@/context/AppContext';
import { scoreSchema, type ScoreInput } from '@/lib/validation';
import { toast } from 'sonner';

export function ScoreEntryForm() {
  const { submitScore } = useSocket();
  const { state } = useAppContext();

  const form = useForm<ScoreInput>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      participantId: '',
      participantType: 'individual',
      score: 0,
    },
  });

  const selectedType = form.watch('participantType');
  const participants =
    selectedType === 'individual' ? state.individuals : state.groups;

  // Filter out participants who have already used both attempts
  const availableParticipants = participants.filter((p) => p.attempts < 2);

  const onSubmit = (data: ScoreInput) => {
    const participant = participants.find((p) => p.id === data.participantId);
    if (!participant) {
      toast.error('Participant not found');
      return;
    }

    if (participant.attempts >= 2) {
      toast.error('This participant has already used both attempts');
      return;
    }

    submitScore(data.participantId, data.participantType, data.score);
    toast.success(
      `Score ${data.score} submitted for "${participant.name}" (Attempt ${participant.attempts + 1}/2)`
    );
    form.reset({
      participantId: '',
      participantType: selectedType,
      score: 0,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="participantType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participant Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue('participantId', '');
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="participantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participant</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select participant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableParticipants.length === 0 ? (
                    <SelectItem value="" disabled>
                      No participants available
                    </SelectItem>
                  ) : (
                    availableParticipants.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.attempts}/2 attempts)
                        {p.score !== null && ` - Best: ${p.score}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Score (0-15)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={15}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={availableParticipants.length === 0}
        >
          <Trophy className="mr-2 h-4 w-4" />
          Submit Score
        </Button>
      </form>
    </Form>
  );
}
