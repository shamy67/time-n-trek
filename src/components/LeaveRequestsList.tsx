
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface LeaveRequest {
  id: string;
  employee_id: string;
  reason: string;
  from_date: string;
  to_date: string;
  status: string;
  rejection_reason?: string;
  attachment_url?: string;
  employee?: {
    name: string;
  };
}

interface LeaveRequestsListProps {
  requests: LeaveRequest[];
  isSupervisor?: boolean;
  onStatusUpdate?: () => void;
}

const LeaveRequestsList = ({ requests, isSupervisor, onStatusUpdate }: LeaveRequestsListProps) => {
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = React.useState<string>('');
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null);

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'rejected' && !rejectionReason) {
        toast({
          title: 'Error',
          description: 'Please provide a rejection reason',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('leave_requests')
        .update({
          status,
          rejection_reason: status === 'rejected' ? rejectionReason : null,
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Leave request ${status} successfully`,
      });

      setRejectionReason('');
      setSelectedRequestId(null);
      if (onStatusUpdate) onStatusUpdate();
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update leave request',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {isSupervisor && <TableHead>Employee</TableHead>}
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attachment</TableHead>
            {isSupervisor && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              {isSupervisor && (
                <TableCell>{request.employee?.name || 'Unknown'}</TableCell>
              )}
              <TableCell>{format(new Date(request.from_date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{format(new Date(request.to_date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{request.reason}</TableCell>
              <TableCell>
                <span className={`capitalize ${
                  request.status === 'approved' ? 'text-green-600' :
                  request.status === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {request.status}
                </span>
                {request.rejection_reason && (
                  <p className="text-sm text-red-500 mt-1">
                    Reason: {request.rejection_reason}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {request.attachment_url && (
                  <a
                    href={request.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                )}
              </TableCell>
              {isSupervisor && request.status === 'pending' && (
                <TableCell>
                  <div className="space-y-2">
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        variant="outline"
                        className="bg-green-500 text-white hover:bg-green-600"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequestId(request.id)}
                        variant="outline"
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        Reject
                      </Button>
                    </div>
                    {selectedRequestId === request.id && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter rejection reason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        >
                          Submit
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaveRequestsList;
