import { User, Checklist, MaintenanceRequest, Message, Alert, MessageReply } from '@/types/maintenance';
import { toast } from '@/components/ui/use-toast';

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
  const { saveUser, saveChecklist, saveRequest, deleteUser: dbDeleteUser, deleteChecklist: dbDeleteChecklist, deleteRequest: dbDeleteRequest } = supabaseMethods || {};

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
    toast({ title: 'Checklist completed!' });
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

  const addMessage = (messageData: Omit<Message, 'id' | 'createdAt' | 'read'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false
    };
    setMessages(prev => [...prev, newMessage]);
    toast({ title: 'Message sent!' });
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
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

  return {
    login,
    logout,
    toggleChecklistItem,
    startChecklist,
    completeChecklist,
    addMaintenanceRequest,
    addMessage,
    markMessageAsRead,
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
    updateRequest
  };
};