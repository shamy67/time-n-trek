
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface LeaveRequestFormProps {
  employeeId: string;
  onSuccess?: () => void;
}

const LeaveRequestForm = ({ employeeId, onSuccess }: LeaveRequestFormProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = async (data: { reason: string }) => {
    if (!fromDate || !toDate) {
      toast({
        title: 'Error',
        description: 'Please select both from and to dates',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const leaveRequestId = uuidv4();
      let attachmentUrl = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${leaveRequestId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('leave_attachments')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('leave_attachments')
          .getPublicUrl(filePath);

        attachmentUrl = publicUrl;
      }

      const { error } = await supabase
        .from('leave_requests')
        .insert([
          {
            id: leaveRequestId,
            employee_id: employeeId,
            reason: data.reason,
            from_date: fromDate.toISOString(),
            to_date: toDate.toISOString(),
            attachment_url: attachmentUrl,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });

      reset();
      setSelectedFile(null);
      setFromDate(undefined);
      setToDate(undefined);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit leave request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">From Date</label>
        <Calendar
          mode="single"
          selected={fromDate}
          onSelect={setFromDate}
          className="rounded-md border"
          disabled={(date) => date < new Date()}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">To Date</label>
        <Calendar
          mode="single"
          selected={toDate}
          onSelect={setToDate}
          className="rounded-md border"
          disabled={(date) => date < (fromDate || new Date())}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Reason</label>
        <Textarea
          {...register('reason', { required: 'Reason is required' })}
          placeholder="Enter your leave request reason"
        />
        {errors.reason && (
          <p className="text-sm text-red-500">{errors.reason.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Attachment (Optional)</label>
        <Input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Submit Leave Request
      </Button>
    </form>
  );
};

export default LeaveRequestForm;
