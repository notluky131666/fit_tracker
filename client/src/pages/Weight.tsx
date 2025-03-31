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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import WeightForm from '@/components/forms/WeightForm';
import LineChart from '@/components/charts/LineChart';
import { WeightEntry, ChartData } from '@/types';

const Weight: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('30days');
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch weight entries
  const { data: weightEntries, isLoading } = useQuery<WeightEntry[]>({
    queryKey: ['/api/weights'],
  });

  // Create a new weight entry
  const createWeightMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/weights', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity/recent'] });
      toast({ title: 'Success', description: 'Weight entry added successfully' });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to add weight entry: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Update an existing weight entry
  const updateWeightMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest('PUT', `/api/weights/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity/recent'] });
      toast({ title: 'Success', description: 'Weight entry updated successfully' });
      setIsFormOpen(false);
      setEditingEntry(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to update weight entry: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Delete a weight entry
  const deleteWeightMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/weights/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity/recent'] });
      toast({ title: 'Success', description: 'Weight entry deleted successfully' });
      setIsDeleteDialogOpen(false);
      setEntryToDelete(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to delete weight entry: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  const handleFormSubmit = (values: any) => {
    const formData = {
      ...values,
      date: new Date(values.date),
      weight: Number(values.weight),
    };

    if (editingEntry) {
      updateWeightMutation.mutate({ id: editingEntry.id, data: formData });
    } else {
      createWeightMutation.mutate(formData);
    }
  };

  const handleEditClick = (entry: WeightEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setEntryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete !== null) {
      deleteWeightMutation.mutate(entryToDelete);
    }
  };

  // Format weight entry date for form
  const formatDateForForm = (date: Date) => {
    return format(new Date(date), 'yyyy-MM-dd');
  };

  // Get filtered entries based on selected period
  const getFilteredEntries = () => {
    if (!weightEntries) return [];
    
    const now = new Date();
    let filteredEntries = [...weightEntries];
    
    if (filterPeriod === '30days') {
      const cutoffDate = new Date(now.setDate(now.getDate() - 30));
      filteredEntries = weightEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    } else if (filterPeriod === '3months') {
      const cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
      filteredEntries = weightEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    } else if (filterPeriod === '6months') {
      const cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
      filteredEntries = weightEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    } 
    // else 'all' - return all entries
    
    return filteredEntries;
  };

  // Calculate weight change between consecutive entries
  const calculateWeightChange = (entryIndex: number, entries: WeightEntry[]) => {
    if (entryIndex === entries.length - 1) return null; // Last entry has no previous to compare
    
    const currentWeight = entries[entryIndex].weight;
    const previousWeight = entries[entryIndex + 1].weight; // Entries are sorted newest first
    const diff = Number(currentWeight) - Number(previousWeight);
    
    return {
      value: Math.abs(diff).toFixed(1),
      isGain: diff > 0,
    };
  };

  // Generate chart data for weight trends
  const getWeightTrendData = (): ChartData => {
    const filteredEntries = getFilteredEntries();
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const labels = sortedEntries.map(entry => format(new Date(entry.date), 'MMM dd'));
    const weightData = sortedEntries.map(entry => Number(entry.weight));
    
    // Calculate goal line if we have a starting weight
    const goalWeight = 175; // Placeholder - in a real app, this would be user-set
    const goalLine = Array(labels.length).fill(goalWeight);
    
    return {
      labels,
      datasets: [
        {
          label: 'Weight (lbs)',
          data: weightData,
          borderColor: 'hsl(40, 96%, 53%)',
          backgroundColor: 'hsla(40, 96%, 53%, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Goal',
          data: goalLine,
          borderColor: 'hsl(142, 72%, 29%)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          fill: false,
          tension: 0
        }
      ]
    };
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Weight Tracker</h1>
        <Button onClick={() => { setEditingEntry(null); setIsFormOpen(true); }}>
          Log Weight
        </Button>
      </div>
      
      {/* Weight History Table */}
      <Card className="overflow-hidden mb-8">
        <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Weight History</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
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
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (lbs)</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-4 text-center text-gray-500">Loading weight data...</TableCell>
                </TableRow>
              ) : getFilteredEntries().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-4 text-center text-gray-500">No weight entries found. Start logging to see your data!</TableCell>
                </TableRow>
              ) : (
                getFilteredEntries().map((entry, index, entries) => {
                  const change = calculateWeightChange(index, entries);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Number(entry.weight).toFixed(1)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        {change ? (
                          <Badge variant={change.isGain ? "destructive" : "success"} className="font-normal">
                            {change.isGain ? '+' : '-'}{change.value}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.notes || '-'}
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Weight Trends Chart */}
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg font-medium">Weight Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64">
            <LineChart chartData={getWeightTrendData()} />
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Weight Entry Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Weight Entry' : 'Log Weight'}</DialogTitle>
            <DialogDescription>
              {editingEntry 
                ? 'Update your weight entry details below.' 
                : 'Enter your weight measurements below.'}
            </DialogDescription>
          </DialogHeader>
          
          <WeightForm 
            defaultValues={editingEntry ? {
              date: formatDateForForm(editingEntry.date),
              weight: Number(editingEntry.weight),
              notes: editingEntry.notes
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isEditing={!!editingEntry}
            isPending={createWeightMutation.isPending || updateWeightMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this weight entry? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteWeightMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteWeightMutation.isPending}
            >
              {deleteWeightMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Weight;
