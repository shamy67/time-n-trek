
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  getEmployeeById, 
  getCurrentEmployee, 
  getTimeRecordsForEmployee,
  TimeRecord
} from '@/services/employeeService';
import { ArrowLeft, Clock, Calendar, MapPin, Coffee } from 'lucide-react';

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentEmployee = getCurrentEmployee();
  const [employee, setEmployee] = useState<any>(null);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  
  useEffect(() => {
    // Redirect if not admin
    if (!currentEmployee || !currentEmployee.isAdmin) {
      navigate('/login');
      toast.error('Admin access required');
      return;
    }
    
    if (id) {
      const employeeData = getEmployeeById(id);
      if (employeeData) {
        setEmployee(employeeData);
        const records = getTimeRecordsForEmployee(id);
        setTimeRecords(records);
      } else {
        toast.error('Employee not found');
        navigate('/admin');
      }
    }
  }, [id, currentEmployee, navigate]);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  if (!employee) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-white shadow-soft z-10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Employee Details</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">{employee.name}</h2>
          <p className="text-muted-foreground">{employee.email}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Employee ID: {employee.id}
          </p>
          <p className="text-sm text-muted-foreground">
            Joined: {formatDate(new Date(employee.joinedAt))}
          </p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Time Records ({timeRecords.length})</h3>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Breaks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No time records found
                  </TableCell>
                </TableRow>
              ) : (
                timeRecords.map((record) => {
                  const totalBreakTime = record.breakEntries.reduce((total, entry) => total + entry.duration, 0);
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.clockInTime)}</TableCell>
                      <TableCell>{formatTime(record.clockInTime)}</TableCell>
                      <TableCell>
                        {record.clockOutTime ? formatTime(record.clockOutTime) : 'Active'}
                      </TableCell>
                      <TableCell>{formatDuration(record.totalWorkDuration)}</TableCell>
                      <TableCell className="max-w-xs truncate" title={record.location}>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{record.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Coffee className="mr-1 h-3 w-3" />
                          <span>{formatDuration(totalBreakTime)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

export default EmployeeDetails;
