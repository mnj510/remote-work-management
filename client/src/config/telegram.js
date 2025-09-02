// 텔레그램 봇 설정
// 실제 사용 시 이 값들을 설정하세요

export const telegramConfig = {
  // 텔레그램 봇 토큰 (BotFather에서 받은 토큰)
  botToken: 'your_bot_token_here', // 여기에 실제 봇 토큰을 입력하세요
  
  // 관리자 채팅 ID (봇이 메시지를 보낼 채팅방 ID)
  chatId: '5742933746', // 사용자가 제공한 채널 ID
  
  // 봇 사용 여부
  enabled: false // 봇 토큰 설정 후 true로 변경
};

// 텔레그램 봇으로 메시지 전송
export const sendTelegramMessage = async (message) => {
  if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) {
    console.log('텔레그램 봇이 비활성화되어 있습니다.');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (response.ok) {
      console.log('텔레그램 메시지 전송 성공');
    } else {
      console.error('텔레그램 메시지 전송 실패');
    }
  } catch (error) {
    console.error('텔레그램 메시지 전송 오류:', error);
  }
};
