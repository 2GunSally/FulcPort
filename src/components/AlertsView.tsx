import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/contexts/AppContext';
import { Alert } from '@/types/maintenance';
import { AlertTriangle, Bell, Search, Clock, AlertCircle } from 'lucide-react';

const AlertsView: React.FC = () => {
  const { alerts, markAlertAsRead } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = alerts.filter(alert => 
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'urgent': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'overdue': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'overdue': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCardBorder = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-4 border-l-red-500';
      case 'urgent': return 'border-l-4 border-l-orange-500';
      case 'overdue': return 'border-l-4 border-l-yellow-500';
      default: return 'border-l-4 border-l-blue-500';
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
          <Card key={alert.id} className={`cursor-pointer hover:shadow-md transition-shadow ${
            getCardBorder(alert.type)
          } ${!alert.read ? 'bg-gray-50' : ''}`}
          onClick={() => markAlertAsRead(alert.id)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.type)}
                  <CardTitle className="text-lg">{alert.title}</CardTitle>
                  {!alert.read && <Badge variant="secondary">New</Badge>}
                </div>
                <Badge className={getAlertColor(alert.type)}>
                  {alert.type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">{alert.message}</p>
              <div className="text-sm text-gray-500">
                {alert.createdAt.toLocaleDateString()} at {alert.createdAt.toLocaleTimeString()}
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