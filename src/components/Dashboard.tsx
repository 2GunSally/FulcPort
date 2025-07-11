import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Wrench, MessageSquare, Bell, Settings } from 'lucide-react';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import { useAppContext } from '@/contexts/AppContext';

interface DashboardProps {
  onViewChecklists: () => void;
  onViewRequests: () => void;
  onViewMessages: () => void;
  onViewAlerts: () => void;
  onViewAdmin?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChecklists, onViewRequests, onViewMessages, onViewAlerts, onViewAdmin }) => {
  const { checklists, requests, messages, alerts, user } = useAppContext();

  const completedToday = checklists.filter(c => c.status === 'completed').length;
  const inProgress = checklists.filter(c => c.status === 'in-progress').length;
  const openRequests = requests.length;
  const totalChecklists = checklists.length;
  const criticalRequests = requests.filter(r => r.priority === 'high').length;
  const unreadMessages = messages.filter(m => !m.read).length;
  const unreadAlerts = alerts.filter(a => !a.read).length;

  const canAccessAdmin = user && (user.role === 'admin' || user.role === 'authorized');

  const recentActivities = [
    {
      id: '1',
      title: 'Replace Sandblast Booth Hose',
      department: 'Powder Coat',
      assignee: 'MS',
      timestamp: 'Jun 22, 7:55 PM',
      priority: 'high' as const,
      type: 'request' as const
    }
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-6">Maintenance Management System</h1>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-4">
            <Button 
              onClick={onViewChecklists}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Checklists
            </Button>
            <Button 
              onClick={onViewAlerts}
              className="bg-red-600 hover:bg-red-700 text-white relative"
            >
              <Bell className="w-4 h-4 mr-2" />
              Alerts
              {unreadAlerts > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-4">
            <Button 
              onClick={onViewRequests}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Requests
            </Button>
            <Button 
              onClick={onViewMessages}
              className="bg-green-600 hover:bg-green-700 text-white relative"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </Button>
          </div>
          {canAccessAdmin && onViewAdmin && (
            <div className="max-w-2xl mx-auto">
              <Button 
                onClick={onViewAdmin}
                className="bg-green-900 hover:bg-green-800 text-white w-full max-w-md"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          )}
        </div>

        <DashboardStats
          completedToday={completedToday}
          inProgress={inProgress}
          openRequests={openRequests}
          totalChecklists={totalChecklists}
          criticalRequests={criticalRequests}
        />

        <RecentActivity activities={recentActivities} />
      </div>
    </div>
  );
};

export default Dashboard;