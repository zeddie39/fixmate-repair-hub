
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PhotoUpload } from '@/components/PhotoUpload';

interface CreateRepairRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateRepairRequestDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateRepairRequestDialogProps) => {
  const { user } = useAuth();
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    deviceTypeId: '',
    deviceBrand: '',
    deviceModel: '',
    problemDescription: '',
    priority: 'medium',
    pickupAddress: '',
  });

  useEffect(() => {
    if (open) {
      fetchDeviceTypes();
    }
  }, [open]);

  const fetchDeviceTypes = async () => {
    const { data, error } = await supabase
      .from('device_types')
      .select('*')
      .order('category', { ascending: true });

    if (!error) {
      setDeviceTypes(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create the repair request
      const { data: repairRequest, error } = await supabase
        .from('repair_requests')
        .insert({
          customer_id: user.id,
          device_type_id: formData.deviceTypeId,
          device_brand: formData.deviceBrand,
          device_model: formData.deviceModel,
          problem_description: formData.problemDescription,
          priority: formData.priority,
          pickup_address: formData.pickupAddress,
          status: 'submitted',
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photos if any
      if (photos.length > 0 && repairRequest) {
        for (const photo of photos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${repairRequest.id}-${Date.now()}.${fileExt}`;
          
          // In a real app, you'd upload to Supabase Storage
          // For now, we'll just store a placeholder URL
          await supabase
            .from('repair_images')
            .insert({
              repair_request_id: repairRequest.id,
              uploaded_by: user.id,
              image_url: `placeholder-${fileName}`,
              description: 'Device photo',
            });
        }
      }

      toast({
        title: 'Repair request created',
        description: 'Your repair request has been submitted successfully.',
      });

      // Reset form
      setFormData({
        deviceTypeId: '',
        deviceBrand: '',
        deviceModel: '',
        problemDescription: '',
        priority: 'medium',
        pickupAddress: '',
      });
      setPhotos([]);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error creating repair request',
        description: error.message,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Repair Request</DialogTitle>
          <DialogDescription>
            Fill out the details below to submit your repair request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceType">Device Type</Label>
            <Select
              value={formData.deviceTypeId}
              onValueChange={(value) =>
                setFormData({ ...formData, deviceTypeId: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type: any) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} ({type.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deviceBrand">Device Brand</Label>
              <Input
                id="deviceBrand"
                value={formData.deviceBrand}
                onChange={(e) =>
                  setFormData({ ...formData, deviceBrand: e.target.value })
                }
                placeholder="e.g., Apple, Samsung"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceModel">Device Model</Label>
              <Input
                id="deviceModel"
                value={formData.deviceModel}
                onChange={(e) =>
                  setFormData({ ...formData, deviceModel: e.target.value })
                }
                placeholder="e.g., iPhone 14, Galaxy S23"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemDescription">Problem Description</Label>
            <Textarea
              id="problemDescription"
              value={formData.problemDescription}
              onChange={(e) =>
                setFormData({ ...formData, problemDescription: e.target.value })
              }
              placeholder="Describe the issue with your device..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Device Photos (Optional)</Label>
            <PhotoUpload onPhotosChange={setPhotos} maxPhotos={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupAddress">Pickup Address (Optional)</Label>
            <Textarea
              id="pickupAddress"
              value={formData.pickupAddress}
              onChange={(e) =>
                setFormData({ ...formData, pickupAddress: e.target.value })
              }
              placeholder="Enter address for device pickup (if needed)"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
