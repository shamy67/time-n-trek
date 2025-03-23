
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import History from '@/pages/History';
import Admin from '@/pages/Admin';
import EmployeeDetails from '@/pages/EmployeeDetails';
import NotFound from '@/pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/employee/:id" element={<EmployeeDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <SonnerToaster position="top-center" />
    </Router>
  );
}

export default App;
