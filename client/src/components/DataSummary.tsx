import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SummarySection {
  title: string;
  items: {
    label: string;
    value: string | number;
    color?: string;
  }[];
}

interface DataSummaryProps {
  caloriesSummary: {
    average: string | number;
    highest: string | number;
    lowest: string | number;
  };
  weightSummary: {
    start: string | number;
    current: string | number;
    change: string | number;
  };
  workoutSummary: {
    total: string | number;
    mostCommon: string;
    avgDuration: string | number;
  };
  isLoading: boolean;
  activeTab: string;
}

const DataSummary: React.FC<DataSummaryProps> = ({ 
  caloriesSummary, 
  weightSummary, 
  workoutSummary, 
  isLoading,
  activeTab
}) => {
  const getSummarySections = (): SummarySection[] => {
    const sections: SummarySection[] = [];
    
    if (activeTab === 'all' || activeTab === 'calories') {
      sections.push({
        title: 'Calories',
        items: [
          { label: 'Average Daily', value: caloriesSummary.average },
          { label: 'Highest Day', value: caloriesSummary.highest },
          { label: 'Lowest Day', value: caloriesSummary.lowest }
        ]
      });
    }
    
    if (activeTab === 'all' || activeTab === 'weight') {
      sections.push({
        title: 'Weight',
        items: [
          { label: 'Starting Weight', value: `${weightSummary.start} lbs` },
          { label: 'Current Weight', value: `${weightSummary.current} lbs` },
          { 
            label: 'Total Change', 
            value: `${Number(weightSummary.change) <= 0 ? '' : '+'}${weightSummary.change} lbs`,
            color: Number(weightSummary.change) <= 0 ? 'text-green-600' : 'text-red-500'
          }
        ]
      });
    }
    
    if (activeTab === 'all' || activeTab === 'workouts') {
      sections.push({
        title: 'Workouts',
        items: [
          { label: 'Total Workouts', value: workoutSummary.total },
          { label: 'Most Common Type', value: workoutSummary.mostCommon },
          { label: 'Average Duration', value: `${workoutSummary.avgDuration} minutes` }
        ]
      });
    }
    
    return sections;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium">Summary Statistics</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {isLoading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-6">
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="space-y-4 mt-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))
        ) : (
          getSummarySections().map((section, index) => (
            <div key={index} className="p-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">{section.title}</h3>
              <dl className="grid grid-cols-1 gap-y-4">
                {section.items.map((item, i) => (
                  <div key={i}>
                    <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                    <dd className={`mt-1 text-lg font-semibold ${item.color || 'text-gray-900'}`}>
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default DataSummary;
