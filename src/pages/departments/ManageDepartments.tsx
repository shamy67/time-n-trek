
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Department {
  id: string;
  name: string;
  supervisor_id: string | null;
  general_manager_id: string | null;
  supervisor?: {
    name: string;
  };
}

interface Employee {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

const ManageDepartments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current employee
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', user.id)
        .single();

      if (employeeError) throw employeeError;
      setCurrentEmployee(employeeData);

      if (!employeeData.is_admin) {
        navigate('/');
        return;
      }

      // Load departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select(`
          *,
          supervisor:supervisor_id(name)
        `);

      if (departmentsError) throw departmentsError;
      setDepartments(departmentsData);

      // Load employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*');

      if (employeesError) throw employeesError;
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load departments data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDepartmentName || !selectedSupervisor) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newDepartment = {
        id: uuidv4(),
        name: newDepartmentName,
        supervisor_id: selectedSupervisor,
        general_manager_id: currentEmployee?.id,
      };

      const { error } = await supabase
        .from('departments')
        .insert([newDepartment]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Department created successfully',
      });

      setNewDepartmentName('');
      setSelectedSupervisor('');
      loadData();
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: 'Error',
        description: 'Failed to create department',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Departments</h1>
        <Button onClick={() => navigate('/admin')} variant="outline">
          Back to Admin
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold mb-4">Create New Department</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Department Name"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedSupervisor}
            onValueChange={setSelectedSupervisor}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Supervisor" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreateDepartment}>
            Create Department
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Departments</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>{department.name}</TableCell>
                <TableCell>{department.supervisor?.name || 'Not assigned'}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/departments/${department.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageDepartments;
