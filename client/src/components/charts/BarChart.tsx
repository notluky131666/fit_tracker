import React, { useEffect, useRef } from 'react';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { ChartData } from '@/types';

// Register all Chart.js components
Chart.register(...registerables);

interface BarChartProps {
  chartData: ChartData;
  height?: string;
}

const BarChart: React.FC<BarChartProps> = ({ 
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
    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          display: chartData.datasets.length > 1
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    };

    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
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

export default BarChart;
