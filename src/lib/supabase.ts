
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create the Supabase client
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

// Helper function to check if Supabase is configured correctly
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl !== 'https://your-project-url.supabase.co' && 
         supabaseKey !== 'your-anon-key' &&
         supabaseUrl !== '' && 
         supabaseKey !== '';
}

// Log Supabase configuration status
console.log('Supabase configuration status:', isSupabaseConfigured() ? 'Configured' : 'Not configured');
if (!isSupabaseConfigured()) {
  console.warn('Supabase is not properly configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  console.warn('For Lovable users: Make sure to connect Supabase in your project settings and set the environment variables.');
}
