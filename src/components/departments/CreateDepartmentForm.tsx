
import React, { useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

interface CreateDepartmentFormProps {
  employees: Employee[];
  onDepartmentCreated: () => void;
  currentEmployeeId: string;
}

const CreateDepartmentForm = ({ employees, onDepartmentCreated, currentEmployeeId }: CreateDepartmentFormProps) => {
  const { toast } = useToast();
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

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
        general_manager_id: currentEmployeeId,
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
      onDepartmentCreated();
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: 'Error',
        description: 'Failed to create department',
        variant: 'destructive',
      });
    }
  };

  return (
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
  );
};

export default CreateDepartmentForm;
