
import React from 'react';
import { Play, Pause, StopCircle, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type TimeStatusType = 'inactive' | 'active' | 'break';

type BreakType = 'Salah' | 'Meeting' | 'Lunch' | 'Breakfast' | 'Break';

interface ClockControlsProps {
  status: TimeStatusType;
  onClockIn: () => void;
  onClockOut: () => void;
  onStartBreak: (breakType: BreakType) => void;
  onEndBreak: () => void;
  loading?: boolean;
}

const breakOptions: BreakType[] = ['Salah', 'Meeting', 'Lunch', 'Breakfast', 'Break'];

const ClockControls: React.FC<ClockControlsProps> = ({
  status,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
  loading = false
}) => {
  const [breakDialogOpen, setBreakDialogOpen] = React.useState(false);

  const handleBreakStart = (breakType: BreakType) => {
    onStartBreak(breakType);
    setBreakDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full gap-4 animate-enter animate-delay-200">
        {status === 'inactive' && (
          <Button
            onClick={onClockIn}
            disabled={loading}
            className="button-primary w-full max-w-xs h-14 gap-2 text-lg"
          >
            <Play className="w-5 h-5" />
            Clock In
          </Button>
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
    </>
  );
};

export default ClockControls;
