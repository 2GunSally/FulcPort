import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NonComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reason: string) => void;
  initialReason?: string;
}

const NonComplianceModal: React.FC<NonComplianceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialReason = ''
}) => {
  const [reason, setReason] = useState(initialReason);

  useEffect(() => {
    if (isOpen) {
      setReason(initialReason);
    }
  }, [isOpen, initialReason]);

  const handleSave = () => {
    const trimmedReason = reason.trim();
    if (trimmedReason) {
      onSave(trimmedReason);
      setReason('');
      onClose();
    }
  };

  const handleCancel = () => {
    setReason('');
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Reason for noncompliance:
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Please explain why this item cannot be completed
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for noncompliance..."
              maxLength={500}
              rows={4}
              className="mt-1"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/500 characters
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!reason.trim()}
              className="bg-red-600 hover:bg-red-700"
              type="button"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NonComplianceModal;