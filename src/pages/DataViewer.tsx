
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  joined_at: string;
}

interface TimeRecord {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  location: string;
  total_work_duration: number;
  break_entries: any[];
  employee_name?: string;
}

interface Invitation {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  token: string;
}

const DataViewer = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<{
    employees: boolean;
    timeRecords: boolean;
    invitations: boolean;
  }>({
    employees: true,
    timeRecords: true,
    invitations: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*');
          
        if (employeesError) throw employeesError;
        setEmployees(employeesData || []);
        setLoading(prev => ({ ...prev, employees: false }));
        
        // Fetch time records
        const { data: timeRecordsData, error: timeRecordsError } = await supabase
          .from('time_records')
          .select('*');
          
        if (timeRecordsError) throw timeRecordsError;
        
        // Add employee names to time records
        const recordsWithNames = (timeRecordsData || []).map(record => {
          const employee = (employeesData || []).find(emp => emp.id === record.employee_id);
          return {
            ...record,
            employee_name: employee ? employee.name : 'Unknown'
          };
        });
        
        setTimeRecords(recordsWithNames);
        setLoading(prev => ({ ...prev, timeRecords: false }));
        
        // Fetch invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('invitations')
          .select('*');
          
        if (invitationsError) throw invitationsError;
        setInvitations(invitationsData || []);
        setLoading(prev => ({ ...prev, invitations: false }));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };
    
    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Format duration in seconds to hours and minutes
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full bg-white shadow-soft z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Database Records</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="employees">
          <TabsList className="mb-4">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="timeRecords">Time Records</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employees ({employees.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.employees ? (
                  <div className="text-center py-4">Loading employees data...</div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-4">No employee records found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Joined At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map(employee => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-mono text-xs">{employee.id}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.is_admin ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{formatDate(employee.joined_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeRecords">
            <Card>
              <CardHeader>
                <CardTitle>Time Records ({timeRecords.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.timeRecords ? (
                  <div className="text-center py-4">Loading time records data...</div>
                ) : timeRecords.length === 0 ? (
                  <div className="text-center py-4">No time records found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Breaks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeRecords.map(record => (
                        <TableRow key={record.id}>
                          <TableCell>{record.employee_name}</TableCell>
                          <TableCell>{formatDate(record.clock_in_time)}</TableCell>
                          <TableCell>{record.clock_out_time ? formatDate(record.clock_out_time) : 'Active'}</TableCell>
                          <TableCell>{formatDuration(record.total_work_duration)}</TableCell>
                          <TableCell className="max-w-xs truncate">{record.location}</TableCell>
                          <TableCell>{Array.isArray(record.break_entries) ? record.break_entries.length : 0} breaks</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Invitations ({invitations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.invitations ? (
                  <div className="text-center py-4">Loading invitations data...</div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-4">No invitations found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Token</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map(invitation => (
                        <TableRow key={invitation.id}>
                          <TableCell>{invitation.name}</TableCell>
                          <TableCell>{invitation.email}</TableCell>
                          <TableCell>{invitation.is_admin ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{formatDate(invitation.created_at)}</TableCell>
                          <TableCell className="font-mono text-xs max-w-xs truncate">{invitation.token}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DataViewer;
