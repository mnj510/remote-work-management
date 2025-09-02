import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 600;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
`;

const Tab = styled.button`
  flex: 1;
  padding: 15px;
  border: none;
  background: ${props => props.$active ? '#667eea' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? '#667eea' : '#f5f5f5'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 10px;
`;



const LoginPage = () => {
  console.log('LoginPage: Component rendered');
  
  const [loginType, setLoginType] = useState('employee');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loginData = loginType === 'admin' 
      ? { username: credentials.username, password: credentials.password }
      : { code: credentials.code };

    const result = await login(loginData, loginType);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>재택 근무 관리 시스템</Title>
        
        <TabContainer>
          <Tab 
            $active={loginType === 'employee'} 
            onClick={() => setLoginType('employee')}
          >
            직원
          </Tab>
          <Tab 
            $active={loginType === 'admin'} 
            onClick={() => setLoginType('admin')}
          >
            관리자
          </Tab>
        </TabContainer>

        <Form onSubmit={handleSubmit}>
          {loginType === 'admin' ? (
            <>
              <InputGroup>
                <Label>사용자명</Label>
                <Input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  placeholder="관리자 사용자명"
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>비밀번호</Label>
                <Input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="비밀번호"
                  required
                />
              </InputGroup>
            </>
          ) : (
            <InputGroup>
              <Label>직원 코드</Label>
              <Input
                type="text"
                name="code"
                value={credentials.code}
                onChange={handleInputChange}
                placeholder="직원 코드를 입력하세요"
                required
              />
            </InputGroup>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>


      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
