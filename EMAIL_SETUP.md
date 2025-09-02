# 직원 출근 이메일 알림 설정 가이드

## 개요
직원이 출근 버튼을 누를 때마다 관리자에게 자동으로 이메일 알림이 전송됩니다.

## EmailJS 설정 방법

### 1. EmailJS 계정 생성
1. [EmailJS](https://www.emailjs.com/)에 가입
2. 무료 계정으로 월 200건까지 이메일 전송 가능

### 2. 이메일 서비스 설정
1. EmailJS 대시보드에서 "Email Services" 클릭
2. "Add New Service" 클릭
3. Gmail 선택 후 연결
4. 서비스 ID 복사 (예: `service_abc123`)

### 3. 이메일 템플릿 생성
1. "Email Templates" 클릭
2. "Create New Template" 클릭
3. 다음 내용으로 템플릿 작성:

```html
제목: [재택근무관리] {{employee_name}} 직원 출근 알림

내용:
안녕하세요 {{to_name}}님,

{{employee_name}} 직원이 출근했습니다.

직원 정보:
- 직원명: {{employee_name}}
- 직원코드: {{employee_code}}
- 출근시간: {{start_time}}
- 출근일: {{start_date}}

{{message}}

재택근무관리 시스템
```

4. 템플릿 ID 복사 (예: `template_xyz789`)

### 4. 공개 키 확인
1. "Account" → "API Keys" 클릭
2. Public Key 복사 (예: `user_def456`)

### 5. 설정 파일 업데이트
`client/src/config/email.js` 파일에서 다음 값들을 실제 값으로 변경:

```javascript
export const emailConfig = {
  serviceId: 'service_abc123',        // 실제 서비스 ID
  templateId: 'template_xyz789',      // 실제 템플릿 ID
  publicKey: 'user_def456',           // 실제 공개 키
  adminEmail: 'admin@yourcompany.com', // 관리자 이메일
  adminName: '관리자'                  // 관리자 이름
};
```

## 이메일 내용 예시

출근 알림 이메일에는 다음 정보가 포함됩니다:
- 직원명
- 직원코드
- 출근시간 (한국 시간)
- 출근일
- 간단한 메시지

## 주의사항

1. **무료 계정 제한**: 월 200건까지 전송 가능
2. **Gmail 설정**: Gmail 계정에서 "보안 수준이 낮은 앱의 액세스" 허용 필요
3. **이메일 전송 실패**: 이메일 전송이 실패해도 출근 기록에는 영향 없음
4. **개인정보**: 직원 정보가 이메일에 포함되므로 개인정보 보호 정책 확인

## 문제 해결

### 이메일이 전송되지 않는 경우
1. EmailJS 설정 값 확인
2. Gmail 계정 보안 설정 확인
3. 브라우저 콘솔에서 오류 메시지 확인
4. EmailJS 대시보드에서 전송 상태 확인

### 이메일 내용이 잘못된 경우
1. 이메일 템플릿의 변수명 확인
2. 템플릿 ID가 올바른지 확인
3. 템플릿 수정 후 저장 확인
