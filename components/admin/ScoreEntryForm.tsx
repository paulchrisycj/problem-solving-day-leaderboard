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

const INDIVIDUAL_TOTAL_CASES = parseInt(
  process.env.NEXT_PUBLIC_INDVIDUAL_TEST_CASES || '40',
  10
);
const GROUP_TOTAL_CASES = parseInt(
  process.env.NEXT_PUBLIC_GROUP_TEST_CASES || '15',
  10
);
const INDIVIDUAL_TOTAL_SCORE = parseFloat(
  process.env.NEXT_PUBLIC_INDIVIDUAL_TOTAL_SCORE || '10'
);
const GROUP_TOTAL_SCORE = parseFloat(
  process.env.NEXT_PUBLIC_GROUP_TOTAL_SCORE || '15'
);

function computeScore(
  testCasesPassed: number,
  participantType: 'individual' | 'group'
): number {
  const totalCases =
    participantType === 'individual' ? INDIVIDUAL_TOTAL_CASES : GROUP_TOTAL_CASES;
  const totalScore =
    participantType === 'individual' ? INDIVIDUAL_TOTAL_SCORE : GROUP_TOTAL_SCORE;
  if (totalCases === 0) return 0;
  return parseFloat(((testCasesPassed / totalCases) * totalScore).toFixed(4));
}

export function ScoreEntryForm() {
  const { submitScore } = useSocket();
  const { state } = useAppContext();

  const form = useForm<ScoreInput>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      participantId: '',
      participantType: 'individual',
      testCasesPassed: 0,
      score: 0,
    },
  });

  const selectedType = form.watch('participantType');
  const testCasesPassed = form.watch('testCasesPassed');
  const participants =
    selectedType === 'individual' ? state.individuals : state.groups;

  const availableParticipants = participants.filter((p) => p.attempts < 2);

  const totalCases =
    selectedType === 'individual' ? INDIVIDUAL_TOTAL_CASES : GROUP_TOTAL_CASES;
  const previewScore = computeScore(testCasesPassed, selectedType);

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

    submitScore(data.participantId, data.participantType, data.testCasesPassed, data.score);
    toast.success(
      `Score ${data.score} submitted for "${participant.name}" (Attempt ${participant.attempts + 1}/2)`
    );
    form.reset({
      participantId: '',
      participantType: selectedType,
      testCasesPassed: 0,
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
                  form.setValue('testCasesPassed', 0);
                  form.setValue('score', 0);
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
                    <SelectItem value="No participants available" disabled>
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
          name="testCasesPassed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Cases Passed (out of {totalCases})</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  value={field.value.toString()}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value === '') {
                      field.onChange(0);
                      form.setValue('score', 0);
                      return;
                    }
                    const num = Math.min(totalCases, Math.max(0, parseInt(value, 10)));
                    field.onChange(num);
                    form.setValue('score', computeScore(num, selectedType));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Calculated score: </span>
          <span className="font-semibold font-mono">{previewScore}</span>
        </div>

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
