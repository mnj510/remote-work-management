# 재택 근무 관리 시스템

직원들의 원격 근무를 효율적으로 관리할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

### 관리자 기능
- 직원 등록 및 관리
- 시급 설정 (10원 단위 지원)
- 근무 시간 조회 및 통계
- 급여 계산
- 업무 루틴 설정

### 직원 기능
- 출퇴근 기록
- 일일 업무 관리
- 업무 진행률 확인
- 개인 근무 통계

## 🛠 기술 스택

- **Frontend**: React, Styled Components
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **Deployment**: Vercel

## 📋 설정 방법

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 다음 스키마 실행:

```sql
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

-- 기본 관리자 계정 생성 (비밀번호: asdf6014!!)
INSERT INTO admin (username, password) VALUES ('mnj510', 'asdf6014!!');
```

3. Settings > API에서 URL과 키 복사

### 2. 환경 변수 설정

#### 서버 (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=5001
```

#### 클라이언트 (.env)
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 로컬 개발

```bash
# 의존성 설치
npm run install-all

# 개발 서버 실행
npm run dev
```

### 4. 배포 (GitHub Pages)

1. GitHub에서 새 저장소 생성
2. 로컬에서 다음 명령어 실행:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```
3. `client/package.json`의 `homepage` 필드를 실제 저장소 URL로 수정:
   ```json
   "homepage": "https://your-username.github.io/your-repo-name"
   ```
4. GitHub 저장소 Settings > Pages에서 Source를 "GitHub Actions"로 설정
5. GitHub Actions가 자동으로 빌드하고 배포합니다

## 🔐 로그인 정보

### 관리자
- 사용자명: `mnj510`
- 비밀번호: `asdf6014!!`

### 직원
- 관리자가 발급한 직원 코드 사용

## 📱 사용법

1. **관리자 로그인**
   - 직원 등록 및 시급 설정
   - 근무 시간 조회
   - 급여 계산
   - 업무 루틴 설정

2. **직원 로그인**
   - 출퇴근 기록
   - 일일 업무 확인 및 완료 체크
   - 진행률 확인

## 🔧 API 엔드포인트

### 인증
- `POST /api/admin/login` - 관리자 로그인
- `POST /api/employee/login` - 직원 로그인

### 직원 관리
- `GET /api/employees` - 직원 목록
- `POST /api/employees` - 직원 등록
- `PUT /api/employees/:code` - 직원 정보 수정
- `DELETE /api/employees/:code` - 직원 삭제

### 근무 관리
- `POST /api/work/start` - 출근 기록
- `POST /api/work/end` - 퇴근 기록
- `GET /api/work/logs/:code` - 근무 로그 조회

### 급여 계산
- `POST /api/salary/calculate` - 급여 계산

### 업무 루틴
- `POST /api/routines/:code/:date` - 업무 루틴 설정
- `GET /api/routines/:code/:date` - 업무 루틴 조회
- `PUT /api/routines/:id/complete` - 업무 완료 상태 변경
- `GET /api/routines/:code/:date/progress` - 진행률 계산

## 🚀 배포된 사이트

**사이트 링크**: `https://mnj510.github.io/remote-work-management`

### 📋 배포 상태
- ✅ GitHub 저장소 생성 완료
- ✅ 코드 푸시 완료
- ✅ GitHub Actions 워크플로우 설정 완료
- ⏳ GitHub Pages 배포 진행 중 (약 2-3분 소요)
- ⏳ Supabase 데이터베이스 설정 필요

## 📝 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   - 해결: `lsof -i :5001`로 프로세스 확인 후 `kill -9 PID`

2. **Supabase 연결 오류**
   - 해결: 환경 변수 확인 및 Supabase 프로젝트 설정 확인

3. **JWT 토큰 오류**
   - 해결: JWT_SECRET 환경 변수 설정 확인

4. **빌드 오류**
   - 해결: `npm run install-all` 실행 후 다시 시도

## �� 라이선스

MIT License
