-- Database Schema for Enhanced Alert System
-- Execute this in your Supabase SQL editor

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('overdue', 'critical', 'urgent', 'info', 'custom', 'maintenance', 'safety', 'system')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  related_type TEXT CHECK (related_type IN ('checklist', 'request', 'user', 'system')),
  department TEXT,
  assigned_to TEXT[], -- Array of user IDs
  expires_at TIMESTAMP WITH TIME ZONE,
  dismissible BOOLEAN DEFAULT TRUE,
  persistent BOOLEAN DEFAULT FALSE,
  frequency TEXT CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  last_shown TIMESTAMP WITH TIME ZONE,
  show_count INTEGER DEFAULT 0,
  max_shows INTEGER DEFAULT 5,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  action_required BOOLEAN DEFAULT FALSE,
  custom_color TEXT
);

-- Create alert_settings table
CREATE TABLE IF NOT EXISTS alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overdue_checklists_enabled BOOLEAN DEFAULT TRUE,
  overdue_checklists_threshold INTEGER DEFAULT 24, -- hours
  critical_requests_enabled BOOLEAN DEFAULT TRUE,
  critical_requests_threshold INTEGER DEFAULT 4, -- hours
  maintenance_window_enabled BOOLEAN DEFAULT TRUE,
  maintenance_window_start TIME DEFAULT '02:00',
  maintenance_window_end TIME DEFAULT '06:00',
  equipment_failure_enabled BOOLEAN DEFAULT TRUE,
  safety_incident_enabled BOOLEAN DEFAULT TRUE,
  compliance_deadline_enabled BOOLEAN DEFAULT TRUE,
  compliance_deadline_threshold INTEGER DEFAULT 7, -- days
  custom_alerts_enabled BOOLEAN DEFAULT TRUE,
  default_alert_duration INTEGER DEFAULT 72, -- hours
  default_show_frequency TEXT DEFAULT 'daily' CHECK (default_show_frequency IN ('once', 'daily', 'weekly', 'monthly')),
  default_max_shows INTEGER DEFAULT 5,
  auto_delete_expired BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  department_filtering BOOLEAN DEFAULT TRUE,
  severity_colors JSONB DEFAULT '{
    "low": "#3b82f6",
    "medium": "#f59e0b", 
    "high": "#ef4444",
    "critical": "#dc2626"
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alert_history table to track alert interactions
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'read', 'dismissed', 'snoozed', 'expired')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_department ON alerts(department);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);
CREATE INDEX IF NOT EXISTS idx_alerts_expires_at ON alerts(expires_at);
CREATE INDEX IF NOT EXISTS idx_alerts_assigned_to ON alerts USING gin(assigned_to);
CREATE INDEX IF NOT EXISTS idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_user_id ON alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_timestamp ON alert_history(timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for alert_settings table
CREATE TRIGGER update_alert_settings_updated_at
  BEFORE UPDATE ON alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default alert settings
INSERT INTO alert_settings (id) VALUES ('default-settings') ON CONFLICT DO NOTHING;

-- Create function to automatically create alert history entries
CREATE OR REPLACE FUNCTION create_alert_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO alert_history (alert_id, action, metadata)
    VALUES (NEW.id, 'created', jsonb_build_object('created_by', NEW.created_by));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Track when alert is marked as read
    IF OLD.read = FALSE AND NEW.read = TRUE THEN
      INSERT INTO alert_history (alert_id, action)
      VALUES (NEW.id, 'read');
    END IF;
    
    -- Track show count increases
    IF OLD.show_count IS DISTINCT FROM NEW.show_count THEN
      INSERT INTO alert_history (alert_id, action, metadata)
      VALUES (NEW.id, 'snoozed', jsonb_build_object('show_count', NEW.show_count));
    END IF;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for alert history
CREATE TRIGGER alert_history_trigger
  AFTER INSERT OR UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION create_alert_history();

-- Create function to clean up expired alerts
CREATE OR REPLACE FUNCTION cleanup_expired_alerts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete alerts that have expired
  DELETE FROM alerts 
  WHERE expires_at < NOW()
  AND dismissible = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Also delete alerts that have reached max shows
  DELETE FROM alerts
  WHERE show_count >= max_shows
  AND max_shows > 0
  AND dismissible = TRUE;
  
  RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Create function to get active alerts for a user/department
CREATE OR REPLACE FUNCTION get_active_alerts(
  user_dept TEXT DEFAULT NULL,
  user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  severity TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  read BOOLEAN,
  related_id UUID,
  related_type TEXT,
  department TEXT,
  assigned_to TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE,
  dismissible BOOLEAN,
  persistent BOOLEAN,
  frequency TEXT,
  last_shown TIMESTAMP WITH TIME ZONE,
  show_count INTEGER,
  max_shows INTEGER,
  created_by UUID,
  action_required BOOLEAN,
  custom_color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.*
  FROM alerts a
  WHERE 
    (a.expires_at IS NULL OR a.expires_at > NOW())
    AND (a.max_shows IS NULL OR a.show_count < a.max_shows)
    AND (
      user_dept IS NULL 
      OR a.department IS NULL 
      OR a.department = user_dept
      OR a.department = 'All'
    )
    AND (
      user_id IS NULL
      OR a.assigned_to IS NULL
      OR user_id::TEXT = ANY(a.assigned_to)
    )
  ORDER BY 
    CASE a.severity
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    a.created_at DESC;
END;
$$ language 'plpgsql';

-- Grant necessary permissions (adjust based on your RLS policies)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON alerts TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON alert_settings TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON alert_history TO authenticated;

-- Example Row Level Security (RLS) policies
-- ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;

-- Create policy for alerts - users can see alerts for their department or assigned to them
-- CREATE POLICY "Users can view relevant alerts" ON alerts FOR SELECT
-- TO authenticated
-- USING (
--   department IS NULL OR 
--   department = (SELECT department FROM users WHERE id = auth.uid()) OR
--   auth.uid()::TEXT = ANY(assigned_to)
-- );

-- Create policy for alert_settings - only admins can modify
-- CREATE POLICY "Only admins can modify alert settings" ON alert_settings FOR ALL
-- TO authenticated
-- USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Create policy for alert_history - users can view their own history
-- CREATE POLICY "Users can view their alert history" ON alert_history FOR SELECT
-- TO authenticated
-- USING (user_id = auth.uid());
