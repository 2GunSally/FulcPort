import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Bell, Shield, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';

export const SystemSettings: React.FC = () => {
  const { users, checklists, requests, messages } = useAppContext();
  const [settings, setSettings] = useState({
    autoAssignChecklists: true,
    emailNotifications: true,
    requireApproval: false,
    maintenanceWindow: '02:00',
    maxRequestsPerUser: 10,
    checklistRetentionDays: 90
  });

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    toast({ title: 'Success', description: 'Settings saved successfully' });
  };

  const systemStats = {
    totalUsers: users.length,
    activeChecklists: checklists.filter(c => c.status !== 'completed').length,
    pendingRequests: requests.filter(r => r.status === 'open').length,
    unreadMessages: messages.filter(m => !m.read).length
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemStats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemStats.activeChecklists}</div>
              <div className="text-sm text-gray-600">Active Checklists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{systemStats.pendingRequests}</div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{systemStats.unreadMessages}</div>
              <div className="text-sm text-gray-600">Unread Messages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-assign Checklists</Label>
                <div className="text-sm text-gray-600">
                  Automatically assign new checklists to department members
                </div>
              </div>
              <Switch
                checked={settings.autoAssignChecklists}
                onCheckedChange={(checked) => setSettings({ ...settings, autoAssignChecklists: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <div className="text-sm text-gray-600">
                  Send email notifications for important updates
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Admin Approval</Label>
                <div className="text-sm text-gray-600">
                  Require admin approval for new maintenance requests
                </div>
              </div>
              <Switch
                checked={settings.requireApproval}
                onCheckedChange={(checked) => setSettings({ ...settings, requireApproval: checked })}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenance-window">Maintenance Window</Label>
                <Input
                  id="maintenance-window"
                  type="time"
                  value={settings.maintenanceWindow}
                  onChange={(e) => setSettings({ ...settings, maintenanceWindow: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-requests">Max Requests per User</Label>
                <Input
                  id="max-requests"
                  type="number"
                  value={settings.maxRequestsPerUser}
                  onChange={(e) => setSettings({ ...settings, maxRequestsPerUser: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention-days">Checklist Retention (Days)</Label>
              <Input
                id="retention-days"
                type="number"
                value={settings.checklistRetentionDays}
                onChange={(e) => setSettings({ ...settings, checklistRetentionDays: parseInt(e.target.value) })}
                className="w-full md:w-48"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Current Admin Users</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {users.filter(u => u.role === 'admin').map(user => (
                  <Badge key={user.id} variant="secondary">
                    {user.name} ({user.initials})
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Authorized Users</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {users.filter(u => u.role === 'authorized').map(user => (
                  <Badge key={user.id} variant="outline">
                    {user.name} ({user.initials})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};