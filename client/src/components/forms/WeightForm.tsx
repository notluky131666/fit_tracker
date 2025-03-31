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

// Form schema with validation
const weightFormSchema = z.object({
  date: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "Please select a valid date",
  }),
  weight: z.coerce.number().positive("Please enter a positive number"),
  notes: z.string().optional(),
});

type WeightFormValues = z.infer<typeof weightFormSchema>;

interface WeightFormProps {
  defaultValues?: Partial<WeightFormValues>;
  onSubmit: (values: WeightFormValues) => void;
  onCancel: () => void;
  isEditing: boolean;
  isPending: boolean;
}

const WeightForm: React.FC<WeightFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing,
  isPending
}) => {
  // Get the current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Create proper default values to avoid type errors
  const formDefaultValues = {
    date: defaultValues?.date || today,
    weight: defaultValues?.weight || 70, // Set a reasonable default in kg
    notes: defaultValues?.notes || '',
  };

  // Initialize form with default values
  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: formDefaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
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
          </div>
          
          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="sm:col-span-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <Button 
            type="submit" 
            className="sm:col-start-2"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="mt-3 sm:mt-0 sm:col-start-1"
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WeightForm;
