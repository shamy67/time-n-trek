
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure environment variables are set.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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
