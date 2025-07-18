# Enhanced Alert System for FulcPort Maintenance Management

## Overview

The enhanced alert system provides comprehensive notifications and alerting capabilities for the maintenance management system. It includes automatic triggers, custom alerts, and flexible configuration options.

## Features

### 🔔 Automatic Alert Triggers

1. **Overdue Checklists**
   - Monitors checklists past their due date
   - Configurable threshold (default: 24 hours)
   - Creates high-severity alerts for overdue items

2. **Critical Maintenance Requests**
   - Tracks high-priority requests left unattended
   - Configurable threshold (default: 4 hours)
   - Creates critical-severity alerts with persistent notifications

3. **Equipment Failure Detection**
   - Scans request titles/descriptions for failure keywords
   - Keywords: failure, broken, down, malfunction, error, stop, emergency
   - Creates critical alerts requiring immediate action

4. **Safety Incident Monitoring**
   - Detects safety-related keywords in requests
   - Keywords: safety, hazard, danger, accident, injury, leak, fire, gas, chemical
   - Creates critical, non-dismissible alerts

5. **Maintenance Window Notifications**
   - Alerts users 30 minutes before scheduled maintenance
   - Configurable maintenance window times
   - Helps users prepare for system downtime

6. **Compliance Deadline Reminders**
   - Warns about upcoming compliance deadlines
   - Configurable threshold (default: 7 days)
   - Ensures regulatory requirements are met

### 🎨 Custom Alert System

Admins can create custom alerts with:
- **Title and Message**: Custom content
- **Severity Levels**: Low, Medium, High, Critical
- **Department Targeting**: All or specific departments
- **Scheduling**: Once, Daily, Weekly, Monthly
- **Expiration**: Optional expiration dates
- **Appearance**: Custom colors and persistence settings
- **Action Requirements**: Mark alerts as requiring action

### ⚙️ Alert Configuration

#### Alert Settings Panel
- Enable/disable individual trigger types
- Adjust thresholds for each trigger
- Configure default durations and frequencies
- Set severity color schemes
- Manage notification preferences

#### Alert Behavior
- **Dismissible**: Can be manually dismissed
- **Persistent**: Remains visible until addressed
- **Frequency Control**: Limit how often alerts repeat
- **Show Count**: Maximum number of times to display
- **Auto-cleanup**: Automatically remove expired alerts

### 📊 Alert Types and Severities

#### Alert Types
- `overdue` - Overdue checklists
- `critical` - Critical maintenance requests
- `urgent` - High-priority items
- `info` - General information
- `custom` - Admin-created alerts
- `maintenance` - Maintenance window notifications
- `safety` - Safety-related incidents
- `system` - System notifications

#### Severity Levels
- `low` - Blue (informational)
- `medium` - Yellow (attention needed)
- `high` - Orange (important)
- `critical` - Red (immediate action required)

### 🎯 Smart Filtering

- **Department Filtering**: Show only relevant alerts
- **Severity Filtering**: Filter by importance level
- **Search Functionality**: Search by title or message
- **Read Status**: Track which alerts have been viewed

### 🔧 Technical Implementation

#### Database Schema
The system uses three main tables:
- `alerts` - Stores alert data
- `alert_settings` - Configuration settings
- `alert_history` - Tracks alert interactions

#### Automatic Monitoring
- Runs checks every 30 seconds in the UI
- Server-side checks every 5 minutes
- Cleanup operations for expired alerts
- Performance-optimized with database indexes

#### Integration Points
- Monitors checklist completion status
- Tracks maintenance request priorities
- Integrates with user department assignments
- Respects user role permissions

## Usage

### For Admins

1. **Access Alert Settings**
   - Navigate to Admin Panel → Alerts tab
   - Configure automatic triggers
   - Set up custom alerts

2. **Create Custom Alerts**
   - Fill in title and message
   - Choose severity and department
   - Set expiration and frequency
   - Configure persistence and dismissibility

3. **Monitor Alert Activity**
   - View all active alerts
   - Track alert history
   - Manage alert settings

### For Users

1. **View Alerts**
   - Click the Alerts button on dashboard
   - See unread count indicator
   - Filter by department or severity

2. **Interact with Alerts**
   - Mark as read
   - Dismiss (if allowed)
   - Snooze for 30 minutes
   - Take required actions

## Database Setup

1. Execute the `alerts_schema.sql` file in your Supabase SQL editor
2. Adjust Row Level Security policies as needed
3. Grant appropriate permissions to users

## Configuration

### Default Settings
- Overdue checklist threshold: 24 hours
- Critical request threshold: 4 hours
- Maintenance window: 2:00 AM - 6:00 AM
- Default alert duration: 72 hours
- Default show frequency: Daily
- Maximum shows: 5

### Customization
All settings can be modified through the admin panel, including:
- Trigger thresholds
- Color schemes
- Notification preferences
- Department filtering
- Auto-cleanup behavior

## Performance Considerations

- Database indexes on key columns
- Efficient queries for large datasets
- Automatic cleanup of expired alerts
- Optimized alert checking intervals
- Minimal UI re-renders

## Security

- Role-based access control
- Department-based alert filtering
- Secure alert history tracking
- Admin-only configuration access
- Audit trail for all alert actions

## Future Enhancements

- Email/SMS notifications
- Mobile app push notifications
- Integration with external monitoring systems
- Advanced analytics and reporting
- Machine learning for predictive alerts
- Integration with calendar systems for maintenance scheduling

## Troubleshooting

### Common Issues

1. **Alerts not appearing**: Check trigger settings and thresholds
2. **Permission errors**: Verify user roles and RLS policies
3. **Performance issues**: Review database indexes and query optimization
4. **Notification not working**: Check alert settings and email configuration

### Debugging

- Check browser console for JavaScript errors
- Review Supabase logs for database issues
- Verify alert service is running checks
- Test with different user roles and departments

## Support

For technical support or feature requests related to the alert system, contact the development team or refer to the main application documentation.
