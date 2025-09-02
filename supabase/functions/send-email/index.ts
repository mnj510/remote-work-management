import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_name, employee_code, start_time, admin_email } = await req.json()

    // 이메일 내용 구성
    const emailSubject = `[재택근무관리] ${employee_name} 직원 출근 알림`
    const emailBody = `
      <h2>직원 출근 알림</h2>
      <p><strong>직원명:</strong> ${employee_name}</p>
      <p><strong>직원코드:</strong> ${employee_code}</p>
      <p><strong>출근시간:</strong> ${new Date(start_time).toLocaleString('ko-KR')}</p>
      <p><strong>출근일:</strong> ${new Date(start_time).toLocaleDateString('ko-KR')}</p>
      <br>
      <p>재택근무관리 시스템에서 자동으로 발송된 메일입니다.</p>
    `

    // EmailJS를 사용한 이메일 전송 (클라이언트 사이드에서 처리)
    // 이 함수는 클라이언트에서 EmailJS를 호출하도록 안내
    const emailData = {
      employee_name,
      employee_code,
      start_time,
      admin_email,
      subject: emailSubject,
      body: emailBody
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '이메일 전송 준비 완료',
        data: emailData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('이메일 전송 오류:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
