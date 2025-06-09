
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, DollarSign, User, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RepairRequestCardProps {
  request: any;
}

export const RepairRequestCard = ({ request }: RepairRequestCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'diagnosing':
        return 'bg-orange-100 text-orange-800';
      case 'repairing':
        return 'bg-purple-100 text-purple-800';
      case 'waiting_approval':
        return 'bg-amber-100 text-amber-800';
      case 'ready_pickup':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {request.device_types?.name} - {request.device_brand}
              {request.device_model && ` ${request.device_model}`}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {request.problem_description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge className={getStatusColor(request.status)}>
              {formatStatus(request.status)}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(request.priority)}>
              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </span>
          </div>
          
          {request.profiles?.full_name && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Assigned to {request.profiles.full_name}</span>
            </div>
          )}
          
          {request.estimated_cost && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Estimated: ${request.estimated_cost}</span>
            </div>
          )}
          
          {request.pickup_address && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Pickup available</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
