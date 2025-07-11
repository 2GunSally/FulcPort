import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checklist, User } from '@/types/maintenance';
import { Clock, CheckCircle, Play } from 'lucide-react';
import ChecklistItemRow from './ChecklistItemRow';

interface ChecklistCardProps {
  checklist: Checklist;
  user: User;
  onItemToggle: (checklistId: string, itemId: string) => void;
  onStartChecklist: (checklistId: string) => void;
  onCompleteChecklist: (checklistId: string) => void;
}

const ChecklistCard: React.FC<ChecklistCardProps> = ({
  checklist,
  user,
  onItemToggle,
  onStartChecklist,
  onCompleteChecklist
}) => {
  // Safely process checklist items with memoization
  const processedItems = useMemo(() => {
    if (!checklist || !checklist.items) return [];
    
    const rawItems = Array.isArray(checklist.items) ? checklist.items : [];
    return rawItems.map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: (index + 1).toString(),
          description: item,
          completed: false,
          nonCompliant: false,
          nonComplianceReason: '',
          hasNotes: false
        };
      }
      return {
        ...item,
        hasNotes: !!(item.nonCompliant && item.nonComplianceReason)
      };
    });
  }, [checklist?.items]);
  
  const [items, setItems] = useState(processedItems);
  
  // Update items when checklist changes
  React.useEffect(() => {
    setItems(processedItems);
  }, [processedItems]);
  
  const canEdit = user?.role === 'admin' || user?.role === 'authorized';
  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const hasStarted = checklist?.status === 'in-progress' || checklist?.status === 'completed';
  const isCompleted = checklist?.status === 'completed';
  const canComplete = items.every(item => 
    item.completed || (item.nonCompliant && item.nonComplianceReason)
  );

  const handleToggleComplete = (itemId: string) => {
    if (isCompleted) return;
    const now = new Date();
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            completed: !item.completed, 
            completedBy: !item.completed ? user.initials : undefined,
            completedAt: !item.completed ? now : undefined,
            nonCompliant: false, 
            nonComplianceReason: '', 
            hasNotes: false 
          }
        : item
    ));
    onItemToggle(checklist.id, itemId);
  };

  const handleToggleNonCompliant = (itemId: string, reason?: string) => {
    if (isCompleted) return;
    const now = new Date();
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            nonCompliant: reason ? true : false, 
            nonComplianceReason: reason || '', 
            completed: false,
            completedBy: reason ? user.initials : undefined,
            completedAt: reason ? now : undefined,
            hasNotes: !!(reason && reason.trim())
          }
        : item
    ));
  };

  const handleViewNotes = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item?.nonComplianceReason) {
      alert(`Non-compliance reason: ${item.nonComplianceReason}`);
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-green-100 text-green-800 border-green-200';
      case 'weekly': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'monthly': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const safeFormatDateTime = (date: Date | string | undefined) => {
    if (!date) return '';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toLocaleDateString() + ', ' + dateObj.toLocaleTimeString();
    } catch (error) {
      return '';
    }
  };

  // Safety check for checklist data
  if (!checklist || !checklist.id) {
    return (
      <Card className="h-full shadow-lg border-red-200">
        <CardContent className="p-4">
          <p className="text-red-600">Invalid checklist data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-gray-800 leading-tight">
            {checklist.title || 'Untitled Checklist'}
          </CardTitle>
          <Badge className={`${getFrequencyColor(checklist.frequency || 'daily')} font-medium`}>
            {checklist.frequency || 'daily'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1">{checklist.department || 'No Department'}</p>
        
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{completedItems}/{totalItems} completed</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {items.map(item => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onToggleComplete={handleToggleComplete}
              onToggleNonCompliant={handleToggleNonCompliant}
              onViewNotes={handleViewNotes}
              isChecklistCompleted={isCompleted}
            />
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {checklist.status === 'completed' ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : checklist.status === 'in-progress' ? (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                Pending
              </Badge>
            )}
          </div>
          
          {canEdit && (
            <div className="flex space-x-2">
              {checklist.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => onStartChecklist(checklist.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              )}
              {checklist.status === 'in-progress' && canComplete && (
                <Button
                  size="sm"
                  onClick={() => onCompleteChecklist(checklist.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          )}
        </div>
        
        {checklist.startedAt && (
          <div className="mt-3 text-xs text-gray-600">
            Started: {safeFormatDateTime(checklist.startedAt)}
          </div>
        )}
        
        {checklist.completedAt && (
          <div className="mt-1 text-xs text-gray-600">
            Completed: {safeFormatDateTime(checklist.completedAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChecklistCard;