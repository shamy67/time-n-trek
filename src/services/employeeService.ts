import { BreakEntry } from '@/hooks/useTimer';
import { supabase, EmployeeDB, TimeRecordDB, InvitationDB, isSupabaseConfigured } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Employee {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  password?: string;
  isAdmin?: boolean;
  authId?: string;
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  clockInTime: Date;
  clockOutTime?: Date;
  location: string;
  totalWorkDuration: number;
  breakEntries: BreakEntry[];
}

// Helper functions to convert between frontend and database models
const convertToEmployeeModel = (dbEmployee: EmployeeDB): Employee => {
  return {
    id: dbEmployee.id,
    name: dbEmployee.name,
    email: dbEmployee.email,
    joinedAt: new Date(dbEmployee.joined_at),
    isAdmin: dbEmployee.is_admin,
    authId: dbEmployee.auth_id
  };
};

const convertToEmployeeDB = (employee: Employee): EmployeeDB => {
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    joined_at: employee.joinedAt.toISOString(),
    is_admin: employee.isAdmin || false,
    auth_id: employee.authId
  };
};

const convertToTimeRecordModel = (dbRecord: TimeRecordDB): TimeRecord => {
  return {
    id: dbRecord.id,
    employeeId: dbRecord.employee_id,
    clockInTime: new Date(dbRecord.clock_in_time),
    clockOutTime: dbRecord.clock_out_time ? new Date(dbRecord.clock_out_time) : undefined,
    location: dbRecord.location,
    totalWorkDuration: dbRecord.total_work_duration,
    breakEntries: dbRecord.break_entries.map((entry: any) => ({
      ...entry,
      startTime: new Date(entry.startTime),
      endTime: entry.endTime ? new Date(entry.endTime) : undefined
    }))
  };
};

const convertToTimeRecordDB = (record: TimeRecord): TimeRecordDB => {
  return {
    id: record.id,
    employee_id: record.employeeId,
    clock_in_time: record.clockInTime.toISOString(),
    clock_out_time: record.clockOutTime ? record.clockOutTime.toISOString() : undefined,
    location: record.location,
    total_work_duration: record.totalWorkDuration,
    break_entries: record.breakEntries.map(entry => ({
      ...entry,
      startTime: entry.startTime.toISOString(),
      endTime: entry.endTime ? entry.endTime.toISOString() : undefined
    }))
  };
};

// Session management - Store current user ID
let currentEmployeeId: string | null = null;

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  if (!isSupabaseConfigured()) {
    // Fallback to mock data when Supabase is not configured
    return [
      {
        id: 'admin',
        name: 'Administrator',
        email: 'admin@example.com',
        joinedAt: new Date(),
        isAdmin: true
      }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*');
    
    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
    
    return data.map(convertToEmployeeModel);
  } catch (err) {
    console.error('Failed to fetch employees:', err);
    return [];
  }
};

// Add a new employee
export const addEmployee = async (employee: Employee): Promise<Employee> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, employee not saved to database');
    return employee;
  }

  try {
    // Check if admin exists already, if not and this is the first employee, make it admin
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true);
    
    if (count === 0 && employee.id === 'admin') {
      employee.isAdmin = true;
    }
    
    const dbEmployee = convertToEmployeeDB(employee);
    
    // Check if employee already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employee.id)
      .single();
    
    if (existingEmployee) {
      // Update existing employee
      const { error } = await supabase
        .from('employees')
        .update(dbEmployee)
        .eq('id', employee.id);
      
      if (error) {
        console.error('Error updating employee:', error);
        throw error;
      }
    } else {
      // Add new employee
      const { error } = await supabase
        .from('employees')
        .insert(dbEmployee);
      
      if (error) {
        console.error('Error adding employee:', error);
        throw error;
      }
    }
    
    return employee;
  } catch (err) {
    console.error('Failed to add/update employee:', err);
    return employee;
  }
};

// Initialize admin account if it doesn't exist
export const initializeAdmin = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, admin initialization skipped');
    return;
  }

  try {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('id', 'admin')
      .single();
    
    if (!data) {
      const adminEmployee: Employee = {
        id: 'admin',
        name: 'Administrator',
        email: 'admin',
        joinedAt: new Date(),
        password: 'admin', // In real app, use Supabase Auth
        isAdmin: true
      };
      
      await addEmployee(adminEmployee);
    }
  } catch (err) {
    console.error('Failed to initialize admin:', err);
  }
};

// Get employee by ID
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  if (!isSupabaseConfigured()) {
    return id === 'admin' ? {
      id: 'admin',
      name: 'Administrator',
      email: 'admin@example.com',
      joinedAt: new Date(),
      isAdmin: true
    } : null;
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching employee by ID:', error);
      return null;
    }
    
    return convertToEmployeeModel(data);
  } catch (err) {
    console.error('Failed to fetch employee by ID:', err);
    return null;
  }
};

// Get employee by email
export const getEmployeeByEmail = async (email: string): Promise<Employee | null> => {
  if (!isSupabaseConfigured()) {
    return email === 'admin@example.com' ? {
      id: 'admin',
      name: 'Administrator',
      email: 'admin@example.com',
      joinedAt: new Date(),
      isAdmin: true
    } : null;
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .ilike('email', email)
      .single();
    
    if (error || !data) {
      console.error('Error fetching employee by email:', error);
      return null;
    }
    
    return convertToEmployeeModel(data);
  } catch (err) {
    console.error('Failed to fetch employee by email:', err);
    return null;
  }
};

// Set current logged in employee
export const setCurrentEmployee = (employeeId: string): void => {
  currentEmployeeId = employeeId;
  localStorage.setItem('timetrack_current_user', employeeId); // Keep for compatibility
};

// Get current logged in employee
export const getCurrentEmployee = async (): Promise<Employee | null> => {
  if (!currentEmployeeId) {
    currentEmployeeId = localStorage.getItem('timetrack_current_user');
  }
  
  if (!currentEmployeeId) return null;
  
  return await getEmployeeById(currentEmployeeId);
};

// Login with credentials (ID/email and password)
export const loginWithCredentials = async (idOrEmail: string, password: string): Promise<Employee | null> => {
  // First try to find by ID
  let employee = await getEmployeeById(idOrEmail);
  
  // If not found by ID, try by email
  if (!employee) {
    employee = await getEmployeeByEmail(idOrEmail);
  }
  
  if (employee && employee.password === password) {
    setCurrentEmployee(employee.id);
    return employee;
  }
  
  return null;
};

// Set employee password
export const setEmployeePassword = async (employeeId: string, password: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, password not updated in database');
    return;
  }

  try {
    const { error } = await supabase
      .from('employees')
      .update({ password })
      .eq('id', employeeId);
    
    if (error) {
      console.error('Error setting employee password:', error);
      throw error;
    }
  } catch (err) {
    console.error('Failed to set employee password:', err);
  }
};

// Add a new time record
export const addTimeRecord = async (record: TimeRecord): Promise<TimeRecord> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, time record not saved to database');
    return record;
  }

  try {
    const dbRecord = convertToTimeRecordDB(record);
    
    const { error } = await supabase
      .from('time_records')
      .insert(dbRecord);
    
    if (error) {
      console.error('Error adding time record:', error);
      throw error;
    }
    
    return record;
  } catch (err) {
    console.error('Failed to add time record:', err);
    return record;
  }
};

// Get all time records
export const getTimeRecords = async (): Promise<TimeRecord[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('time_records')
      .select('*');
    
    if (error) {
      console.error('Error fetching time records:', error);
      return [];
    }
    
    return data.map(convertToTimeRecordModel);
  } catch (err) {
    console.error('Failed to fetch time records:', err);
    return [];
  }
};

// Get time records for a specific employee
export const getTimeRecordsForEmployee = async (employeeId: string): Promise<TimeRecord[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('time_records')
      .select('*')
      .eq('employee_id', employeeId);
    
    if (error) {
      console.error('Error fetching time records for employee:', error);
      return [];
    }
    
    return data.map(convertToTimeRecordModel);
  } catch (err) {
    console.error('Failed to fetch time records for employee:', err);
    return [];
  }
};

// Get time records for all employees
export const getAllEmployeesTimeRecords = async (): Promise<TimeRecord[]> => {
  return getTimeRecords();
};

// Export time records to CSV format
export const exportTimeRecordsToCSV = async (): Promise<string> => {
  try {
    const records = await getTimeRecords();
    const employees = await getEmployees();
    
    // Create a map of employee IDs to names for quick lookup
    const employeeMap = new Map<string, string>();
    employees.forEach(emp => employeeMap.set(emp.id, emp.name));
    
    // CSV header
    let csv = 'Employee Name,Employee ID,Clock In,Clock Out,Location,Total Duration (hours),Break Duration (hours)\n';
    
    // Add records to CSV
    records.forEach(record => {
      const employeeName = employeeMap.get(record.employeeId) || 'Unknown';
      const clockIn = record.clockInTime.toLocaleString();
      const clockOut = record.clockOutTime ? record.clockOutTime.toLocaleString() : 'Still Active';
      const totalDurationHours = (record.totalWorkDuration / 3600).toFixed(2);
      
      // Calculate total break time
      const totalBreakTime = record.breakEntries.reduce((total, entry) => total + entry.duration, 0);
      const totalBreakHours = (totalBreakTime / 3600).toFixed(2);
      
      csv += `"${employeeName}","${record.employeeId}","${clockIn}","${clockOut}","${record.location}","${totalDurationHours}","${totalBreakHours}"\n`;
    });
    
    return csv;
  } catch (err) {
    console.error('Failed to export time records to CSV:', err);
    return 'Error generating CSV';
  }
};

// Delete an employee by ID
export const deleteEmployee = async (employeeId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, employee not deleted from database');
    return true;
  }

  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);
    
    if (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to delete employee:', err);
    return false;
  }
};

// Grant admin privileges to an employee
export const makeAdmin = async (employeeId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, admin privileges not updated in database');
    return true;
  }

  try {
    const { error } = await supabase
      .from('employees')
      .update({ is_admin: true })
      .eq('id', employeeId);
    
    if (error) {
      console.error('Error making employee admin:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to make employee admin:', err);
    return false;
  }
};

// Remove admin privileges from an employee
export const removeAdmin = async (employeeId: string): Promise<boolean> => {
  if (employeeId === 'admin') {
    // Prevent removing admin from original admin
    return false;
  }
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, admin privileges not updated in database');
    return true;
  }

  try {
    const { error } = await supabase
      .from('employees')
      .update({ is_admin: false })
      .eq('id', employeeId);
    
    if (error) {
      console.error('Error removing admin privileges:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to remove admin privileges:', err);
    return false;
  }
};

// Interface for invitation
export interface Invitation {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: Date;
  token: string;
}

// Save an invitation
export const saveInvitation = async (invitation: Invitation): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, invitation not saved to database');
    return;
  }

  try {
    const dbInvitation: InvitationDB = {
      id: invitation.id,
      email: invitation.email,
      name: invitation.name,
      is_admin: invitation.isAdmin,
      created_at: invitation.createdAt.toISOString(),
      token: invitation.token
    };
    
    const { error } = await supabase
      .from('invitations')
      .insert(dbInvitation);
    
    if (error) {
      console.error('Error saving invitation:', error);
      throw error;
    }
  } catch (err) {
    console.error('Failed to save invitation:', err);
  }
};

// Get all invitations
export const getInvitations = async (): Promise<Invitation[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('*');
    
    if (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }
    
    return data.map((inv: InvitationDB) => ({
      id: inv.id,
      email: inv.email,
      name: inv.name,
      isAdmin: inv.is_admin,
      createdAt: new Date(inv.created_at),
      token: inv.token
    }));
  } catch (err) {
    console.error('Failed to fetch invitations:', err);
    return [];
  }
};

// Delete an invitation
export const deleteInvitation = async (invitationId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, invitation not deleted from database');
    return true;
  }

  try {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId);
    
    if (error) {
      console.error('Error deleting invitation:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to delete invitation:', err);
    return false;
  }
};

// Verify if an invitation token is valid
export const verifyInvitationToken = async (token: string): Promise<Invitation | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();
    
    if (error || !data) {
      console.error('Error verifying invitation token:', error);
      return null;
    }
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      isAdmin: data.is_admin,
      createdAt: new Date(data.created_at),
      token: data.token
    };
  } catch (err) {
    console.error('Failed to verify invitation token:', err);
    return null;
  }
};

// Create an employee from an invitation and delete the invitation
export const registerFromInvitation = async (token: string, password: string): Promise<Employee | null> => {
  const invitation = await verifyInvitationToken(token);
  
  if (invitation) {
    // Generate a unique ID for the employee
    const id = `emp_${Date.now().toString(36)}`;
    
    const newEmployee: Employee = {
      id,
      name: invitation.name,
      email: invitation.email,
      joinedAt: new Date(),
      password,
      isAdmin: invitation.isAdmin
    };
    
    await addEmployee(newEmployee);
    await deleteInvitation(invitation.id);
    
    return newEmployee;
  }
  
  return null;
};

// Mock function to simulate sending an email invitation
export const sendInvitationEmail = (invitation: Invitation): boolean => {
  // In a real application, this would send an actual email
  // For now, we'll just log to console and return true to simulate success
  console.log('Sending invitation email to:', invitation.email);
  console.log('Invitation link:', `${window.location.origin}/register?token=${invitation.token}`);
  return true;
};

// Function to check if an email already exists in the system
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    if (isSupabaseConfigured()) {
      // Check in Supabase
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error checking email:', error);
      }
      
      return !!data;
    } else {
      // Check in local storage - if we're not using Supabase
      // Just check if admin email matches
      return email === 'admin@example.com';
    }
  } catch (error) {
    console.error('Error checking if email exists:', error);
    return false;
  }
};
