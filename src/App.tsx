import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { PaymentPage } from './pages/PaymentPage';
import { PracticeTest } from './pages/PracticeTest';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage isSignUp={false} />} />
          <Route path="/signup" element={<LoginPage isSignUp={true} />} />
          <Route path="/payment" element={<PaymentPage />} />

          {/* Private Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-notes" 
            element={
              <ProtectedRoute>
                <Dashboard defaultView="study-notes" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/practice-test/:subject/:classId" 
            element={
              <ProtectedRoute>
                <PracticeTest />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
