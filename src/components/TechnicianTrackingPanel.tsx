
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TechnicianTrackingPanelProps {
  repairRequests: any[];
}

export function TechnicianTrackingPanel({ repairRequests }: TechnicianTrackingPanelProps) {
  return (
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
  );
}
