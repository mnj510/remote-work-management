// EmailJS 설정
// 실제 사용 시 이 값들을 환경변수로 설정하세요

export const emailConfig = {
  // EmailJS 서비스 ID (EmailJS 대시보드에서 확인)
  serviceId: 'your_service_id',
  
  // EmailJS 템플릿 ID (EmailJS 대시보드에서 확인)
  templateId: 'your_template_id',
  
  // EmailJS 공개 키 (EmailJS 대시보드에서 확인)
  publicKey: 'your_public_key',
  
  // 관리자 이메일 주소
  adminEmail: 'admin@yourcompany.com',
  
  // 관리자 이름
  adminName: '관리자'
};

// EmailJS 초기화
export const initEmailJS = () => {
  // EmailJS가 이미 초기화되었는지 확인
  if (typeof window !== 'undefined' && window.emailjs) {
    window.emailjs.init(emailConfig.publicKey);
  }
};
