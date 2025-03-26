
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner";
import Index from './pages/Index';
import Login from './pages/Login';
import History from './pages/History';
import Admin from './pages/Admin';
import EmployeeDetails from './pages/EmployeeDetails';
import NotFound from './pages/NotFound';
import DataViewer from './pages/DataViewer';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/employee/:id" element={<EmployeeDetails />} />
        <Route path="/data" element={<DataViewer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
