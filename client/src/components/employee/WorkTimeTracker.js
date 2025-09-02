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

const TimeDisplay = styled.div`
  text-align: center;
  margin: 2rem 0;
`;

const CurrentTime = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;
`;

const CurrentDate = styled.div`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;

  &.start {
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
    }

    &:disabled {
      background: #95a5a6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }

  &.end {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
    }

    &:disabled {
      background: #95a5a6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
`;

const StatusCard = styled.div`
  background: ${props => props.status === 'working' ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' : 
    props.status === 'completed' ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)' : 
    'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'};
  color: white;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const StatusTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StatusText = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const WorkLogCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const LogTitle = styled.h3`
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
`;

const LogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const LogItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
`;

const LogLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const LogValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
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

const WorkTimeTracker = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayLog, setTodayLog] = useState(null);
  const [allTodayLogs, setAllTodayLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');


  const fetchTodayLog = useCallback(async () => {
    try {
      const today = moment().format('YYYY-MM-DD');
      // 사용자의 코드를 사용하여 오늘 기록 조회
      const userCode = user?.employee?.code;
      
      if (!userCode) {
        console.error('사용자 코드를 찾을 수 없습니다.');
        return;
      }

      console.log('오늘 기록 조회:', { today, userCode });

      const { data: logs, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('employee_code', userCode)
        .eq('date', today)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('오늘 기록 조회 실패:', error);
        return;
      }

      if (logs && logs.length > 0) {
        console.log('오늘 기록 발견:', logs);
        // 가장 최근 기록을 todayLog로 설정
        setTodayLog(logs[0]);
        // 모든 기록을 별도로 저장 (나중에 표시용)
        setAllTodayLogs(logs);
      } else {
        console.log('오늘 기록 없음 - 새로운 날짜');
        setTodayLog(null);
        setAllTodayLogs([]);
      }
    } catch (error) {
      console.error('오늘 기록 조회 실패:', error);
    }
  }, [user?.employee?.code]);

  useEffect(() => {
    // 현재 시간 업데이트
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 오늘의 출퇴근 기록 조회
    fetchTodayLog();

    return () => clearInterval(timer);
  }, [fetchTodayLog]);

  const handleStartWork = async () => {
    setLoading(true);
    setMessage('');

    try {
      const today = moment().format('YYYY-MM-DD');
      const now = moment().toISOString(); // ISO 형식으로 저장 (UTC)
      const userCode = user?.employee?.code;

      console.log('출근 기록:', { today, now, userCode });

      // 항상 새로운 출근 기록 생성 (같은 날짜에 여러 번 출근 가능)
      const { error } = await supabase
        .from('work_logs')
        .insert([{
          employee_code: userCode,
          date: today,
          start_time: now
        }]);

      if (error) {
        console.error('출근 기록 생성 오류:', error);
        setMessage('출근 기록에 실패했습니다.');
        return;
      }

      setMessage('출근이 기록되었습니다.');
      fetchTodayLog();
    } catch (error) {
      console.error('출근 기록 오류:', error);
      setMessage('출근 기록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndWork = async () => {
    setLoading(true);
    setMessage('');

    try {
      const today = moment().format('YYYY-MM-DD');
      const now = moment().toISOString(); // ISO 형식으로 저장 (UTC)
      const userCode = user?.employee?.code;

      console.log('퇴근 기록:', { today, now, userCode });

      // 오늘 가장 최근 출근 기록 찾기 (퇴근 기록이 없는 것)
      const { data: workLogs, error: findError } = await supabase
        .from('work_logs')
        .select('*')
        .eq('employee_code', userCode)
        .eq('date', today)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1);

      if (findError || !workLogs || workLogs.length === 0) {
        setMessage('출근 기록을 찾을 수 없습니다.');
        return;
      }

      const workLog = workLogs[0];
      console.log('기존 근무 기록:', workLog);

      // 근무 시간 계산 (정확한 계산)
      const startTime = moment(workLog.start_time);
      const endTime = moment(now);
      const totalMinutes = endTime.diff(startTime, 'minutes', true);
      const totalHours = totalMinutes / 60;

      console.log('시간 계산:', {
        startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
        endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
        totalMinutes,
        totalHours
      });

      // 퇴근 기록 업데이트
      const { error: updateError } = await supabase
        .from('work_logs')
        .update({
          end_time: now,
          total_hours: totalHours
        })
        .eq('id', workLog.id);

      if (updateError) {
        console.error('퇴근 기록 업데이트 오류:', updateError);
        setMessage('퇴근 기록에 실패했습니다.');
        return;
      }

      setMessage('퇴근이 기록되었습니다.');
      fetchTodayLog();
    } catch (error) {
      console.error('퇴근 기록 오류:', error);
      setMessage('퇴근 기록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };



  // 실시간 근무 시간 계산
  const getCurrentWorkHours = () => {
    if (!todayLog || !todayLog.start_time) return null;
    
    const startTime = moment(todayLog.start_time);
    const endTime = todayLog.end_time ? moment(todayLog.end_time) : moment();
    const totalMinutes = endTime.diff(startTime, 'minutes', true);
    const totalHours = totalMinutes / 60;
    
    return totalHours;
  };

  const getWorkStatus = () => {
    if (!todayLog) return 'not-started';
    if (!todayLog.end_time) return 'working';
    return 'completed';
  };

  const getStatusInfo = () => {
    const status = getWorkStatus();
    switch (status) {
      case 'not-started':
        return {
          title: '출근 전',
          text: '출근 버튼을 눌러 근무를 시작하세요.'
        };
      case 'working':
        return {
          title: '근무 중',
          text: '퇴근 버튼을 눌러 근무를 종료하세요.'
        };
      case 'completed':
        return {
          title: '근무 완료',
          text: '오늘 근무가 완료되었습니다.'
        };
      default:
        return {
          title: '상태 확인 중',
          text: '잠시만 기다려주세요.'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const workStatus = getWorkStatus();

  return (
    <Container>
      <Title>출퇴근 관리</Title>

      {message && (
        <Message className={message.includes('실패') ? 'error' : 'success'}>
          {message}
        </Message>
      )}

      <Card>
        <TimeDisplay>
          <CurrentTime>
            {moment(currentTime).format('HH:mm:ss')}
          </CurrentTime>
          <CurrentDate>
            {moment(currentTime).format('YYYY년 MM월 DD일 (dddd)')}
          </CurrentDate>
        </TimeDisplay>

        <ButtonGroup>
          <Button
            className="start"
            onClick={handleStartWork}
            disabled={loading}
          >
            {loading ? '처리 중...' : '출근'}
          </Button>
          <Button
            className="end"
            onClick={handleEndWork}
            disabled={loading}
          >
            {loading ? '처리 중...' : '퇴근'}
          </Button>
        </ButtonGroup>
      </Card>

      <StatusCard status={workStatus}>
        <StatusTitle>{statusInfo.title}</StatusTitle>
        <StatusText>{statusInfo.text}</StatusText>
      </StatusCard>

      {allTodayLogs.length > 0 && (
        <WorkLogCard>
          <LogTitle>
            오늘의 근무 기록 ({allTodayLogs.length}회)
          </LogTitle>
          

            <div>
              {allTodayLogs.map((log, index) => (
                <div key={log.id} style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '10px', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  background: index === 0 ? '#f8f9fa' : 'white'
                }}>
                  <div style={{ 
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    color: index === 0 ? '#667eea' : '#333'
                  }}>
                    {allTodayLogs.length - index}차 근무
                  </div>
                  <LogGrid>
                    <LogItem>
                      <LogLabel>출근 시간</LogLabel>
                      <LogValue>
                        {log.start_time ? moment(log.start_time).local().format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </LogValue>
                    </LogItem>
                    <LogItem>
                      <LogLabel>퇴근 시간</LogLabel>
                      <LogValue>
                        {log.end_time ? moment(log.end_time).local().format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </LogValue>
                    </LogItem>
                    <LogItem>
                      <LogLabel>근무 시간</LogLabel>
                      <LogValue>
                        {log.total_hours ? (
                          log.total_hours < 0.01 ? 
                          '1분 미만' : 
                          `${Math.abs(log.total_hours).toFixed(2)}시간`
                        ) : '-'}
                      </LogValue>
                    </LogItem>
                  </LogGrid>
                </div>
              ))}
            </div>
          )}
        </WorkLogCard>
      )}
    </Container>
  );
};

export default WorkTimeTracker;
