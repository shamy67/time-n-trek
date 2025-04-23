
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CreateDepartmentForm from '@/components/departments/CreateDepartmentForm';
import DepartmentsList from '@/components/departments/DepartmentsList';

interface Department {
  id: string;
  name: string;
  supervisor_id: string | null;
  general_manager_id: string | null;
  supervisor?: {
    name: string;
  } | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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

      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select(`
          id,
          name,
          supervisor_id,
          general_manager_id,
          supervisor:employees(name)
        `)
        .returns<Department[]>();

      if (departmentsError) throw departmentsError;
      setDepartments(departmentsData);

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

      <CreateDepartmentForm
        employees={employees}
        onDepartmentCreated={loadData}
        currentEmployeeId={currentEmployee?.id || ''}
      />

      <DepartmentsList departments={departments} />
    </div>
  );
};

export default ManageDepartments;
