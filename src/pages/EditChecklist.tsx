import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { DEPARTMENTS } from '@/types/maintenance';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface ChecklistItemInput {
  id: string;
  description: string;
}

const EditChecklist: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { checklists, users, updateChecklist, addChecklist, setCurrentView } = useAppContext();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [frequency, setFrequency] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [items, setItems] = useState<ChecklistItemInput[]>([{ id: '1', description: '' }]);
  const [loading, setLoading] = useState(true);
  const isCreating = !id || id === 'new';

  useEffect(() => {
    if (isCreating) {
      setLoading(false);
      return;
    }

    const checklist = checklists.find(c => c.id === id);
    
    if (checklist) {
      setTitle(checklist.title);
      setDepartment(checklist.department);
      setFrequency(checklist.frequency);
      setAssignedTo(checklist.assignedTo || '');
      
      if (checklist.items && checklist.items.length > 0) {
        const processedItems = checklist.items.map((item, index) => {
          if (typeof item === 'string') {
            return { id: (index + 1).toString(), description: item };
          } else if (item && typeof item === 'object' && 'description' in item) {
            return { id: item.id || (index + 1).toString(), description: item.description || '' };
          }
          return { id: (index + 1).toString(), description: '' };
        });
        setItems(processedItems);
      }
    }
    setLoading(false);
  }, [id, checklists, isCreating]);

  const handleGoBack = () => {
    setCurrentView('admin');
    navigate('/');
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

  const saveToSupabase = async (checklistData: any) => {
    try {
      if (isCreating) {
        const { error } = await supabase.from('checklists').insert([checklistData]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('checklists').update(checklistData).eq('id', id);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Supabase error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assignedUser = users.find(u => u.id === assignedTo);
    const updatedItems = items.filter(item => item.description.trim() !== '').map(item => ({
      id: item.id,
      description: item.description,
      completed: false,
      nonCompliant: false,
      hasNotes: false
    }));
    
    const checklistData = {
      id: isCreating ? Date.now().toString() : id,
      title,
      department,
      frequency: frequency as 'daily' | 'weekly' | 'monthly',
      status: 'pending' as const,
      assignedTo: assignedTo || undefined,
      assignedToName: assignedUser?.name || undefined,
      createdBy: '1',
      createdAt: new Date(),
      items: updatedItems
    };

    await saveToSupabase(checklistData);

    if (isCreating) {
      addChecklist(checklistData);
      toast({ title: 'Success', description: 'Checklist created successfully' });
    } else {
      updateChecklist(checklistData);
      toast({ title: 'Success', description: 'Checklist updated successfully' });
    }
    
    handleGoBack();
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center"><div>Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isCreating ? 'Create' : 'Edit'} Checklist</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Checklist Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter checklist title" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={department} onValueChange={setDepartment} required>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.filter(dept => dept !== 'All').map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency} required>
                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
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
                  <SelectTrigger><SelectValue placeholder="Select user (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name} ({user.department})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Checklist Items</Label>
                  <Button type="button" onClick={addItem} size="sm"><Plus className="w-4 h-4 mr-2" />Add Item</Button>
                </div>

                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-2">
                    <Textarea value={item.description} onChange={(e) => updateItem(item.id, e.target.value)} placeholder={`Item ${index + 1} description`} className="flex-1" rows={2} required />
                    {items.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeItem(item.id)}><X className="w-4 h-4" /></Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">{isCreating ? 'Create' : 'Update'} Checklist</Button>
                <Button type="button" variant="outline" onClick={handleGoBack}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditChecklist;