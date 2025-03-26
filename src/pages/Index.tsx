
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle, Info, History as HistoryIcon, User, Clock, Menu, Database } from 'lucide-react';
import { useTimer, BreakEntry } from '@/hooks/useTimer';
import { useLocation } from '@/hooks/useLocation';
import TimeStatus from '@/components/TimeStatus';
import ClockControls from '@/components/ClockControls';
import TimeSummary from '@/components/TimeSummary';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { getCurrentEmployee, addTimeRecord, Employee } from '@/services/employeeService';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

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
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const timer = useTimer();
  const location = useLocation();
  
  useEffect(() => {
    const checkLogin = async () => {
      setLoading(true);
      const employee = await getCurrentEmployee();
      
      if (!employee) {
        navigate('/login');
      } else {
        setCurrentEmployee(employee);
      }
      
      setLoading(false);
    };
    
    checkLogin();
  }, [navigate]);

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

  const handleClockOut = async () => {
    try {
      const result = timer.stopTimer();
      setStatus('inactive');
      
      if (result.startTime && result.endTime && currentEmployee) {
        const timeRecord = {
          id: uuidv4(),
          employeeId: currentEmployee.id,
          clockInTime: result.startTime,
          clockOutTime: result.endTime,
          location: location.address || 'Location not available',
          totalWorkDuration: result.elapsedTime,
          breakEntries: result.breaks
        };
        
        await addTimeRecord(timeRecord);
        
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-pulse-slow">Loading...</div>
      </div>
    );
  }

  if (!currentEmployee) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="app-header">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/fd15a914-326d-4b02-84d9-11611f8e0903.png" 
            alt="CULTIV BUREAU Logo" 
            className="h-16" /* Increased from h-10 to h-16 */
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/data')}
            title="View Data"
            className="text-black hover:bg-gray-100"
          >
            <Database className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/history')}
            title="View History"
            className="text-black hover:bg-gray-100"
          >
            <HistoryIcon className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/login')}
            title="Profile"
            className="text-black hover:bg-gray-100"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-grow app-content">
        {!showSummary ? (
          <>
            <div className="w-full border-2 border-black p-4 mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center mr-3 bg-black text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold">{currentEmployee.name}</h3>
                  <p className="text-sm">{currentEmployee.email}</p>
                </div>
              </div>
            </div>
            
            <TimeStatus 
              status={status}
              clockInTime={timer.startTime || undefined}
              duration={timer.elapsedTime}
              location={location.address || undefined}
            />
            
            {location.error && (
              <Alert variant="destructive" className="border-2 border-black my-4 bg-white">
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
              <div className="p-5 border-2 border-black my-4">
                <div className="flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  <h3 className="font-bold">On Break: {timer.currentBreak.type}</h3>
                </div>
                <p className="mt-2 text-sm">
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
              
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => navigate('/history')}
                  className="cultiv-button w-full"
                >
                  <HistoryIcon className="mr-2 h-4 w-4 inline" />
                  View History
                </button>
                
                <button
                  onClick={resetView}
                  className="cultiv-button-outline w-full"
                >
                  Back to Clock
                </button>
              </div>
            </div>
          )
        )}
      </main>

      <footer className="bg-black text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} CULTIV BUREAU • Time Management
        </div>
      </footer>
    </div>
  );
};

export default Index;
