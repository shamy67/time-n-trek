import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Supabase setup
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Flag to determine whether to use Supabase or local storage
const useSupabase = supabaseUrl && supabaseKey;

export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
  joinedAt?: Date;
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  clockInTime: Date;
  clockOutTime: Date;
  location: string;
  totalWorkDuration: number;
  breakEntries: any[];
}

// Helper functions for local storage
const getEmployeesFromLocalStorage = (): Employee[] => {
  const employeesData = localStorage.getItem('timetrack_employees');
  return employeesData ? JSON.parse(employeesData) : [];
};

const saveEmployeesToLocalStorage = (employees: Employee[]) => {
  localStorage.setItem('timetrack_employees', JSON.stringify(employees));
};

const getTimeRecordsFromLocalStorage = (): TimeRecord[] => {
  const timeRecordsData = localStorage.getItem('timetrack_time_records');
  return timeRecordsData ? JSON.parse(timeRecordsData) : [];
};

const saveTimeRecordsToLocalStorage = (timeRecords: TimeRecord[]) => {
  localStorage.setItem('timetrack_time_records', JSON.stringify(timeRecords));
};

// Initialize admin account
export const initializeAdmin = async () => {
  try {
    if (useSupabase) {
      // Check if admin exists in Supabase
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('email', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error checking admin existence:', error);
        return;
      }

      if (!data) {
        // Create admin in Supabase
        const { error: insertError } = await supabase
          .from('employees')
          .insert([{ id: 'admin', name: 'Administrator', email: 'admin', password: 'password', isAdmin: true }]);

        if (insertError) {
          console.error('Supabase error creating admin:', insertError);
        }
      }
    } else {
      // Check if admin exists in local storage
      let employees = getEmployeesFromLocalStorage();
      const adminExists = employees.some(emp => emp.email === 'admin');

      if (!adminExists) {
        // Create admin in local storage
        const adminUser = { id: 'admin', name: 'Administrator', email: 'admin', password: 'password', isAdmin: true };
        employees.push(adminUser);
        saveEmployeesToLocalStorage(employees);
      }
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Login with credentials
export const loginWithCredentials = async (email: string, password: string): Promise<Employee | null> => {
  try {
    if (useSupabase) {
      // Query Supabase for the employee
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Supabase error logging in:', error);
        return null;
      }

      return data ? { ...data, joinedAt: data.joinedAt ? new Date(data.joinedAt) : undefined } : null;
    } else {
      // Check in local storage
      const employees = getEmployeesFromLocalStorage();
      const employee = employees.find(emp => emp.email === email && emp.password === password);
      return employee || null;
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

// Get current employee
export const getCurrentEmployee = async (): Promise<Employee | null> => {
  const employeeId = localStorage.getItem('timetrack_current_user');
  if (!employeeId) {
    return null;
  }

  try {
    if (useSupabase) {
      // Query Supabase for the employee
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) {
        console.error('Supabase error getting current employee:', error);
        return null;
      }

      return data ? { ...data, joinedAt: data.joinedAt ? new Date(data.joinedAt) : undefined } : null;
    } else {
      // Check in local storage
      const employees = getEmployeesFromLocalStorage();
      const employee = employees.find(emp => emp.id === employeeId);
      return employee || null;
    }
  } catch (error) {
    console.error('Error getting current employee:', error);
    return null;
  }
};

// Add employee
export const addEmployee = async (employee: Employee): Promise<void> => {
  try {
    if (useSupabase) {
      // Insert employee into Supabase
      const { error } = await supabase
        .from('employees')
        .insert([employee]);

      if (error) {
        console.error('Supabase error adding employee:', error);
      }
    } else {
      // Add employee to local storage
      let employees = getEmployeesFromLocalStorage();
      employees.push(employee);
      saveEmployeesToLocalStorage(employees);
    }
  } catch (error) {
    console.error('Error adding employee:', error);
  }
};

// Check if email exists
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // Check if we're using Supabase
    if (useSupabase) {
      // Query Supabase for the email
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
        console.error('Supabase error checking email existence:', error);
        return false;
      }
      
      return !!data;
    } else {
      // Check in local storage
      const employees = getEmployeesFromLocalStorage();
      return employees.some(emp => emp.email === email);
    }
  } catch (error) {
    console.error('Error checking if email exists:', error);
    return false;
  }
};

// Add time record
export const addTimeRecord = async (timeRecord: TimeRecord): Promise<void> => {
  try {
    if (useSupabase) {
      // Insert time record into Supabase
      const { error } = await supabase
        .from('time_records')
        .insert([{
          id: timeRecord.id,
          employee_id: timeRecord.employeeId,
          clock_in_time: timeRecord.clockInTime.toISOString(),
          clock_out_time: timeRecord.clockOutTime.toISOString(),
          location: timeRecord.location,
          total_work_duration: timeRecord.totalWorkDuration,
          break_entries: JSON.stringify(timeRecord.breakEntries)
        }]);

      if (error) {
        console.error('Supabase error adding time record:', error);
      }
    } else {
      // Add time record to local storage
      let timeRecords = getTimeRecordsFromLocalStorage();
      timeRecords.push(timeRecord);
      saveTimeRecordsToLocalStorage(timeRecords);
    }
  } catch (error) {
    console.error('Error adding time record:', error);
  }
};

// Get time records for employee
export const getTimeRecordsForEmployee = async (employeeId: string): Promise<TimeRecord[]> => {
  try {
    if (useSupabase) {
      // Query Supabase for time records
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('employee_id', employeeId);

      if (error) {
        console.error('Supabase error getting time records:', error);
        return [];
      }

      return data ? data.map(record => ({
        id: record.id,
        employeeId: record.employee_id,
        clockInTime: new Date(record.clock_in_time),
        clockOutTime: new Date(record.clock_out_time),
        location: record.location,
        totalWorkDuration: record.total_work_duration,
        breakEntries: JSON.parse(record.break_entries)
      })) : [];
    } else {
      // Get time records from local storage
      const timeRecords = getTimeRecordsFromLocalStorage();
      return timeRecords.filter(record => record.employeeId === employeeId);
    }
  } catch (error) {
    console.error('Error getting time records:', error);
    return [];
  }
};
