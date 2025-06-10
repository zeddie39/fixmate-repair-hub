
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Wrench, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalRequests: number;
  completedRequests: number;
  activeRequests: number;
  totalRevenue: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
  technicianCount: number;
  monthlyTrends: Array<{ month: string; requests: number; revenue: number }>;
  statusDistribution: Array<{ status: string; count: number; color: string }>;
  topDeviceTypes: Array<{ device: string; count: number }>;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch repair requests
      const { data: requests } = await supabase
        .from('repair_requests')
        .select(`
          *,
          device_types(name, category),
          profiles!repair_requests_technician_id_fkey(full_name)
        `);

      // Fetch technician count
      const { data: technicians } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'technician');

      // Fetch reviews for satisfaction
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating');

      if (requests) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalRequests = requests.length;
        const completedRequests = requests.filter(r => r.status === 'completed').length;
        const activeRequests = requests.filter(r => !['completed', 'cancelled'].includes(r.status)).length;
        
        const totalRevenue = requests
          .filter(r => r.final_cost)
          .reduce((sum, r) => sum + parseFloat(r.final_cost.toString()), 0);

        const averageRating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0;

        // Status distribution
        const statusCounts = requests.reduce((acc, request) => {
          acc[request.status] = (acc[request.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const statusColors: Record<string, string> = {
          submitted: '#8884d8',
          assigned: '#82ca9d',
          diagnosing: '#ffc658',
          repairing: '#ff7300',
          completed: '#00ff00',
          cancelled: '#ff0000',
        };

        const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count,
          color: statusColors[status] || '#888888',
        }));

        // Device type distribution
        const deviceCounts = requests.reduce((acc, request) => {
          const deviceName = request.device_types?.name || 'Unknown';
          acc[deviceName] = (acc[deviceName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topDeviceTypes = Object.entries(deviceCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([device, count]) => ({ device, count }));

        // Monthly trends (mock data for now)
        const monthlyTrends = [
          { month: 'Jan', requests: 45, revenue: 12500 },
          { month: 'Feb', requests: 52, revenue: 14200 },
          { month: 'Mar', requests: 48, revenue: 13800 },
          { month: 'Apr', requests: 61, revenue: 16900 },
          { month: 'May', requests: 55, revenue: 15200 },
          { month: 'Jun', requests: 67, revenue: 18500 },
        ];

        setAnalytics({
          totalRequests,
          completedRequests,
          activeRequests,
          totalRevenue,
          averageResolutionTime: 3.2,
          customerSatisfaction: averageRating,
          technicianCount: technicians?.length || 0,
          monthlyTrends,
          statusDistribution,
          topDeviceTypes,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageResolutionTime} days</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -5% improvement
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.customerSatisfaction.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="devices">Device Types</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Requests and revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="requests" fill="#8884d8" name="Requests" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Status Distribution</CardTitle>
              <CardDescription>Current status of all repair requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Device Types</CardTitle>
              <CardDescription>Most common devices being repaired</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topDeviceTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="device" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
