
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle, Info } from 'lucide-react';
import { useTimer, BreakEntry } from '@/hooks/useTimer';
import { useLocation } from '@/hooks/useLocation';
import TimeStatus from '@/components/TimeStatus';
import ClockControls from '@/components/ClockControls';
import TimeSummary from '@/components/TimeSummary';
import { Alert, AlertDescription } from "@/components/ui/alert";

type BreakType = 'Salah' | 'Meeting' | 'Lunch' | 'Breakfast' | 'Break';
type AppStatus = 'inactive' | 'active' | 'break';

const Index = () => {
  const [status, setStatus] = useState<AppStatus>('inactive');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    clockInTime: Date;
    clockOutTime: Date;
    location: string;
    totalWorkDuration: number;
    breakEntries: BreakEntry[];
  } | null>(null);

  const timer = useTimer();
  const location = useLocation();

  const handleClockIn = async () => {
    try {
      setStatus('active');
      timer.startTimer();
      
      const locationData = await location.getLocation();
      
      if (locationData.error) {
        toast.warning('Location not available', {
          description: locationData.error
        });
      } else {
        toast.success('Clocked in successfully', {
          description: 'Your shift has started'
        });
      }
    } catch (error) {
      console.error('Clock in error:', error);
      toast.error('Failed to clock in', {
        description: 'Please try again'
      });
    }
  };

  const handleClockOut = () => {
    try {
      const result = timer.stopTimer();
      setStatus('inactive');
      
      if (result.startTime && result.endTime) {
        setSummaryData({
          clockInTime: result.startTime,
          clockOutTime: result.endTime,
          location: location.address || 'Location not available',
          totalWorkDuration: result.elapsedTime,
          breakEntries: result.breaks
        });
        
        setShowSummary(true);
        
        toast.success('Clocked out successfully', {
          description: 'Your shift has ended'
        });
      }
    } catch (error) {
      console.error('Clock out error:', error);
      toast.error('Failed to clock out', {
        description: 'Please try again'
      });
    }
  };

  const handleStartBreak = (breakType: BreakType) => {
    timer.startBreak(breakType);
    setStatus('break');
    toast('Break started', {
      description: `You're now on ${breakType} break`
    });
  };

  const handleEndBreak = () => {
    timer.endBreak();
    setStatus('active');
    toast('Break ended', {
      description: 'You\'re back on duty'
    });
  };

  const resetView = () => {
    setShowSummary(false);
    setSummaryData(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-white shadow-soft z-10">
        <div className="container max-w-md mx-auto px-4 py-5">
          <h1 className="text-2xl font-semibold text-center">TimeTrack</h1>
        </div>
      </header>

      <main className="flex-grow container max-w-md mx-auto px-4 py-6 space-y-6">
        {!showSummary ? (
          <>
            <TimeStatus 
              status={status}
              clockInTime={timer.startTime || undefined}
              duration={timer.elapsedTime}
              location={location.address || undefined}
            />
            
            {location.error && (
              <Alert variant="destructive" className="animate-enter animate-delay-100">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {location.error}
                </AlertDescription>
              </Alert>
            )}
            
            <ClockControls
              status={status}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              onStartBreak={handleStartBreak}
              onEndBreak={handleEndBreak}
              loading={location.loading}
            />
            
            {status === 'break' && timer.currentBreak && (
              <div className="p-5 bg-warning-light rounded-xl border border-warning/20 animate-enter">
                <div className="flex items-center">
                  <Info className="w-5 h-5 text-warning mr-2" />
                  <h3 className="font-medium text-warning">On Break: {timer.currentBreak.type}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your break started at {timer.currentBreak.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </>
        ) : (
          summaryData && (
            <div className="space-y-6">
              <TimeSummary
                clockInTime={summaryData.clockInTime}
                clockOutTime={summaryData.clockOutTime}
                location={summaryData.location}
                totalWorkDuration={summaryData.totalWorkDuration}
                breakEntries={summaryData.breakEntries}
              />
              
              <button
                onClick={resetView}
                className="button-secondary w-full"
              >
                Back to Clock
              </button>
            </div>
          )
        )}
      </main>

      <footer className="bg-white py-4 border-t">
        <div className="container max-w-md mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TimeTrack • Employee Management
        </div>
      </footer>
    </div>
  );
};

export default Index;
