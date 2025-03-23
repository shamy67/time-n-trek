
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus } from 'lucide-react';
import { Invitation, saveInvitation, sendInvitationEmail, addEmployee } from '@/services/employeeService';

interface AddUserFormValues {
  name: string;
  email: string;
  isAdmin: boolean;
  directAdd: boolean;
  password?: string;
}

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [isDirectAdd, setIsDirectAdd] = useState(false);
  
  const form = useForm<AddUserFormValues>({
    defaultValues: {
      name: '',
      email: '',
      isAdmin: false,
      directAdd: false,
      password: '',
    },
  });

  const handleDirectAddChange = (checked: boolean) => {
    setIsDirectAdd(checked);
    form.setValue('directAdd', checked);
  };

  const onSubmit = (data: AddUserFormValues) => {
    if (data.directAdd) {
      // Add user directly to the system without invitation
      if (!data.password) {
        toast.error('Password is required for direct user creation');
        return;
      }
      
      // Generate a unique ID for the employee
      const id = `emp_${Date.now().toString(36)}`;
      
      const newEmployee = {
        id,
        name: data.name,
        email: data.email,
        joinedAt: new Date(),
        password: data.password,
        isAdmin: data.isAdmin
      };
      
      addEmployee(newEmployee);
      toast.success(`User ${data.name} has been added successfully`);
    } else {
      // Create and send invitation
      const token = uuidv4();
      const invitation: Invitation = {
        id: uuidv4(),
        email: data.email,
        name: data.name,
        isAdmin: data.isAdmin,
        createdAt: new Date(),
        token
      };
      
      saveInvitation(invitation);
      sendInvitationEmail(invitation);
      toast.success(`Invitation sent to ${data.email}`);
    }
    
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new employee or admin to the system. You can send an invitation or create the account directly.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Admin Privileges</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Give this user admin access to manage users and view reports
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="directAdd"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        handleDirectAddChange(checked === true);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Add User Directly</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Create the account immediately instead of sending an invitation
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            {isDirectAdd && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="submit">
                {isDirectAdd ? 'Create User' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
