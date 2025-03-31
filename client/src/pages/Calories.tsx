import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import CaloriesForm from '@/components/forms/CaloriesForm';
import WeeklyProgressChart from '@/components/charts/WeeklyProgressChart';
import { CalorieEntry, ChartData } from '@/types';

const Calories: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('7days');
  const [editingEntry, setEditingEntry] = useState<CalorieEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch calorie entries
  const { data: calorieEntries, isLoading } = useQuery<CalorieEntry[]>({
    queryKey: ['/api/calories'],
  });

  // Create a new calorie entry
  const createCalorieMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/calories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity/recent'] });
      toast({ title: 'Success', description: 'Calorie entry added successfully' });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to add calorie entry: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Update an existing calorie entry
  const updateCalorieMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest('PUT', `/api/calories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity/recent'] });
      toast({ title: 'Success', description: 'Calorie entry updated successfully' });
      setIsFormOpen(false);
      setEditingEntry(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to update calorie entry: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Delete a calorie entry
  const deleteCalorieMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/calories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity/recent'] });
      toast({ title: 'Success', description: 'Calorie entry deleted successfully' });
      setIsDeleteDialogOpen(false);
      setEntryToDelete(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to delete calorie entry: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  const handleFormSubmit = (values: any) => {
    const formData = {
      ...values,
      date: new Date(values.date),
      totalCalories: Number(values.totalCalories),
      protein: values.protein ? Number(values.protein) : undefined,
      carbs: values.carbs ? Number(values.carbs) : undefined,
      fat: values.fat ? Number(values.fat) : undefined,
    };

    if (editingEntry) {
      updateCalorieMutation.mutate({ id: editingEntry.id, data: formData });
    } else {
      createCalorieMutation.mutate(formData);
    }
  };

  const handleEditClick = (entry: CalorieEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setEntryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete !== null) {
      deleteCalorieMutation.mutate(entryToDelete);
    }
  };

  // Format calorie entry date for form
  const formatDateForForm = (date: Date) => {
    return format(new Date(date), 'yyyy-MM-dd');
  };

  // Get filtered entries based on selected period
  const getFilteredEntries = () => {
    if (!calorieEntries) return [];
    
    const now = new Date();
    let filteredEntries = [...calorieEntries];
    
    if (filterPeriod === '7days') {
      const cutoffDate = new Date(now.setDate(now.getDate() - 7));
      filteredEntries = calorieEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    } else if (filterPeriod === '30days') {
      const cutoffDate = new Date(now.setDate(now.getDate() - 30));
      filteredEntries = calorieEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    } else if (filterPeriod === '3months') {
      const cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
      filteredEntries = calorieEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    } 
    // else 'all' - return all entries
    
    return filteredEntries;
  };

  // Generate chart data for calories trends
  const getCaloriesTrendData = (): ChartData => {
    const filteredEntries = getFilteredEntries();
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const labels = sortedEntries.map(entry => format(new Date(entry.date), 'MMM dd'));
    const caloriesData = sortedEntries.map(entry => entry.totalCalories);
    
    // Optional: also show macros if available
    const proteinData = sortedEntries.map(entry => entry.protein || 0);
    const carbsData = sortedEntries.map(entry => entry.carbs || 0);
    const fatData = sortedEntries.map(entry => entry.fat || 0);
    
    return {
      labels,
      datasets: [
        {
          label: 'Calories',
          data: caloriesData,
          borderColor: 'hsl(235 81% 48%)',
          backgroundColor: 'hsla(235, 81%, 48%, 0.7)'
        }
      ]
    };
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Calories Tracker</h1>
        <Button onClick={() => { setEditingEntry(null); setIsFormOpen(true); }}>
          Log Calories
        </Button>
      </div>
      
      {/* Calories History Table */}
      <Card className="overflow-hidden mb-8">
        <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Calories History</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calories</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protein (g)</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs (g)</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fat (g)</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center text-gray-500">Loading calorie data...</TableCell>
                </TableRow>
              ) : getFilteredEntries().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center text-gray-500">No calorie entries found. Start logging to see your data!</TableCell>
                </TableRow>
              ) : (
                getFilteredEntries().map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.totalCalories}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.protein || '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.carbs || '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.fat || '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <Button 
                        variant="link" 
                        className="text-primary hover:text-primary-600"
                        onClick={() => handleEditClick(entry)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="link" 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteClick(entry.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Calories Trends Chart */}
      <WeeklyProgressChart 
        title="Calories Trends" 
        chartData={getCaloriesTrendData()} 
      />
      
      {/* Add/Edit Calorie Entry Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Calorie Entry' : 'Log Calories'}</DialogTitle>
            <DialogDescription>
              {editingEntry 
                ? 'Update your calorie entry details below.' 
                : 'Enter the details of your calorie intake below.'}
            </DialogDescription>
          </DialogHeader>
          
          <CaloriesForm 
            defaultValues={editingEntry ? {
              date: formatDateForForm(editingEntry.date),
              totalCalories: editingEntry.totalCalories,
              protein: editingEntry.protein,
              carbs: editingEntry.carbs,
              fat: editingEntry.fat,
              notes: editingEntry.notes
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isEditing={!!editingEntry}
            isPending={createCalorieMutation.isPending || updateCalorieMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this calorie entry? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteCalorieMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteCalorieMutation.isPending}
            >
              {deleteCalorieMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calories;
