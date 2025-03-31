import React, { useEffect, useRef } from 'react';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { ChartData } from '@/types';

// Register all Chart.js components
Chart.register(...registerables);

interface DoughnutChartProps {
  chartData: ChartData;
  height?: string;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ 
  chartData,
  height = "100%" 
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

    // Define chart options
    const options: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            boxWidth: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw as number;
              const total = context.chart.data.datasets[0].data.reduce(
                (acc: number, val: number) => acc + val, 0
              );
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '70%',
      radius: '90%'
    };

    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div style={{ width: '100%', height }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default DoughnutChart;
