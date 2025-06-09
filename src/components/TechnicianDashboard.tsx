
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';

export const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedRequests();
  }, [user]);

  const fetchAssignedRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('repair_requests')
      .select(`
        *,
        device_types(name, category),
        profiles!repair_requests_customer_id_fkey(full_name, email, phone)
      `)
      .eq('technician_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setRepairRequests(data || []);
    }
    setLoading(false);
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from('repair_requests')
      .update({ status })
      .eq('id', requestId);

    if (!error) {
      fetchAssignedRequests();
    }
  };

  const getStats = () => {
    return {
      assigned: repairRequests.filter(r => r.status === 'assigned').length,
      inProgress: repairRequests.filter(r => ['diagnosing', 'repairing'].includes(r.status)).length,
      completed: repairRequests.filter(r => r.status === 'completed').length,
    };
  };

  const stats = getStats();

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
          <h1 className="text-3xl font-bold">Technician Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned repair requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned}</div>
              <p className="text-xs text-muted-foreground">
                New assignments waiting
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Currently working on
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Repair Requests */}
        <div className="space-y-4">
          {repairRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No repair requests assigned</h3>
                  <p className="text-muted-foreground">
                    You don't have any repair requests assigned to you yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            repairRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {request.device_types?.name} - {request.device_brand}
                        {request.device_model && ` ${request.device_model}`}
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
                    <div>
                      <h4 className="font-medium mb-2">Problem Description:</h4>
                      <p className="text-sm text-muted-foreground">{request.problem_description}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {request.status === 'assigned' && (
                        <Button 
                          onClick={() => updateRequestStatus(request.id, 'diagnosing')}
                          size="sm"
                        >
                          Start Diagnosis
                        </Button>
                      )}
                      {request.status === 'diagnosing' && (
                        <Button 
                          onClick={() => updateRequestStatus(request.id, 'repairing')}
                          size="sm"
                        >
                          Start Repair
                        </Button>
                      )}
                      {request.status === 'repairing' && (
                        <Button 
                          onClick={() => updateRequestStatus(request.id, 'ready_pickup')}
                          size="sm"
                        >
                          Mark Ready for Pickup
                        </Button>
                      )}
                      {request.status === 'ready_pickup' && (
                        <Button 
                          onClick={() => updateRequestStatus(request.id, 'completed')}
                          size="sm"
                        >
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
