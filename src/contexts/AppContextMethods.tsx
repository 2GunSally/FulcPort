import { User, Checklist, MaintenanceRequest, Message, Alert, MessageReply } from '@/types/maintenance';
import { toast } from '@/components/ui/use-toast';
import { alertService } from '@/services/AlertService';

export const createAppContextMethods = (
  user: User | null,
  setUser: (user: User | null) => void,
  users: User[],
  setUsers: (users: User[] | ((prev: User[]) => User[])) => void,
  checklists: Checklist[],
  setChecklists: (checklists: Checklist[] | ((prev: Checklist[]) => Checklist[])) => void,
  requests: MaintenanceRequest[],
  setRequests: (requests: MaintenanceRequest[] | ((prev: MaintenanceRequest[]) => MaintenanceRequest[])) => void,
  messages: Message[],
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
  alerts: Alert[],
  setAlerts: (alerts: Alert[] | ((prev: Alert[]) => Alert[])) => void,
  setSelectedDepartment: (dept: string) => void,
  setCurrentView: (view: string) => void,
  setEditingChecklist: (checklist: Checklist | null) => void,
  supabaseMethods: any
) => {
  const { saveUser, saveChecklist, saveRequest, saveMessage, deleteMessages, markMessageAsRead: dbMarkMessageAsRead, deleteUser: dbDeleteUser, deleteChecklist: dbDeleteChecklist, deleteRequest: dbDeleteRequest } = supabaseMethods || {};

  const login = (userData: User) => {
    setUser(userData);
    toast({ title: `Welcome, ${userData.name}!` });
  };

  const logout = () => {
    setUser(null);
    setSelectedDepartment('All');
    setCurrentView('dashboard');
    setEditingChecklist(null);
  };

  const toggleChecklistItem = async (checklistId: string, itemId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'authorized')) return;
    
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const updatedItems = Array.isArray(checklist.items) && typeof checklist.items[0] === 'object' 
      ? (checklist.items as any[]).map((item: any) => {
          if (item.id === itemId) {
            return {
              ...item,
              completed: !item.completed,
              completedBy: !item.completed ? user.initials : undefined,
              completedAt: !item.completed ? new Date() : undefined
            };
          }
          return item;
        })
      : checklist.items;

    const updatedChecklist = { ...checklist, items: updatedItems };
    if (saveChecklist) {
      await saveChecklist(updatedChecklist);
    }
    setChecklists(prev => prev.map(c => c.id === checklistId ? updatedChecklist : c));
  };

  const toggleChecklistItemNonCompliant = async (checklistId: string, itemId: string, reason?: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'authorized')) return;
    
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const updatedItems = Array.isArray(checklist.items) && typeof checklist.items[0] === 'object' 
      ? (checklist.items as any[]).map((item: any) => {
          if (item.id === itemId) {
            return {
              ...item,
              nonCompliant: reason ? true : false,
              nonComplianceReason: reason || '',
              completed: false,
              completedBy: reason ? user.initials : undefined,
              completedAt: reason ? new Date() : undefined,
              hasNotes: !!(reason && reason.trim())
            };
          }
          return item;
        })
      : checklist.items;

    const updatedChecklist = { ...checklist, items: updatedItems };
    if (saveChecklist) {
      await saveChecklist(updatedChecklist);
    }
    setChecklists(prev => prev.map(c => c.id === checklistId ? updatedChecklist : c));
  };

  const startChecklist = async (checklistId: string) => {
    const updatedChecklist = checklists.find(c => c.id === checklistId);
    if (!updatedChecklist) return;
    
    const newChecklist = {
      ...updatedChecklist,
      status: 'in-progress' as const,
      startedAt: new Date(),
      assignedTo: user?.id
    };
    
    if (saveChecklist) {
      await saveChecklist(newChecklist);
    }
    setChecklists(prev => prev.map(c => c.id === checklistId ? newChecklist : c));
  };

  const completeChecklist = async (checklistId: string) => {
    const updatedChecklist = checklists.find(c => c.id === checklistId);
    if (!updatedChecklist) return;
    
    const newChecklist = {
      ...updatedChecklist,
      status: 'completed' as const,
      completedAt: new Date()
    };
    
    if (saveChecklist) {
      await saveChecklist(newChecklist);
    }
    setChecklists(prev => prev.map(c => c.id === checklistId ? newChecklist : c));
    
    // If this is a recurring checklist, create a new instance
    if (updatedChecklist.recurring && updatedChecklist.frequency) {
      const getNextDueDate = (freq: 'daily' | 'weekly' | 'monthly'): Date => {
        const now = new Date();
        switch (freq) {
          case 'daily':
            return new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
          case 'weekly':
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
          case 'monthly':
            const nextMonth = new Date(now);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return nextMonth;
          default:
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }
      };
      
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      // Reset all items to not completed
      const resetItems = (items: any[]) => {
        return items.map(item => ({
          ...item,
          completed: false,
          completedBy: undefined,
          completedAt: undefined,
          nonCompliant: false,
          nonComplianceReason: '',
          hasNotes: false
        }));
      };
      
      const recurringChecklist = {
        ...updatedChecklist,
        id: generateUUID(),
        status: 'pending' as const,
        createdAt: new Date(),
        startedAt: undefined,
        completedAt: undefined,
        nextDueDate: getNextDueDate(updatedChecklist.frequency),
        items: resetItems(Array.isArray(updatedChecklist.items) ? updatedChecklist.items : [])
      };
      
      try {
        if (saveChecklist) {
          await saveChecklist(recurringChecklist);
        }
        setChecklists(prev => [...prev, recurringChecklist]);
        toast({ 
          title: 'Checklist completed!', 
          description: 'Next recurring checklist created automatically.'
        });
      } catch (error) {
        console.error('Error creating recurring checklist:', error);
        toast({ 
          title: 'Checklist completed!', 
          description: 'Could not create next recurring checklist.'
        });
      }
    } else {
      toast({ title: 'Checklist completed!' });
    }
  };

  const addMaintenanceRequest = async (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt'>) => {
    const newRequest: MaintenanceRequest = {
      ...requestData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    if (saveRequest) {
      await saveRequest(newRequest);
    }
    setRequests(prev => [...prev, newRequest]);
    toast({ title: 'Maintenance request submitted!' });
  };

  const addMessage = async (msgData: { subject: string; content: string; to: string[]; type: Message['type']; threadId?: string; imageUrl?: string; }) => {
    if (!user || !saveMessage) return;
    
    try {
      const recipientUsers = users.filter(u => msgData.to.includes(u.name));
      const savedMessage = await saveMessage({
        ...msgData,
        from: user.name,
        senderId: user.id,
        recipientIds: recipientUsers.map(u => u.id)
      });
      
      setMessages(prev => [...prev, savedMessage]);
      toast({ title: 'Message sent successfully' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error sending message', variant: 'destructive' });
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
    
    if (dbMarkMessageAsRead) {
      try {
        await dbMarkMessageAsRead(messageId);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const deleteThread = async (threadKey: string) => {
    try {
      // Find all messages in the thread
      const threadMessages = messages.filter(msg => 
        (msg.threadId || msg.id) === threadKey
      );
      
      if (threadMessages.length === 0) return;
      
      const messageIds = threadMessages.map(msg => msg.id);
      
      // Delete from database
      if (deleteMessages) {
        await deleteMessages(messageIds);
      }
      
      // Remove from local state
      setMessages(prev => prev.filter(msg => 
        !messageIds.includes(msg.id)
      ));
      
      toast({ title: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast({ title: 'Error deleting conversation', variant: 'destructive' });
    }
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const replyToMessage = (messageId: string, content: string) => {
    if (!user) return;
    
    const reply: MessageReply = {
      id: Date.now().toString(),
      content,
      from: user.name,
      createdAt: new Date(),
      type: 'reply'
    };

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          replies: [...(msg.replies || []), reply]
        };
      }
      return msg;
    }));
    
    toast({ title: 'Reply sent!' });
  };

  const forwardMessage = (messageId: string, to: string[], subject: string, content: string) => {
    if (!user) return;
    
    const originalMessage = messages.find(msg => msg.id === messageId);
    if (!originalMessage) return;

    const forwardedMessage: Message = {
      id: Date.now().toString(),
      subject,
      content: `${content}\n\n--- Forwarded Message ---\nFrom: ${originalMessage.from}\nTo: ${originalMessage.to.join(', ')}\nSubject: ${originalMessage.subject}\n\n${originalMessage.content}`,
      from: user.name,
      to,
      createdAt: new Date(),
      read: false,
      type: originalMessage.type,
      originalMessageId: messageId
    };

    setMessages(prev => [...prev, forwardedMessage]);
    toast({ title: 'Message forwarded!' });
  };

  const addUser = async (newUser: User) => {
    if (saveUser) {
      await saveUser(newUser);
    }
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (updatedUser: User) => {
    if (saveUser) {
      await saveUser(updatedUser);
    }
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = async (userId: string) => {
    if (dbDeleteUser) {
      await dbDeleteUser(userId);
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const deleteChecklist = async (checklistId: string) => {
    if (dbDeleteChecklist) {
      await dbDeleteChecklist(checklistId);
    }
    setChecklists(prev => prev.filter(c => c.id !== checklistId));
  };

  const deleteRequest = async (requestId: string) => {
    if (dbDeleteRequest) {
      await dbDeleteRequest(requestId);
    }
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const assignChecklist = async (checklistId: string, userId: string, userName: string) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;
    
    const updatedChecklist = {
      ...checklist,
      assignedTo: userId,
      assignedToName: userName
    };
    
    if (saveChecklist) {
      await saveChecklist(updatedChecklist);
    }
    setChecklists(prev => prev.map(c => c.id === checklistId ? updatedChecklist : c));
  };

  const updateChecklist = async (updatedChecklist: Checklist) => {
    if (saveChecklist) {
      await saveChecklist(updatedChecklist);
    }
    setChecklists(prev => prev.map(c => c.id === updatedChecklist.id ? updatedChecklist : c));
  };

  const addChecklist = async (newChecklist: Checklist) => {
    if (saveChecklist) {
      await saveChecklist(newChecklist);
    }
    setChecklists(prev => [...prev, newChecklist]);
  };

  const addRequest = async (newRequest: MaintenanceRequest) => {
    if (saveRequest) {
      await saveRequest(newRequest);
    }
    setRequests(prev => [...prev, newRequest]);
  };

  const updateRequest = async (updatedRequest: MaintenanceRequest) => {
    if (saveRequest) {
      await saveRequest(updatedRequest);
    }
    setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
  };

  // Alert management methods
  const createCustomAlert = (alertData: Omit<Alert, 'id' | 'createdAt' | 'read' | 'showCount'>) => {
    const newAlert = alertService.createCustomAlert(alertData);
    setAlerts(prev => [...prev, newAlert]);
    return newAlert;
  };

  const runAlertChecks = () => {
    const newAlerts = alertService.runAutomaticChecks(checklists, requests);
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        const existingIds = prev.map(a => a.id);
        const uniqueNewAlerts = newAlerts.filter(a => !existingIds.includes(a.id));
        return [...prev, ...uniqueNewAlerts];
      });
    }
  };

  const cleanupAlerts = () => {
    setAlerts(prev => alertService.cleanupExpiredAlerts(prev));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const snoozeAlert = (alertId: string, duration: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, lastShown: new Date(), showCount: (alert.showCount || 0) + 1 }
        : alert
    ));
  };

  return {
    login,
    logout,
    toggleChecklistItem,
    toggleChecklistItemNonCompliant,
    startChecklist,
    completeChecklist,
    addMaintenanceRequest,
    addMessage,
    markMessageAsRead,
    deleteThread,
    markAlertAsRead,
    replyToMessage,
    forwardMessage,
    addUser,
    updateUser,
    deleteUser,
    deleteChecklist,
    deleteRequest,
    assignChecklist,
    updateChecklist,
    addChecklist,
    addRequest,
    updateRequest,
    createCustomAlert,
    runAlertChecks,
    cleanupAlerts,
    dismissAlert,
    snoozeAlert
  };
};