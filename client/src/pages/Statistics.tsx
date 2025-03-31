import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import DataSummary from '@/components/DataSummary';
import { ChartData, TimeFrame } from '@/types';

const Statistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');
  
  // Fetch calorie data
  const { data: caloriesData, isLoading: isLoadingCalories } = useQuery({
    queryKey: ['/api/calories'],
  });
  
  // Fetch weight data
  const { data: weightsData, isLoading: isLoadingWeights } = useQuery({
    queryKey: ['/api/weights'],
  });
  
  // Fetch workout data
  const { data: workoutsData, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ['/api/workouts'],
  });
  
  // Handle export data
  const handleExportData = () => {
    // Combine all data for export
    const exportData = {
      calories: caloriesData || [],
      weights: weightsData || [],
      workouts: workoutsData || [],
      exportDate: new Date().toISOString(),
    };
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fittrack-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Get date range based on selected time frame
  const getDateRange = () => {
    const today = new Date();
    
    switch(timeFrame) {
      case 'daily':
        return {
          start: startOfDay(today),
          end: endOfDay(today),
          format: 'HH:mm',
          interval: 'hour',
        };
      case 'weekly':
        return {
          start: startOfWeek(today),
          end: endOfWeek(today),
          format: 'EEE',
          interval: 'day',
        };
      case 'monthly':
        return {
          start: startOfMonth(subMonths(today, 1)),
          end: endOfMonth(today),
          format: 'MMM dd',
          interval: 'week',
        };
      case 'yearly':
        return {
          start: startOfYear(today),
          end: endOfYear(today),
          format: 'MMM',
          interval: 'month',
        };
      default:
        return {
          start: startOfWeek(today),
          end: endOfWeek(today),
          format: 'EEE',
          interval: 'day',
        };
    }
  };
  
  // Filter data based on selected time frame
  const getFilteredData = (data: any[], dateField: string) => {
    if (!data || data.length === 0) return [];
    
    const { start, end } = getDateRange();
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };
  
  // Generates chart data for calories over time
  const getCaloriesChartData = (): ChartData => {
    if (!caloriesData || caloriesData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Calories',
          data: [0],
          borderColor: 'hsl(235 81% 48%)',
          backgroundColor: 'hsla(235, 81%, 48%, 0.1)',
        }]
      };
    }
    
    const filteredData = getFilteredData(caloriesData, 'date');
    const { format: dateFormat } = getDateRange();
    
    // Sort by date
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const labels = sortedData.map(entry => format(new Date(entry.date), dateFormat));
    const caloriesValues = sortedData.map(entry => entry.totalCalories);
    
    return {
      labels,
      datasets: [{
        label: 'Calories',
        data: caloriesValues,
        borderColor: 'hsl(235 81% 48%)',
        backgroundColor: 'hsla(235, 81%, 48%, 0.1)',
        fill: true,
        tension: 0.3
      }]
    };
  };
  
  // Generates chart data for weight progress
  const getWeightChartData = (): ChartData => {
    if (!weightsData || weightsData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Weight (lbs)',
          data: [0],
          borderColor: 'hsl(40, 96%, 53%)',
          backgroundColor: 'hsla(40, 96%, 53%, 0.1)',
        }]
      };
    }
    
    const filteredData = getFilteredData(weightsData, 'date');
    const { format: dateFormat } = getDateRange();
    
    // Sort by date
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const labels = sortedData.map(entry => format(new Date(entry.date), dateFormat));
    const weightValues = sortedData.map(entry => Number(entry.weight));
    
    return {
      labels,
      datasets: [{
        label: 'Weight (lbs)',
        data: weightValues,
        borderColor: 'hsl(40, 96%, 53%)',
        backgroundColor: 'hsla(40, 96%, 53%, 0.1)',
        fill: true,
        tension: 0.3
      }]
    };
  };
  
  // Generates chart data for workout frequency
  const getWorkoutFrequencyChartData = (): ChartData => {
    if (!workoutsData || workoutsData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Workouts',
          data: [0],
          backgroundColor: 'hsla(160, 84%, 39%, 0.7)',
        }]
      };
    }
    
    const filteredData = getFilteredData(workoutsData, 'date');
    const { format: dateFormat, interval } = getDateRange();
    
    // For frequency, we need to count workouts per interval
    // This would be more complex in a real app with proper date bucketing
    
    // Simple approach: group by formatted date
    const workoutsByInterval: Record<string, number> = {};
    
    filteredData.forEach(workout => {
      const formattedDate = format(new Date(workout.date), dateFormat);
      workoutsByInterval[formattedDate] = (workoutsByInterval[formattedDate] || 0) + 1;
    });
    
    const labels = Object.keys(workoutsByInterval);
    const counts = Object.values(workoutsByInterval);
    
    return {
      labels,
      datasets: [{
        label: 'Workout Sessions',
        data: counts,
        backgroundColor: 'hsla(160, 84%, 39%, 0.7)',
      }]
    };
  };
  
  // Generate correlation chart (e.g., calories vs weight)
  const getCorrelationChartData = (): ChartData => {
    if (!caloriesData || !weightsData || caloriesData.length === 0 || weightsData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Correlation',
          data: [{ x: 0, y: 0 }],
          backgroundColor: 'hsla(235, 81%, 48%, 0.7)',
        }]
      };
    }
    
    // Match weights with calories by date for correlation
    const dataPoints = [];
    
    // Use a map to quickly find weights by date string
    const weightsByDate = new Map();
    weightsData.forEach(weight => {
      const dateStr = format(new Date(weight.date), 'yyyy-MM-dd');
      weightsByDate.set(dateStr, Number(weight.weight));
    });
    
    // For each calorie entry, find a matching weight
    for (const calorie of caloriesData) {
      const dateStr = format(new Date(calorie.date), 'yyyy-MM-dd');
      if (weightsByDate.has(dateStr)) {
        dataPoints.push({
          x: calorie.totalCalories,
          y: weightsByDate.get(dateStr)
        });
      }
    }
    
    return {
      datasets: [{
        label: 'Calories vs Weight',
        data: dataPoints,
        backgroundColor: 'hsla(235, 81%, 48%, 0.7)',
      }]
    };
  };

  // Calculate summary statistics
  const getCaloriesSummary = () => {
    if (!caloriesData || caloriesData.length === 0) {
      return {
        average: '-',
        highest: '-',
        lowest: '-'
      };
    }
    
    const calorieValues = caloriesData.map(entry => entry.totalCalories);
    
    return {
      average: Math.round(calorieValues.reduce((sum, val) => sum + val, 0) / calorieValues.length),
      highest: Math.max(...calorieValues),
      lowest: Math.min(...calorieValues)
    };
  };
  
  const getWeightSummary = () => {
    if (!weightsData || weightsData.length === 0) {
      return {
        start: '-',
        current: '-',
        change: '-'
      };
    }
    
    // Sort by date
    const sortedWeights = [...weightsData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const startWeight = Number(sortedWeights[0].weight);
    const currentWeight = Number(sortedWeights[sortedWeights.length - 1].weight);
    const change = currentWeight - startWeight;
    
    return {
      start: startWeight.toFixed(1),
      current: currentWeight.toFixed(1),
      change: change.toFixed(1)
    };
  };
  
  const getWorkoutSummary = () => {
    if (!workoutsData || workoutsData.length === 0) {
      return {
        total: 0,
        mostCommon: '-',
        avgDuration: '-'
      };
    }
    
    // Count workout types
    const typeCounts: Record<string, number> = {};
    let totalDuration = 0;
    
    workoutsData.forEach(workout => {
      const type = workout.type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      totalDuration += workout.duration;
    });
    
    // Find most common type
    let mostCommonType = '';
    let maxCount = 0;
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        mostCommonType = type;
        maxCount = count;
      }
    });
    
    // Map the type code to a readable label
    const typeLabels: Record<string, string> = {
      upper: 'Upper Body',
      lower: 'Lower Body',
      full: 'Full Body',
      cardio: 'Cardio',
      hiit: 'HIIT',
      other: 'Other'
    };
    
    return {
      total: workoutsData.length,
      mostCommon: typeLabels[mostCommonType] || mostCommonType,
      avgDuration: Math.round(totalDuration / workoutsData.length)
    };
  };

  const isLoading = isLoadingCalories || isLoadingWeights || isLoadingWorkouts;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Statistics & Analysis</h1>
        <div className="flex space-x-2">
          <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            onClick={handleExportData}
            disabled={isLoading}
          >
            Export Data
          </Button>
        </div>
      </div>
      
      {/* Tabs for different stats views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="border-b border-gray-200 w-full justify-start">
          <TabsTrigger value="all" className="px-4 py-2">All Metrics</TabsTrigger>
          <TabsTrigger value="calories" className="px-4 py-2">Calories</TabsTrigger>
          <TabsTrigger value="weight" className="px-4 py-2">Weight</TabsTrigger>
          <TabsTrigger value="workouts" className="px-4 py-2">Workouts</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Statistics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Show different charts based on active tab */}
        {(activeTab === 'all' || activeTab === 'calories') && (
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-medium">Calories Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                {isLoadingCalories ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Loading data...
                  </div>
                ) : (
                  <LineChart chartData={getCaloriesChartData()} />
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {(activeTab === 'all' || activeTab === 'weight') && (
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-medium">Weight Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                {isLoadingWeights ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Loading data...
                  </div>
                ) : (
                  <LineChart chartData={getWeightChartData()} />
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {(activeTab === 'all' || activeTab === 'workouts') && (
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-medium">Workout Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                {isLoadingWorkouts ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Loading data...
                  </div>
                ) : (
                  <BarChart chartData={getWorkoutFrequencyChartData()} />
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'all' && (
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg font-medium">Metrics Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Loading data...
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {caloriesData?.length && weightsData?.length ? (
                      <LineChart 
                        chartData={getCorrelationChartData()} 
                        type="scatter" 
                        xLabel="Calories" 
                        yLabel="Weight (lbs)"
                      />
                    ) : (
                      <p className="text-gray-500">Not enough data for correlation analysis</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Summary Statistics */}
      <DataSummary 
        caloriesSummary={getCaloriesSummary()}
        weightSummary={getWeightSummary()}
        workoutSummary={getWorkoutSummary()}
        isLoading={isLoading}
        activeTab={activeTab}
      />
    </div>
  );
};

export default Statistics;
