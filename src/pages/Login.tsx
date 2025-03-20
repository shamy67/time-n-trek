
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentEmployee } from '@/services/employeeService';
import QRCodeScanner from '@/components/QRCodeScanner';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentEmployee = getCurrentEmployee();
  const [isLoggedIn, setIsLoggedIn] = useState(!!currentEmployee);

  // Check for URL parameters on load
  useEffect(() => {
    // If user is already logged in, no need to process URL parameters
    if (isLoggedIn) return;
    
    // The QRCodeScanner component will handle the actual URL parameter processing
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-white shadow-soft z-10">
        <div className="container max-w-md mx-auto px-4 py-5">
          <h1 className="text-2xl font-semibold text-center">TimeTrack</h1>
        </div>
      </header>

      <main className="flex-grow container max-w-md mx-auto px-4 py-6 space-y-6">
        {isLoggedIn && currentEmployee ? (
          <div className="w-full glass-panel rounded-xl p-6 space-y-4 animate-enter">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-success-light flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-medium">Logged in as {currentEmployee.name}</h3>
                <p className="text-sm text-muted-foreground">{currentEmployee.email}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem('timetrack_current_user');
                setIsLoggedIn(false);
              }}
              className="w-full"
              variant="outline"
            >
              Logout
            </Button>
          </div>
        ) : (
          <QRCodeScanner onLogin={handleLogin} />
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

export default Login;
