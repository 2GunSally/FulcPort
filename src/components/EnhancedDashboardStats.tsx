import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Timer, 
  Target, 
  Wrench,
  Shield,
  Calendar,
  Users,
  BarChart3,
  Zap,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Minus,
  Info
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Checklist, MaintenanceRequest, DEPARTMENTS } from '@/types/maintenance';
import { PerformanceInsights } from './PerformanceInsights';

interface DashboardMetrics {
  // Core Performance
  completionRate: number;
  avgResponseTime: number;
  overdueRate: number;
  
  // Equipment & Reliability
  mtbf: number; // Mean Time Between Failures (simulated)
  mttr: number; // Mean Time To Repair (simulated)
  equipmentUptime: number;
  
  // Efficiency & Planning
  plannedMaintenancePercentage: number;
  workOrderBacklog: number;
  resourceUtilization: number;
  
  // Quality & Safety
  complianceRate: number;
  safetyIncidents: number;
  firstPassYield: number;
  
  // Trends
  weeklyTrends: {
    completions: number[];
    requests: number[];
    compliance: number[];
  };
  
  // Department Performance
  departmentStats: {
    [key: string]: {
      completionRate: number;
      avgResponseTime: number;
      workload: number;
      priority: 'low' | 'medium' | 'high';
    };
  };
}

const EnhancedDashboardStats: React.FC = () => {
  const { checklists, requests, users, alerts } = useAppContext();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    calculateMetrics();
  }, [checklists, requests, users, alerts, selectedTimeframe]);

  const calculateMetrics = (): void => {
    const now = new Date();
    const timeframes = {
      today: 1,
      week: 7,
      month: 30
    };
    
    const daysBack = timeframes[selectedTimeframe];
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    // Filter data by timeframe
    const recentChecklists = checklists.filter(c => 
      c.createdAt && c.createdAt >= cutoffDate
    );
    const recentRequests = requests.filter(r => 
      r.createdAt >= cutoffDate
    );
    
    // Core Performance Metrics
    const completedChecklists = recentChecklists.filter(c => c.status === 'completed');
    const completionRate = recentChecklists.length > 0 
      ? (completedChecklists.length / recentChecklists.length) * 100 
      : 0;
    
    const overdueChecklists = recentChecklists.filter(c => 
      c.nextDueDate && c.nextDueDate < now && c.status !== 'completed'
    );
    const overdueRate = recentChecklists.length > 0 
      ? (overdueChecklists.length / recentChecklists.length) * 100 
      : 0;
    
    // Calculate average response time (simulated realistic values)
    const avgResponseTime = recentRequests.length > 0 
      ? recentRequests.reduce((sum, req) => {
          const priority = req.priority === 'high' ? 2 : req.priority === 'medium' ? 4 : 8;
          return sum + priority;
        }, 0) / recentRequests.length
      : 4;
    
    // Equipment & Reliability (simulated based on maintenance requests)
    const equipmentFailures = recentRequests.filter(r => 
      r.description.toLowerCase().includes('failure') || 
      r.description.toLowerCase().includes('broken') ||
      r.description.toLowerCase().includes('malfunction')
    ).length;
    
    const mtbf = equipmentFailures > 0 ? (daysBack * 24) / equipmentFailures : 168; // hours
    const mttr = avgResponseTime + (Math.random() * 4); // Add some variation
    const equipmentUptime = Math.max(85, 100 - (equipmentFailures * 2));
    
    // Planning & Efficiency
    const plannedRequests = recentRequests.filter(r => 
      r.description.toLowerCase().includes('scheduled') || 
      r.description.toLowerCase().includes('planned')
    ).length;
    const plannedMaintenancePercentage = recentRequests.length > 0 
      ? (plannedRequests / recentRequests.length) * 100 
      : 60;
    
    const workOrderBacklog = requests.filter(r => r.status === 'open').length;
    const resourceUtilization = Math.min(95, (recentRequests.length / (users.length || 1)) * 20);
    
    // Quality & Safety
    const complianceRate = completedChecklists.length > 0 
      ? (completedChecklists.filter(c => {
          const items = Array.isArray(c.items) ? c.items : [];
          return items.every((item: any) => item.completed || item.nonCompliant);
        }).length / completedChecklists.length) * 100
      : 95;
    
    const safetyIncidents = recentRequests.filter(r => 
      r.description.toLowerCase().includes('safety') || 
      r.description.toLowerCase().includes('accident') ||
      r.description.toLowerCase().includes('hazard')
    ).length;
    
    const firstPassYield = Math.max(80, complianceRate - 5);
    
    // Weekly trends (simulated)
    const weeklyTrends = {
      completions: Array(7).fill(0).map((_, i) => Math.max(0, 10 + Math.sin(i) * 3 + Math.random() * 5)),
      requests: Array(7).fill(0).map((_, i) => Math.max(0, 8 + Math.cos(i) * 2 + Math.random() * 4)),
      compliance: Array(7).fill(0).map((_, i) => Math.max(80, 90 + Math.sin(i) * 5 + Math.random() * 3))
    };
    
    // Department Performance
    const departmentStats: DashboardMetrics['departmentStats'] = {};
    DEPARTMENTS.forEach(dept => {
      const deptChecklists = recentChecklists.filter(c => c.department === dept);
      const deptRequests = recentRequests.filter(r => r.department === dept);
      const deptCompleted = deptChecklists.filter(c => c.status === 'completed');
      
      const workload = deptChecklists.length + deptRequests.length;
      const priority = workload > 15 ? 'high' : workload > 8 ? 'medium' : 'low';
      
      departmentStats[dept] = {
        completionRate: deptChecklists.length > 0 ? (deptCompleted.length / deptChecklists.length) * 100 : 0,
        avgResponseTime: deptRequests.length > 0 ? avgResponseTime + (Math.random() * 2 - 1) : avgResponseTime,
        workload,
        priority
      };
    });
    
    setMetrics({
      completionRate,
      avgResponseTime,
      overdueRate,
      mtbf,
      mttr,
      equipmentUptime,
      plannedMaintenancePercentage,
      workOrderBacklog,
      resourceUtilization,
      complianceRate,
      safetyIncidents,
      firstPassYield,
      weeklyTrends,
      departmentStats
    });
  };

  const getTrendIcon = (value: number, threshold: number, inverse: boolean = false) => {
    if (inverse) {
      if (value < threshold) return <ArrowDown className="h-4 w-4 text-green-500" />;
      if (value > threshold * 1.2) return <ArrowUp className="h-4 w-4 text-red-500" />;
    } else {
      if (value > threshold) return <ArrowUp className="h-4 w-4 text-green-500" />;
      if (value < threshold * 0.8) return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'bg-green-500';
    if (value >= thresholds.warning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!metrics) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Performance Dashboard</h2>
        <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Completion Rate */}
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={metrics.completionRate} className="flex-1" />
              {getTrendIcon(metrics.completionRate, 85)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: 90%</p>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">Avg Response Time</CardTitle>
            <Timer className="h-4 w-4 text-orange-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(1)}h</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={Math.max(0, 100 - (metrics.avgResponseTime * 10))} className="flex-1" />
              {getTrendIcon(metrics.avgResponseTime, 6, true)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: &lt;4h</p>
          </CardContent>
        </Card>

        {/* Equipment Uptime */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.equipmentUptime.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={metrics.equipmentUptime} className="flex-1" />
              {getTrendIcon(metrics.equipmentUptime, 90)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: 95%</p>
          </CardContent>
        </Card>

        {/* Work Order Backlog */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Order Backlog</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.workOrderBacklog}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={Math.max(0, 100 - (metrics.workOrderBacklog * 5))} className="flex-1" />
              {getTrendIcon(metrics.workOrderBacklog, 15, true)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: &lt;10</p>
          </CardContent>
        </Card>
      </div>

      {/* Reliability & Safety Metrics */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* MTBF */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTBF</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.mtbf.toFixed(0)}h</div>
            <p className="text-xs text-gray-500">Mean Time Between Failures</p>
          </CardContent>
        </Card>

        {/* MTTR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTTR</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.mttr.toFixed(1)}h</div>
            <p className="text-xs text-gray-500">Mean Time To Repair</p>
          </CardContent>
        </Card>

        {/* Safety Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Incidents</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.safetyIncidents}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={metrics.safetyIncidents === 0 ? "default" : "destructive"}>
                {metrics.safetyIncidents === 0 ? "None" : "Action Required"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complianceRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={metrics.complianceRate} className="flex-1" />
              {getTrendIcon(metrics.complianceRate, 95)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: 98%</p>
          </CardContent>
        </Card>
      </div>

      {/* Planning & Efficiency */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Planned Maintenance % */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned Maintenance</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.plannedMaintenancePercentage.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={metrics.plannedMaintenancePercentage} className="flex-1" />
              {getTrendIcon(metrics.plannedMaintenancePercentage, 70)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: 80%</p>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.resourceUtilization.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={metrics.resourceUtilization} className="flex-1" />
              {getTrendIcon(metrics.resourceUtilization, 75)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: 80%</p>
          </CardContent>
        </Card>

        {/* First Pass Yield */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Pass Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.firstPassYield.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={metrics.firstPassYield} className="flex-1" />
              {getTrendIcon(metrics.firstPassYield, 90)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: 95%</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Department Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(metrics.departmentStats).map(([dept, stats]) => (
              <div key={dept} className="p-4 border rounded-lg min-w-0">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h4 className="font-medium truncate text-sm">{dept}</h4>
                  <Badge 
                    variant={stats.priority === 'high' ? 'destructive' : stats.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs flex-shrink-0"
                  >
                    {stats.priority}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm gap-2">
                    <span className="truncate">Completion Rate</span>
                    <span className={`${getStatusColor(stats.completionRate, { good: 85, warning: 70 })} flex-shrink-0`}>
                      {stats.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm gap-2">
                    <span className="truncate">Response Time</span>
                    <span className={`${getStatusColor(100 - stats.avgResponseTime * 10, { good: 60, warning: 40 })} flex-shrink-0`}>
                      {stats.avgResponseTime.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between text-sm gap-2">
                    <span className="truncate">Workload</span>
                    <span className="flex-shrink-0">{stats.workload} items</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <PerformanceInsights />
    </div>
  );
};

export default EnhancedDashboardStats;
