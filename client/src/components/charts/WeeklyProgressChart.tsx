import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

interface WeeklyProgressChartProps {
  title: string;
  chartData: ChartData;
  height?: string;
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ 
  title, 
  chartData, 
  height = "h-64" 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Cleanup function to destroy previous chart instance
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: chartData.datasets[0]?.label
            }
          },
          ...(chartData.datasets.length > 1 && chartData.datasets[1]?.yAxisID === 'y1' ? {
            y1: {
              position: 'right',
              title: {
                display: true,
                text: chartData.datasets[1]?.label
              },
              grid: {
                drawOnChartArea: false
              }
            }
          } : {})
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`w-full ${height}`}>
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyProgressChart;
