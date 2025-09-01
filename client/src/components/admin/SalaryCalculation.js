import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../config/supabase';
import moment from 'moment';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
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

const ResultCard = styled.div`
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ResultTitle = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const ResultItem = styled.div`
  text-align: center;
`;

const ResultValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ResultLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const SalaryAmount = styled.div`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin: 2rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 600;

  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
`;

const SalaryCalculation = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const [salaryResult, setSalaryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setMessage('직원 목록을 불러오는데 실패했습니다.');
        return;
      }

      setEmployees(employees || []);
      if (employees && employees.length > 0) {
        setSelectedEmployee(employees[0].code);
      }
    } catch (error) {
      setMessage('직원 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleCalculateSalary = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setMessage('직원을 선택해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');
    setSalaryResult(null);

    try {
      // 근무 로그 조회
      const { data: logs, error } = await supabase
        .from('work_logs')
        .select('total_hours')
        .eq('employee_code', selectedEmployee)
        .gte('date', startDate)
        .lte('date', endDate)
        .not('total_hours', 'is', null);

      if (error) {
        setMessage('급여 계산에 실패했습니다.');
        return;
      }

      const totalHours = logs.reduce((sum, log) => sum + (log.total_hours || 0), 0);
      const hourlyRate = selectedEmployeeData.hourly_rate;
      const salary = totalHours * hourlyRate;

      setSalaryResult({
        total_hours: totalHours,
        hourly_rate: hourlyRate,
        salary: salary
      });
      setMessage('급여 계산이 완료되었습니다.');
    } catch (error) {
      setMessage('급여 계산에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployeeData = employees.find(emp => emp.code === selectedEmployee);

  return (
    <Container>
      <Title>급여 계산</Title>

      {message && (
        <Message className={message.includes('실패') ? 'error' : 'success'}>
          {message}
        </Message>
      )}

      <Card>
        <h3>급여 계산 조건</h3>
        <Form onSubmit={handleCalculateSalary}>
          <InputGroup>
            <Label>직원 선택</Label>
            <Select 
              value={selectedEmployee} 
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              {employees.map(employee => (
                <option key={employee.code} value={employee.code}>
                  {employee.name} ({employee.code})
                </option>
              ))}
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>시작 날짜</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>종료 날짜</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </InputGroup>
          <Button type="submit" disabled={loading}>
            {loading ? '계산 중...' : '급여 계산'}
          </Button>
        </Form>
      </Card>

      {selectedEmployeeData && (
        <Card>
          <h3>직원 정보</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong>이름:</strong> {selectedEmployeeData.name}
            </div>
            <div>
              <strong>직원 코드:</strong> {selectedEmployeeData.code}
            </div>
            <div>
              <strong>시급:</strong> {selectedEmployeeData.hourly_rate?.toLocaleString()}원
            </div>
            <div>
              <strong>계산 기간:</strong> {moment(startDate).format('YYYY-MM-DD')} ~ {moment(endDate).format('YYYY-MM-DD')}
            </div>
          </div>
        </Card>
      )}

      {salaryResult && (
        <ResultCard>
          <ResultTitle>급여 계산 결과</ResultTitle>
          <ResultGrid>
            <ResultItem>
              <ResultValue>{salaryResult.total_hours}h</ResultValue>
              <ResultLabel>총 근무 시간</ResultLabel>
            </ResultItem>
            <ResultItem>
              <ResultValue>{salaryResult.hourly_rate?.toLocaleString()}원</ResultValue>
              <ResultLabel>시급</ResultLabel>
            </ResultItem>
            <ResultItem>
              <ResultValue>{Math.round(salaryResult.total_hours * salaryResult.hourly_rate).toLocaleString()}원</ResultValue>
              <ResultLabel>계산 급여</ResultLabel>
            </ResultItem>
          </ResultGrid>
          
          <SalaryAmount>
            {salaryResult.salary?.toLocaleString()}원
          </SalaryAmount>
          
          <div style={{ textAlign: 'center', fontSize: '1.1rem', opacity: 0.9 }}>
            {moment(startDate).format('YYYY년 MM월 DD일')} ~ {moment(endDate).format('YYYY년 MM월 DD일')} 기간 급여
          </div>
        </ResultCard>
      )}
    </Container>
  );
};

export default SalaryCalculation;
