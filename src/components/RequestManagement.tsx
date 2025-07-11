import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Calendar, User, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import RequestDetailModal from './RequestDetailModal';
import EditRequestModal from './EditRequestModal';
import { MaintenanceRequest } from '@/types/maintenance';

export const RequestManagement: React.FC = () => {
  const { requests, deleteRequest, addRequest, updateRequest } = useAppContext();
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleDeleteRequest = (requestId: string) => {
    deleteRequest(requestId);
    toast({ title: 'Success', description: 'Request deleted successfully' });
  };

  const handleTitleClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleEditRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setIsCreating(false);
    setShowEditModal(true);
  };

  const handleNewRequest = () => {
    setSelectedRequest(null);
    setIsCreating(true);
    setShowEditModal(true);
  };

  const handleSaveRequest = (requestData: MaintenanceRequest) => {
    if (isCreating) {
      addRequest(requestData);
      toast({ title: 'Success', description: 'Request created successfully' });
    } else {
      updateRequest(requestData);
      toast({ title: 'Success', description: 'Request updated successfully' });
    }
    setShowEditModal(false);
    setIsCreating(false);
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="mb-4">Request Management</CardTitle>
          <Button onClick={handleNewRequest} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New Request
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center text-sm text-gray-600">
            <span>Scroll for more options</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-80 min-w-80">
                  <div className="whitespace-nowrap">Title</div>
                  <div className="text-xs text-gray-500 font-normal whitespace-nowrap">(Click to view.)</div>
                </TableHead>
                <TableHead className="whitespace-nowrap">Department</TableHead>
                <TableHead className="whitespace-nowrap">Priority</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Requested By</TableHead>
                <TableHead className="whitespace-nowrap">Created</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div 
                      className="font-semibold cursor-pointer hover:text-blue-600 hover:underline whitespace-nowrap overflow-hidden text-ellipsis"
                      onClick={() => handleTitleClick(request)}
                    >
                      {request.title}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{request.department}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadgeColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <User className="h-3 w-3" />
                      <span className="text-sm">{request.requestedBy}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditRequest(request)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the request "{request.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteRequest(request.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No maintenance requests found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <RequestDetailModal
        request={selectedRequest}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
      
      <EditRequestModal
        request={selectedRequest}
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setIsCreating(false);
        }}
        onSave={handleSaveRequest}
        isCreating={isCreating}
      />
    </>
  );
};