import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, CheckCircle, AlertCircle, MessageSquare, BarChart3, Truck, Search, Eye, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CreateRepairRequestDialog } from '@/components/CreateRepairRequestDialog';
import { CustomerStatsCards } from './CustomerStatsCards';
import { CustomerRepairRequestsList } from './CustomerRepairRequestsList';
import { CustomerTrackingPanel } from './CustomerTrackingPanel';
import { CustomerChatPanel } from './CustomerChatPanel';
import { CustomerAnalyticsPanel } from './CustomerAnalyticsPanel';
import { CustomerRequestDetailsModal } from './CustomerRequestDetailsModal';
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
            <CustomerStatsCards stats={stats} />
            <CustomerRepairRequestsList
              repairRequests={repairRequests}
              onCreate={() => setIsCreateDialogOpen(true)}
              onViewDetails={handleViewDetails}
              onChat={setSelectedRequestForChat}
              onDownloadReceipt={handleDownloadReceipt}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <CustomerTrackingPanel
              trackingCode={trackingCode}
              onSetTrackingCode={setTrackingCode}
              onTrackRequest={handleTrackRequest}
              trackedRequest={trackedRequest}
              repairRequests={repairRequests}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <CustomerChatPanel
              selectedRequestForChat={selectedRequestForChat}
              onBack={() => setSelectedRequestForChat(null)}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <CustomerAnalyticsPanel
              repairRequests={repairRequests}
              stats={stats}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateRepairRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchRepairRequests}
      />

      {selectedRequestForDetails && (
        <CustomerRequestDetailsModal
          request={selectedRequestForDetails}
          onClose={() => setSelectedRequestForDetails(null)}
        />
      )}
    </div>
  );
};
