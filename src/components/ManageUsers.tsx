
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Employee, getEmployees, deleteEmployee, makeAdmin, removeAdmin } from '@/services/employeeService';
import { Trash2, Shield, ShieldOff, Search, RefreshCw, UserCog } from 'lucide-react';

export function ManageUsers() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await getEmployees();
      // Filter out the main admin
      const filteredData = data.filter(emp => emp.id !== 'admin');
      setEmployees(filteredData);
      setFilteredEmployees(filteredData);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(
      employee => 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleDeleteEmployee = async (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      try {
        const success = await deleteEmployee(employee.id);
        if (success) {
          await loadEmployees();
          toast.success(`${employee.name} has been deleted`);
        } else {
          toast.error(`Failed to delete ${employee.name}`);
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error(`Failed to delete ${employee.name}`);
      }
    }
  };

  const handleToggleAdmin = async (employee: Employee) => {
    try {
      if (employee.isAdmin) {
        // Remove admin privileges
        const success = await removeAdmin(employee.id);
        if (success) {
          await loadEmployees();
          toast.success(`Admin privileges removed from ${employee.name}`);
        } else {
          toast.error(`Could not remove admin privileges from ${employee.name}`);
        }
      } else {
        // Grant admin privileges
        const success = await makeAdmin(employee.id);
        if (success) {
          await loadEmployees();
          toast.success(`${employee.name} is now an admin`);
        } else {
          toast.error(`Could not make ${employee.name} an admin`);
        }
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('An error occurred while updating admin status');
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setCurrentUser(employee);
    setIsSheetOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h3 className="text-lg font-medium">Manage Users</h3>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm" onClick={loadEmployees}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-4 border rounded-md">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center p-4 border rounded-md">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    {employee.isAdmin ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="outline">Employee</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(new Date(employee.joinedAt))}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(employee)}
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={employee.isAdmin ? "destructive" : "outline"} 
                        size="sm"
                        onClick={() => handleToggleAdmin(employee)}
                      >
                        {employee.isAdmin ? (
                          <ShieldOff className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>
              View detailed information about this user
            </SheetDescription>
          </SheetHeader>
          
          {currentUser && (
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-base">{currentUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-base">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-base">
                      {currentUser.isAdmin ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <Badge variant="outline">Employee</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Joined Date</p>
                    <p className="text-base">{formatDate(new Date(currentUser.joinedAt))}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Actions</h4>
                <div className="flex gap-2">
                  <Button 
                    variant={currentUser.isAdmin ? "destructive" : "default"} 
                    onClick={() => {
                      handleToggleAdmin(currentUser);
                      setIsSheetOpen(false);
                    }}
                  >
                    {currentUser.isAdmin ? (
                      <>
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Make Admin
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      handleDeleteEmployee(currentUser);
                      setIsSheetOpen(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
