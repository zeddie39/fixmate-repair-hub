
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, DollarSign, CheckCircle, MessageSquare, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TechnicianRequestListProps {
  requests: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSelectedRequest: (req: any) => void;
  updateRequestStatus: (id: string, status: string) => void;
}

export function TechnicianRequestList({ requests, searchTerm, setSearchTerm, setSelectedRequest, updateRequestStatus }: TechnicianRequestListProps) {
  const filteredRequests = requests.filter(request =>
    request.device_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.device_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by device, model, or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="space-y-4 mt-2">
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
    </>
  );
}
