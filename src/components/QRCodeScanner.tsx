
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addEmployee, setCurrentEmployee } from '@/services/employeeService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Copy, ArrowRight, Scan } from 'lucide-react';

interface QRCodeScannerProps {
  onLogin?: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onLogin }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [manualCode, setManualCode] = useState('');
  const navigate = useNavigate();

  // Check if URL contains employee data
  useEffect(() => {
    const url = new URL(window.location.href);
    const encodedData = url.searchParams.get('employeeData');
    
    if (encodedData) {
      try {
        // Decode and parse the employee data
        const decodedData = decodeURIComponent(encodedData);
        const employeeData = JSON.parse(decodedData);
        
        if (employeeData.id && employeeData.name) {
          // Set current employee
          setCurrentEmployee(employeeData.id);
          
          // Add employee if not exists
          try {
            addEmployee(employeeData);
          } catch (e) {
            // Employee might already exist
          }
          
          toast.success('Login successful');
          
          // Clear the URL parameter without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Navigate to dashboard or call onLogin
          if (onLogin) {
            onLogin();
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        toast.error('Invalid QR code data');
      }
    }
  }, [navigate, onLogin]);

  // Generate a unique ID for the employee
  const generateEmployeeId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleGenerateQR = () => {
    if (!employeeName.trim() || !employeeEmail.trim()) {
      toast.error('Please enter both name and email');
      return;
    }

    const newEmployeeId = generateEmployeeId();
    setEmployeeId(newEmployeeId);
    
    // Create a QR code value with employee information
    const employeeData = {
      id: newEmployeeId,
      name: employeeName,
      email: employeeEmail,
      joinedAt: new Date()
    };
    
    // Save employee to storage
    addEmployee(employeeData);
    
    // Generate QR value with app URL and employee data
    const baseUrl = window.location.origin;
    const loginUrl = `${baseUrl}/login?employeeData=${encodeURIComponent(JSON.stringify(employeeData))}`;
    setQrValue(loginUrl);
    setIsGenerating(true);
    
    toast.success('QR code generated successfully', {
      description: 'Now you can share this with the employee'
    });
  };

  const handleCopyLink = () => {
    if (qrValue) {
      navigator.clipboard.writeText(qrValue);
      toast.success('Code copied to clipboard');
    }
  };

  const handleJoinWithCode = () => {
    try {
      if (!manualCode.trim()) {
        toast.error('Please enter a valid code');
        return;
      }
      
      const employeeData = JSON.parse(manualCode);
      if (!employeeData.id || !employeeData.name) {
        toast.error('Invalid employee code');
        return;
      }
      
      // Set current employee
      setCurrentEmployee(employeeData.id);
      
      // Add employee if not exists
      try {
        addEmployee(employeeData);
      } catch (e) {
        // Employee might already exist
      }
      
      toast.success('Login successful');
      
      if (onLogin) {
        onLogin();
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to parse employee code');
    }
  };

  return (
    <div className="w-full glass-panel rounded-xl p-6 space-y-6">
      {!isGenerating ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add New Employee</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Employee Name</label>
            <Input 
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Employee Email</label>
            <Input 
              value={employeeEmail}
              onChange={(e) => setEmployeeEmail(e.target.value)}
              placeholder="Enter employee email"
              type="email"
            />
          </div>
          <Button
            onClick={handleGenerateQR}
            className="w-full mt-2"
          >
            Generate QR Code
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or Join with Code</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste your employee code here"
            />
            <Button
              onClick={handleJoinWithCode}
              className="w-full"
              variant="secondary"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Join with Code
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Employee QR Code</h3>
          <p className="text-sm text-muted-foreground">
            Scan this QR code with your mobile device to instantly log in to the TimeTrack app.
          </p>
          
          <div className="flex justify-center py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={qrValue} size={200} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex">
              <Input
                value={qrValue}
                readOnly
                className="rounded-r-none"
              />
              <Button
                onClick={handleCopyLink}
                className="rounded-l-none"
                variant="secondary"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => setIsGenerating(false)}
              className="w-full"
              variant="outline"
            >
              Add Another Employee
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
