import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { DEPARTMENTS } from '@/types/maintenance';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';

interface ChecklistItemInput {
  id: string;
  description: string;
}

interface EditChecklistModalProps {
  checklist?: any;
  isOpen: boolean;
  onClose: () => void;
  isCreateMode?: boolean;
}

const EditChecklistModal: React.FC<EditChecklistModalProps> = ({ 
  checklist, 
  isOpen, 
  onClose, 
  isCreateMode = false 
}) => {
  const { users, updateChecklist, addChecklist } = useAppContext();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [assignedTo, setAssignedTo] = useState('');
  const [items, setItems] = useState<ChecklistItemInput[]>([{ id: '1', description: '' }]);

  useEffect(() => {
    if (isOpen) {
      if (isCreateMode || !checklist) {
        setTitle('');
        setDepartment('');
        setFrequency('daily');
        setAssignedTo('');
        setItems([{ id: '1', description: '' }]);
      } else {
        setTitle(checklist.title || '');
        setDepartment(checklist.department || '');
        setFrequency(checklist.frequency || 'daily');
        setAssignedTo(checklist.assignedTo || '');
        
        if (checklist.items && checklist.items.length > 0) {
          const processedItems = checklist.items.map((item, index) => {
            if (typeof item === 'string') {
              return {
                id: (index + 1).toString(),
                description: item
              };
            } else if (item && typeof item === 'object' && 'description' in item) {
              return {
                id: item.id || (index + 1).toString(),
                description: item.description || ''
              };
            }
            return {
              id: (index + 1).toString(),
              description: ''
            };
          });
          setItems(processedItems);
        } else {
          setItems([{ id: '1', description: '' }]);
        }
      }
    }
  }, [isOpen, checklist, isCreateMode]);

  const handleClose = () => {
    onClose();
    setTitle('');
    setDepartment('');
    setFrequency('daily');
    setAssignedTo('');
    setItems([{ id: '1', description: '' }]);
  };

  const addItem = () => {
    const newId = (items.length + 1).toString();
    setItems([...items, { id: newId, description: '' }]);
  };

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const updateItem = (itemId: string, description: string) => {
    setItems(items.map(item => item.id === itemId ? { ...item, description } : item));
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title || title.trim() === '') {
      toast({ title: 'Error', description: 'Checklist title is required', variant: 'destructive' });
      return;
    }
    
    if (!department) {
      toast({ title: 'Error', description: 'Department is required', variant: 'destructive' });
      return;
    }

    const assignedUser = users.find(u => u.id === assignedTo);
    
    const validItems = items
      .filter(item => item.description.trim() !== '')
      .map(item => ({
        id: item.id,
        description: item.description,
        completed: false
      }));
    
    const checklistData = {
      title: title.trim(),
      department,
      frequency: frequency as 'daily' | 'weekly' | 'monthly',
      assignedTo: assignedTo || undefined,
      assignedToName: assignedUser?.name || undefined,
      items: validItems,
      status: 'pending' as const
    };

    try {
      if (isCreateMode) {
        const newChecklist = {
          ...checklistData,
          id: generateUUID(),
          createdAt: new Date()
        };
        
        await addChecklist(newChecklist);
        toast({ title: 'Success', description: 'Checklist created successfully' });
      } else {
        const updatedChecklist = {
          ...checklist,
          ...checklistData
        };
        
        await updateChecklist(updatedChecklist);
        toast({ title: 'Success', description: 'Checklist updated successfully' });
      }
      
      handleClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to ${isCreateMode ? 'create' : 'update'} checklist`, 
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreateMode ? 'Create New Checklist' : 'Edit Checklist'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter checklist title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.filter(dept => dept !== 'All').map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select user (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Checklist Items</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="flex gap-2">
                <Textarea
                  value={item.description}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  placeholder={`Item ${index + 1} description`}
                  className="flex-1"
                  rows={2}
                />
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              {isCreateMode ? 'Create Checklist' : 'Update Checklist'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChecklistModal;