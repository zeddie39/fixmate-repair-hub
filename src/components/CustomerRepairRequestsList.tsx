
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Download, MessageSquare } from 'lucide-react';

interface CustomerRepairRequestsListProps {
  repairRequests: any[];
  onCreate: () => void;
  onViewDetails: (request: any) => void;
  onChat: (request: any) => void;
  onDownloadReceipt: (request: any) => void;
  getStatusColor: (status: string) => string;
}

export function CustomerRepairRequestsList({
  repairRequests,
  onCreate,
  onViewDetails,
  onChat,
  onDownloadReceipt,
  getStatusColor,
}: CustomerRepairRequestsListProps) {
  return (
    <div className="space-y-4">
      {repairRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No repair requests yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first repair request to get started
              </p>
              <Button onClick={onCreate}>
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
                  onClick={() => onViewDetails(request)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Details
                </Button>
                {request.technician_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChat(request)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadReceipt(request)}
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
  );
}
