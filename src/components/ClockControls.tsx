import React, { useState } from 'react';
import { Play, Pause, StopCircle, Coffee, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

type TimeStatusType = 'inactive' | 'active' | 'break';
type BreakType = 'Salah' | 'Meeting' | 'Lunch' | 'Breakfast' | 'Break';

interface ClockControlsProps {
  status: TimeStatusType;
  onClockIn: (manualTime?: Date) => void;
  onClockOut: () => void;
  onStartBreak: (breakType: BreakType) => void;
  onEndBreak: () => void;
  loading?: boolean;
}

const breakOptions: BreakType[] = ['Salah', 'Meeting', 'Lunch', 'Breakfast', 'Break'];

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      options.push({
        value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      });
    }
  }
  return options;
};

const ClockControls: React.FC<ClockControlsProps> = ({
  status,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
  loading = false
}) => {
  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
  const [manualClockInOpen, setManualClockInOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(), 'HH:mm')
  );

  const handleBreakStart = (breakType: BreakType) => {
    onStartBreak(breakType);
    setBreakDialogOpen(false);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) || value === '') {
      setSelectedTime(value);
    }
  };

  const handleManualClockIn = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const dateTime = new Date(selectedDate);
      dateTime.setHours(hours, minutes, 0, 0);
      onClockIn(dateTime);
      setManualClockInOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full gap-4 animate-enter animate-delay-200">
        {status === 'inactive' && (
          <>
            <Button
              onClick={() => onClockIn()}
              disabled={loading}
              className="button-primary w-full max-w-xs h-14 gap-2 text-lg"
            >
              <Play className="w-5 h-5" />
              Clock In
            </Button>
            <Button
              onClick={() => setManualClockInOpen(true)}
              disabled={loading}
              variant="outline"
              className="w-full max-w-xs h-14 gap-2"
            >
              <Clock className="w-5 h-5" />
              Manual Clock In
            </Button>
          </>
        )}

        {status === 'active' && (
          <>
            <Button
              onClick={() => setBreakDialogOpen(true)}
              disabled={loading}
              className="button-secondary w-full max-w-xs h-14 gap-2 text-lg"
            >
              <Coffee className="w-5 h-5" />
              Take a Break
            </Button>
            <Button
              onClick={onClockOut}
              disabled={loading}
              className="button-danger w-full max-w-xs h-14 gap-2 text-lg"
            >
              <StopCircle className="w-5 h-5" />
              Clock Out
            </Button>
          </>
        )}

        {status === 'break' && (
          <Button
            onClick={onEndBreak}
            disabled={loading}
            className="button-secondary w-full max-w-xs h-14 gap-2 text-lg"
          >
            <Play className="w-5 h-5" />
            End Break
          </Button>
        )}
      </div>

      <Dialog open={breakDialogOpen} onOpenChange={setBreakDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">Select Break Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {breakOptions.map((breakType) => (
              <Button
                key={breakType}
                onClick={() => handleBreakStart(breakType)}
                className={cn(
                  "w-full py-6 text-base font-medium",
                  breakType === 'Salah' && "bg-timepulse-light text-timepulse hover:bg-timepulse-light/80",
                  breakType === 'Meeting' && "bg-accent text-accent-foreground hover:bg-accent/80",
                  breakType === 'Lunch' && "bg-warning-light text-warning hover:bg-warning-light/80",
                  breakType === 'Breakfast' && "bg-success-light text-success hover:bg-success-light/80",
                  breakType === 'Break' && "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                variant="outline"
              >
                {breakType}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={manualClockInOpen} onOpenChange={setManualClockInOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">Manual Clock In</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border shadow"
                disabled={(date) => date > new Date()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Time (HH:mm)</label>
              <Input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleManualClockIn}
              className="w-full"
            >
              Confirm Manual Clock In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClockControls;
