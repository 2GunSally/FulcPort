import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checklist, ChecklistItem } from '@/types/maintenance';
import { Clock, User as UserIcon, CheckCircle, Calendar } from 'lucide-react';
import ChecklistItemRow from './ChecklistItemRow';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';

interface ViewChecklistModalProps {
  checklist: Checklist | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewChecklistModal: React.FC<ViewChecklistModalProps> = ({
  checklist,
  isOpen,
  onClose
}) => {
  const { updateChecklist } = useAppContext();
  const [items, setItems] = useState<ChecklistItem[]>([]);

  React.useEffect(() => {
    if (checklist) {
      const processedItems = Array.isArray(checklist.items) ? checklist.items.map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: (index + 1).toString(),
            description: item,
            completed: false,
            nonCompliant: false,
            hasNotes: false
          };
        }
        return {
          ...item,
          nonCompliant: item.nonCompliant || false,
          hasNotes: item.hasNotes || false
        };
      }) : [];
      setItems(processedItems);
    }
  }, [checklist]);

  if (!checklist) return null;

  const handleToggleComplete = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed, nonCompliant: false } : item
    ));
  };

  const handleToggleNonCompliant = (itemId: string, reason?: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        if (reason) {
          return {
            ...item,
            nonCompliant: true,
            nonComplianceReason: reason,
            hasNotes: true,
            completed: false
          };
        } else {
          return {
            ...item,
            nonCompliant: false,
            nonComplianceReason: undefined,
            hasNotes: false
          };
        }
      }
      return item;
    }));
  };

  const handleViewNotes = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item?.nonComplianceReason) {
      toast({
        title: 'Noncompliance Note',
        description: item.nonComplianceReason
      });
    }
  };

  const canComplete = () => {
    return items.every(item => 
      item.completed || (item.nonCompliant && item.nonComplianceReason)
    );
  };

  const handleComplete = () => {
    if (canComplete()) {
      const updatedChecklist = {
        ...checklist,
        items,
        status: 'completed' as const,
        completedAt: new Date()
      };
      updateChecklist(updatedChecklist);
      toast({ title: 'Success', description: 'Checklist completed successfully' });
      onClose();
    }
  };

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-green-100 text-green-800 border-green-200';
      case 'weekly': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'monthly': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {checklist.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={getFrequencyColor(checklist.frequency)}>
                {checklist.frequency}
              </Badge>
              <Badge className={getStatusColor(checklist.status)}>
                {checklist.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                {checklist.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                {checklist.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{checklist.department}</p>
          </div>

          {checklist.description && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-600">{checklist.description}</p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-800">Progress</h4>
              <span className="text-sm text-gray-600">
                {completedItems}/{totalItems} completed ({Math.round(progressPercent)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Checklist Items</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map(item => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onToggleComplete={handleToggleComplete}
                  onToggleNonCompliant={handleToggleNonCompliant}
                  onViewNotes={handleViewNotes}
                />
              ))}
            </div>
          </div>

          {checklist.status !== 'completed' && (
            <div className="flex justify-end">
              <Button
                onClick={handleComplete}
                disabled={!canComplete()}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Checklist
              </Button>
            </div>
          )}

          {checklist.assignedToName && (
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Assigned to: <span className="font-medium">{checklist.assignedToName}</span>
              </span>
            </div>
          )}

          {(checklist.startedAt || checklist.completedAt || checklist.createdAt) && (
            <div className="border-t pt-3 space-y-1">
              <h4 className="font-semibold text-gray-800 mb-2">Timeline</h4>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {new Date(checklist.createdAt).toLocaleString()}</span>
                </div>
                {checklist.startedAt && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>Started: {new Date(checklist.startedAt).toLocaleString()}</span>
                  </div>
                )}
                {checklist.completedAt && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed: {new Date(checklist.completedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewChecklistModal;