
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, CheckCircle, AlertCircle, MessageSquare, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CreateRepairRequestDialog } from '@/components/CreateRepairRequestDialog';
import { RepairRequestCard } from '@/components/RepairRequestCard';
import { LiveChat } from '@/components/LiveChat';
import { QRCodeTracker } from '@/components/QRCodeTracker';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [repairRequests, setRepairRequests] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequestForChat, setSelectedRequestForChat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairRequests();
  }, [user]);

  const fetchRepairRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('repair_requests')
      .select(`
        *,
        device_types(name, category),
        profiles!repair_requests_technician_id_fkey(full_name)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setRepairRequests(data || []);
    }
    setLoading(false);
  };

  const getStatusStats = () => {
    const stats = {
      pending: repairRequests.filter(r => ['submitted', 'assigned'].includes(r.status)).length,
      inProgress: repairRequests.filter(r => ['diagnosing', 'repairing'].includes(r.status)).length,
      completed: repairRequests.filter(r => r.status === 'completed').length,
    };
    return stats;
  };

  const stats = getStatusStats();

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
        <Tabs defaultValue="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="requests">My Repairs</TabsTrigger>
              <TabsTrigger value="chat">Messages</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
            </TabsList>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Repair Request
            </Button>
          </div>

          <TabsContent value="requests" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    Waiting for assignment or diagnosis
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently being repaired
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
                    Successfully completed
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
                      <h3 className="text-lg font-semibold mb-2">No repair requests yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first repair request to get started
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Repair Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                repairRequests.map((request) => (
                  <div key={request.id} className="relative">
                    <RepairRequestCard request={request} />
                    {request.technician_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-4 right-4"
                        onClick={() => setSelectedRequestForChat(request)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            {selectedRequestForChat ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LiveChat
                    repairRequestId={selectedRequestForChat.id}
                    otherParticipant={{
                      id: selectedRequestForChat.technician_id,
                      name: selectedRequestForChat.profiles?.full_name || 'Technician',
                    }}
                  />
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Request Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Device:</strong> {selectedRequestForChat.device_brand} {selectedRequestForChat.device_model}</p>
                        <p><strong>Status:</strong> {selectedRequestForChat.status}</p>
                        <p><strong>Technician:</strong> {selectedRequestForChat.profiles?.full_name || 'Not assigned'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No chat selected</h3>
                  <p className="text-muted-foreground text-center">
                    Select a repair request with an assigned technician to start chatting
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {repairRequests.map((request) => (
                <QRCodeTracker
                  key={request.id}
                  repairRequestId={request.id}
                  onTrackingUpdate={(status) => console.log('Tracking update:', status)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateRepairRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchRepairRequests}
      />
    </div>
  );
};
