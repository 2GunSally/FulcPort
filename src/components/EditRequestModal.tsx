import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaintenanceRequest } from '@/types/maintenance';
import { supabase } from '@/lib/supabase';
import ImageUploadButton from '@/components/ImageUploadButton';
import ImagePreview from '@/components/ImagePreview';
import ImageViewModal from '@/components/ImageViewModal';

interface EditRequestModalProps {
  request?: MaintenanceRequest | null;
  open: boolean;
  onClose: () => void;
  onSave: (request: MaintenanceRequest) => void;
  isCreating?: boolean;
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  request,
  open,
  onClose,
  onSave,
  isCreating = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'medium',
    status: 'open',
    requestedBy: '',
    assignedTo: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (request && !isCreating) {
      setFormData({
        title: request.title || '',
        description: request.description || '',
        department: request.department || '',
        priority: request.priority || 'medium',
        status: request.status || 'open',
        requestedBy: request.requestedBy || '',
        assignedTo: request.assignedTo || ''
      });
      setImages(request.images || []);
    } else {
      setFormData({
        title: '',
        description: '',
        department: '',
        priority: 'medium',
        status: 'open',
        requestedBy: '',
        assignedTo: ''
      });
      setImages([]);
    }
  }, [request, isCreating, open]);

  const handleImageSelect = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewImage = (imageUrl: string) => {
    setViewingImage(imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        ...formData,
        images,
        updatedAt: new Date().toISOString()
      };

      if (isCreating) {
        requestData.createdAt = new Date().toISOString();
        const { data, error } = await supabase
          .from('maintenance_requests')
          .insert([requestData])
          .select()
          .single();

        if (error) throw error;
        onSave(data);
      } else {
        const { data, error } = await supabase
          .from('maintenance_requests')
          .update(requestData)
          .eq('id', request?.id)
          .select()
          .single();

        if (error) throw error;
        onSave(data);
      }

      onClose();
    } catch (error) {
      console.error('Error saving request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isCreating ? 'Create New Request' : 'Edit Request'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cut Shop">Cut Shop</SelectItem>
                    <SelectItem value="Welding">Welding</SelectItem>
                    <SelectItem value="Assembly">Assembly</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="requestedBy">Requested By</Label>
                <Input
                  id="requestedBy"
                  value={formData.requestedBy}
                  onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe the maintenance request..."
              />
            </div>
            
            <div>
              <Label>Attachments</Label>
              <div className="mt-2 flex items-center gap-2">
                <ImageUploadButton onImageSelect={handleImageSelect} />
                <span className="text-sm text-gray-500">Upload images or take photos</span>
              </div>
              <ImagePreview 
                images={images}
                onRemove={handleRemoveImage}
                onView={handleViewImage}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isCreating ? 'Create Request' : 'Save Changes')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <ImageViewModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage}
      />
    </>
  );
};

export default EditRequestModal;