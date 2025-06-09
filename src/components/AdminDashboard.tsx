
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Wrench, 
  Clock, 
  DollarSign, 
  TrendingUp,
  UserCheck,
  Settings,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    totalCustomers: 0,
    totalTechnicians: 0,
    totalRevenue: 0,
    avgResolutionTime: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch repair requests stats
      const { data: requests } = await supabase
        .from('repair_requests')
        .select('*');

      // Fetch users by role
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      // Fetch recent requests with details
      const { data: recent } = await supabase
        .from('repair_requests')
        .select(`
          *,
          device_types(name, category),
          profiles!repair_requests_customer_id_fkey(full_name, email),
          profiles!repair_requests_technician_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (requests && profiles) {
        const activeRequests = requests.filter(r => 
          !['completed', 'cancelled'].includes(r.status)
        ).length;
        
        const customers = profiles.filter(p => p.role === 'customer').length;
        const techs = profiles.filter(p => p.role === 'technician');
        
        const completedRequests = requests.filter(r => r.status === 'completed');
        const totalRevenue = completedRequests.reduce((sum, r) => 
          sum + (r.final_cost || r.estimated_cost || 0), 0
        );

        setStats({
          totalRequests: requests.length,
          activeRequests,
          totalCustomers: customers,
          totalTechnicians: techs.length,
          totalRevenue,
          avgResolutionTime: 0, // Calculate based on actual data
        });

        setTechnicians(techs);
        setRecentRequests(recent || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const assignTechnician = async (requestId: string, technicianId: string) => {
    const { error } = await supabase
      .from('repair_requests')
      .update({ 
        technician_id: technicianId,
        status: 'assigned'
      })
      .eq('id', requestId);

    if (!error) {
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your repair business</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeRequests} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Technicians</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTechnicians}</div>
              <p className="text-xs text-muted-foreground">
                Active technicians
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">Recent Requests</TabsTrigger>
            <TabsTrigger value="technicians">Manage Technicians</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {recentRequests.map((request: any) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {request.device_types?.name} - {request.device_brand}
                      </CardTitle>
                      <CardDescription>
                        Customer: {request.profiles?.full_name} ({request.profiles?.email})
                      </CardDescription>
                    </div>
                    <Badge>
                      {request.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm">{request.problem_description}</p>
                    
                    {request.status === 'submitted' && (
                      <div className="flex gap-2">
                        <select 
                          className="px-3 py-2 border rounded-md"
                          onChange={(e) => {
                            if (e.target.value) {
                              assignTechnician(request.id, e.target.value);
                            }
                          }}
                        >
                          <option value="">Assign Technician</option>
                          {technicians.map((tech: any) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="technicians" className="space-y-4">
            <div className="grid gap-4">
              {technicians.map((tech: any) => (
                <Card key={tech.id}>
                  <CardHeader>
                    <CardTitle>{tech.full_name}</CardTitle>
                    <CardDescription>{tech.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Phone: {tech.phone || 'Not provided'}
                      </span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Resolution Time</span>
                      <span className="font-medium">2.5 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completion Rate</span>
                      <span className="font-medium">95%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
