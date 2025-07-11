import React, { useState } from 'react';
import { CheckCircle, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChecklistItem } from '@/types/maintenance';
import NonComplianceModal from './NonComplianceModal';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggleComplete: (itemId: string) => void;
  onToggleNonCompliant: (itemId: string, reason?: string) => void;
  onViewNotes: (itemId: string) => void;
  isChecklistCompleted?: boolean;
}

const ChecklistItemRow: React.FC<ChecklistItemRowProps> = ({
  item,
  onToggleComplete,
  onToggleNonCompliant,
  onViewNotes,
  isChecklistCompleted = false
}) => {
  const [showNonComplianceModal, setShowNonComplianceModal] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);

  const handleGreenBoxClick = () => {
    if (!item.nonCompliant && !isChecklistCompleted) {
      onToggleComplete(item.id);
    }
  };

  const handleRedBoxClick = () => {
    if (!item.completed && !isChecklistCompleted) {
      if (item.nonCompliant) {
        onToggleNonCompliant(item.id);
      } else {
        setShowNonComplianceModal(true);
      }
    }
  };

  const handleSaveNonCompliance = (reason: string) => {
    onToggleNonCompliant(item.id, reason);
  };

  const handleViewNotes = () => {
    setShowNotesDialog(true);
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString() + ', ' + dateObj.toLocaleTimeString();
  };

  return (
    <>
      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
        <button
          onClick={handleGreenBoxClick}
          disabled={item.nonCompliant || isChecklistCompleted}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
            item.completed
              ? 'bg-green-600 border-green-600'
              : item.nonCompliant || isChecklistCompleted
              ? 'border-gray-300 bg-gray-200 cursor-not-allowed'
              : 'border-green-600 hover:bg-green-50'
          }`}
        >
          {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
        </button>

        <button
          onClick={handleRedBoxClick}
          disabled={item.completed || isChecklistCompleted}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
            item.nonCompliant
              ? 'bg-red-600 border-red-600'
              : item.completed || isChecklistCompleted
              ? 'border-gray-300 bg-gray-200 cursor-not-allowed'
              : 'border-red-600 hover:bg-red-50'
          }`}
        >
          {item.nonCompliant && <X className="w-3 h-3 text-white" />}
        </button>

        <div className="flex-1">
          <p className={`text-sm ${
            item.completed
              ? 'text-gray-500 line-through'
              : item.nonCompliant
              ? 'text-red-600'
              : 'text-gray-700'
          }`}>
            {item.description}
          </p>
          
          {(item.completed || item.nonCompliant) && item.completedBy && item.completedAt && (
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <User className="w-3 h-3 mr-1" />
              <span className="text-green-600 font-medium">{item.completedBy}</span>
              <span className="ml-1">{formatDateTime(item.completedAt)}</span>
            </div>
          )}
        </div>

        {item.nonCompliant && item.nonComplianceReason && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewNotes}
            className="text-xs px-3 py-1 h-auto bg-white border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
          >
            Notes
          </Button>
        )}
      </div>

      <NonComplianceModal
        isOpen={showNonComplianceModal}
        onClose={() => setShowNonComplianceModal(false)}
        onSave={handleSaveNonCompliance}
        initialReason={item.nonComplianceReason || ''}
      />

      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Non-Compliance Notes</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-700">{item.nonComplianceReason}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChecklistItemRow;