import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import WorkoutForm from '@/components/forms/WorkoutForm';
import BarChart from '@/components/charts/BarChart';
import DoughnutChart from '@/components/charts/DoughnutChart';
import { WorkoutEntry, ChartData } from '@/types';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const Workouts: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('30days');
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    getWorkoutEntries, 
    createWorkoutEntry, 
    updateWorkoutEntry, 
    deleteWorkoutEntry 
  } = useSupabaseData();

  // Fetch workout entries
  const { data: workoutEntries, isLoading } = useQuery<WorkoutEntry[]>({
    queryKey: ['workouts'],
    queryFn: getWorkoutEntries
  });
  
  // Refresh data when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['workouts'] });
  }, [queryClient]);

  // Create a new workout entry
  const createWorkoutMutation = useMutation({
    mutationFn: (data: Omit<WorkoutEntry, 'id' | 'userId' | 'createdAt'>) => createWorkoutEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      toast({ title: 'Success', description: 'Workout entry added successfully' });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to add workout entry: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Update an existing workout entry
  const updateWorkoutMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Omit<WorkoutEntry, 'id' | 'userId' | 'createdAt'>> }) => 
      updateWorkoutEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      toast({ title: 'Success', description: 'Workout entry updated successfully' });
      setIsFormOpen(false);
      setEditingEntry(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to update workout entry: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Delete a workout entry
  const deleteWorkoutMutation = useMutation({
    mutationFn: (id: number) => deleteWorkoutEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      toast({ title: 'Success', description: 'Workout entry deleted successfully' });
      setIsDeleteDialogOpen(false);
      setEntryToDelete(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to delete workout entry: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  const handleFormSubmit = (values: any) => {
    try {
      console.log('Form values received:', values);
      
      // Make sure date is valid
      const dateValue = values.date ? new Date(values.date) : new Date();
      if (isNaN(dateValue.getTime())) {
        throw new Error('Invalid date format');
      }
      
      const formData = {
        ...values,
        date: dateValue,
        duration: Number(values.duration) || 0,
        type: values.type || 'other',
        intensity: values.intensity || 'medium',
        notes: values.notes || ''
      };
      
      console.log('Formatted form data:', formData);

      if (editingEntry) {
        console.log('Updating entry with ID:', editingEntry.id);
        updateWorkoutMutation.mutate({ id: editingEntry.id, data: formData });
      } else {
        console.log('Creating new entry');
        createWorkoutMutation.mutate(formData);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({ 
        title: 'Form Error', 
        description: `Could not process form: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        variant: 'destructive' 
      });
    }
  };

  const handleEditClick = (entry: WorkoutEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setEntryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete !== null) {
      deleteWorkoutMutation.mutate(entryToDelete);
    }
  };

  // Format workout entry date for form
  const formatDateForForm = (date: Date) => {
    return format(new Date(date), 'yyyy-MM-dd');
  };

  // Get filtered entries based on selected period
  const getFilteredEntries = () => {
    if (!workoutEntries) return [];
    
    const now = new Date();
    let filteredEntries = [...workoutEntries];
    
    if (filterPeriod === '30days') {
      const cutoffDate = new Date(now.setDate(now.getDate() - 30));
      filteredEntries = workoutEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    } else if (filterPeriod === '3months') {
      const cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
      filteredEntries = workoutEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    } else if (filterPeriod === '6months') {
      const cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
      filteredEntries = workoutEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    } 
    // else 'all' - return all entries
    
    return filteredEntries;
  };

  // Map workout type to a readable label
  const getWorkoutTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      upper: 'Upper Body',
      lower: 'Lower Body',
      full: 'Full Body',
      cardio: 'Cardio',
      hiit: 'HIIT',
      other: 'Other'
    };
    return typeMap[type] || type;
  };

  // Get intensity badge color
  const getIntensityBadgeVariant = (intensity: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (intensity) {
      case 'low': return 'outline';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'default';
    }
  };

  // Generate chart data for workout types
  const getWorkoutTypesChartData = (): ChartData => {
    if (!workoutEntries || workoutEntries.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Workout Types',
          data: [1],
          backgroundColor: ['#e2e8f0'],
        }]
      };
    }
    
    const filteredEntries = getFilteredEntries();
    
    // Count workout types
    const typeCounts: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      const type = entry.type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    // Prepare chart data
    const labels = Object.keys(typeCounts).map(getWorkoutTypeLabel);
    const data = Object.values(typeCounts);
    
    // Colors for different workout types
    const colors = [
      'hsla(235, 81%, 48%, 0.7)',
      'hsla(160, 84%, 39%, 0.7)',
      'hsla(40, 96%, 53%, 0.7)',
      'hsla(340, 82%, 52%, 0.7)',
      'hsla(262, 80%, 59%, 0.7)',
      'hsla(190, 90%, 50%, 0.7)',
    ];
    
    return {
      labels,
      datasets: [{
        label: 'Workout Types',
        data,
        backgroundColor: colors.slice(0, labels.length),
      }]
    };
  };

  // Generate chart data for weekly workouts
  const getWeeklyWorkoutChartData = (): ChartData => {
    if (!workoutEntries || workoutEntries.length === 0) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Workout Sessions',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'hsla(160, 84%, 39%, 0.7)',
        }]
      };
    }
    
    // Get workouts from last 7 days and count per day of week
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - 7));
    
    const recentWorkouts = workoutEntries.filter(entry => 
      new Date(entry.date) >= weekStart
    );
    
    // Count workouts per day of week (0 = Sunday, 1 = Monday, etc.)
    const dayCount = Array(7).fill(0);
    
    recentWorkouts.forEach(workout => {
      const date = new Date(workout.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      dayCount[dayOfWeek] = dayCount[dayOfWeek] + 1;
    });
    
    // Reorder to start with Monday
    const reorderedDayCount = [
      ...dayCount.slice(1), // Monday to Saturday
      dayCount[0]           // Sunday
    ];
    
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Workout Sessions',
        data: reorderedDayCount,
        backgroundColor: 'hsla(160, 84%, 39%, 0.7)',
      }]
    };
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Workout Tracker</h1>
        <Button onClick={() => { setEditingEntry(null); setIsFormOpen(true); }}>
          Log Workout
        </Button>
      </div>
      
      {/* Workout History Table */}
      <Card className="overflow-hidden mb-8">
        <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Workout History</CardTitle>
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
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workout Type</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intensity</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center text-gray-500">Loading workout data...</TableCell>
                </TableRow>
              ) : getFilteredEntries().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center text-gray-500">No workout entries found. Start logging to see your data!</TableCell>
                </TableRow>
              ) : (
                getFilteredEntries().map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getWorkoutTypeLabel(entry.type)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.duration} min
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant={getIntensityBadgeVariant(entry.intensity)}>
                        {entry.intensity.charAt(0).toUpperCase() + entry.intensity.slice(1)}
                      </Badge>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Workout Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg font-medium">Workout Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <DoughnutChart chartData={getWorkoutTypesChartData()} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg font-medium">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <BarChart chartData={getWeeklyWorkoutChartData()} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add/Edit Workout Entry Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Workout Entry' : 'Log Workout'}</DialogTitle>
            <DialogDescription>
              {editingEntry 
                ? 'Update your workout details below.' 
                : 'Enter the details of your workout below.'}
            </DialogDescription>
          </DialogHeader>
          
          <WorkoutForm 
            defaultValues={editingEntry ? {
              date: formatDateForForm(editingEntry.date),
              type: editingEntry.type,
              duration: editingEntry.duration,
              intensity: editingEntry.intensity,
              notes: editingEntry.notes
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isEditing={!!editingEntry}
            isPending={createWorkoutMutation.isPending || updateWorkoutMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workout entry? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteWorkoutMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteWorkoutMutation.isPending}
            >
              {deleteWorkoutMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workouts;
