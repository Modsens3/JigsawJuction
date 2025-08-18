import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Activity, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  FileText,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: { status: string; message: string; details?: any };
    disk: { status: string; message: string; details?: any };
    memory: { status: string; message: string; details?: any };
    uploads: { status: string; message: string; details?: any };
  };
}

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  uploads: {
    totalFiles: number;
    totalSize: number;
    oldestFile: string;
    newestFile: string;
  };
}

interface PerformanceStats {
  uptime: number;
  totalRequests: number;
  totalErrors: number;
  requestsPerMinute: string;
  errorRate: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch health status
      const healthResponse = await fetch('/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthStatus(healthData);
      }

      // Fetch metrics (requires admin auth)
      try {
        const metricsData = await apiRequest('GET', '/api/metrics');
        setMetrics(metricsData.metrics);
        setPerformance(metricsData.performance);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'unhealthy':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-500">Degraded</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !healthStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">
            System overview and performance metrics
          </p>
        </div>
            <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(healthStatus.status)}
              <span>System Health</span>
              {getStatusBadge(healthStatus.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Environment</p>
                <p className="text-2xl font-bold">{healthStatus.environment}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Version</p>
                <p className="text-2xl font-bold">{healthStatus.version}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(healthStatus.uptime)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Last Check</p>
                <p className="text-sm">{new Date(healthStatus.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Checks */}
      {healthStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {getStatusIcon(healthStatus.checks.database.status)}
                <span className="text-sm">{healthStatus.checks.database.message}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {getStatusIcon(healthStatus.checks.memory.status)}
                <span className="text-sm">{healthStatus.checks.memory.message}</span>
              </div>
              {healthStatus.checks.memory.details && (
                <div className="mt-2 text-xs text-gray-500">
                  {healthStatus.checks.memory.details.usedMB}MB / {healthStatus.checks.memory.details.totalMB}MB ({healthStatus.checks.memory.details.percentage}%)
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {getStatusIcon(healthStatus.checks.disk.status)}
                <span className="text-sm">{healthStatus.checks.disk.message}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {getStatusIcon(healthStatus.checks.uploads.status)}
                <span className="text-sm">{healthStatus.checks.uploads.message}</span>
              </div>
              {healthStatus.checks.uploads.details && (
                <div className="mt-2 text-xs text-gray-500">
                  {healthStatus.checks.uploads.details.totalFiles} files, {healthStatus.checks.uploads.details.totalSize}
          </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.memory.percentage}%</div>
              <Progress value={metrics.memory.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.memory.used}MB / {metrics.memory.total}MB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests/min</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.requestsPerMinute}</div>
              <p className="text-xs text-muted-foreground">
                Total: {performance.totalRequests}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.errorRate}</div>
              <p className="text-xs text-muted-foreground">
                {performance.totalErrors} errors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uploaded Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uploads.totalFiles}</div>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(metrics.uploads.totalSize)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => setLocation('/admin/orders')}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Orders
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/products')}>
              <FileText className="w-4 h-4 mr-2" />
              Manage Products
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/customers')}>
              <Users className="w-4 h-4 mr-2" />
              View Customers
            </Button>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button 
              variant="outline" 
                        onClick={async () => {
            try {
              const result = await apiRequest('POST', '/api/admin/memory-cleanup');
              toast({
                title: "Memory Cleanup",
                description: `Freed ${result.freed.mb}MB (${result.freed.percentage}%)`,
              });
              fetchData(); // Refresh data
            } catch (error) {
              toast({
                title: "Error",
                description: "Memory cleanup failed",
                variant: "destructive"
              });
            }
          }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Memory Cleanup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}