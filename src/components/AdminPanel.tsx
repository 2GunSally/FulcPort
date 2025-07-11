import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/UserManagement';
import { ChecklistManagement } from '@/components/ChecklistManagement';
import { RequestManagement } from '@/components/RequestManagement';
import { SystemSettings } from '@/components/SystemSettings';
import { Users, ClipboardList, Settings, AlertTriangle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export const AdminPanel: React.FC = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('settings');

  if (!user || user.role !== 'admin') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="checklists" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Checklists
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="checklists">
          <ChecklistManagement />
        </TabsContent>

        <TabsContent value="requests">
          <RequestManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};