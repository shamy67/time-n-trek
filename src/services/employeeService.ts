
import { BreakEntry } from '@/hooks/useTimer';

export interface Employee {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  password?: string;
  isAdmin?: boolean;
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

// Local storage keys
const EMPLOYEES_KEY = 'timetrack_employees';
const TIME_RECORDS_KEY = 'timetrack_records';
const CURRENT_USER_KEY = 'timetrack_current_user';
const INVITATIONS_KEY = 'timetrack_invitations';

// Get all employees
export const getEmployees = (): Employee[] => {
  const storedData = localStorage.getItem(EMPLOYEES_KEY);
  return storedData ? JSON.parse(storedData) : [];
};

// Add a new employee
export const addEmployee = (employee: Employee): Employee => {
  const employees = getEmployees();
  
  // Check if admin exists already, if not and this is the first employee, make it admin
  const adminExists = employees.some(emp => emp.isAdmin);
  if (!adminExists && employee.id === 'admin') {
    employee.isAdmin = true;
  }
  
  // Check if employee already exists
  const existingEmployeeIndex = employees.findIndex(emp => emp.id === employee.id);
  if (existingEmployeeIndex !== -1) {
    // Update existing employee
    employees[existingEmployeeIndex] = {
      ...employees[existingEmployeeIndex],
      ...employee
    };
  } else {
    // Add new employee
    employees.push(employee);
  }
  
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  return employee;
};

// Initialize admin account if it doesn't exist
export const initializeAdmin = (): void => {
  const employees = getEmployees();
  const adminExists = employees.some(emp => emp.id === 'admin');
  
  if (!adminExists) {
    const adminEmployee: Employee = {
      id: 'admin',
      name: 'Administrator',
      email: 'admin',
      joinedAt: new Date(),
      password: 'admin',
      isAdmin: true
    };
    
    addEmployee(adminEmployee);
  }
};

// Get employee by ID
export const getEmployeeById = (id: string): Employee | undefined => {
  const employees = getEmployees();
  return employees.find(employee => employee.id === id);
};

// Get employee by email
export const getEmployeeByEmail = (email: string): Employee | undefined => {
  const employees = getEmployees();
  return employees.find(employee => employee.email.toLowerCase() === email.toLowerCase());
};

// Set current logged in employee
export const setCurrentEmployee = (employeeId: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, employeeId);
};

// Get current logged in employee
export const getCurrentEmployee = (): Employee | null => {
  const employeeId = localStorage.getItem(CURRENT_USER_KEY);
  if (!employeeId) return null;
  
  const employee = getEmployeeById(employeeId);
  return employee || null;
};

// Login with credentials (ID/email and password)
export const loginWithCredentials = (idOrEmail: string, password: string): Employee | null => {
  // First try to find by ID
  let employee = getEmployeeById(idOrEmail);
  
  // If not found by ID, try by email
  if (!employee) {
    employee = getEmployeeByEmail(idOrEmail);
  }
  
  if (employee && employee.password === password) {
    setCurrentEmployee(employee.id);
    return employee;
  }
  
  return null;
};

// Set employee password
export const setEmployeePassword = (employeeId: string, password: string): void => {
  const employees = getEmployees();
  const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
  
  if (employeeIndex !== -1) {
    employees[employeeIndex].password = password;
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  }
};

// Add a new time record
export const addTimeRecord = (record: TimeRecord): TimeRecord => {
  const records = getTimeRecords();
  records.push(record);
  localStorage.setItem(TIME_RECORDS_KEY, JSON.stringify(records));
  return record;
};

// Get all time records
export const getTimeRecords = (): TimeRecord[] => {
  const storedData = localStorage.getItem(TIME_RECORDS_KEY);
  const records = storedData ? JSON.parse(storedData) : [];
  
  // Convert date strings back to Date objects
  return records.map((record: any) => ({
    ...record,
    clockInTime: new Date(record.clockInTime),
    clockOutTime: record.clockOutTime ? new Date(record.clockOutTime) : undefined,
    breakEntries: record.breakEntries.map((entry: any) => ({
      ...entry,
      startTime: new Date(entry.startTime),
      endTime: entry.endTime ? new Date(entry.endTime) : undefined
    }))
  }));
};

// Get time records for a specific employee
export const getTimeRecordsForEmployee = (employeeId: string): TimeRecord[] => {
  const records = getTimeRecords();
  return records.filter(record => record.employeeId === employeeId);
};

// Get time records for all employees
export const getAllEmployeesTimeRecords = (): TimeRecord[] => {
  return getTimeRecords();
};

// Export time records to CSV format
export const exportTimeRecordsToCSV = (): string => {
  const records = getTimeRecords();
  const employees = getEmployees();
  
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
};

// Delete an employee by ID
export const deleteEmployee = (employeeId: string): boolean => {
  const employees = getEmployees();
  const initialLength = employees.length;
  const filteredEmployees = employees.filter(emp => emp.id !== employeeId);
  
  if (filteredEmployees.length < initialLength) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(filteredEmployees));
    return true;
  }
  
  return false;
};

// Grant admin privileges to an employee
export const makeAdmin = (employeeId: string): boolean => {
  const employees = getEmployees();
  const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
  
  if (employeeIndex !== -1) {
    employees[employeeIndex].isAdmin = true;
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    return true;
  }
  
  return false;
};

// Remove admin privileges from an employee
export const removeAdmin = (employeeId: string): boolean => {
  const employees = getEmployees();
  const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
  
  if (employeeIndex !== -1 && employeeId !== 'admin') { // Prevent removing admin from original admin
    employees[employeeIndex].isAdmin = false;
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    return true;
  }
  
  return false;
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
export const saveInvitation = (invitation: Invitation): void => {
  const invitations = getInvitations();
  invitations.push(invitation);
  localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));
};

// Get all invitations
export const getInvitations = (): Invitation[] => {
  const storedData = localStorage.getItem(INVITATIONS_KEY);
  const invitations = storedData ? JSON.parse(storedData) : [];
  
  // Convert date strings back to Date objects
  return invitations.map((invitation: any) => ({
    ...invitation,
    createdAt: new Date(invitation.createdAt)
  }));
};

// Delete an invitation
export const deleteInvitation = (invitationId: string): boolean => {
  const invitations = getInvitations();
  const initialLength = invitations.length;
  const filteredInvitations = invitations.filter(inv => inv.id !== invitationId);
  
  if (filteredInvitations.length < initialLength) {
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(filteredInvitations));
    return true;
  }
  
  return false;
};

// Verify if an invitation token is valid
export const verifyInvitationToken = (token: string): Invitation | null => {
  const invitations = getInvitations();
  const invitation = invitations.find(inv => inv.token === token);
  
  return invitation || null;
};

// Create an employee from an invitation and delete the invitation
export const registerFromInvitation = (token: string, password: string): Employee | null => {
  const invitation = verifyInvitationToken(token);
  
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
    
    addEmployee(newEmployee);
    deleteInvitation(invitation.id);
    
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
