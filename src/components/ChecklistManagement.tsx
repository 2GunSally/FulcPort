import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import EditChecklistModal from './EditChecklistModal';
import ViewChecklistModal from './ViewChecklistModal';

export const ChecklistManagement: React.FC = () => {
  const { checklists, deleteChecklist } = useAppContext();
  const [viewChecklist, setViewChecklist] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editChecklist, setEditChecklist] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const handleCreateChecklist = () => {
    setEditChecklist(null);
    setIsCreateMode(true);
    setIsEditModalOpen(true);
  };

  const handleEditChecklist = (checklist: any) => {
    setEditChecklist(checklist);
    setIsCreateMode(false);
    setIsEditModalOpen(true);
  };

  const handleViewChecklist = (checklist: any) => {
    setViewChecklist(checklist);
    setIsViewModalOpen(true);
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      await supabase.from('checklists').delete().eq('id', checklistId);
      deleteChecklist(checklistId);
      toast({ title: 'Success', description: 'Checklist deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Error', description: 'Failed to delete checklist', variant: 'destructive' });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800';
      case 'weekly': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="mb-4">Checklist Management</CardTitle>
          <Button onClick={handleCreateChecklist} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New Checklist
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
                <TableHead>
                  Title
                  <div className="text-xs text-gray-500 font-normal">(Click to view.)</div>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklists.map((checklist) => (
                <TableRow key={checklist.id}>
                  <TableCell className="font-medium">
                    <button onClick={() => handleViewChecklist(checklist)} className="text-left hover:text-blue-600 hover:underline transition-colors">
                      {checklist.title}
                    </button>
                  </TableCell>
                  <TableCell>{checklist.department}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadgeColor(checklist.frequency)}>{checklist.frequency}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(checklist.status)}>{checklist.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {checklist.assignedToName ? (
                      <span className="text-sm">{checklist.assignedToName}</span>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditChecklist(checklist)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Checklist</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete "{checklist.title}"? This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteChecklist(checklist.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <EditChecklistModal 
        checklist={editChecklist}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditChecklist(null);
          setIsCreateMode(false);
        }}
        isCreateMode={isCreateMode}
      />
      <ViewChecklistModal 
        checklist={viewChecklist} 
        isOpen={isViewModalOpen} 
        onClose={() => { 
          setIsViewModalOpen(false); 
          setViewChecklist(null); 
        }} 
      />
    </>
  );
};