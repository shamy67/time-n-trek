
import React from 'react';
import { Clock, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimeStatus = 'inactive' | 'active' | 'break';

interface TimeStatusProps {
  status: TimeStatus;
  clockInTime?: Date;
  duration?: number; // in seconds
  location?: string;
}

const TimeStatus: React.FC<TimeStatusProps> = ({ 
  status, 
  clockInTime, 
  duration, 
  location 
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full p-5 glass-panel rounded-xl animate-enter">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg">Current Status</h3>
        <div 
          className={cn(
            'status-pill',
            status === 'active' && 'status-active',
            status === 'break' && 'status-break',
            status === 'inactive' && 'status-inactive'
          )}
        >
          {status === 'active' && 'On Duty'}
          {status === 'break' && 'On Break'}
          {status === 'inactive' && 'Not Clocked In'}
        </div>
      </div>
      
      {status !== 'inactive' && clockInTime && (
        <div className="space-y-3">
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-2" />
            <span>Clock In: {formatTime(clockInTime)}</span>
          </div>
          
          {duration !== undefined && (
            <div className="flex items-center text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Duration: {formatDuration(duration)}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-start text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
              <span className="text-sm">{location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeStatus;
