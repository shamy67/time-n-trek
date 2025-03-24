import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Flag to determine whether to use Supabase or local storage
const useSupabase = true; // We're connected to Supabase now

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

export interface Invitation {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: Date;
  token: string;
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

const getInvitationsFromLocalStorage = (): Invitation[] => {
  const invitationsData = localStorage.getItem('timetrack_invitations');
  return invitationsData ? JSON.parse(invitationsData) : [];
};

const saveInvitationsToLocalStorage = (invitations: Invitation[]) => {
  localStorage.setItem('timetrack_invitations', JSON.stringify(invitations));
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

// Set current employee
export const setCurrentEmployee = (employeeId: string): void => {
  localStorage.setItem('timetrack_current_user', employeeId);
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

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    if (useSupabase) {
      // Query Supabase for employees
      const { data, error } = await supabase
        .from('employees')
        .select('*');

      if (error) {
        console.error('Supabase error getting employees:', error);
        return [];
      }

      return data ? data.map(emp => ({
        ...emp,
        joinedAt: emp.joined_at ? new Date(emp.joined_at) : undefined,
        isAdmin: emp.is_admin
      })) : [];
    } else {
      // Get employees from local storage
      return getEmployeesFromLocalStorage();
    }
  } catch (error) {
    console.error('Error getting employees:', error);
    return [];
  }
};

// Get employee by ID
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    if (useSupabase) {
      // Query Supabase for the employee
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error getting employee by ID:', error);
        return null;
      }

      return data ? {
        ...data,
        joinedAt: data.joined_at ? new Date(data.joined_at) : undefined,
        isAdmin: data.is_admin
      } : null;
    } else {
      // Check in local storage
      const employees = getEmployeesFromLocalStorage();
      const employee = employees.find(emp => emp.id === id);
      return employee || null;
    }
  } catch (error) {
    console.error('Error getting employee by ID:', error);
    return null;
  }
};

// Delete employee
export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    if (useSupabase) {
      // Delete from Supabase
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting employee:', error);
        return false;
      }

      return true;
    } else {
      // Delete from local storage
      let employees = getEmployeesFromLocalStorage();
      const filteredEmployees = employees.filter(emp => emp.id !== id);
      saveEmployeesToLocalStorage(filteredEmployees);
      return true;
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};

// Make employee an admin
export const makeAdmin = async (id: string): Promise<boolean> => {
  try {
    if (useSupabase) {
      // Update in Supabase
      const { error } = await supabase
        .from('employees')
        .update({ is_admin: true })
        .eq('id', id);

      if (error) {
        console.error('Supabase error making employee admin:', error);
        return false;
      }

      return true;
    } else {
      // Update in local storage
      let employees = getEmployeesFromLocalStorage();
      const employeeIndex = employees.findIndex(emp => emp.id === id);
      
      if (employeeIndex !== -1) {
        employees[employeeIndex].isAdmin = true;
        saveEmployeesToLocalStorage(employees);
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error making employee admin:', error);
    return false;
  }
};

// Remove admin privileges
export const removeAdmin = async (id: string): Promise<boolean> => {
  try {
    if (useSupabase) {
      // Update in Supabase
      const { error } = await supabase
        .from('employees')
        .update({ is_admin: false })
        .eq('id', id);

      if (error) {
        console.error('Supabase error removing admin privileges:', error);
        return false;
      }

      return true;
    } else {
      // Update in local storage
      let employees = getEmployeesFromLocalStorage();
      const employeeIndex = employees.findIndex(emp => emp.id === id);
      
      if (employeeIndex !== -1) {
        employees[employeeIndex].isAdmin = false;
        saveEmployeesToLocalStorage(employees);
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error removing admin privileges:', error);
    return false;
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

// Get all time records for all employees
export const getAllEmployeesTimeRecords = async (): Promise<TimeRecord[]> => {
  try {
    if (useSupabase) {
      // Query Supabase for all time records
      const { data, error } = await supabase
        .from('time_records')
        .select('*');

      if (error) {
        console.error('Supabase error getting all time records:', error);
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
      // Get all time records from local storage
      return getTimeRecordsFromLocalStorage();
    }
  } catch (error) {
    console.error('Error getting all time records:', error);
    return [];
  }
};

// Export time records to CSV
export const exportTimeRecordsToCSV = async (): Promise<string> => {
  try {
    const records = await getAllEmployeesTimeRecords();
    const employees = await getEmployees();
    
    // Create a map for quick employee lookup
    const employeeMap = new Map();
    for (const employee of employees) {
      employeeMap.set(employee.id, employee);
    }
    
    // CSV header
    let csvContent = "Employee ID,Employee Name,Date,Clock In,Clock Out,Duration (hours),Location\n";
    
    // Add records to CSV
    for (const record of records) {
      const employee = employeeMap.get(record.employeeId);
      const employeeName = employee ? employee.name : 'Unknown';
      const date = record.clockInTime.toLocaleDateString();
      const clockIn = record.clockInTime.toLocaleTimeString();
      const clockOut = record.clockOutTime.toLocaleTimeString();
      const durationHours = (record.totalWorkDuration / 3600).toFixed(2);
      
      csvContent += `${record.employeeId},${employeeName},${date},${clockIn},${clockOut},${durationHours},${record.location}\n`;
    }
    
    return csvContent;
  } catch (error) {
    console.error('Error exporting time records to CSV:', error);
    return "Error generating CSV";
  }
};

// Get all invitations
export const getInvitations = async (): Promise<Invitation[]> => {
  try {
    if (useSupabase) {
      // Query Supabase for invitations
      const { data, error } = await supabase
        .from('invitations')
        .select('*');

      if (error) {
        console.error('Supabase error getting invitations:', error);
        return [];
      }

      return data ? data.map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        isAdmin: invitation.is_admin,
        createdAt: new Date(invitation.created_at),
        token: invitation.token
      })) : [];
    } else {
      // Get invitations from local storage
      return getInvitationsFromLocalStorage();
    }
  } catch (error) {
    console.error('Error getting invitations:', error);
    return [];
  }
};

// Save invitation
export const saveInvitation = async (invitation: Invitation): Promise<boolean> => {
  try {
    if (useSupabase) {
      // Insert invitation into Supabase
      const { error } = await supabase
        .from('invitations')
        .insert([{
          id: invitation.id,
          email: invitation.email,
          name: invitation.name,
          is_admin: invitation.isAdmin,
          created_at: invitation.createdAt.toISOString(),
          token: invitation.token
        }]);

      if (error) {
        console.error('Supabase error saving invitation:', error);
        return false;
      }

      return true;
    } else {
      // Save invitation to local storage
      let invitations = getInvitationsFromLocalStorage();
      invitations.push(invitation);
      saveInvitationsToLocalStorage(invitations);
      return true;
    }
  } catch (error) {
    console.error('Error saving invitation:', error);
    return false;
  }
};

// Delete invitation
export const deleteInvitation = async (id: string): Promise<boolean> => {
  try {
    if (useSupabase) {
      // Delete invitation from Supabase
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting invitation:', error);
        return false;
      }

      return true;
    } else {
      // Delete invitation from local storage
      let invitations = getInvitationsFromLocalStorage();
      const filteredInvitations = invitations.filter(inv => inv.id !== id);
      saveInvitationsToLocalStorage(filteredInvitations);
      return true;
    }
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return false;
  }
};

// Send invitation email
export const sendInvitationEmail = async (invitation: Invitation): Promise<boolean> => {
  try {
    // In a real app, this would send an actual email
    // For this demo, we'll just log to console
    console.log(`Sending invitation email to ${invitation.email}`, {
      name: invitation.name,
      isAdmin: invitation.isAdmin,
      token: invitation.token
    });
    
    // Here you would integrate with an email service
    // like SendGrid, AWS SES, etc.
    
    return true;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return false;
  }
};
