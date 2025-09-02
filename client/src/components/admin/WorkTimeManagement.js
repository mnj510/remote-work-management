import React, { useState, useEffect, useCallback } from 'react';
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

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
  margin-bottom: 2rem;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #667eea;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
`;

const TimeCell = styled(Td)`
  font-family: monospace;
  font-weight: 600;
`;

const HoursCell = styled(Td)`
  font-weight: 600;
  color: #27ae60;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;

  &.working {
    background: #e8f5e8;
    color: #27ae60;
  }

  &.completed {
    background: #e3f2fd;
    color: #1976d2;
  }

  &.incomplete {
    background: #fff3e0;
    color: #f57c00;
  }
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SummaryTitle = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const SummaryLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
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
`;

const WorkTimeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingLog, setEditingLog] = useState(null);
  const [editForm, setEditForm] = useState({
    start_time: '',
    end_time: ''
  });

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

  const fetchWorkLogs = useCallback(async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

      const { data: logs, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('employee_code', selectedEmployee)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        setMessage('업무 시간 조회에 실패했습니다.');
        return;
      }

      setWorkLogs(logs || []);
    } catch (error) {
      setMessage('업무 시간 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, selectedMonth]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchWorkLogs();
    }
  }, [selectedEmployee, selectedMonth, fetchWorkLogs]);

  const getStatusBadge = (log) => {
    if (!log.start_time) return <StatusBadge className="incomplete">미출근</StatusBadge>;
    if (!log.end_time) return <StatusBadge className="working">근무중</StatusBadge>;
    return <StatusBadge className="completed">완료</StatusBadge>;
  };

  const calculateSummary = () => {
    const totalDays = workLogs.length;
    const workingDays = workLogs.filter(log => log.start_time).length;
    const completedDays = workLogs.filter(log => log.end_time).length;
    const totalHours = workLogs.reduce((sum, log) => sum + (log.total_hours || 0), 0);

    return {
      totalDays,
      workingDays,
      completedDays,
      totalHours: Math.round(totalHours * 100) / 100
    };
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setEditForm({
      start_time: log.start_time ? moment(log.start_time).local().format('YYYY-MM-DDTHH:mm') : '',
      end_time: log.end_time ? moment(log.end_time).local().format('YYYY-MM-DDTHH:mm') : ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingLog) return;

    setLoading(true);
    setMessage('');

    try {
      // 시간 형식 변환 (로컬 시간을 UTC로 변환)
      const startTime = editForm.start_time ? moment(editForm.start_time).toISOString() : null;
      const endTime = editForm.end_time ? moment(editForm.end_time).toISOString() : null;
      
      // 근무 시간 계산
      let totalHours = null;
      if (startTime && endTime) {
        const start = moment(startTime);
        const end = moment(endTime);
        const totalMinutes = end.diff(start, 'minutes', true);
        totalHours = totalMinutes / 60;
      }

      const updateData = {
        start_time: startTime,
        end_time: endTime,
        total_hours: totalHours
      };

      const { error } = await supabase
        .from('work_logs')
        .update(updateData)
        .eq('id', editingLog.id);

      if (error) {
        setMessage('근무 기록 수정에 실패했습니다.');
        return;
      }

      setMessage('근무 기록이 수정되었습니다.');
      setEditingLog(null);
      setEditForm({ start_time: '', end_time: '' });
      fetchWorkLogs();
    } catch (error) {
      setMessage('근무 기록 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
    setEditForm({ start_time: '', end_time: '' });
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('정말로 이 근무 기록을 삭제하시겠습니까?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        setMessage('근무 기록 삭제에 실패했습니다.');
        return;
      }

      setMessage('근무 기록이 삭제되었습니다.');
      fetchWorkLogs();
    } catch (error) {
      setMessage('근무 기록 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const summary = calculateSummary();

  return (
    <Container>
      <Title>출퇴근 관리</Title>

      {message && (
        <Message className="error">
          {message}
        </Message>
      )}

      <Card>
        <h3>조회 조건</h3>
        <FilterSection>
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
            <Label>조회 월</Label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </InputGroup>
          <InputGroup>
            <Label>&nbsp;</Label>
            <Button onClick={fetchWorkLogs} disabled={loading}>
              {loading ? '조회 중...' : '조회'}
            </Button>
          </InputGroup>
        </FilterSection>
      </Card>

      {selectedEmployee && (
        <SummaryCard>
          <SummaryTitle>월간 요약</SummaryTitle>
          <SummaryGrid>
            <SummaryItem>
              <SummaryValue>{summary.totalDays}</SummaryValue>
              <SummaryLabel>총 일수</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue>{summary.workingDays}</SummaryValue>
              <SummaryLabel>출근 일수</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue>{summary.completedDays}</SummaryValue>
              <SummaryLabel>완료 일수</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue>{summary.totalHours}h</SummaryValue>
              <SummaryLabel>총 근무 시간</SummaryLabel>
            </SummaryItem>
          </SummaryGrid>
        </SummaryCard>
      )}

      <Card>
        <h3>출퇴근 기록</h3>
        <Table>
          <thead>
            <tr>
              <Th>날짜</Th>
              <Th>출근 시간</Th>
              <Th>퇴근 시간</Th>
              <Th>근무 시간</Th>
              <Th>상태</Th>
              <Th>관리</Th>
            </tr>
          </thead>
          <tbody>
            {workLogs.map((log) => (
              <tr key={log.id}>
                <Td>{moment(log.date).format('YYYY-MM-DD (ddd)')}</Td>
                <TimeCell>
                  {editingLog?.id === log.id ? (
                    <input
                      type="datetime-local"
                      value={editForm.start_time}
                      onChange={(e) => setEditForm({...editForm, start_time: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '0.9rem'
                      }}
                    />
                  ) : (
                    log.start_time ? moment(log.start_time).local().format('YYYY-MM-DD HH:mm:ss') : '-'
                  )}
                </TimeCell>
                <TimeCell>
                  {editingLog?.id === log.id ? (
                    <input
                      type="datetime-local"
                      value={editForm.end_time}
                      onChange={(e) => setEditForm({...editForm, end_time: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '0.9rem'
                      }}
                    />
                  ) : (
                    log.end_time ? moment(log.end_time).local().format('YYYY-MM-DD HH:mm:ss') : '-'
                  )}
                </TimeCell>
                <HoursCell>
                  {log.total_hours ? `${Math.abs(log.total_hours).toFixed(2)}h` : '-'}
                </HoursCell>
                <Td>{getStatusBadge(log)}</Td>
                <Td>
                  {editingLog?.id === log.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={handleSaveEdit}
                        disabled={loading}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loading}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#95a5a6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditLog(log)}
                        disabled={loading}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={loading}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
            {workLogs.length === 0 && (
              <tr>
                <Td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  {loading ? '조회 중...' : '데이터가 없습니다.'}
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default WorkTimeManagement;
