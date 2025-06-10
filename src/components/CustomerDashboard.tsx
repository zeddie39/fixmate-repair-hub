
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, CheckCircle, AlertCircle, MessageSquare, BarChart3, Truck, Search, Eye, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CreateRepairRequestDialog } from '@/components/CreateRepairRequestDialog';
import { RepairRequestCard } from '@/components/RepairRequestCard';
import { LiveChat } from '@/components/LiveChat';
import { QRCodeTracker } from '@/components/QRCodeTracker';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [repairRequests, setRepairRequests] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequestForChat, setSelectedRequestForChat] = useState<any>(null);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<any>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<any>(null);
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

  const handleTrackRequest = async () => {
    if (!trackingCode.trim()) return;

    // Search for request by ID or custom tracking code
    const { data, error } = await supabase
      .from('repair_requests')
      .select(`
        *,
        device_types(name, category),
        profiles!repair_requests_customer_id_fkey(full_name, email),
        profiles!repair_requests_technician_id_fkey(full_name)
      `)
      .or(`id.eq.${trackingCode},tracking_code.eq.${trackingCode}`)
      .single();

    if (!error && data) {
      setTrackedRequest(data);
    } else {
      setTrackedRequest(null);
      alert('Request not found. Please check your tracking code.');
    }
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequestForDetails(request);
  };

  const handleDownloadReceipt = (request: any) => {
    // Generate a simple receipt
    const receipt = `
REPAIR RECEIPT
==============
Request ID: ${request.id}
Device: ${request.device_brand} ${request.device_model}
Status: ${request.status}
Created: ${new Date(request.created_at).toLocaleDateString()}
${request.final_cost ? `Total Cost: $${request.final_cost}` : 'Cost: Pending'}
    `;
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${request.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'diagnosing': return 'bg-orange-100 text-orange-800';
      case 'repairing': return 'bg-purple-100 text-purple-800';
      case 'ready_pickup': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Tabs defaultValue="requests" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-4">
              <TabsTrigger value="requests">My Repairs</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="chat">Messages</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Repair Request
            </Button>
          </div>

          <TabsContent value="requests" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base sm:text-lg">
                            {request.device_types?.name} - {request.device_brand}
                            {request.device_model && ` ${request.device_model}`}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {request.problem_description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-start sm:items-end">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          {request.estimated_cost && (
                            <span className="text-sm font-medium">${request.estimated_cost}</span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        {request.technician_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequestForChat(request)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(request)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-5 w-5" />
                    <span>Quick Tracking</span>
                  </CardTitle>
                  <CardDescription>
                    Enter your request ID or tracking code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter tracking code"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleTrackRequest}>
                      <Search className="h-4 w-4 mr-2" />
                      Track
                    </Button>
                  </div>
                  
                  {trackedRequest && (
                    <div className="mt-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {trackedRequest.device_brand} {trackedRequest.device_model}
                        </h4>
                        <Badge className={getStatusColor(trackedRequest.status)}>
                          {trackedRequest.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {trackedRequest.problem_description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(trackedRequest.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Delivery Status</span>
                  </CardTitle>
                  <CardDescription>
                    Track pickup and delivery status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {repairRequests.filter(r => ['ready_pickup', 'completed'].includes(r.status)).map(request => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium text-sm">{request.device_brand} {request.device_model}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.status === 'ready_pickup' ? 'Ready for pickup' : 'Completed'}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(request.status)}>
                          {request.status === 'ready_pickup' ? 'Ready' : 'Done'}
                        </Badge>
                      </div>
                    ))}
                    {repairRequests.filter(r => ['ready_pickup', 'completed'].includes(r.status)).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No items ready for pickup
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Tracking for each request */}
              {repairRequests.slice(0, 2).map((request) => (
                <QRCodeTracker
                  key={request.id}
                  repairRequestId={request.id}
                  onTrackingUpdate={(status) => console.log('Tracking update:', status)}
                />
              ))}
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

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Request Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Requests:</span>
                      <span className="font-medium">{repairRequests.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Cost:</span>
                      <span className="font-medium">
                        ${repairRequests.filter(r => r.final_cost).length > 0 
                          ? Math.round(repairRequests.filter(r => r.final_cost).reduce((sum, r) => sum + parseFloat(r.final_cost), 0) / repairRequests.filter(r => r.final_cost).length)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completion Rate:</span>
                      <span className="font-medium">
                        {repairRequests.length > 0 ? Math.round((stats.completed / repairRequests.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateRepairRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchRepairRequests}
      />

      {/* Request Details Modal */}
      {selectedRequestForDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRequestForDetails(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Device Information</h4>
                <p><strong>Type:</strong> {selectedRequestForDetails.device_types?.name}</p>
                <p><strong>Brand:</strong> {selectedRequestForDetails.device_brand}</p>
                <p><strong>Model:</strong> {selectedRequestForDetails.device_model}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Problem Description</h4>
                <p className="text-sm text-muted-foreground">{selectedRequestForDetails.problem_description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Status & Pricing</h4>
                <p><strong>Status:</strong> {selectedRequestForDetails.status}</p>
                {selectedRequestForDetails.estimated_cost && (
                  <p><strong>Estimated Cost:</strong> ${selectedRequestForDetails.estimated_cost}</p>
                )}
                {selectedRequestForDetails.final_cost && (
                  <p><strong>Final Cost:</strong> ${selectedRequestForDetails.final_cost}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Timeline</h4>
                <p><strong>Created:</strong> {new Date(selectedRequestForDetails.created_at).toLocaleString()}</p>
                {selectedRequestForDetails.updated_at && (
                  <p><strong>Last Updated:</strong> {new Date(selectedRequestForDetails.updated_at).toLocaleString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
