
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TechnicianCompletedPanelProps {
  repairRequests: any[];
}

export function TechnicianCompletedPanel({ repairRequests }: TechnicianCompletedPanelProps) {
  return (
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
  );
}
