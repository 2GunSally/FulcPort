import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Bell, Settings, Save, Plus, X, Clock, AlertCircle, Shield, Wrench } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { AlertSettings, DEPARTMENTS } from '@/types/maintenance';

export const AlertSettingsComponent: React.FC = () => {
  const { user, alerts, createCustomAlert } = useAppContext();
  const [settings, setSettings] = useState<AlertSettings>({
    id: 'default',
    overdueChecklistsEnabled: true,
    overdueChecklistsThreshold: 24,
    criticalRequestsEnabled: true,
    criticalRequestsThreshold: 4,
    maintenanceWindowEnabled: true,
    maintenanceWindowStart: '02:00',
    maintenanceWindowEnd: '06:00',
    equipmentFailureEnabled: true,
    safetyIncidentEnabled: true,
    complianceDeadlineEnabled: true,
    complianceDeadlineThreshold: 7,
    customAlertsEnabled: true,
    defaultAlertDuration: 72,
    defaultShowFrequency: 'daily',
    defaultMaxShows: 5,
    autoDeleteExpired: true,
    emailNotifications: true,
    departmentFiltering: true,
    severityColors: {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [customAlert, setCustomAlert] = useState({
    title: '',
    message: '',
    type: 'custom' as const,
    severity: 'medium' as const,
    department: 'All',
    assignedTo: [] as string[],
    expiresAt: '',
    dismissible: true,
    persistent: false,
    frequency: 'once' as const,
    maxShows: 3,
    actionRequired: false,
    customColor: ''
  });

  const handleSaveSettings = () => {
    setSettings({ ...settings, updatedAt: new Date() });
    toast({ title: 'Success', description: 'Alert settings saved successfully' });
  };

  const handleCreateCustomAlert = () => {
    if (!customAlert.title || !customAlert.message) {
      toast({ title: 'Error', description: 'Title and message are required', variant: 'destructive' });
      return;
    }

    const newAlert = {
      ...customAlert,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
      assignedTo: customAlert.department === 'All' ? [] : [customAlert.department],
      expiresAt: customAlert.expiresAt ? new Date(customAlert.expiresAt) : undefined,
      showCount: 0,
      maxShows: customAlert.maxShows,
      createdBy: user?.id || 'admin'
    };

    createCustomAlert?.(newAlert);
    
    // Reset form
    setCustomAlert({
      title: '',
      message: '',
      type: 'custom',
      severity: 'medium',
      department: 'All',
      assignedTo: [],
      expiresAt: '',
      dismissible: true,
      persistent: false,
      frequency: 'once',
      maxShows: 3,
      actionRequired: false,
      customColor: ''
    });

    toast({ title: 'Success', description: 'Custom alert created successfully' });
  };

  const getSeverityColor = (severity: string) => {
    return settings.severityColors[severity as keyof typeof settings.severityColors] || '#3b82f6';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Alert Settings</h2>

      {/* Automatic Alert Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Automatic Alert Triggers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overdue Checklists */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium">Overdue Checklists</Label>
                <p className="text-sm text-gray-600 break-words">Alert when checklists are overdue</p>
              </div>
              <Switch
                checked={settings.overdueChecklistsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, overdueChecklistsEnabled: checked })}
                className="flex-shrink-0"
              />
            </div>
            {settings.overdueChecklistsEnabled && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="overdue-threshold">Threshold (hours)</Label>
                <Input
                  id="overdue-threshold"
                  type="number"
                  value={settings.overdueChecklistsThreshold}
                  onChange={(e) => setSettings({ ...settings, overdueChecklistsThreshold: parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Critical Requests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium">Critical Maintenance Requests</Label>
                <p className="text-sm text-gray-600 break-words">Alert when high-priority requests are unattended</p>
              </div>
              <Switch
                checked={settings.criticalRequestsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, criticalRequestsEnabled: checked })}
                className="flex-shrink-0"
              />
            </div>
            {settings.criticalRequestsEnabled && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="critical-threshold">Threshold (hours)</Label>
                <Input
                  id="critical-threshold"
                  type="number"
                  value={settings.criticalRequestsThreshold}
                  onChange={(e) => setSettings({ ...settings, criticalRequestsThreshold: parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Maintenance Window */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium">Scheduled Maintenance Window</Label>
                <p className="text-sm text-gray-600 break-words">Alert before scheduled maintenance begins</p>
              </div>
              <Switch
                checked={settings.maintenanceWindowEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceWindowEnabled: checked })}
                className="flex-shrink-0"
              />
            </div>
            {settings.maintenanceWindowEnabled && (
              <div className="ml-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maintenance-start">Start Time</Label>
                  <Input
                    id="maintenance-start"
                    type="time"
                    value={settings.maintenanceWindowStart}
                    onChange={(e) => setSettings({ ...settings, maintenanceWindowStart: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maintenance-end">End Time</Label>
                  <Input
                    id="maintenance-end"
                    type="time"
                    value={settings.maintenanceWindowEnd}
                    onChange={(e) => setSettings({ ...settings, maintenanceWindowEnd: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Equipment Failure */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-medium">Equipment Failure Detection</Label>
              <p className="text-sm text-gray-600 break-words">Alert when equipment failures are reported</p>
            </div>
            <Switch
              checked={settings.equipmentFailureEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, equipmentFailureEnabled: checked })}
              className="flex-shrink-0"
            />
          </div>

          <Separator />

          {/* Safety Incidents */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-medium">Safety Incidents</Label>
              <p className="text-sm text-gray-600 break-words">Alert when safety incidents occur</p>
            </div>
            <Switch
              checked={settings.safetyIncidentEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, safetyIncidentEnabled: checked })}
              className="flex-shrink-0"
            />
          </div>

          <Separator />

          {/* Compliance Deadlines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium">Compliance Deadlines</Label>
                <p className="text-sm text-gray-600 break-words">Alert before compliance deadlines</p>
              </div>
              <Switch
                checked={settings.complianceDeadlineEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, complianceDeadlineEnabled: checked })}
                className="flex-shrink-0"
              />
            </div>
            {settings.complianceDeadlineEnabled && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="compliance-threshold">Days Before Deadline</Label>
                <Input
                  id="compliance-threshold"
                  type="number"
                  value={settings.complianceDeadlineThreshold}
                  onChange={(e) => setSettings({ ...settings, complianceDeadlineThreshold: parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Custom Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-w-0">
              <Label htmlFor="custom-title">Alert Title</Label>
              <Input
                id="custom-title"
                value={customAlert.title}
                onChange={(e) => setCustomAlert({ ...customAlert, title: e.target.value })}
                placeholder="Enter alert title"
                className="w-full"
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="custom-severity">Severity</Label>
              <Select value={customAlert.severity} onValueChange={(value) => setCustomAlert({ ...customAlert, severity: value as any })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="custom-message">Alert Message</Label>
            <Textarea
              id="custom-message"
              value={customAlert.message}
              onChange={(e) => setCustomAlert({ ...customAlert, message: e.target.value })}
              placeholder="Enter alert message"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="min-w-0">
              <Label htmlFor="custom-department">Department</Label>
              <Select value={customAlert.department} onValueChange={(value) => setCustomAlert({ ...customAlert, department: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Departments</SelectItem>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0">
              <Label htmlFor="custom-frequency">Frequency</Label>
              <Select value={customAlert.frequency} onValueChange={(value) => setCustomAlert({ ...customAlert, frequency: value as any })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0">
              <Label htmlFor="custom-max-shows">Max Shows</Label>
              <Input
                id="custom-max-shows"
                type="number"
                value={customAlert.maxShows}
                onChange={(e) => setCustomAlert({ ...customAlert, maxShows: parseInt(e.target.value) })}
                min="1"
                max="10"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-w-0">
              <Label htmlFor="custom-expires">Expires At (optional)</Label>
              <Input
                id="custom-expires"
                type="datetime-local"
                value={customAlert.expiresAt}
                onChange={(e) => setCustomAlert({ ...customAlert, expiresAt: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="min-w-0">
              <Label htmlFor="custom-color">Custom Color (optional)</Label>
              <Input
                id="custom-color"
                type="color"
                value={customAlert.customColor}
                onChange={(e) => setCustomAlert({ ...customAlert, customColor: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="custom-dismissible"
                checked={customAlert.dismissible}
                onCheckedChange={(checked) => setCustomAlert({ ...customAlert, dismissible: checked })}
              />
              <Label htmlFor="custom-dismissible" className="text-sm">Dismissible</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="custom-persistent"
                checked={customAlert.persistent}
                onCheckedChange={(checked) => setCustomAlert({ ...customAlert, persistent: checked })}
              />
              <Label htmlFor="custom-persistent" className="text-sm">Persistent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="custom-action-required"
                checked={customAlert.actionRequired}
                onCheckedChange={(checked) => setCustomAlert({ ...customAlert, actionRequired: checked })}
              />
              <Label htmlFor="custom-action-required" className="text-sm">Action Required</Label>
            </div>
          </div>

          <Button onClick={handleCreateCustomAlert} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Alert
          </Button>
        </CardContent>
      </Card>

      {/* Alert Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Display & Behavior Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="default-duration">Default Alert Duration (hours)</Label>
              <Input
                id="default-duration"
                type="number"
                value={settings.defaultAlertDuration}
                onChange={(e) => setSettings({ ...settings, defaultAlertDuration: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="default-max-shows">Default Max Shows</Label>
              <Input
                id="default-max-shows"
                type="number"
                value={settings.defaultMaxShows}
                onChange={(e) => setSettings({ ...settings, defaultMaxShows: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="default-frequency">Default Show Frequency</Label>
            <Select value={settings.defaultShowFrequency} onValueChange={(value) => setSettings({ ...settings, defaultShowFrequency: value as any })}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Severity Colors</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(settings.severityColors).map(([severity, color]) => (
                <div key={severity} className="space-y-2 min-w-0">
                  <Label htmlFor={`color-${severity}`} className="capitalize text-sm">{severity}</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`color-${severity}`}
                      type="color"
                      value={color}
                      onChange={(e) => setSettings({
                        ...settings,
                        severityColors: { ...settings.severityColors, [severity]: e.target.value }
                      })}
                      className="w-16 h-8 flex-shrink-0"
                    />
                    <Badge style={{ backgroundColor: color, color: 'white' }} className="capitalize text-xs flex-shrink-0">
                      {severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-delete Expired Alerts</Label>
                <p className="text-sm text-gray-600">Automatically remove expired alerts</p>
              </div>
              <Switch
                checked={settings.autoDeleteExpired}
                onCheckedChange={(checked) => setSettings({ ...settings, autoDeleteExpired: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-600">Send email notifications for alerts</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Department Filtering</Label>
                <p className="text-sm text-gray-600">Filter alerts by department</p>
              </div>
              <Switch
                checked={settings.departmentFiltering}
                onCheckedChange={(checked) => setSettings({ ...settings, departmentFiltering: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Alert Settings
        </Button>
      </div>
    </div>
  );
};
