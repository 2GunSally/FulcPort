export interface User {
  id: string;
  name: string;
  initials: string;
  role: 'employee' | 'authorized' | 'admin';
  department: string;
  permissions?: string[];
  password?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  nonCompliant?: boolean;
  nonComplianceReason?: string;
  hasNotes?: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  department: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'in-progress' | 'completed';
  items: ChecklistItem[] | string[];
  description?: string;
  startedAt?: Date;
  completedAt?: Date;
  assignedTo?: string;
  createdBy?: string;
  createdAt?: Date;
  recurring?: boolean;
  nextDueDate?: Date;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: 'low' | 'medium' | 'high';
  requestedBy: string;
  createdAt: Date;
  status: 'open' | 'in-progress' | 'completed';
}

export interface MessageReply {
  id: string;
  content: string;
  from: string;
  createdAt: Date;
  type: 'reply' | 'forward';
  imageUrl?: string;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  from: string;
  to: string[];
  createdAt: Date;
  read: boolean;
  type: 'request' | 'checklist' | 'general';
  relatedId?: string;
  replies?: MessageReply[];
  originalMessageId?: string;
  threadId?: string;
  imageUrl?: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'overdue' | 'critical' | 'urgent' | 'info' | 'custom' | 'maintenance' | 'safety' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  read: boolean;
  relatedId?: string;
  relatedType?: 'checklist' | 'request' | 'user' | 'system';
  department?: string;
  assignedTo?: string[];
  expiresAt?: Date;
  dismissible: boolean;
  persistent: boolean;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  lastShown?: Date;
  showCount?: number;
  maxShows?: number;
  createdBy?: string;
  actionRequired?: boolean;
  customColor?: string;
}

export interface AlertSettings {
  id: string;
  overdueChecklistsEnabled: boolean;
  overdueChecklistsThreshold: number; // hours
  criticalRequestsEnabled: boolean;
  criticalRequestsThreshold: number; // hours
  maintenanceWindowEnabled: boolean;
  maintenanceWindowStart: string; // time
  maintenanceWindowEnd: string; // time
  equipmentFailureEnabled: boolean;
  safetyIncidentEnabled: boolean;
  complianceDeadlineEnabled: boolean;
  complianceDeadlineThreshold: number; // days
  customAlertsEnabled: boolean;
  defaultAlertDuration: number; // hours
  defaultShowFrequency: 'once' | 'daily' | 'weekly' | 'monthly';
  defaultMaxShows: number;
  autoDeleteExpired: boolean;
  emailNotifications: boolean;
  departmentFiltering: boolean;
  severityColors: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const DEPARTMENTS = [
  'Cut Shop',
  'Powder Coat',
  'Weld Shop',
  'Ped Set',
  'Final Assembly',
  'Maintenance',
  'Quality Control'
] as const;

export type Department = typeof DEPARTMENTS[number];

export const USER_PERMISSIONS = [
  'view_all_checklists',
  'create_checklists',
  'delete_checklists',
  'assign_checklists',
  'manage_users',
  'delete_requests',
  'view_admin_panel'
] as const;

export type Permission = typeof USER_PERMISSIONS[number];