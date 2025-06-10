
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, Clock, CheckCircle, AlertTriangle, Search, MessageSquare, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [repairRequests, setRepairRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [finalCost, setFinalCost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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

  const updateRequestStatus = async (requestId: string, status: string, additionalData: any = {}) => {
    const updateData = { status, ...additionalData };
    
    if (updateNotes) {
      updateData.technician_notes = updateNotes;
    }

    const { error } = await supabase
      .from('repair_requests')
      .update(updateData)
      .eq('id', requestId);

    if (!error) {
      fetchAssignedRequests();
      setUpdateNotes('');
      setEstimatedCost('');
      setFinalCost('');
      setSelectedRequest(null);
    }
  };

  const handleEstimateSubmit = async (requestId: string) => {
    if (!estimatedCost) return;
    
    await updateRequestStatus(requestId, 'waiting_approval', {
      estimated_cost: parseFloat(estimatedCost)
    });
  };

  const handleCompleteRepair = async (requestId: string) => {
    if (!finalCost) return;
    
    await updateRequestStatus(requestId, 'ready_pickup', {
      final_cost: parseFloat(finalCost)
    });
  };

  const getStats = () => {
    return {
      assigned: repairRequests.filter(r => r.status === 'assigned').length,
      inProgress: repairRequests.filter(r => ['diagnosing', 'repairing'].includes(r.status)).length,
      completed: repairRequests.filter(r => r.status === 'completed').length,
      readyPickup: repairRequests.filter(r => r.status === 'ready_pickup').length,
    };
  };

  const filteredRequests = repairRequests.filter(request =>
    request.device_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.device_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Technician Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned repair requests</p>
        </div>

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Active Requests</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.readyPickup}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting customer pickup
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

            {/* Search Bar */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by device, model, or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Repair Requests */}
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">No repair requests found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Try adjusting your search terms' : "You don't have any repair requests assigned to you yet."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredRequests.filter(r => r.status !== 'completed').map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-base sm:text-lg">
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
                        
                        {request.technician_notes && (
                          <div>
                            <h4 className="font-medium mb-2">Your Notes:</h4>
                            <p className="text-sm text-muted-foreground">{request.technician_notes}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {request.status === 'assigned' && (
                            <Button 
                              onClick={() => updateRequestStatus(request.id, 'diagnosing')}
                              size="sm"
                            >
                              Start Diagnosis
                            </Button>
                          )}
                          {request.status === 'diagnosing' && (
                            <>
                              <Button 
                                onClick={() => updateRequestStatus(request.id, 'repairing')}
                                size="sm"
                              >
                                Start Repair
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setSelectedRequest(request)}
                                size="sm"
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Add Estimate
                              </Button>
                            </>
                          )}
                          {request.status === 'repairing' && (
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete Repair
                            </Button>
                          )}
                          {request.status === 'ready_pickup' && (
                            <Button 
                              onClick={() => updateRequestStatus(request.id, 'completed')}
                              size="sm"
                            >
                              Mark as Picked Up
                            </Button>
                          )}
                          <Button 
                            variant="outline"
                            size="sm"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat with Customer
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                            size="sm"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Add Notes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {repairRequests.filter(r => !['submitted', 'completed'].includes(r.status)).map(request => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {request.device_brand} {request.device_model}
                    </CardTitle>
                    <CardDescription>
                      Customer: {request.profiles?.full_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Status:</span>
                        <Badge>{request.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Started:</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {request.estimated_cost && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Estimated Cost:</span>
                          <span className="text-sm font-medium">${request.estimated_cost}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="space-y-4">
              {repairRequests.filter(r => r.status === 'completed').map(request => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {request.device_brand} {request.device_model}
                        </CardTitle>
                        <CardDescription>
                          Customer: {request.profiles?.full_name}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Final Cost:</span> ${request.final_cost || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Completed:</span> {new Date(request.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal for estimates, completion, and notes */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedRequest.status === 'diagnosing' && 'Add Estimate'}
                  {selectedRequest.status === 'repairing' && 'Complete Repair'}
                  {!['diagnosing', 'repairing'].includes(selectedRequest.status) && 'Add Notes'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRequest.status === 'diagnosing' && (
                <div>
                  <label className="text-sm font-medium">Estimated Cost ($)</label>
                  <Input
                    type="number"
                    placeholder="Enter estimated cost"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                  />
                </div>
              )}
              
              {selectedRequest.status === 'repairing' && (
                <div>
                  <label className="text-sm font-medium">Final Cost ($)</label>
                  <Input
                    type="number"
                    placeholder="Enter final cost"
                    value={finalCost}
                    onChange={(e) => setFinalCost(e.target.value)}
                  />
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes or updates..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={() => setSelectedRequest(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedRequest.status === 'diagnosing') {
                      handleEstimateSubmit(selectedRequest.id);
                    } else if (selectedRequest.status === 'repairing') {
                      handleCompleteRepair(selectedRequest.id);
                    } else {
                      updateRequestStatus(selectedRequest.id, selectedRequest.status);
                    }
                  }}
                  className="flex-1"
                  disabled={
                    (selectedRequest.status === 'diagnosing' && !estimatedCost) ||
                    (selectedRequest.status === 'repairing' && !finalCost)
                  }
                >
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
