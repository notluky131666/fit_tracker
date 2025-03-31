import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RecentActivity as RecentActivityType } from '@/types';
import { format } from 'date-fns';

interface RecentActivityProps {
  activities: RecentActivityType[];
  isLoading: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, isLoading }) => {
  // Map activity type to a readable label
  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'calorie': return 'Calories Log';
      case 'weight': return 'Weight Log';
      case 'workout': return 'Workout';
      default: return 'Activity';
    }
  };

  return (
    <Card className="overflow-hidden mb-8">
      <CardHeader className="border-b border-gray-200 px-6 py-4">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-4 text-center text-gray-500">
                  Loading recent activities...
                </TableCell>
              </TableRow>
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-4 text-center text-gray-500">
                  No recent activities found. Start tracking to see your progress!
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={`${activity.type}-${activity.id}`}>
                  <TableCell className="whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(activity.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-medium text-gray-900">
                    {getActivityLabel(activity.type)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-500">
                    {activity.metric}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-500">
                    {activity.value}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default RecentActivity;
