import { Alert, AlertSettings, Checklist, MaintenanceRequest, User } from '@/types/maintenance';

export class AlertService {
  private static instance: AlertService;
  private settings: AlertSettings;
  private alertCallbacks: ((alert: Alert) => void)[] = [];

  private constructor() {
    this.settings = this.getDefaultSettings();
  }

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  private getDefaultSettings(): AlertSettings {
    return {
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
    };
  }

  updateSettings(settings: AlertSettings): void {
    this.settings = { ...settings, updatedAt: new Date() };
  }

  getSettings(): AlertSettings {
    return this.settings;
  }

  onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  private createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'read' | 'showCount'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      read: false,
      showCount: 0,
      dismissible: alert.dismissible ?? true,
      persistent: alert.persistent ?? false
    };

    this.alertCallbacks.forEach(callback => callback(newAlert));
    return newAlert;
  }

  // Automatic Alert Triggers
  checkOverdueChecklists(checklists: Checklist[]): Alert[] {
    if (!this.settings.overdueChecklistsEnabled) return [];

    const alerts: Alert[] = [];
    const now = new Date();
    const thresholdMs = this.settings.overdueChecklistsThreshold * 60 * 60 * 1000;

    checklists.forEach(checklist => {
      if (checklist.status === 'pending' && checklist.nextDueDate) {
        const timeSinceOverdue = now.getTime() - checklist.nextDueDate.getTime();
        if (timeSinceOverdue > thresholdMs) {
          alerts.push(this.createAlert({
            title: `Overdue Checklist: ${checklist.title}`,
            message: `The checklist "${checklist.title}" in ${checklist.department} is overdue by ${Math.round(timeSinceOverdue / (60 * 60 * 1000))} hours.`,
            type: 'overdue',
            severity: 'high',
            department: checklist.department,
            relatedId: checklist.id,
            relatedType: 'checklist',
            assignedTo: checklist.assignedTo ? [checklist.assignedTo] : [],
            actionRequired: true,
            dismissible: true,
            persistent: false
          }));
        }
      }
    });

    return alerts;
  }

  checkCriticalRequests(requests: MaintenanceRequest[]): Alert[] {
    if (!this.settings.criticalRequestsEnabled) return [];

    const alerts: Alert[] = [];
    const now = new Date();
    const thresholdMs = this.settings.criticalRequestsThreshold * 60 * 60 * 1000;

    requests.forEach(request => {
      if (request.priority === 'high' && request.status === 'open') {
        const timeSinceCreated = now.getTime() - request.createdAt.getTime();
        if (timeSinceCreated > thresholdMs) {
          alerts.push(this.createAlert({
            title: `Critical Request Unattended: ${request.title}`,
            message: `High priority maintenance request "${request.title}" in ${request.department} has been open for ${Math.round(timeSinceCreated / (60 * 60 * 1000))} hours.`,
            type: 'critical',
            severity: 'critical',
            department: request.department,
            relatedId: request.id,
            relatedType: 'request',
            actionRequired: true,
            dismissible: true,
            persistent: true
          }));
        }
      }
    });

    return alerts;
  }

  checkMaintenanceWindow(): Alert[] {
    if (!this.settings.maintenanceWindowEnabled) return [];

    const alerts: Alert[] = [];
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // Check if we're 30 minutes before maintenance window
    const maintenanceStart = this.settings.maintenanceWindowStart;
    const [startHour, startMinute] = maintenanceStart.split(':').map(Number);
    const maintenanceStartTime = new Date(now);
    maintenanceStartTime.setHours(startHour, startMinute, 0, 0);
    
    const timeDiff = maintenanceStartTime.getTime() - now.getTime();
    const thirtyMinutesMs = 30 * 60 * 1000;
    
    if (timeDiff > 0 && timeDiff <= thirtyMinutesMs) {
      alerts.push(this.createAlert({
        title: 'Scheduled Maintenance Window Approaching',
        message: `Scheduled maintenance window begins at ${maintenanceStart}. Please complete any critical operations.`,
        type: 'maintenance',
        severity: 'medium',
        actionRequired: false,
        dismissible: true,
        persistent: false
      }));
    }

    return alerts;
  }

  checkEquipmentFailure(requests: MaintenanceRequest[]): Alert[] {
    if (!this.settings.equipmentFailureEnabled) return [];

    const alerts: Alert[] = [];
    const equipmentKeywords = ['failure', 'broken', 'down', 'malfunction', 'error', 'stop', 'emergency'];

    requests.forEach(request => {
      const containsEquipmentKeyword = equipmentKeywords.some(keyword => 
        request.title.toLowerCase().includes(keyword) || 
        request.description.toLowerCase().includes(keyword)
      );

      if (containsEquipmentKeyword && request.status === 'open') {
        alerts.push(this.createAlert({
          title: `Equipment Failure Detected: ${request.title}`,
          message: `Potential equipment failure reported in ${request.department}. Immediate attention may be required.`,
          type: 'critical',
          severity: 'critical',
          department: request.department,
          relatedId: request.id,
          relatedType: 'request',
          actionRequired: true,
          dismissible: true,
          persistent: true,
          customColor: '#dc2626'
        }));
      }
    });

    return alerts;
  }

  checkSafetyIncidents(requests: MaintenanceRequest[]): Alert[] {
    if (!this.settings.safetyIncidentEnabled) return [];

    const alerts: Alert[] = [];
    const safetyKeywords = ['safety', 'hazard', 'danger', 'accident', 'injury', 'leak', 'fire', 'gas', 'chemical'];

    requests.forEach(request => {
      const containsSafetyKeyword = safetyKeywords.some(keyword => 
        request.title.toLowerCase().includes(keyword) || 
        request.description.toLowerCase().includes(keyword)
      );

      if (containsSafetyKeyword) {
        alerts.push(this.createAlert({
          title: `Safety Alert: ${request.title}`,
          message: `Safety-related issue reported in ${request.department}. Immediate safety protocol activation required.`,
          type: 'safety',
          severity: 'critical',
          department: request.department,
          relatedId: request.id,
          relatedType: 'request',
          actionRequired: true,
          dismissible: false,
          persistent: true,
          customColor: '#dc2626'
        }));
      }
    });

    return alerts;
  }

  checkComplianceDeadlines(checklists: Checklist[]): Alert[] {
    if (!this.settings.complianceDeadlineEnabled) return [];

    const alerts: Alert[] = [];
    const now = new Date();
    const thresholdMs = this.settings.complianceDeadlineThreshold * 24 * 60 * 60 * 1000;

    checklists.forEach(checklist => {
      if (checklist.nextDueDate) {
        const timeUntilDue = checklist.nextDueDate.getTime() - now.getTime();
        if (timeUntilDue > 0 && timeUntilDue <= thresholdMs) {
          alerts.push(this.createAlert({
            title: `Compliance Deadline Approaching: ${checklist.title}`,
            message: `Compliance checklist "${checklist.title}" is due in ${Math.round(timeUntilDue / (24 * 60 * 60 * 1000))} days.`,
            type: 'info',
            severity: 'medium',
            department: checklist.department,
            relatedId: checklist.id,
            relatedType: 'checklist',
            assignedTo: checklist.assignedTo ? [checklist.assignedTo] : [],
            actionRequired: true,
            dismissible: true,
            persistent: false
          }));
        }
      }
    });

    return alerts;
  }

  // Check all automatic triggers
  runAutomaticChecks(checklists: Checklist[], requests: MaintenanceRequest[]): Alert[] {
    const alerts: Alert[] = [];

    alerts.push(...this.checkOverdueChecklists(checklists));
    alerts.push(...this.checkCriticalRequests(requests));
    alerts.push(...this.checkMaintenanceWindow());
    alerts.push(...this.checkEquipmentFailure(requests));
    alerts.push(...this.checkSafetyIncidents(requests));
    alerts.push(...this.checkComplianceDeadlines(checklists));

    return alerts;
  }

  // Custom alert creation
  createCustomAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'read' | 'showCount'>): Alert {
    return this.createAlert({
      ...alertData,
      type: 'custom',
      expiresAt: alertData.expiresAt || new Date(Date.now() + this.settings.defaultAlertDuration * 60 * 60 * 1000),
      frequency: alertData.frequency || this.settings.defaultShowFrequency,
      maxShows: alertData.maxShows || this.settings.defaultMaxShows
    });
  }

  // Alert management
  shouldShowAlert(alert: Alert): boolean {
    const now = new Date();
    
    // Check if expired
    if (alert.expiresAt && now > alert.expiresAt) {
      return false;
    }

    // Check if max shows reached
    if (alert.maxShows && alert.showCount && alert.showCount >= alert.maxShows) {
      return false;
    }

    // Check frequency
    if (alert.frequency && alert.lastShown) {
      const timeSinceLastShown = now.getTime() - alert.lastShown.getTime();
      switch (alert.frequency) {
        case 'daily':
          return timeSinceLastShown >= 24 * 60 * 60 * 1000;
        case 'weekly':
          return timeSinceLastShown >= 7 * 24 * 60 * 60 * 1000;
        case 'monthly':
          return timeSinceLastShown >= 30 * 24 * 60 * 60 * 1000;
        case 'once':
          return false;
      }
    }

    return true;
  }

  cleanupExpiredAlerts(alerts: Alert[]): Alert[] {
    if (!this.settings.autoDeleteExpired) return alerts;

    const now = new Date();
    return alerts.filter(alert => {
      if (alert.expiresAt && now > alert.expiresAt) {
        return false;
      }
      if (alert.maxShows && alert.showCount && alert.showCount >= alert.maxShows) {
        return false;
      }
      return true;
    });
  }
}

export const alertService = AlertService.getInstance();
