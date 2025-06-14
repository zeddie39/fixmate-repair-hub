
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TechnicianRequestModalProps {
  selectedRequest: any;
  setSelectedRequest: (req: any) => void;
  updateNotes: string;
  setUpdateNotes: (notes: string) => void;
  estimatedCost: string;
  setEstimatedCost: (cost: string) => void;
  finalCost: string;
  setFinalCost: (cost: string) => void;
  handleEstimateSubmit: (id: string) => void;
  handleCompleteRepair: (id: string) => void;
  updateRequestStatus: (id: string, status: string) => void;
}

export function TechnicianRequestModal({
  selectedRequest,
  setSelectedRequest,
  updateNotes,
  setUpdateNotes,
  estimatedCost,
  setEstimatedCost,
  finalCost,
  setFinalCost,
  handleEstimateSubmit,
  handleCompleteRepair,
  updateRequestStatus,
}: TechnicianRequestModalProps) {
  if (!selectedRequest) return null;

  return (
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
  )
}
