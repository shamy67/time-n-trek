
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
import { Invitation, getInvitations, deleteInvitation, sendInvitationEmail } from '@/services/employeeService';
import { Mail, Trash2, RefreshCw } from 'lucide-react';

export function ManageInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvitations = () => {
    setIsLoading(true);
    const data = getInvitations();
    setInvitations(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleResendInvitation = (invitation: Invitation) => {
    sendInvitationEmail(invitation);
    toast.success(`Invitation resent to ${invitation.email}`);
  };

  const handleDeleteInvitation = (invitationId: string) => {
    deleteInvitation(invitationId);
    loadInvitations();
    toast.success('Invitation deleted successfully');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Pending Invitations</h3>
        <Button variant="outline" size="sm" onClick={loadInvitations}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {invitations.length === 0 ? (
        <div className="text-center p-4 border rounded-md">
          <p className="text-muted-foreground">No pending invitations</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.name}</TableCell>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    {invitation.isAdmin ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="outline">Employee</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResendInvitation(invitation)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteInvitation(invitation.id)}
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
    </div>
  );
}
