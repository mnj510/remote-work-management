require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 미들웨어
app.use(cors());
app.use(express.json());

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '토큰이 필요합니다.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// 관리자 로그인
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: '잘못된 사용자명 또는 비밀번호입니다.' });
    }

    const token = jwt.sign({ username: admin.username, role: 'admin' }, JWT_SECRET);
    res.json({ 
      token, 
      username: admin.username,
      role: 'admin'
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 직원 코드로 로그인
app.post('/api/employee/login', async (req, res) => {
  const { code } = req.body;

  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !employee) {
      return res.status(401).json({ error: '유효하지 않은 직원 코드입니다.' });
    }

    const token = jwt.sign({ 
      code: employee.code, 
      name: employee.name, 
      role: 'employee' 
    }, JWT_SECRET);
    
    res.json({ 
      token, 
      employee: {
        code: employee.code,
        name: employee.name
      },
      role: 'employee'
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 직원 등록 (관리자만)
app.post('/api/employees', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  const { name, hourly_rate } = req.body;
  const code = uuidv4().substring(0, 8).toUpperCase();

  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([{ code, name, hourly_rate }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: '직원 등록에 실패했습니다.' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '직원 등록에 실패했습니다.' });
  }
});

// 직원 목록 조회 (관리자만)
app.get('/api/employees', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: '직원 목록 조회에 실패했습니다.' });
    }

    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: '직원 목록 조회에 실패했습니다.' });
  }
});

// 직원 정보 수정 (관리자만)
app.put('/api/employees/:code', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  const { code } = req.params;
  const { name, hourly_rate } = req.body;

  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ name, hourly_rate })
      .eq('code', code)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: '직원 정보 수정에 실패했습니다.' });
    }

    if (!data) {
      return res.status(404).json({ error: '직원을 찾을 수 없습니다.' });
    }

    res.json({ message: '직원 정보가 수정되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '직원 정보 수정에 실패했습니다.' });
  }
});

// 직원 삭제 (관리자만)
app.delete('/api/employees/:code', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  const { code } = req.params;

  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('code', code);

    if (error) {
      return res.status(500).json({ error: '직원 삭제에 실패했습니다.' });
    }

    res.json({ message: '직원이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '직원 삭제에 실패했습니다.' });
  }
});

// 출근 기록
app.post('/api/work/start', authenticateToken, async (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  const today = moment().format('YYYY-MM-DD');
  const now = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    // 오늘 이미 출근 기록이 있는지 확인
    const { data: existingLog } = await supabase
      .from('work_logs')
      .select('*')
      .eq('employee_code', req.user.code)
      .eq('date', today)
      .single();

    if (existingLog) {
      return res.status(400).json({ error: '오늘 이미 출근 기록이 있습니다.' });
    }

    // 새로운 출근 기록 생성
    const { data, error } = await supabase
      .from('work_logs')
      .insert([{
        employee_code: req.user.code,
        date: today,
        start_time: now
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: '출근 기록에 실패했습니다.' });
    }

    res.json({ message: '출근이 기록되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '출근 기록에 실패했습니다.' });
  }
});

// 퇴근 기록
app.post('/api/work/end', authenticateToken, async (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  const today = moment().format('YYYY-MM-DD');
  const now = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    // 오늘 출근 기록 찾기
    const { data: workLog, error: findError } = await supabase
      .from('work_logs')
      .select('*')
      .eq('employee_code', req.user.code)
      .eq('date', today)
      .single();

    if (findError || !workLog) {
      return res.status(400).json({ error: '출근 기록을 찾을 수 없습니다.' });
    }

    if (workLog.end_time) {
      return res.status(400).json({ error: '이미 퇴근 기록이 있습니다.' });
    }

    // 근무 시간 계산
    const startTime = moment(workLog.start_time);
    const endTime = moment(now);
    const totalHours = endTime.diff(startTime, 'hours', true);

    // 퇴근 기록 업데이트
    const { error: updateError } = await supabase
      .from('work_logs')
      .update({
        end_time: now,
        total_hours: totalHours
      })
      .eq('id', workLog.id);

    if (updateError) {
      return res.status(500).json({ error: '퇴근 기록에 실패했습니다.' });
    }

    res.json({ message: '퇴근이 기록되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '퇴근 기록에 실패했습니다.' });
  }
});

// 근무 로그 조회
app.get('/api/work/logs/:code', authenticateToken, async (req, res) => {
  const { code } = req.params;
  const { year, month } = req.query;

  // 직원이 자신의 로그만 조회할 수 있도록 권한 확인
  if (req.user.role === 'employee' && req.user.code !== code) {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  try {
    let query = supabase
      .from('work_logs')
      .select('*')
      .eq('employee_code', code);

    if (year && month) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data: logs, error } = await query.order('date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: '근무 로그 조회에 실패했습니다.' });
    }

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: '근무 로그 조회에 실패했습니다.' });
  }
});

// 급여 계산
app.post('/api/salary/calculate', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  const { employee_code, start_date, end_date, hourly_rate } = req.body;

  try {
    const { data: logs, error } = await supabase
      .from('work_logs')
      .select('total_hours')
      .eq('employee_code', employee_code)
      .gte('date', start_date)
      .lte('date', end_date)
      .not('total_hours', 'is', null);

    if (error) {
      return res.status(500).json({ error: '급여 계산에 실패했습니다.' });
    }

    const totalHours = logs.reduce((sum, log) => sum + (log.total_hours || 0), 0);
    const salary = totalHours * hourly_rate;

    res.json({
      total_hours: totalHours,
      hourly_rate: hourly_rate,
      salary: salary
    });
  } catch (error) {
    res.status(500).json({ error: '급여 계산에 실패했습니다.' });
  }
});

// 업무 루틴 설정
app.post('/api/routines/:code/:date', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  const { code, date } = req.params;
  const { tasks } = req.body;

  try {
    // 기존 루틴 삭제
    await supabase
      .from('work_routines')
      .delete()
      .eq('employee_code', code)
      .eq('date', date);

    // 새로운 루틴 추가
    const routineData = tasks.map(task => ({
      employee_code: code,
      task: task,
      date: date
    }));

    const { error } = await supabase
      .from('work_routines')
      .insert(routineData);

    if (error) {
      return res.status(500).json({ error: '업무 루틴 설정에 실패했습니다.' });
    }

    res.json({ message: '업무 루틴이 설정되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '업무 루틴 설정에 실패했습니다.' });
  }
});

// 업무 루틴 조회
app.get('/api/routines/:code/:date', authenticateToken, async (req, res) => {
  const { code, date } = req.params;

  // 직원이 자신의 루틴만 조회할 수 있도록 권한 확인
  if (req.user.role === 'employee' && req.user.code !== code) {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  try {
    const { data: routines, error } = await supabase
      .from('work_routines')
      .select('*')
      .eq('employee_code', code)
      .eq('date', date)
      .order('id');

    if (error) {
      return res.status(500).json({ error: '업무 루틴 조회에 실패했습니다.' });
    }

    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: '업무 루틴 조회에 실패했습니다.' });
  }
});

// 업무 완료 상태 변경
app.put('/api/routines/:id/complete', authenticateToken, async (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }

  const { id } = req.params;
  const { is_completed } = req.body;

  try {
    // 직원이 자신의 업무만 수정할 수 있도록 권한 확인
    const { data: routine, error: findError } = await supabase
      .from('work_routines')
      .select('employee_code')
      .eq('id', id)
      .single();

    if (findError || !routine) {
      return res.status(404).json({ error: '업무를 찾을 수 없습니다.' });
    }

    if (routine.employee_code !== req.user.code) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    const completedAt = is_completed ? moment().format('YYYY-MM-DD HH:mm:ss') : null;

    const { error } = await supabase
      .from('work_routines')
      .update({
        is_completed: is_completed,
        completed_at: completedAt
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: '업무 상태 변경에 실패했습니다.' });
    }

    res.json({ message: '업무 상태가 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '업무 상태 변경에 실패했습니다.' });
  }
});

// 진행률 계산
app.get('/api/routines/:code/:date/progress', authenticateToken, async (req, res) => {
  const { code, date } = req.params;

  try {
    const { data: routines, error } = await supabase
      .from('work_routines')
      .select('is_completed')
      .eq('employee_code', code)
      .eq('date', date);

    if (error) {
      return res.status(500).json({ error: '진행률 계산에 실패했습니다.' });
    }

    const total = routines.length;
    const completed = routines.filter(r => r.is_completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      total,
      completed,
      progress
    });
  } catch (error) {
    res.status(500).json({ error: '진행률 계산에 실패했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
