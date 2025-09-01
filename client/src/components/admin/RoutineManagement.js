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

const Form = styled.form`
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

const TaskInput = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TaskList = styled.div`
  margin-top: 1rem;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 0.5rem;
`;

const TaskText = styled.span`
  flex: 1;
`;

const RemoveButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    background: #c0392b;
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

const TaskCell = styled(Td)`
  max-width: 300px;
  word-wrap: break-word;
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

const RoutineManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [routines, setRoutines] = useState([]);
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

  const fetchRoutines = useCallback(async () => {
    if (!selectedEmployee || !selectedDate) return;

    setLoading(true);
    try {
      const { data: routines, error } = await supabase
        .from('work_routines')
        .select('*')
        .eq('employee_code', selectedEmployee)
        .eq('date', selectedDate)
        .order('id');

      if (error) {
        setMessage('업무 루틴 조회에 실패했습니다.');
        return;
      }

      setRoutines(routines || []);
    } catch (error) {
      setMessage('업무 루틴 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, selectedDate]);

  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      fetchRoutines();
    }
  }, [selectedEmployee, selectedDate, fetchRoutines]);

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSaveRoutines = async () => {
    if (tasks.length === 0) {
      setMessage('업무를 추가해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // 기존 루틴 삭제
      await supabase
        .from('work_routines')
        .delete()
        .eq('employee_code', selectedEmployee)
        .eq('date', selectedDate);

      // 새로운 루틴 추가
      const routineData = tasks.map(task => ({
        employee_code: selectedEmployee,
        task: task,
        date: selectedDate
      }));

      const { error } = await supabase
        .from('work_routines')
        .insert(routineData);

      if (error) {
        setMessage('업무 루틴 저장에 실패했습니다.');
        return;
      }

      setTasks([]);
      fetchRoutines();
      setMessage('업무 루틴이 저장되었습니다.');
    } catch (error) {
      setMessage('업무 루틴 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
  };

  return (
    <Container>
      <Title>업무 루틴 관리</Title>

      {message && (
        <Message className={message.includes('실패') ? 'error' : 'success'}>
          {message}
        </Message>
      )}

      <Card>
        <h3>업무 루틴 설정</h3>
        <Form>
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
            <Label>날짜</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>&nbsp;</Label>
            <Button onClick={fetchRoutines} disabled={loading}>
              {loading ? '조회 중...' : '기존 루틴 조회'}
            </Button>
          </InputGroup>
        </Form>

        <div style={{ marginBottom: '2rem' }}>
          <Label>업무 추가</Label>
          <TaskInput
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="업무를 입력하고 Enter를 누르거나 추가 버튼을 클릭하세요"
          />
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={handleAddTask} disabled={!newTask.trim()}>
              업무 추가
            </Button>
          </div>
        </div>

        {tasks.length > 0 && (
          <div>
            <Label>추가할 업무 목록</Label>
            <TaskList>
              {tasks.map((task, index) => (
                <TaskItem key={index}>
                  <TaskText>{task}</TaskText>
                  <RemoveButton onClick={() => handleRemoveTask(index)}>
                    삭제
                  </RemoveButton>
                </TaskItem>
              ))}
            </TaskList>
            <Button onClick={handleSaveRoutines} disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? '저장 중...' : '업무 루틴 저장'}
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <h3>기존 업무 루틴</h3>
        <Table>
          <thead>
            <tr>
              <Th>업무</Th>
              <Th>완료 상태</Th>
              <Th>완료 시간</Th>
            </tr>
          </thead>
          <tbody>
            {routines.map((routine) => (
              <tr key={routine.id}>
                <TaskCell>{routine.task}</TaskCell>
                <Td>
                  {routine.is_completed ? '완료' : '미완료'}
                </Td>
                <Td>
                  {routine.completed_at ? moment(routine.completed_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Td>
              </tr>
            ))}
            {routines.length === 0 && (
              <tr>
                <Td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                  {loading ? '조회 중...' : '해당 날짜의 업무 루틴이 없습니다.'}
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default RoutineManagement;
