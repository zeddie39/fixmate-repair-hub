
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CustomerRequestDetailsModalProps {
  request: any;
  onClose: () => void;
}

export function CustomerRequestDetailsModal({ request, onClose }: CustomerRequestDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Request Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Device Information</h4>
            <p><strong>Type:</strong> {request.device_types?.name}</p>
            <p><strong>Brand:</strong> {request.device_brand}</p>
            <p><strong>Model:</strong> {request.device_model}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Problem Description</h4>
            <p className="text-sm text-muted-foreground">{request.problem_description}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Status & Pricing</h4>
            <p><strong>Status:</strong> {request.status}</p>
            {request.estimated_cost && (
              <p><strong>Estimated Cost:</strong> ${request.estimated_cost}</p>
            )}
            {request.final_cost && (
              <p><strong>Final Cost:</strong> ${request.final_cost}</p>
            )}
          </div>
          <div>
            <h4 className="font-medium mb-2">Timeline</h4>
            <p><strong>Created:</strong> {new Date(request.created_at).toLocaleString()}</p>
            {request.updated_at && (
              <p><strong>Last Updated:</strong> {new Date(request.updated_at).toLocaleString()}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
