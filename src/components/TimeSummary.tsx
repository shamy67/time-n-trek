
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  Coffee 
} from 'lucide-react';

interface BreakEntry {
  type: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
}

interface TimeSummaryProps {
  clockInTime: Date;
  clockOutTime: Date;
  location: string;
  totalWorkDuration: number; // in seconds
  breakEntries: BreakEntry[];
}

const TimeSummary: React.FC<TimeSummaryProps> = ({
  clockInTime,
  clockOutTime,
  location,
  totalWorkDuration,
  breakEntries,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalBreakTime = breakEntries.reduce((acc, entry) => acc + entry.duration, 0);

  return (
    <div className="w-full glass-panel rounded-xl p-6 animate-enter">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-success-light flex items-center justify-center mr-4">
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>
        <h2 className="text-xl font-semibold">Shift Complete</h2>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="text-muted-foreground text-sm">Date</div>
          <div className="flex items-center text-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(clockInTime)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">Clock In</div>
            <div className="flex items-center text-foreground">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatTime(clockInTime)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">Clock Out</div>
            <div className="flex items-center text-foreground">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatTime(clockOutTime)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-muted-foreground text-sm">Location</div>
          <div className="flex items-start text-foreground">
            <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
            <span className="text-sm">{location}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">Total Time</div>
            <div className="font-semibold">
              {formatDuration(totalWorkDuration + totalBreakTime)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">Work Time</div>
            <div className="font-semibold">{formatDuration(totalWorkDuration)}</div>
          </div>
        </div>

        {breakEntries.length > 0 && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="text-muted-foreground text-sm">Breaks</div>
              
              {breakEntries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-secondary rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                      <Coffee className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{entry.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(entry.startTime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatDuration(entry.duration)}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between px-3 mt-2">
                <span className="text-sm text-muted-foreground">Total Break Time</span>
                <span className="text-sm font-medium">{formatDuration(totalBreakTime)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TimeSummary;
