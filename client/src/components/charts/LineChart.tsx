import React, { useEffect, useRef } from 'react';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { ChartData } from '@/types';

// Register all Chart.js components
Chart.register(...registerables);

interface LineChartProps {
  chartData: ChartData;
  height?: string;
  type?: 'line' | 'scatter';
  xLabel?: string;
  yLabel?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  chartData,
  height = "100%",
  type = 'line',
  xLabel,
  yLabel
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
    const options: ChartOptions<typeof type> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: xLabel ? {
            display: true,
            text: xLabel
          } : undefined
        },
        y: {
          beginAtZero: false,
          title: yLabel ? {
            display: true,
            text: yLabel
          } : undefined
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
          position: 'bottom',
          display: chartData.datasets.length > 1
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      elements: {
        line: {
          tension: 0.3
        }
      }
    };

    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type,
      data: chartData,
      options
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, type, xLabel, yLabel]);

  return (
    <div style={{ width: '100%', height }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default LineChart;
