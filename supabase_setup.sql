-- Supabase 데이터베이스 설정 스크립트
-- https://supabase.com/dashboard/project/wrzwkrvtamhtxdgqlxve/sql 에서 실행하세요

-- 관리자 테이블
CREATE TABLE admin (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 직원 테이블
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  hourly_rate INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 근무 로그 테이블
CREATE TABLE work_logs (
  id SERIAL PRIMARY KEY,
  employee_code VARCHAR(8) NOT NULL,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  total_hours DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_code) REFERENCES employees(code) ON DELETE CASCADE
);

-- 업무 루틴 테이블
CREATE TABLE work_routines (
  id SERIAL PRIMARY KEY,
  employee_code VARCHAR(8) NOT NULL,
  task TEXT NOT NULL,
  date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_code) REFERENCES employees(code) ON DELETE CASCADE
);

-- 기본 관리자 계정 생성
INSERT INTO admin (username, password) VALUES ('mnj510', 'asdf6014!!');

-- 샘플 직원 데이터 (선택사항)
INSERT INTO employees (code, name, hourly_rate) VALUES 
('EMP001', '김철수', 15000),
('EMP002', '이영희', 12000),
('EMP003', '박민수', 18000);

-- 샘플 업무 루틴 (선택사항)
INSERT INTO work_routines (employee_code, task, date) VALUES 
('EMP001', '이메일 확인 및 응답', CURRENT_DATE),
('EMP001', '일일 보고서 작성', CURRENT_DATE),
('EMP001', '고객 문의 처리', CURRENT_DATE),
('EMP002', '데이터 분석', CURRENT_DATE),
('EMP002', '회의 참석', CURRENT_DATE),
('EMP003', '코드 리뷰', CURRENT_DATE),
('EMP003', '문서 작성', CURRENT_DATE);
