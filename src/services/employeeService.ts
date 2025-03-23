
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
