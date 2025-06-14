import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { LiveChat } from '@/components/LiveChat';

interface CustomerChatPanelProps {
  selectedRequestForChat: any;
  onBack: () => void;
}

export function CustomerChatPanel({ selectedRequestForChat, onBack }: CustomerChatPanelProps) {
  if (selectedRequestForChat) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveChat
            repairRequestId={selectedRequestForChat.id}
            otherParticipant={{
              id: selectedRequestForChat.technician_id,
              name: selectedRequestForChat.profiles?.full_name || 'Technician',
            }}
          />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Device:</strong> {selectedRequestForChat.device_brand} {selectedRequestForChat.device_model}</p>
                <p><strong>Status:</strong> {selectedRequestForChat.status}</p>
                <p><strong>Technician:</strong> {selectedRequestForChat.profiles?.full_name || 'Not assigned'}</p>
              </div>
              <button className="mt-4 text-blue-600 hover:underline" onClick={onBack}>Back</button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No chat selected</h3>
        <p className="text-muted-foreground text-center">
          Select a repair request with an assigned technician to start chatting
        </p>
      </CardContent>
    </Card>
  );
}
