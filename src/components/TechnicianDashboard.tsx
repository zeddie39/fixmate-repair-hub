
import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TechnicianStatsCards } from './TechnicianStatsCards';
import { TechnicianRequestList } from './TechnicianRequestList';
import { TechnicianTrackingPanel } from './TechnicianTrackingPanel';
import { TechnicianCompletedPanel } from './TechnicianCompletedPanel';
import { TechnicianRequestModal } from './TechnicianRequestModal';

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
    // eslint-disable-next-line
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
            <TechnicianStatsCards stats={stats} />
            <TechnicianRequestList
              requests={repairRequests}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setSelectedRequest={setSelectedRequest}
              updateRequestStatus={updateRequestStatus}
            />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <TechnicianTrackingPanel repairRequests={repairRequests} />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <TechnicianCompletedPanel repairRequests={repairRequests} />
          </TabsContent>
        </Tabs>
      </div>

      <TechnicianRequestModal
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
        updateNotes={updateNotes}
        setUpdateNotes={setUpdateNotes}
        estimatedCost={estimatedCost}
        setEstimatedCost={setEstimatedCost}
        finalCost={finalCost}
        setFinalCost={setFinalCost}
        handleEstimateSubmit={handleEstimateSubmit}
        handleCompleteRepair={handleCompleteRepair}
        updateRequestStatus={updateRequestStatus}
      />
    </div>
  );
};
