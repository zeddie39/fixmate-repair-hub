
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Truck } from 'lucide-react';
import { QRCodeTracker } from '@/components/QRCodeTracker';

interface CustomerTrackingPanelProps {
  trackingCode: string;
  onSetTrackingCode: (code: string) => void;
  onTrackRequest: () => void;
  trackedRequest: any;
  repairRequests: any[];
  getStatusColor: (status: string) => string;
}

export function CustomerTrackingPanel({
  trackingCode,
  onSetTrackingCode,
  onTrackRequest,
  trackedRequest,
  repairRequests,
  getStatusColor,
}: CustomerTrackingPanelProps) {
  return (
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
              onChange={(e) => onSetTrackingCode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={onTrackRequest}>
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
  );
}
