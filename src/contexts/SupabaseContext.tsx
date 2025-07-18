import React, { createContext, useContext } from 'react';
import { User, Checklist, MaintenanceRequest, Message } from '@/types/maintenance';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { toDomainMessage, toDbMessage, DbMessage } from '@/lib/mappers';

interface SupabaseContextType {
  loadUsers: () => Promise<User[]>;
  loadChecklists: () => Promise<Checklist[]>;
  loadRequests: () => Promise<MaintenanceRequest[]>;
  saveUser: (user: User) => Promise<void>;
  saveChecklist: (checklist: Checklist) => Promise<void>;
  saveRequest: (request: MaintenanceRequest) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  loadMessages: (userId: string) => Promise<Message[]>;
  saveMessage: (message: { subject: string; content: string; from: string; to: string[]; type: Message['type']; senderId: string; recipientIds: string[]; threadId?: string; imageUrl?: string; }) => Promise<Message>;
  deleteMessages: (ids: string[]) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  return context;
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadUsers = async (): Promise<User[]> => {
    try {
      console.log('Loading users from users table...');
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error loading users:', error);
        throw error;
      }
      console.log('Loaded users:', data);
      return (data || []).map(user => ({
        ...user,
        createdAt: new Date(user.created_at),
        lastLogin: user.last_login ? new Date(user.last_login) : new Date(),
        password: user.password || ''
      }));
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  };

  const loadChecklists = async (): Promise<Checklist[]> => {
    try {
      console.log('Loading checklists...');
      const { data, error } = await supabase.from('checklists').select('*');
      if (error) {
        console.error('Error loading checklists:', error);
        throw error;
      }
      console.log('Loaded checklists:', data);
      return (data || []).map(item => ({
        ...item,
        assignedTo: item.assigned_to,
        items: typeof item.items === 'string' ? JSON.parse(item.items) : item.items || [],
        createdAt: new Date(item.created_at),
        startedAt: item.started_at ? new Date(item.started_at) : undefined,
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
        recurring: item.recurring || false,
        nextDueDate: item.next_due_date ? new Date(item.next_due_date) : undefined
      }));
    } catch (error) {
      console.error('Error loading checklists:', error);
      return [];
    }
  };

  const loadRequests = async (): Promise<MaintenanceRequest[]> => {
    try {
      console.log('Loading maintenance requests...');
      const { data, error } = await supabase.from('maintenance_requests').select('*');
      if (error) {
        console.error('Error loading requests:', error);
        throw error;
      }
      console.log('Loaded requests:', data);
      return (data || []).map(req => ({
        ...req,
        createdAt: new Date(req.created_at)
      }));
    } catch (error) {
      console.error('Error loading requests:', error);
      return [];
    }
  };

  const loadMessages = async (userId: string): Promise<Message[]> => {
    try {
      console.log('Loading messages for user:', userId);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_ids.cs.{${userId}}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }
      
      console.log('Loaded messages:', data);
      return (data as DbMessage[]).map(toDomainMessage);
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  const saveMessage = async (payload: { subject: string; content: string; from: string; to: string[]; type: Message['type']; senderId: string; recipientIds: string[]; threadId?: string; imageUrl?: string; }): Promise<Message> => {
    try {
      console.log('Saving message:', payload);
      
      // Use the EXACT same format as the original working code
      const { data, error } = await supabase
        .from('messages')
        .insert({
          subject: payload.subject,
          content: payload.content,
          sender_id: payload.senderId,
          sender_name: payload.from,
          recipient_ids: payload.recipientIds,
          recipient_names: payload.to,
          message_type: payload.type,
          thread_id: payload.threadId || null,
          image_url: payload.imageUrl || null
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error saving message:', error);
        throw error;
      }
      
      console.log('Message saved successfully:', data);
      return toDomainMessage(data as DbMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      toast({ title: 'Error saving message', variant: 'destructive' });
      throw error;
    }
  };

  const deleteMessages = async (ids: string[]): Promise<void> => {
    try {
      console.log('Deleting messages:', ids);
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', ids);
        
      if (error) {
        console.error('Error deleting messages:', error);
        throw error;
      }
      
      console.log('Messages deleted successfully');
    } catch (error) {
      console.error('Error deleting messages:', error);
      throw error;
    }
  };

  const markMessageAsRead = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) {
        console.error('Error marking message as read:', error);
        throw error;
      }
      
      console.log('Message marked as read');
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  };

  const saveUser = async (user: User): Promise<void> => {
    try {
      console.log('Saving user:', user);
      const userId = user.id && isValidUUID(user.id) ? user.id : generateUUID();
      
      const userData = {
        id: userId,
        name: user.name,
        role: user.role,
        department: user.department,
        initials: user.initials,
        permissions: user.permissions || [],
        password: user.password || '',
        created_at: user.createdAt?.toISOString() || new Date().toISOString()
      };
      
      const { error } = await supabase.from('users').upsert(userData, { onConflict: 'id' });
      if (error) {
        console.error('Error saving user:', error);
        throw error;
      }
      console.log('User saved successfully');
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const saveChecklist = async (checklist: Checklist): Promise<void> => {
    try {
      console.log('Saving checklist:', checklist);
      const checklistId = checklist.id && isValidUUID(checklist.id) ? checklist.id : generateUUID();
      
      if (!checklist.title || checklist.title.trim() === '') {
        throw new Error('Checklist title is required');
      }
      
      // Validate assigned_to user exists in users table
      let validatedAssignedTo = null;
      if (checklist.assignedTo && isValidUUID(checklist.assignedTo)) {
        const { data: userExists } = await supabase
          .from('users')
          .select('id')
          .eq('id', checklist.assignedTo)
          .single();
        
        if (userExists) {
          validatedAssignedTo = checklist.assignedTo;
        }
      }

      const checklistData = {
        id: checklistId,
        title: checklist.title.trim(),
        department: checklist.department || 'General',
        frequency: checklist.frequency || 'daily',
        items: JSON.stringify(checklist.items || []),
        status: checklist.status || 'pending',
        assigned_to: validatedAssignedTo,
        started_at: checklist.startedAt?.toISOString() || null,
        completed_at: checklist.completedAt?.toISOString() || null,
        created_at: checklist.createdAt?.toISOString() || new Date().toISOString(),
        created_by: checklist.createdBy && isValidUUID(checklist.createdBy) ? checklist.createdBy : null,
        recurring: checklist.recurring || false,
        next_due_date: checklist.nextDueDate?.toISOString() || null
      };
      
      const { error } = await supabase.from('checklists').upsert(checklistData);
      if (error) {
        console.error('Error saving checklist:', error);
        throw error;
      }
      console.log('Checklist saved successfully');
    } catch (error) {
      console.error('Error saving checklist:', error);
      toast({ title: 'Error saving checklist', variant: 'destructive' });
      throw error;
    }
  };

  const saveRequest = async (request: MaintenanceRequest): Promise<void> => {
    try {
      console.log('Saving maintenance request:', request);
      const requestId = request.id && isValidUUID(request.id) ? request.id : generateUUID();
      
      const requestData = {
        id: requestId,
        title: request.title,
        description: request.description,
        priority: request.priority,
        status: request.status,
        department: request.department,
        requested_by: request.requestedBy && isValidUUID(request.requestedBy) ? request.requestedBy : null,
        requested_by_name: request.requestedByName || null,
        created_at: request.createdAt.toISOString()
      };
      
      const { error } = await supabase.from('maintenance_requests').upsert(requestData);
      if (error) {
        console.error('Error saving request:', error);
        throw error;
      }
      console.log('Request saved successfully');
    } catch (error) {
      console.error('Error saving request:', error);
      toast({ title: 'Error saving request', variant: 'destructive' });
      throw error;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      console.log('Deleting user:', id);
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const deleteChecklist = async (id: string): Promise<void> => {
    try {
      console.log('Deleting checklist:', id);
      const { error } = await supabase.from('checklists').delete().eq('id', id);
      if (error) {
        console.error('Error deleting checklist:', error);
        throw error;
      }
      console.log('Checklist deleted successfully');
    } catch (error) {
      console.error('Error deleting checklist:', error);
      toast({ title: 'Error deleting checklist', variant: 'destructive' });
      throw error;
    }
  };

  const deleteRequest = async (id: string): Promise<void> => {
    try {
      console.log('Deleting request:', id);
      const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
      if (error) {
        console.error('Error deleting request:', error);
        throw error;
      }
      console.log('Request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({ title: 'Error deleting request', variant: 'destructive' });
      throw error;
    }
  };

  return (
    <SupabaseContext.Provider
      value={{
        loadUsers,
        loadChecklists,
        loadRequests,
        loadMessages,
        saveMessage,
        deleteMessages,
        markMessageAsRead,
        saveUser,
        saveChecklist,
        saveRequest,
        deleteUser,
        deleteChecklist,
        deleteRequest
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};