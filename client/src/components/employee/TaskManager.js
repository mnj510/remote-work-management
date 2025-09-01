import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { supabase } from '../../config/supabase';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
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

const DateSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const DateButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }

  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

const DateInput = styled.input`
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ProgressCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const ProgressTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const ProgressText = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid ${props => props.completed ? '#27ae60' : '#e0e0e0'};
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #27ae60;
`;

const TaskText = styled.span`
  flex: 1;
  font-size: 1.1rem;
  color: #333;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  opacity: ${props => props.completed ? 0.6 : 1};
`;

const TaskTime = styled.div`
  font-size: 0.9rem;
  color: #666;
  min-width: 120px;
  text-align: right;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.p`
  font-size: 1rem;
  opacity: 0.7;
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

const TaskManager = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // 사용자의 코드를 사용하여 업무 루틴 조회
      const userCode = user?.employee?.code;
      
      if (!userCode) {
        console.error('사용자 코드를 찾을 수 없습니다.');
        return;
      }

      const { data: tasks, error } = await supabase
        .from('work_routines')
        .select('*')
        .eq('employee_code', userCode)
        .eq('date', selectedDate)
        .order('id');

      if (error) {
        setMessage('업무 루틴을 불러오는데 실패했습니다.');
        return;
      }

      setTasks(tasks || []);
      calculateProgress(tasks || []);
    } catch (error) {
      setMessage('업무 루틴을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, user?.employee?.code]);

  useEffect(() => {
    fetchTasks();
  }, [selectedDate, fetchTasks]);

  const calculateProgress = (taskList) => {
    const total = taskList.length;
    const completed = taskList.filter(task => task.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    setProgress({ total, completed, percentage });
  };

  const handleTaskToggle = async (taskId, isCompleted) => {
    try {
      const completedAt = !isCompleted ? moment().format('YYYY-MM-DD HH:mm:ss') : null;

      const { error } = await supabase
        .from('work_routines')
        .update({
          is_completed: !isCompleted,
          completed_at: completedAt
        })
        .eq('id', taskId);

      if (error) {
        setMessage('업무 상태 변경에 실패했습니다.');
        return;
      }
      
      // 로컬 상태 업데이트
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, is_completed: !isCompleted } : task
      );
      setTasks(updatedTasks);
      calculateProgress(updatedTasks);
      
      setMessage('업무 상태가 업데이트되었습니다.');
    } catch (error) {
      setMessage('업무 상태 변경에 실패했습니다.');
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const quickDateButtons = [
    { label: '오늘', date: moment().format('YYYY-MM-DD') },
    { label: '어제', date: moment().subtract(1, 'day').format('YYYY-MM-DD') },
    { label: '이번 주', date: moment().startOf('week').format('YYYY-MM-DD') }
  ];

  return (
    <Container>
      <Title>업무 관리</Title>

      {message && (
        <Message className={message.includes('실패') ? 'error' : 'success'}>
          {message}
        </Message>
      )}

      <Card>
        <h3>날짜 선택</h3>
        <DateSelector>
          {quickDateButtons.map(({ label, date }) => (
            <DateButton
              key={date}
              className={selectedDate === date ? 'active' : ''}
              onClick={() => handleDateChange(date)}
            >
              {label}
            </DateButton>
          ))}
          <DateInput
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </DateSelector>
      </Card>

      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            업무 루틴을 불러오는 중...
          </div>
        </Card>
      ) : tasks.length > 0 ? (
        <>
          <ProgressCard>
            <ProgressTitle>업무 진행률</ProgressTitle>
            <ProgressBar>
              <ProgressFill progress={progress.percentage} />
            </ProgressBar>
            <ProgressText>
              {progress.completed} / {progress.total} 완료 ({progress.percentage}%)
            </ProgressText>
          </ProgressCard>

          <Card>
            <h3>업무 목록</h3>
            <TaskList>
              {tasks.map((task) => (
                <TaskItem key={task.id} completed={task.is_completed}>
                  <Checkbox
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => handleTaskToggle(task.id, task.is_completed)}
                  />
                  <TaskText completed={task.is_completed}>
                    {task.task}
                  </TaskText>
                  <TaskTime>
                    {task.completed_at ? 
                      moment(task.completed_at).format('HH:mm') : 
                      '-'
                    }
                  </TaskTime>
                </TaskItem>
              ))}
            </TaskList>
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyText>해당 날짜의 업무가 없습니다</EmptyText>
            <EmptySubtext>
              관리자가 업무 루틴을 설정하면 여기에 표시됩니다.
            </EmptySubtext>
          </EmptyState>
        </Card>
      )}
    </Container>
  );
};

export default TaskManager;
