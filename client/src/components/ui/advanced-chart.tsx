import React, { useEffect, useRef } from 'react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface AdvancedChartProps {
  data: ChartData;
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  title?: string;
  height?: number;
  className?: string;
}

export const AdvancedChart: React.FC<AdvancedChartProps> = ({
  data,
  type,
  title,
  height = 300,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Import Chart.js dynamically
    import('chart.js/auto').then(({ Chart, registerables }) => {
      Chart.register(...registerables);

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      chartRef.current = new Chart(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: !!title,
              text: title,
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'top' as const,
              labels: {
                usePointStyle: true,
                padding: 20
              }
            }
          },
          scales: type !== 'doughnut' && type !== 'pie' ? {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            }
          } : undefined
        }
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, type, title]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <canvas
        ref={canvasRef}
        height={height}
        className="w-full"
      />
    </div>
  );
};

export const RevenueChart: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData: ChartData = {
    labels: data.map(item => item.month),
    datasets: [{
      label: 'Revenue (€)',
      data: data.map(item => item.revenue),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2
    }]
  };

  return (
    <AdvancedChart
      data={chartData}
      type="line"
      title="Monthly Revenue"
      height={300}
    />
  );
};

export const OrdersChart: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData: ChartData = {
    labels: data.map(item => item.month),
    datasets: [{
      label: 'Orders',
      data: data.map(item => item.orders),
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 2
    }]
  };

  return (
    <AdvancedChart
      data={chartData}
      type="bar"
      title="Monthly Orders"
      height={300}
    />
  );
};

export const PuzzleTypesChart: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData: ChartData = {
    labels: data.map(item => item.type),
    datasets: [{
      label: 'Orders',
      data: data.map(item => item.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  };

  return (
    <AdvancedChart
      data={chartData}
      type="doughnut"
      title="Puzzle Types Distribution"
      height={300}
    />
  );
};
