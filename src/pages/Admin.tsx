
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  getEmployees, 
  getCurrentEmployee, 
  getAllEmployeesTimeRecords, 
  exportTimeRecordsToCSV,
  Employee,
  TimeRecord
} from '@/services/employeeService';
import { FileDown, Users, Clock, Calendar } from 'lucide-react';

interface EmployeeStats {
  id: string;
  name: string;
  totalHours: number;
  totalDays: number;
  lastActivity?: Date;
}

const Admin = () => {
  const navigate = useNavigate();
  const currentEmployee = getCurrentEmployee();
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Redirect if not admin
    if (!currentEmployee || !currentEmployee.isAdmin) {
      navigate('/login');
      toast.error('Admin access required');
      return;
    }
    
    calculateEmployeeStats();
  }, [currentEmployee, navigate]);
  
  const calculateEmployeeStats = () => {
    const employees = getEmployees().filter(emp => !emp.isAdmin);
    const timeRecords = getAllEmployeesTimeRecords();
    
    const stats: EmployeeStats[] = employees.map(employee => {
      const employeeRecords = timeRecords.filter(record => record.employeeId === employee.id);
      
      // Calculate total hours worked
      const totalSeconds = employeeRecords.reduce((total, record) => total + record.totalWorkDuration, 0);
      const totalHours = totalSeconds / 3600;
      
      // Calculate unique days worked
      const uniqueDays = new Set();
      employeeRecords.forEach(record => {
        const date = new Date(record.clockInTime).toDateString();
        uniqueDays.add(date);
      });
      
      // Find last activity
      let lastActivity: Date | undefined = undefined;
      if (employeeRecords.length > 0) {
        const sortedRecords = [...employeeRecords].sort((a, b) => {
          const dateA = a.clockOutTime || a.clockInTime;
          const dateB = b.clockOutTime || b.clockInTime;
          return dateB.getTime() - dateA.getTime();
        });
        
        lastActivity = sortedRecords[0].clockOutTime || sortedRecords[0].clockInTime;
      }
      
      return {
        id: employee.id,
        name: employee.name,
        totalHours: totalHours,
        totalDays: uniqueDays.size,
        lastActivity
      };
    });
    
    setEmployeeStats(stats);
  };
  
  const handleExportToExcel = () => {
    try {
      const csvContent = exportTimeRecordsToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create hidden link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timetrack_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };
  
  const handleViewEmployeeDetails = (employeeId: string) => {
    navigate(`/admin/employee/${employeeId}`);
  };
  
  const filteredEmployees = employeeStats.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-white shadow-soft z-10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Employee Overview</h2>
            <p className="text-muted-foreground">Manage your workforce and track time records</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleExportToExcel} className="flex items-center">
              <FileDown className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Employees ({employeeStats.length})</h3>
          </div>
          
          <div className="w-full max-w-xs">
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end">
                    <Clock className="mr-1 h-4 w-4" />
                    Hours
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end">
                    <Calendar className="mr-1 h-4 w-4" />
                    Days
                  </div>
                </TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell className="text-right">{formatHours(employee.totalHours)}h</TableCell>
                    <TableCell className="text-right">{employee.totalDays}</TableCell>
                    <TableCell>{formatDate(employee.lastActivity)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewEmployeeDetails(employee.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TimeTrack • Admin Dashboard
        </div>
      </footer>
    </div>
  );
};

export default Admin;
