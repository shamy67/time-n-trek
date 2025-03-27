
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getCurrentEmployee, 
  initializeAdmin, 
  loginWithCredentials,
  addEmployee,
  Employee,
  checkEmailExists
} from '@/services/employeeService';
import QRCodeScanner from '@/components/QRCodeScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Mail, LockKeyhole, UserPlus, User, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'login' | 'register'>('qr');
  const [loading, setLoading] = useState(true);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await initializeAdmin();
      
      const employee = await getCurrentEmployee();
      if (employee) {
        setCurrentEmployee(employee);
        setIsLoggedIn(true);
        
        // If already logged in, redirect to the appropriate page
        if (employee.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
      
      setLoading(false);
    };
    
    init();
  }, [navigate]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = '';

    if (password.length === 0) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }

    if (password.length > 6) strength += 20;
    if (password.length > 10) strength += 10;

    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    if (strength < 40) {
      feedback = 'Weak - Add uppercase, numbers, and special characters';
    } else if (strength < 70) {
      feedback = 'Medium - Add more variety to make your password stronger';
    } else {
      feedback = 'Strong password';
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const handleCredentialLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      
      const employee = await loginWithCredentials(loginEmail, loginPassword);
      
      if (employee) {
        setCurrentEmployee(employee);
        setIsLoggedIn(true);
        
        toast.success('Login successful');
        
        // Ensure we redirect after setting the state
        setTimeout(() => {
          if (employee.isAdmin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 100);
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
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength < 60) {
      toast.error('Password is too weak. Please include uppercase, numbers, and special characters.');
      return;
    }

    try {
      setLoading(true);
      
      const emailExists = await checkEmailExists(registerEmail);
      if (emailExists) {
        toast.error('This email is already registered');
        setLoading(false);
        return;
      }
      
      const newEmployeeId = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);
      
      const newEmployee = {
        id: newEmployeeId,
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        joinedAt: new Date()
      };

      await addEmployee(newEmployee);
      
      localStorage.setItem('timetrack_current_user', newEmployeeId);
      setCurrentEmployee(newEmployee);
      setIsLoggedIn(true);
      
      toast.success('Registration successful');
      
      // Ensure we redirect after setting the state
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="app-header">
        <div className="w-full flex justify-center">
          <img 
            src="/lovable-uploads/fd15a914-326d-4b02-84d9-11611f8e0903.png" 
            alt="CULTIV BUREAU Logo" 
            className="h-20"
          />
        </div>
      </header>

      <main className="flex-grow app-content">
        {isLoggedIn && currentEmployee ? (
          <div className="w-full border-2 border-black p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold">Logged in as {currentEmployee.name}</h3>
                <p className="text-sm">{currentEmployee.email}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(currentEmployee.isAdmin ? '/admin' : '/')}
              className="cultiv-button w-full"
            >
              Go to {currentEmployee.isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="cultiv-button w-full flex items-center justify-center"
            >
              <QrCode className="mr-2 h-4 w-4" />
              View My QR Code
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('timetrack_current_user');
                setIsLoggedIn(false);
                setCurrentEmployee(null);
              }}
              className="cultiv-button-outline w-full"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <div className="flex border-b-2 border-black">
              <button
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-3 text-center font-bold text-sm uppercase ${
                  activeTab === 'qr' ? 'border-b-4 border-black' : ''
                }`}
              >
                QR Code
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 text-center font-bold text-sm uppercase ${
                  activeTab === 'login' ? 'border-b-4 border-black' : ''
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 text-center font-bold text-sm uppercase ${
                  activeTab === 'register' ? 'border-b-4 border-black' : ''
                }`}
              >
                Register
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'qr' && <QRCodeScanner onLogin={handleLogin} />}

              {activeTab === 'login' && (
                <div className="w-full border-2 border-black p-6 space-y-4">
                  <h3 className="text-lg font-bold text-center uppercase">Login with Credentials</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-bold uppercase">Email or ID</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5" />
                        <Input 
                          id="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="Enter your email or 'admin'"
                          className="pl-10 border-2 border-black"
                          type="text"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-bold uppercase">Password</Label>
                      <div className="relative">
                        <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5" />
                        <Input 
                          id="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          type="password"
                          className="pl-10 border-2 border-black"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCredentialLogin}
                    className="cultiv-button w-full"
                    disabled={loading}
                  >
                    Login
                  </button>
                  
                  <div className="text-center text-sm">
                    <p>
                      Don't have an account?{" "}
                      <button 
                        onClick={() => setActiveTab('register')} 
                        className="font-bold underline"
                      >
                        Register now
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'register' && (
                <div className="w-full border-2 border-black p-6 space-y-4">
                  <h3 className="text-lg font-bold text-center uppercase">Register New Account</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-sm font-bold uppercase">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5" />
                        <Input 
                          id="register-name"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          placeholder="Enter your full name"
                          className="pl-10 border-2 border-black"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-bold uppercase">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5" />
                        <Input 
                          id="register-email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="Enter your email"
                          type="email"
                          className="pl-10 border-2 border-black"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-bold uppercase">Password</Label>
                      <div className="relative">
                        <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5" />
                        <Input 
                          id="register-password"
                          value={registerPassword}
                          onChange={(e) => {
                            setRegisterPassword(e.target.value);
                            checkPasswordStrength(e.target.value);
                          }}
                          placeholder="Create a password"
                          type="password"
                          className="pl-10 border-2 border-black"
                        />
                      </div>
                      <div className="space-y-1 mt-1">
                        <Progress value={passwordStrength} className="h-2 bg-gray-200" />
                        <p className={`text-xs ${
                          passwordStrength < 40 ? 'text-red-600' : 
                          passwordStrength < 70 ? 'text-amber-600' : 
                          'text-green-600'
                        }`}>
                          {passwordFeedback}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password" className="text-sm font-bold uppercase">Confirm Password</Label>
                      <div className="relative">
                        <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5" />
                        <Input 
                          id="register-confirm-password"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          type="password"
                          className="pl-10 border-2 border-black"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleRegister}
                    className="cultiv-button w-full"
                    disabled={loading}
                  >
                    <UserPlus className="mr-2 h-4 w-4 inline" />
                    Register
                  </button>
                  
                  <div className="text-center text-sm">
                    <p>
                      Already have an account?{" "}
                      <button 
                        onClick={() => setActiveTab('login')} 
                        className="font-bold underline"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
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

export default Login;
