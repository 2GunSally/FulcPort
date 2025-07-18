import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  progress?: number;
  target?: string;
  status?: 'good' | 'warning' | 'critical';
  badge?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  trendValue,
  progress,
  target,
  status = 'good',
  badge,
  className = ''
}) => {
  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={`relative ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getStatusColor(status)}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        
        {progress !== undefined && (
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          {target && (
            <p className="text-xs text-gray-500">{target}</p>
          )}
          
          {trend && trendValue && (
            <p className={`text-xs ${getTrendColor(trend)}`}>
              {trendValue}
            </p>
          )}
        </div>
        
        {badge && (
          <Badge 
            variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'default' : 'secondary'}
            className="mt-2"
          >
            {badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
