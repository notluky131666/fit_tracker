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
import { CalorieEntry } from '@/types';

// Form schema with validation
const caloriesFormSchema = z.object({
  date: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "Please select a valid date",
  }),
  totalCalories: z.coerce.number().min(1, "Please enter a positive number"),
  protein: z.coerce.number().min(0, "Please enter a non-negative number").optional(),
  carbs: z.coerce.number().min(0, "Please enter a non-negative number").optional(),
  fat: z.coerce.number().min(0, "Please enter a non-negative number").optional(),
  notes: z.string().optional(),
});

type CaloriesFormValues = z.infer<typeof caloriesFormSchema>;

interface CaloriesFormProps {
  defaultValues?: Partial<CaloriesFormValues>;
  onSubmit: (values: CaloriesFormValues) => void;
  onCancel: () => void;
  isEditing: boolean;
  isPending: boolean;
}

const CaloriesForm: React.FC<CaloriesFormProps> = ({
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
    totalCalories: defaultValues?.totalCalories || 0,
    protein: defaultValues?.protein || 0,
    carbs: defaultValues?.carbs || 0,
    fat: defaultValues?.fat || 0,
    notes: defaultValues?.notes || '',
  };

  // Initialize form with default values
  const form = useForm<CaloriesFormValues>({
    resolver: zodResolver(caloriesFormSchema),
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
              name="totalCalories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Calories</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="protein"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protein (g)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="carbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbs (g)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="fat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fat (g)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
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

export default CaloriesForm;
