import { useState, useRef, useEffect } from 'react';

interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  endTime: Date | null;
  elapsedTime: number; // in seconds
  breaks: BreakEntry[];
  currentBreak: BreakEntry | null;
}

export interface BreakEntry {
  type: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
}

export function useTimer() {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    endTime: null,
    elapsedTime: 0,
    breaks: [],
    currentBreak: null
  });
  
  const timerRef = useRef<number | null>(null);
  const breakTimerRef = useRef<number | null>(null);

  const updateElapsedTime = () => {
    setState(prev => {
      if (!prev.startTime || !prev.isRunning) return prev;
      
      const now = new Date();
      let totalTime = Math.floor((now.getTime() - prev.startTime.getTime()) / 1000);
      
      // Subtract break times from total time
      const breakTime = prev.breaks.reduce((total, breakEntry) => {
        return total + breakEntry.duration;
      }, 0);
      
      // If on a break now, add the current break time
      let currentBreakTime = 0;
      if (prev.currentBreak) {
        currentBreakTime = Math.floor((now.getTime() - prev.currentBreak.startTime.getTime()) / 1000);
      }
      
      const activeWorkTime = totalTime - breakTime - currentBreakTime;
      
      return {
        ...prev,
        elapsedTime: activeWorkTime
      };
    });
  };

  const updateCurrentBreakDuration = () => {
    setState(prev => {
      if (!prev.currentBreak) return prev;
      
      const now = new Date();
      const breakDuration = Math.floor((now.getTime() - prev.currentBreak.startTime.getTime()) / 1000);
      
      return {
        ...prev,
        currentBreak: {
          ...prev.currentBreak,
          duration: breakDuration
        }
      };
    });
  };

  const startTimer = (manualTime?: Date) => {
    const startTime = manualTime || new Date();
    
    setState({
      isRunning: true,
      startTime,
      endTime: null,
      elapsedTime: 0,
      breaks: [],
      currentBreak: null
    });
    
    timerRef.current = window.setInterval(updateElapsedTime, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
      breakTimerRef.current = null;
    }
    
    const endTime = new Date();
    
    setState(prev => ({
      ...prev,
      isRunning: false,
      endTime
    }));
    
    return {
      startTime: state.startTime,
      endTime,
      elapsedTime: state.elapsedTime,
      breaks: state.breaks
    };
  };

  const startBreak = (breakType: string) => {
    if (!state.isRunning) return;
    
    const startTime = new Date();
    const newBreak: BreakEntry = {
      type: breakType,
      startTime,
      duration: 0
    };
    
    setState(prev => ({
      ...prev,
      currentBreak: newBreak
    }));
    
    breakTimerRef.current = window.setInterval(updateCurrentBreakDuration, 1000);
  };

  const endBreak = () => {
    if (!state.currentBreak || !state.isRunning) return;
    
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
      breakTimerRef.current = null;
    }
    
    const endTime = new Date();
    
    setState(prev => {
      if (!prev.currentBreak) return prev;
      
      const completeBreak = {
        ...prev.currentBreak,
        endTime,
        duration: Math.floor((endTime.getTime() - prev.currentBreak.startTime.getTime()) / 1000)
      };
      
      return {
        ...prev,
        breaks: [...prev.breaks, completeBreak],
        currentBreak: null
      };
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    };
  }, []);

  return {
    ...state,
    startTimer,
    stopTimer,
    startBreak,
    endBreak
  };
}
