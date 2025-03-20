
import { BreakEntry } from '@/hooks/useTimer';

export interface Employee {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
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
  employees.push(employee);
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  return employee;
};

// Get employee by ID
export const getEmployeeById = (id: string): Employee | undefined => {
  const employees = getEmployees();
  return employees.find(employee => employee.id === id);
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
