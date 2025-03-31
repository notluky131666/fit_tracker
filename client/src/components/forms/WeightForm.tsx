import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WeightEntry } from '@/types';


const weightFormSchema = z.object({
  date: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "Please select a valid date",
  }),
  weight: z.coerce.number().positive("Please enter a positive number"),
  notes: z.string().optional(),
});

type WeightFormValues = z.infer<typeof weightFormSchema>;

interface WeightFormProps {
  onSubmit: (values: WeightFormValues) => void;
  defaultValues?: Partial<WeightFormValues>;
}

const WeightForm: React.FC<WeightFormProps> = ({ onSubmit, defaultValues }) => {
  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      date: defaultValues?.date || new Date().toISOString().split('T')[0],
      weight: defaultValues?.weight || undefined,
      notes: defaultValues?.notes || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {defaultValues ? 'Update Entry' : 'Add Entry'}
        </Button>
      </form>
    </Form>
  );
};

export default WeightForm;