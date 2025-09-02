import React, { useEffect } from 'react';
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
  console.log('AppContent: Starting...');
  
  const { user, loading } = useAuth();
  console.log('AppContent: Auth state:', { user, loading });

  // GitHub Pages 라우팅 처리
  useEffect(() => {
    const path = window.location.pathname;
    console.log('AppContent: Initial path:', path);
    
    // GitHub Pages에서 ?/ 경로 처리
    if (path.includes('/?/')) {
      const newPath = path.split('/?/')[1].replace(/~and~/g, '&');
      console.log('AppContent: Redirecting to:', newPath);
      window.history.replaceState(null, null, newPath);
    }
  }, []);

  if (loading) {
    console.log('AppContent: Showing loading...');
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

  console.log('AppContent: Rendering routes...');
  
  // 현재 경로 확인
  const currentPath = window.location.pathname;
  console.log('AppContent: Current path:', currentPath);
  
  return (
    <AppContainer>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            user && user.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/employee/*" 
          element={
            user && user.role === 'employee' ? (
              <EmployeeDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
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
  console.log('App: Starting...');
  
  try {
    return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    );
  } catch (error) {
    console.error('App: Error:', error);
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white',
        fontSize: '1.2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        앱 초기화 오류: {error.message}
      </div>
    );
  }
}

export default App;
