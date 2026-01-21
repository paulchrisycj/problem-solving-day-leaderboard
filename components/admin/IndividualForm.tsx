'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
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
import { useSocket } from '@/hooks/useSocket';
import { individualSchema, type IndividualInput } from '@/lib/validation';
import { toast } from 'sonner';

export function IndividualForm() {
  const { createParticipant } = useSocket();

  const form = useForm<IndividualInput>({
    resolver: zodResolver(individualSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = (data: IndividualInput) => {
    createParticipant('individual', data.name);
    toast.success(`Individual "${data.name}" registered!`);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participant Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Register Individual
        </Button>
      </form>
    </Form>
  );
}
