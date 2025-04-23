
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Department {
  id: string;
  name: string;
  supervisor_id: string | null;
  general_manager_id: string | null;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department_id: string | null;
}

const DepartmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [department, setDepartment] = useState<Department | null>(null);
  const [supervisor, setSupervisor] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDepartmentData();
    }
  }, [id]);

  const loadDepartmentData = async () => {
    try {
      setIsLoading(true);
      
      // Get department details
      const { data: departmentData, error: departmentError } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();

      if (departmentError) throw departmentError;
      setDepartment(departmentData);

      // Get supervisor details
      if (departmentData.supervisor_id) {
        const { data: supervisorData, error: supervisorError } = await supabase
          .from('employees')
          .select('*')
          .eq('id', departmentData.supervisor_id)
          .single();

        if (!supervisorError) {
          setSupervisor(supervisorData);
        }
      }

      // Get employees in this department
      const { data: deptEmployeesData, error: deptEmployeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('department_id', id);

      if (deptEmployeesError) throw deptEmployeesError;
      setEmployees(deptEmployeesData);

      // Get available employees (not assigned to any department)
      const { data: availableData, error: availableError } = await supabase
        .from('employees')
        .select('*')
        .is('department_id', null);

      if (availableError) throw availableError;
      setAvailableEmployees(availableData);
    } catch (error) {
      console.error('Error loading department data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load department details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: 'Error',
        description: 'Please select an employee to add',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .update({ department_id: id })
        .eq('id', selectedEmployeeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Employee added to department',
      });

      setSelectedEmployeeId('');
      loadDepartmentData();
    } catch (error) {
      console.error('Error adding employee to department:', error);
      toast({
        title: 'Error',
        description: 'Failed to add employee to department',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!department) {
    return <div>Department not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Department Details: {department.name}</h1>
        <Button onClick={() => navigate('/departments')} variant="outline">
          Back to Departments
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {department.name}
            </div>
            <div>
              <span className="font-medium">Supervisor:</span> {supervisor?.name || 'Not assigned'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Employee to Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddEmployee}>Add</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Employees</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length > 0 ? (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/employee/${employee.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No employees in this department</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentDetails;
