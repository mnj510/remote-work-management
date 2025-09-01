import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 토큰 확인
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials, type) => {
    try {
      if (type === 'admin') {
        // 관리자 로그인
        const { data: admin, error } = await supabase
          .from('admin')
          .select('*')
          .eq('username', credentials.username)
          .single();

        if (error || !admin) {
          return { 
            success: false, 
            error: '잘못된 사용자명 또는 비밀번호입니다.' 
          };
        }

        // 비밀번호 검증 (실제로는 bcrypt로 해시된 비밀번호를 비교해야 함)
        // 여기서는 간단히 하드코딩된 비밀번호와 비교
        if (credentials.password !== 'asdf6014!!') {
          return { 
            success: false, 
            error: '잘못된 사용자명 또는 비밀번호입니다.' 
          };
        }

        const userWithRole = {
          username: admin.username,
          role: 'admin'
        };

        localStorage.setItem('user', JSON.stringify(userWithRole));
        setUser(userWithRole);
        
        return { success: true };
      } else {
        // 직원 로그인
        const { data: employee, error } = await supabase
          .from('employees')
          .select('*')
          .eq('code', credentials.code)
          .single();

        if (error || !employee) {
          return { 
            success: false, 
            error: '유효하지 않은 직원 코드입니다.' 
          };
        }

        const userWithRole = {
          employee: {
            code: employee.code,
            name: employee.name
          },
          role: 'employee'
        };

        localStorage.setItem('user', JSON.stringify(userWithRole));
        setUser(userWithRole);
        
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: '로그인에 실패했습니다.' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
