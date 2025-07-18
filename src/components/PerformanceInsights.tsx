import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Target,
  Clock,
  Users,
  Wrench,
  Shield
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'improvement' | 'warning' | 'success' | 'info';
  priority: 'high' | 'medium' | 'low';
  category: 'efficiency' | 'safety' | 'quality' | 'cost';
  metric: string;
  value: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

export const PerformanceInsights: React.FC = () => {
  const { checklists, requests, users } = useAppContext();
  
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    // Calculate key metrics
    const totalChecklists = checklists.length;
    const completedChecklists = checklists.filter(c => c.status === 'completed').length;
    const overdueChecklists = checklists.filter(c => 
      c.nextDueDate && c.nextDueDate < new Date() && c.status !== 'completed'
    ).length;
    const completionRate = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0;
    
    const openRequests = requests.filter(r => r.status === 'open').length;
    const criticalRequests = requests.filter(r => r.priority === 'high' && r.status === 'open').length;
    
    // Completion Rate Insights
    if (completionRate < 70) {
      insights.push({
        id: 'low-completion',
        title: 'Low Completion Rate',
        description: 'Your checklist completion rate is below optimal levels',
        type: 'warning',
        priority: 'high',
        category: 'efficiency',
        metric: 'Completion Rate',
        value: `${completionRate.toFixed(1)}%`,
        recommendation: 'Consider reassigning overdue checklists, providing additional training, or reviewing checklist complexity',
        impact: 'high'
      });
    } else if (completionRate > 90) {
      insights.push({
        id: 'high-completion',
        title: 'Excellent Completion Rate',
        description: 'Your team is consistently completing checklists on time',
        type: 'success',
        priority: 'low',
        category: 'efficiency',
        metric: 'Completion Rate',
        value: `${completionRate.toFixed(1)}%`,
        recommendation: 'Maintain current processes and consider sharing best practices with other departments',
        impact: 'medium'
      });
    }
    
    // Overdue Insights
    if (overdueChecklists > 5) {
      insights.push({
        id: 'overdue-items',
        title: 'High Number of Overdue Items',
        description: 'Multiple checklists are past their due dates',
        type: 'warning',
        priority: 'high',
        category: 'efficiency',
        metric: 'Overdue Items',
        value: `${overdueChecklists}`,
        recommendation: 'Prioritize overdue items, consider adjusting schedules, or increasing team capacity',
        impact: 'high'
      });
    }
    
    // Critical Requests
    if (criticalRequests > 3) {
      insights.push({
        id: 'critical-requests',
        title: 'Multiple Critical Requests',
        description: 'High-priority maintenance requests need immediate attention',
        type: 'warning',
        priority: 'high',
        category: 'safety',
        metric: 'Critical Requests',
        value: `${criticalRequests}`,
        recommendation: 'Assign additional resources to critical requests and review emergency response procedures',
        impact: 'high'
      });
    }
    
    // Resource Utilization
    const workload = (totalChecklists + openRequests) / (users.length || 1);
    if (workload > 10) {
      insights.push({
        id: 'high-workload',
        title: 'High Team Workload',
        description: 'Your team may be overloaded with work items',
        type: 'warning',
        priority: 'medium',
        category: 'efficiency',
        metric: 'Items per Person',
        value: `${workload.toFixed(1)}`,
        recommendation: 'Consider hiring additional staff, redistributing work, or extending deadlines',
        impact: 'medium'
      });
    }
    
    // Department Analysis
    const deptPerformance = checklists.reduce((acc, checklist) => {
      const dept = checklist.department;
      if (!acc[dept]) {
        acc[dept] = { total: 0, completed: 0 };
      }
      acc[dept].total++;
      if (checklist.status === 'completed') {
        acc[dept].completed++;
      }
      return acc;
    }, {} as { [key: string]: { total: number; completed: number } });
    
    const underperformingDepts = Object.entries(deptPerformance)
      .filter(([dept, stats]) => stats.total > 0 && (stats.completed / stats.total) < 0.6)
      .map(([dept]) => dept);
    
    if (underperformingDepts.length > 0) {
      insights.push({
        id: 'underperforming-depts',
        title: 'Underperforming Departments',
        description: `${underperformingDepts.join(', ')} departments have low completion rates`,
        type: 'warning',
        priority: 'medium',
        category: 'efficiency',
        metric: 'Department Performance',
        value: `${underperformingDepts.length} dept(s)`,
        recommendation: 'Investigate bottlenecks in these departments and provide targeted support',
        impact: 'medium'
      });
    }
    
    // Safety Insights
    const safetyRequests = requests.filter(r => 
      r.description.toLowerCase().includes('safety') || 
      r.description.toLowerCase().includes('hazard')
    ).length;
    
    if (safetyRequests > 0) {
      insights.push({
        id: 'safety-concerns',
        title: 'Safety-Related Requests',
        description: 'Safety-related maintenance requests require immediate attention',
        type: 'warning',
        priority: 'high',
        category: 'safety',
        metric: 'Safety Requests',
        value: `${safetyRequests}`,
        recommendation: 'Prioritize safety-related requests and conduct safety review',
        impact: 'high'
      });
    }
    
    // Positive Insights
    if (openRequests === 0) {
      insights.push({
        id: 'no-open-requests',
        title: 'All Requests Completed',
        description: 'Excellent work! No outstanding maintenance requests',
        type: 'success',
        priority: 'low',
        category: 'efficiency',
        metric: 'Open Requests',
        value: '0',
        recommendation: 'Great job! Focus on preventive maintenance to keep this trend',
        impact: 'low'
      });
    }
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };
  
  const insights = generateInsights();
  
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'improvement': return TrendingUp;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'info': return Info;
      default: return Info;
    }
  };
  
  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'improvement': return 'text-blue-600';
      case 'warning': return 'text-orange-600';
      case 'success': return 'text-green-600';
      case 'info': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };
  
  const getCategoryIcon = (category: Insight['category']) => {
    switch (category) {
      case 'efficiency': return Target;
      case 'safety': return Shield;
      case 'quality': return CheckCircle;
      case 'cost': return TrendingDown;
      default: return Info;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No specific insights available. Keep monitoring your metrics!
              </AlertDescription>
            </Alert>
          ) : (
            insights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              const CategoryIcon = getCategoryIcon(insight.category);
              
              return (
                <Alert key={insight.id} className={`border-l-4 ${
                  insight.type === 'warning' ? 'border-l-orange-500' :
                  insight.type === 'success' ? 'border-l-green-500' :
                  insight.type === 'improvement' ? 'border-l-blue-500' :
                  'border-l-gray-500'
                }`}>
                  <div className="flex items-start justify-between min-w-0">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getInsightColor(insight.type)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-medium break-words">{insight.title}</h4>
                          <Badge 
                            variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}
                            className="text-xs flex-shrink-0"
                          >
                            {insight.priority}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1 text-xs flex-shrink-0">
                            <CategoryIcon className="h-3 w-3" />
                            {insight.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 break-words">{insight.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm mb-2">
                          <span className="break-words"><strong>{insight.metric}:</strong> {insight.value}</span>
                          <span className="flex-shrink-0"><strong>Impact:</strong> {insight.impact}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm break-words"><strong>Recommendation:</strong> {insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Alert>
              );
            })
          )}
        </div>
        
        {insights.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Assign Tasks</span>
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Extend Deadlines</span>
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Wrench className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Schedule Maintenance</span>
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Target className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Update Targets</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
