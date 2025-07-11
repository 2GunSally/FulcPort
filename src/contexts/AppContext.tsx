import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Checklist, MaintenanceRequest, Message, Alert } from '@/types/maintenance';
import { toast } from '@/components/ui/use-toast';
import { useSupabase } from './SupabaseContext';
import { createAppContextMethods } from './AppContextMethods';

interface AppContextType {
  user: User | null;
  users: User[];
  checklists: Checklist[];
  requests: MaintenanceRequest[];
  messages: Message[];
  alerts: Alert[];
  selectedDepartment: string;
  currentView: string;
  editingChecklist: Checklist | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setSelectedDepartment: (dept: string) => void;
  setCurrentView: (view: string) => void;
  setEditingChecklist: (checklist: Checklist | null) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  startChecklist: (checklistId: string) => void;
  completeChecklist: (checklistId: string) => void;
  addMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id' | 'createdAt'>) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => void;
  markMessageAsRead: (messageId: string) => void;
  markAlertAsRead: (alertId: string) => void;
  replyToMessage: (messageId: string, content: string) => void;
  forwardMessage: (messageId: string, to: string[], subject: string, content: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  deleteChecklist: (checklistId: string) => void;
  deleteRequest: (requestId: string) => void;
  assignChecklist: (checklistId: string, userId: string, userName: string) => void;
  updateChecklist: (checklist: Checklist) => void;
  addChecklist: (checklist: Checklist) => void;
  addRequest: (request: MaintenanceRequest) => void;
  updateRequest: (request: MaintenanceRequest) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const mockMessages: Message[] = [];
const mockAlerts: Alert[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabaseContext = useSupabase();
  const { loadUsers, loadChecklists, loadRequests } = supabaseContext || {};

  useEffect(() => {
    if (loadUsers && loadChecklists && loadRequests) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [loadUsers, loadChecklists, loadRequests]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, checklistsData, requestsData] = await Promise.all([
        loadUsers?.() || Promise.resolve([]),
        loadChecklists?.() || Promise.resolve([]),
        loadRequests?.() || Promise.resolve([])
      ]);
      
      setUsers(usersData || []);
      setChecklists(checklistsData || []);
      setRequests(requestsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error loading data', description: 'Using offline mode', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const methods = createAppContextMethods(
    user, setUser, users, setUsers, checklists, setChecklists,
    requests, setRequests, messages, setMessages, alerts, setAlerts,
    setSelectedDepartment, setCurrentView, setEditingChecklist, supabaseContext
  );

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        checklists,
        requests,
        messages,
        alerts,
        selectedDepartment,
        currentView,
        editingChecklist,
        loading,
        setSelectedDepartment,
        setCurrentView,
        setEditingChecklist,
        ...methods
      }}
    >
      {children}
    </AppContext.Provider>
  );
};