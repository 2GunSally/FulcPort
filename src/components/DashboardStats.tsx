import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle, Clipboard } from 'lucide-react';

interface DashboardStatsProps {
  completedToday: number;
  inProgress: number;
  openRequests: number;
  totalChecklists: number;
  criticalRequests: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  completedToday,
  inProgress,
  openRequests,
  totalChecklists,
  criticalRequests
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="bg-white border-gray-300 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Completed Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">{completedToday}</div>
            <p className="text-xs text-gray-500">+12% from yesterday</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-300 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">{inProgress}</div>
            <p className="text-xs text-gray-500">1 active checklists</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-300 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Open Requests</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">{openRequests}</div>
            <p className="text-xs text-gray-500">{criticalRequests} critical</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-300 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Total Checklists</CardTitle>
          <Clipboard className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">{totalChecklists}</div>
            <p className="text-xs text-gray-500">All time</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;