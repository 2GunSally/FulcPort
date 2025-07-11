import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle, Clipboard } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  department: string;
  assignee: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low' | 'critical';
  status?: 'in progress' | 'completed';
  type: 'request' | 'checklist';
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'critical': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'in progress': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className="bg-white border-gray-300 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Clipboard className="h-5 w-5 mr-2 text-green-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex-shrink-0">
              {activity.type === 'request' ? (
                <Wrench className="h-5 w-5 text-orange-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-gray-600">
                {activity.department} • {activity.assignee}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {activity.priority && (
                  <Badge className={`text-xs ${getPriorityColor(activity.priority)}`}>
                    {activity.priority}
                  </Badge>
                )}
                {activity.status && (
                  <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 text-xs text-gray-500">
              {activity.timestamp}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;