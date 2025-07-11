import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/maintenance';
import { DEPARTMENTS } from '@/types/maintenance';
import { CheckSquare, Wrench, Shield, Users, LogOut, X, BarChart3, MessageCircle, Bell, Settings } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface SidebarProps {
  user: User;
  selectedDepartment: string;
  onDepartmentSelect: (dept: string) => void;
  onViewChange: (view: string) => void;
  currentView: string;
  onLogout: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  selectedDepartment,
  onDepartmentSelect,
  onViewChange,
  currentView,
  onLogout,
  onClose
}) => {
  const { messages, alerts } = useAppContext();
  const unreadMessages = messages.filter(m => !m.read).length;
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <div className="w-64 bg-gradient-to-b from-green-800 to-gray-800 text-white shadow-xl h-full flex flex-col">
      <div className="p-4 border-b border-green-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {user.initials}
            </div>
            <div>
              <p className="font-semibold text-white">{user.name}</p>
              <Badge 
                variant={user.role === 'admin' ? 'default' : 'secondary'}
                className={user.role === 'admin' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}
              >
                {user.role}
              </Badge>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-white hover:bg-green-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Button
          variant={currentView === 'messages' ? 'secondary' : 'ghost'}
          className={`w-full justify-start text-white hover:bg-green-700 ${
            currentView === 'messages' ? 'bg-green-600' : ''
          }`}
          onClick={() => {
            onViewChange('messages');
            onClose?.();
          }}
        >
          <MessageCircle className="mr-3 h-4 w-4" />
          Messages
          {unreadMessages > 0 && (
            <Badge className="ml-auto bg-red-500 text-white">
              {unreadMessages}
            </Badge>
          )}
        </Button>
        
        <Button
          variant={currentView === 'alerts' ? 'secondary' : 'ghost'}
          className={`w-full justify-start text-white hover:bg-green-700 ${
            currentView === 'alerts' ? 'bg-green-600' : ''
          }`}
          onClick={() => {
            onViewChange('alerts');
            onClose?.();
          }}
        >
          <Bell className="mr-3 h-4 w-4" />
          Alerts
          {unreadAlerts > 0 && (
            <Badge className="ml-auto bg-red-500 text-white">
              {unreadAlerts}
            </Badge>
          )}
        </Button>
        
        <div className="border-t border-green-700 my-2"></div>
        
        <Button
          variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
          className={`w-full justify-start text-white hover:bg-green-700 ${
            currentView === 'dashboard' ? 'bg-green-600' : ''
          }`}
          onClick={() => {
            onViewChange('dashboard');
            onClose?.();
          }}
        >
          <BarChart3 className="mr-3 h-4 w-4" />
          Dashboard
        </Button>
        
        <Button
          variant={currentView === 'checklists' ? 'secondary' : 'ghost'}
          className={`w-full justify-start text-white hover:bg-green-700 ${
            currentView === 'checklists' ? 'bg-green-600' : ''
          }`}
          onClick={() => {
            onViewChange('checklists');
            onClose?.();
          }}
        >
          <CheckSquare className="mr-3 h-4 w-4" />
          Checklists
        </Button>
        
        <Button
          variant={currentView === 'requests' ? 'secondary' : 'ghost'}
          className={`w-full justify-start text-white hover:bg-green-700 ${
            currentView === 'requests' ? 'bg-green-600' : ''
          }`}
          onClick={() => {
            onViewChange('requests');
            onClose?.();
          }}
        >
          <Wrench className="mr-3 h-4 w-4" />
          Maintenance Requests
        </Button>
        
        {user.role === 'admin' && (
          <Button
            variant={currentView === 'admin' ? 'secondary' : 'ghost'}
            className={`w-full justify-start text-white hover:bg-green-700 ${
              currentView === 'admin' ? 'bg-green-600' : ''
            }`}
            onClick={() => {
              onViewChange('admin');
              onClose?.();
            }}
          >
            <Settings className="mr-3 h-4 w-4" />
            Admin Panel
          </Button>
        )}
        
        <div className="pt-6">
          <h3 className="text-sm font-semibold text-green-200 mb-3 px-2">Departments</h3>
          <div className="space-y-1">
            {DEPARTMENTS.map(dept => (
              <Button
                key={dept}
                variant="ghost"
                className={`w-full justify-start text-sm text-white hover:bg-green-700 ${
                  selectedDepartment === dept ? 'bg-green-600' : ''
                }`}
                onClick={() => {
                  onDepartmentSelect(dept);
                  onClose?.();
                }}
              >
                {dept}
              </Button>
            ))}
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t border-green-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-red-600 transition-colors"
          onClick={() => {
            onLogout();
            onClose?.();
          }}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;