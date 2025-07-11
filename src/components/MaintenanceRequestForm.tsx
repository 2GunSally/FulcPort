import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types/maintenance';
import { DEPARTMENTS } from '@/types/maintenance';
import { Send, X } from 'lucide-react';
import ImageUploadButton from '@/components/ImageUploadButton';
import ImagePreview from '@/components/ImagePreview';
import ImageViewModal from '@/components/ImageViewModal';

interface MaintenanceRequestFormProps {
  user: User;
  onSubmit: (request: any) => void;
  onCancel: () => void;
}

const MaintenanceRequestForm: React.FC<MaintenanceRequestFormProps> = ({
  user,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'medium',
    equipment: ''
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.department) {
      return;
    }
    
    onSubmit({
      ...formData,
      images,
      id: Date.now().toString(),
      requestedBy: user.name,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewImage = (imageUrl: string) => {
    setViewingImage(imageUrl);
  };

  return (
    <>
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Send className="w-5 h-5 mr-2 text-green-600" />
              New Maintenance Request
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-gray-700 font-medium">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Brief description of the issue"
                  className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="equipment" className="text-gray-700 font-medium">Equipment</Label>
                <Input
                  id="equipment"
                  value={formData.equipment}
                  onChange={(e) => handleChange('equipment', e.target.value)}
                  placeholder="Equipment ID or name"
                  className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 font-medium">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-700 font-medium">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-gray-700 font-medium">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed description of the maintenance request..."
                className="mt-1 min-h-[100px] border-gray-300 focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <Label className="text-gray-700 font-medium">Attachments</Label>
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
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!formData.title || !formData.description || !formData.department}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <ImageViewModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage}
      />
    </>
  );
};

export default MaintenanceRequestForm;