import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          fontSize: '1.2rem'
        }}>
          로딩 중...
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace /> : <LoginPage />} 
        />
        <Route 
          path="/admin/*" 
          element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/employee/*" 
          element={user && user.role === 'employee' ? <EmployeeDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </AppContainer>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
