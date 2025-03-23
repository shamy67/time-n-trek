
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getCurrentEmployee, 
  initializeAdmin, 
  loginWithCredentials 
} from '@/services/employeeService';
import QRCodeScanner from '@/components/QRCodeScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Lock, User, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentEmployee = getCurrentEmployee();
  const [isLoggedIn, setIsLoggedIn] = useState(!!currentEmployee);
  const [showCredentialLogin, setShowCredentialLogin] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  // Initialize admin account
  useEffect(() => {
    initializeAdmin();
  }, []);

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

  const handleCredentialLogin = () => {
    if (!userId.trim() || !password.trim()) {
      toast.error('Please enter both user ID and password');
      return;
    }

    const employee = loginWithCredentials(userId, password);
    
    if (employee) {
      setIsLoggedIn(true);
      
      if (employee.isAdmin) {
        navigate('/admin');
        toast.success('Welcome, Administrator');
      } else {
        navigate('/');
        toast.success('Login successful');
      }
    } else {
      toast.error('Invalid credentials');
    }
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
              onClick={() => navigate(currentEmployee.isAdmin ? '/admin' : '/')}
              className="w-full"
            >
              Go to {currentEmployee.isAdmin ? 'Admin Dashboard' : 'Dashboard'}
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
        ) : showCredentialLogin ? (
          <div className="w-full glass-panel rounded-xl p-6 space-y-4 animate-enter">
            <h3 className="text-lg font-medium text-center">Login with Credentials</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your ID or 'admin'"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    type="password"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleCredentialLogin}
              className="w-full"
            >
              Login
            </Button>
            
            <Button
              onClick={() => setShowCredentialLogin(false)}
              className="w-full"
              variant="outline"
            >
              Back to QR Code Login
            </Button>
          </div>
        ) : (
          <>
            <QRCodeScanner onLogin={handleLogin} />
            
            <div className="text-center">
              <Button
                onClick={() => setShowCredentialLogin(true)}
                variant="link"
                className="text-muted-foreground"
              >
                <Lock className="mr-2 h-4 w-4" />
                Login with ID & Password
              </Button>
            </div>
          </>
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
