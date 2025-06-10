
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode, Download, Search } from 'lucide-react';

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
          <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>QR Code Tracking</span>
        </CardTitle>
        <CardDescription className="text-sm">
          Generate a QR code for easy tracking or scan to check status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full max-w-[200px]">
            <img
              src={generateQRCode()}
              alt="QR Code"
              className="w-full h-auto border rounded-lg"
            />
          </div>
          <Button onClick={downloadQRCode} variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2 text-sm">Track by Code</h4>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              placeholder="Enter tracking code"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={trackRepair} 
              disabled={isTracking}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              {isTracking ? 'Tracking...' : 'Track'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
