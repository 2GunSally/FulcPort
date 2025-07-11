import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaintenanceRequest } from '@/types/maintenance';

interface RequestDetailModalProps {
  request: MaintenanceRequest | null;
  open: boolean;
  onClose: () => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  open,
  onClose
}) => {
  if (!request) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Request Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Request Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Request Information</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Title:</label>
              <p className="text-gray-900">{request.title}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Department:</label>
              <p className="text-gray-900">{request.department}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Priority:</label>
              <Badge className={getPriorityColor(request.priority || '')}>
                {request.priority}
              </Badge>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Status:</label>
              <Badge className={getStatusColor(request.status || '')}>
                {request.status?.replace('-', ' ')}
              </Badge>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Requested by:</label>
              <p className="text-gray-900">{request.requestedBy}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Assigned to:</label>
              <p className="text-gray-900">{request.assignedTo || 'Unassigned'}</p>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Timeline</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Created:</label>
              <p className="text-gray-900">
                {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Updated:</label>
              <p className="text-gray-900">
                {request.updatedAt ? new Date(request.updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Description</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900 whitespace-pre-wrap">
              {request.description || 'No description provided'}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Complete
          </Button>
          <Button variant="outline">
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetailModal;