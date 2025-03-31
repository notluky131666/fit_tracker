import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MetricSummary } from '@/types';

interface MetricSummariesProps {
  metrics: MetricSummary[];
}

const MetricSummaries: React.FC<MetricSummariesProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${metric.color}`}>
                {metric.icon}
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">{metric.title}</h2>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                  {metric.unit && <span className="text-sm font-normal ml-1">{metric.unit}</span>}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Goal: {metric.goal}</span>
                <span className={`text-sm ${metric.achieved ? 'text-green-600' : 'text-primary'}`}>
                  {metric.achieved || metric.changeValue}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${metric.color.replace('bg-', 'bg-')} rounded-full h-2`} 
                  style={{ width: `${metric.progress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricSummaries;
