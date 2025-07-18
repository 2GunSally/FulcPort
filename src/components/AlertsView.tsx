import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Alert } from '@/types/maintenance';
import { AlertTriangle, Bell, Search, Clock, AlertCircle, X, RotateCcw, Shield, Wrench, Settings } from 'lucide-react';

const AlertsView: React.FC = () => {
  const { alerts, markAlertAsRead, dismissAlert, snoozeAlert, runAlertChecks, cleanupAlerts } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  // Run automatic alert checks periodically
  useEffect(() => {
    const interval = setInterval(() => {
      runAlertChecks();
      cleanupAlerts();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [runAlertChecks, cleanupAlerts]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || alert.department === selectedDepartment;
    const matchesSeverity = selectedSeverity === 'All' || alert.severity === selectedSeverity;
    
    return matchesSearch && matchesDepartment && matchesSeverity;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'urgent': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'overdue': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'safety': return <Shield className="h-5 w-5 text-red-600" />;
      case 'maintenance': return <Wrench className="h-5 w-5 text-blue-600" />;
      case 'system': return <Settings className="h-5 w-5 text-gray-600" />;
      case 'custom': return <Bell className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCardBorder = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-l-red-500';
      case 'high': return 'border-l-4 border-l-orange-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-blue-500';
      default: return 'border-l-4 border-l-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Alerts</h1>
        <Badge variant="outline" className="text-sm">
          {alerts.filter(a => !a.read).length} unread
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search alerts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={`transition-shadow ${
            getCardBorder(alert.severity)
          } ${!alert.read ? 'bg-gray-50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.type)}
                  <CardTitle className="text-lg">{alert.title}</CardTitle>
                  {!alert.read && <Badge variant="secondary">New</Badge>}
                  {alert.persistent && <Badge variant="outline">Persistent</Badge>}
                  {alert.actionRequired && <Badge variant="destructive">Action Required</Badge>}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getAlertColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {alert.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">{alert.message}</p>
              {alert.department && (
                <p className="text-sm text-gray-500 mb-2">Department: {alert.department}</p>
              )}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {alert.createdAt.toLocaleDateString()} at {alert.createdAt.toLocaleTimeString()}
                  {alert.expiresAt && (
                    <span className="ml-2">
                      • Expires: {alert.expiresAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {alert.dismissible && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => snoozeAlert(alert.id, 1800000)} // 30 minutes
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    Mark Read
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No alerts found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlertsView;