
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getCurrentEmployee, 
  initializeAdmin, 
  loginWithCredentials,
  addEmployee,
  Employee
} from '@/services/employeeService';
import QRCodeScanner from '@/components/QRCodeScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Mail, LockKeyhole, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'login' | 'register'>('qr');
  const [loading, setLoading] = useState(true);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Initialize admin account and check login status
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await initializeAdmin();
      
      const employee = await getCurrentEmployee();
      if (employee) {
        setCurrentEmployee(employee);
        setIsLoggedIn(true);
      }
      
      setLoading(false);
    };
    
    init();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleCredentialLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      
      // Try to login with provided credentials
      const employee = await loginWithCredentials(loginEmail, loginPassword);
      
      if (employee) {
        setCurrentEmployee(employee);
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
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validate form
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      // Generate a unique ID
      const newEmployeeId = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);
      
      // Create new employee
      const newEmployee = {
        id: newEmployeeId,
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        joinedAt: new Date()
      };

      // Add employee
      await addEmployee(newEmployee);
      
      // Auto login
      localStorage.setItem('timetrack_current_user', newEmployeeId);
      setCurrentEmployee(newEmployee);
      setIsLoggedIn(true);
      navigate('/');
      toast.success('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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
                setCurrentEmployee(null);
              }}
              className="w-full"
              variant="outline"
            >
              Logout
            </Button>
          </div>
        ) : (
          <>
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-2 text-center font-medium ${
                  activeTab === 'qr' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
                }`}
              >
                QR Code
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 text-center font-medium ${
                  activeTab === 'login' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 text-center font-medium ${
                  activeTab === 'register' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
                }`}
              >
                Register
              </button>
            </div>

            {activeTab === 'qr' && <QRCodeScanner onLogin={handleLogin} />}

            {activeTab === 'login' && (
              <div className="w-full glass-panel rounded-xl p-6 space-y-4 animate-enter">
                <h3 className="text-lg font-medium text-center">Login with Credentials</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email or ID</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter your email or 'admin'"
                        className="pl-10"
                        type="text"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
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
                  disabled={loading}
                >
                  Login
                </Button>
                
                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    Don't have an account?{" "}
                    <button 
                      onClick={() => setActiveTab('register')} 
                      className="text-primary hover:underline"
                    >
                      Register now
                    </button>
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'register' && (
              <div className="w-full glass-panel rounded-xl p-6 space-y-4 animate-enter">
                <h3 className="text-lg font-medium text-center">Register New Account</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="register-name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="register-email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="Enter your email"
                        type="email"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="register-password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Create a password"
                        type="password"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="register-confirm-password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        type="password"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleRegister}
                  className="w-full"
                  disabled={loading}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
                
                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <button 
                      onClick={() => setActiveTab('login')} 
                      className="text-primary hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>
            )}
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
