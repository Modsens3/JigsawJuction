import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { AdvancedLoader } from '@/components/ui/advanced-loader';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalUsers: number;
  activeUsers: number;
  popularPuzzleTypes: Array<{ type: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  conversionRate: number;
  cartAbandonmentRate: number;
}

interface RealTimeMetrics {
  activeUsers: number;
  ordersToday: number;
  revenueToday: number;
  averageResponseTime: number;
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [realTime, setRealTime] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchRealTimeMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/performance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRealTime(data);
      }
    } catch (err) {
      console.error('Failed to fetch real-time metrics:', err);
    }
  };

  if (loading) {
    return <AdvancedLoader type="skeleton" size="lg" text="Loading analytics..." />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 text-lg mb-2">Error loading analytics</div>
        <div className="text-gray-600">{error}</div>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Orders"
          value={analytics.totalOrders}
          change="+12%"
          positive={true}
          icon="📦"
        />
        <MetricCard
          title="Total Revenue"
          value={`€${analytics.totalRevenue.toLocaleString()}`}
          change="+8%"
          positive={true}
          icon="💰"
        />
        <MetricCard
          title="Active Users"
          value={analytics.activeUsers}
          change="+5%"
          positive={true}
          icon="👥"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          change="-2%"
          positive={false}
          icon="📈"
        />
      </div>

      {/* Real-time Metrics */}
      {realTime && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <p className="text-3xl font-bold text-blue-600">{realTime.activeUsers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Currently online</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Orders Today</h3>
                <p className="text-3xl font-bold text-green-600">{realTime.ordersToday}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">New orders today</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
                <p className="text-3xl font-bold text-purple-600">{realTime.averageResponseTime}ms</p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Average API response</p>
          </Card>
        </motion.div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Puzzle Types */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Puzzle Types</h3>
          <div className="space-y-3">
            {analytics.popularPuzzleTypes.map((type, index) => (
              <motion.div
                key={type.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{type.type}</span>
                </div>
                <span className="text-gray-600">{type.count} orders</span>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {analytics.revenueByMonth.slice(0, 6).map((month, index) => (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <span className="font-medium">{month.month}</span>
                <span className="text-green-600 font-semibold">€{month.revenue.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{analytics.averageOrderValue.toFixed(2)}€</div>
            <div className="text-sm text-gray-500">Average Order Value</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{analytics.conversionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{analytics.cartAbandonmentRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Cart Abandonment</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  positive: boolean;
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, positive, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last month
        </p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </motion.div>
);
