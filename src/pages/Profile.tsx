
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getCurrentEmployee } from '@/services/employeeService';
import { Employee } from '@/services/employeeService';
import { Button } from '@/components/ui/button';
import { Copy, Download, QrCode, ArrowLeft, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      const employee = await getCurrentEmployee();
      
      if (!employee) {
        navigate('/login');
      } else {
        setCurrentEmployee(employee);
      }
      
      setLoading(false);
    };
    
    fetchEmployee();
  }, [navigate]);

  const generateQRValue = () => {
    if (!currentEmployee) return '';
    
    // Create employee data for QR code
    const employeeData = {
      id: currentEmployee.id,
      name: currentEmployee.name,
      email: currentEmployee.email,
      password: currentEmployee.password, // Note: In a production app, you may want to omit this for security
      joinedAt: currentEmployee.joinedAt
    };
    
    // Generate QR value with app URL and employee data
    const baseUrl = window.location.origin;
    return `${baseUrl}/login?employeeData=${encodeURIComponent(JSON.stringify(employeeData))}`;
  };

  const handleCopyLink = () => {
    const qrValue = generateQRValue();
    if (qrValue) {
      navigator.clipboard.writeText(qrValue);
      toast.success('Login link copied to clipboard');
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('employee-qr-code')?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentEmployee?.name}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded');
    } else {
      toast.error('Could not download QR code');
    }
  };

  const handleExportEmployeeData = () => {
    if (!currentEmployee) return;
    
    const employeeData = {
      id: currentEmployee.id,
      name: currentEmployee.name,
      email: currentEmployee.email,
      password: currentEmployee.password,
      joinedAt: currentEmployee.joinedAt
    };
    
    const jsonString = JSON.stringify(employeeData);
    navigator.clipboard.writeText(jsonString);
    toast.success('Employee data copied to clipboard');
  };

  const handleLogout = () => {
    // Clear the current user from localStorage
    localStorage.removeItem('timetrack_current_user');
    toast.success('Logged out successfully');
    // Navigate to the login page
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="app-header">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/fd15a914-326d-4b02-84d9-11611f8e0903.png" 
            alt="CULTIV BUREAU Logo" 
            className="h-20"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            title="Back to Dashboard"
            className="text-black hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            title="Logout"
            className="text-black hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-grow app-content">
        <div className="space-y-6">
          <div className="w-full border-2 border-black p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center mr-3 bg-black text-white">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold">{currentEmployee?.name}</h3>
                <p className="text-sm">{currentEmployee?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-2 border-black">
            <h2 className="text-xl font-bold mb-4">Your QR Code</h2>
            <p className="text-sm text-gray-500 mb-4">
              Use this QR code to quickly log in to your account on another device.
              Simply scan it with a camera or QR code scanner.
            </p>
            
            <div id="employee-qr-code" className="flex justify-center py-6 mb-4 bg-white">
              <QRCodeSVG
                value={generateQRValue()}
                size={200}
                level="H"
                includeMargin
                className="border p-2"
              />
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleDownloadQR}
                className="cultiv-button w-full flex items-center justify-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              
              <Button
                onClick={handleCopyLink}
                className="cultiv-button-outline w-full flex items-center justify-center"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Login Link
              </Button>
              
              <Button
                onClick={handleExportEmployeeData}
                className="cultiv-button-outline w-full flex items-center justify-center"
              >
                <Copy className="mr-2 h-4 w-4" />
                Export Employee Data
              </Button>
              
              <Button
                onClick={handleLogout}
                className="cultiv-button-outline w-full flex items-center justify-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} CULTIV BUREAU • Time Management
        </div>
      </footer>
    </div>
  );
};

export default Profile;
