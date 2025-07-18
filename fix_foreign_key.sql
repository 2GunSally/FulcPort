-- Fix foreign key constraint to point to users table instead of app_users
-- Run this in your Supabase SQL editor

-- Drop the existing foreign key constraint
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_assigned_to_fkey;

-- Add new foreign key constraint pointing to users table
ALTER TABLE checklists 
ADD CONSTRAINT checklists_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
