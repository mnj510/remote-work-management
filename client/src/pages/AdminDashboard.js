import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import WorkTimeManagement from '../components/admin/WorkTimeManagement';
import SalaryCalculation from '../components/admin/SalaryCalculation';
import RoutineManagement from '../components/admin/RoutineManagement';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Header = styled.header`
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  color: #667eea;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.span`
  color: #333;
  font-weight: 500;
`;

const LogoutButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;

  &:hover {
    background: #c0392b;
  }
`;

const MainContent = styled.main`
  display: flex;
  min-height: calc(100vh - 80px);
`;

const Sidebar = styled.nav`
  width: 250px;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 2rem 0;
`;

const NavItem = styled(Link)`
  display: block;
  padding: 1rem 2rem;
  color: #666;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
    color: #667eea;
    border-left-color: #667eea;
  }

  &.active {
    background: #f8f9fa;
    color: #667eea;
    border-left-color: #667eea;
    font-weight: 600;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const WelcomeCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const WelcomeTitle = styled.h2`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.8rem;
`;

const WelcomeText = styled.p`
  color: #666;
  line-height: 1.6;
  font-size: 1.1rem;
`;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: '대시보드', component: null },
    { path: '/admin/employees', label: '직원 관리', component: EmployeeManagement },
    { path: '/admin/worktime', label: '출퇴근 관리', component: WorkTimeManagement },
    { path: '/admin/salary', label: '급여 계산', component: SalaryCalculation },
    { path: '/admin/routines', label: '업무 루틴 관리', component: RoutineManagement }
  ];

  return (
    <DashboardContainer>
      <Header>
        <Logo>재택 근무 관리 시스템</Logo>
        <UserInfo>
          <UserName>관리자: {user?.username}</UserName>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </UserInfo>
      </Header>

      <MainContent>
        <Sidebar>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              className={activeTab === item.path ? 'active' : ''}
              onClick={() => setActiveTab(item.path)}
            >
              {item.label}
            </NavItem>
          ))}
        </Sidebar>

        <Content>
          <Routes>
            <Route index element={
              <WelcomeCard>
                <WelcomeTitle>관리자 대시보드에 오신 것을 환영합니다!</WelcomeTitle>
                <WelcomeText>
                  이 시스템을 통해 재택 근무 직원들의 출퇴근 시간을 관리하고, 
                  업무 루틴을 설정하며, 급여를 계산할 수 있습니다.
                </WelcomeText>
                <WelcomeText>
                  왼쪽 메뉴에서 원하는 기능을 선택하여 사용하세요.
                </WelcomeText>
              </WelcomeCard>
            } />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="worktime" element={<WorkTimeManagement />} />
            <Route path="salary" element={<SalaryCalculation />} />
            <Route path="routines" element={<RoutineManagement />} />
          </Routes>
        </Content>
      </MainContent>
    </DashboardContainer>
  );
};

export default AdminDashboard;
