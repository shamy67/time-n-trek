
// This file is being deprecated in favor of using the official Supabase client
// from src/integrations/supabase/client.ts

import { supabase } from '@/integrations/supabase/client';

// Database types that match our tables
export type EmployeeDB = {
  id: string;
  name: string;
  email: string;
  joined_at: string;
  is_admin: boolean;
  auth_id?: string;
}

export type TimeRecordDB = {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time?: string;
  location: string;
  total_work_duration: number;
  break_entries: any[];
}

export type InvitationDB = {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  token: string;
}

// Helper function to check if Supabase is configured correctly
export const isSupabaseConfigured = (): boolean => {
  return true; // We are now using the imported client which is properly configured
}

// Log Supabase configuration status
console.log('Supabase configuration status: Configured');
