
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentEmployee, getTimeRecordsForEmployee } from '@/services/employeeService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, MapPin } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

const History = () => {
  const navigate = useNavigate();
  const currentEmployee = getCurrentEmployee();
  const timeRecords = currentEmployee 
    ? getTimeRecordsForEmployee(currentEmployee.id)
    : [];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (!currentEmployee) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-white shadow-soft z-10">
        <div className="container max-w-md mx-auto px-4 py-5">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Time History</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="w-full glass-panel rounded-xl p-5 animate-enter">
          <h3 className="font-medium text-lg mb-4">Your Time Records</h3>
          
          {timeRecords.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">No time records found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {timeRecords.map((record, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(record.clockInTime)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {formatDuration(record.totalWorkDuration)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-3 w-3" />
                        <span>Clock In:</span>
                      </div>
                      <span>{formatTime(record.clockInTime)}</span>
                    </div>
                    
                    {record.clockOutTime && (
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-3 w-3" />
                          <span>Clock Out:</span>
                        </div>
                        <span>{formatTime(record.clockOutTime)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <MapPin className="mr-2 h-3 w-3 mt-1" />
                      <span className="text-xs">{record.location}</span>
                    </div>
                  </div>
                  
                  {record.breakEntries.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div className="text-xs font-medium mb-2">Breaks:</div>
                      {record.breakEntries.map((breakEntry, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-1">
                          <span>{breakEntry.type}</span>
                          <span>{formatDuration(breakEntry.duration)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white py-4 border-t">
        <div className="container max-w-md mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TimeTrack • Employee Management
        </div>
      </footer>
    </div>
  );
};

export default History;
