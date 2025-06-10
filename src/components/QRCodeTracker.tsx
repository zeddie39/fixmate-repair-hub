
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode, Download } from 'lucide-react';

interface QRCodeTrackerProps {
  repairRequestId: string;
  onTrackingUpdate?: (status: string) => void;
}

export const QRCodeTracker = ({ repairRequestId, onTrackingUpdate }: QRCodeTrackerProps) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const generateQRCode = () => {
    // Generate QR code URL for the repair request
    const trackingUrl = `${window.location.origin}/track/${repairRequestId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingUrl)}`;
  };

  const downloadQRCode = () => {
    const qrCodeUrl = generateQRCode();
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `repair-${repairRequestId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trackRepair = async () => {
    if (!trackingCode.trim()) return;
    
    setIsTracking(true);
    // Simulate tracking lookup
    setTimeout(() => {
      onTrackingUpdate?.('Request found and status updated');
      setIsTracking(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>QR Code Tracking</span>
          </CardTitle>
          <CardDescription>
            Generate a QR code for easy tracking or scan to check status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <img
              src={generateQRCode()}
              alt="QR Code"
              className="border rounded-lg"
            />
            <Button onClick={downloadQRCode} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Track by Code</h4>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter tracking code"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
              />
              <Button onClick={trackRepair} disabled={isTracking}>
                {isTracking ? 'Tracking...' : 'Track'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
